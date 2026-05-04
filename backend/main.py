from fastapi import FastAPI, Query, Body, Depends, HTTPException, status, File, UploadFile
from fastapi.staticfiles import StaticFiles
import shutil
from fastapi.middleware.cors import CORSMiddleware
import swisseph as swe
import datetime
import httpx
import os
import json

# ── Load .env FIRST so OPENAI_API_KEY / DEEPSEEK keys are available to all services ──
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
    print(f"[Startup] .env loaded. OPENAI_API_KEY present: {bool(os.environ.get('OPENAI_API_KEY'))}")
except ImportError:
    print("[Startup] python-dotenv not installed, relying on system env vars.")
from pydantic import BaseModel
from typing import List, Optional
from services.astrology import AstrologyEngine
from services.ai_service import AIService
from services.muhurat import MuhuratService
from services.marriage_matching import MarriageMatchingEngine
from services import yearbook_engine as yb_engine
import models
import auth
from database import engine, SessionLocal, get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

class ChatMessage(BaseModel):
    role: str
    text: str
    time: str

class ChatLogModel(BaseModel):
    session_id: str
    astrologer_id: str
    messages: List[ChatMessage]
    profile_name: Optional[str] = None

class ChatQueryModel(BaseModel):
    messages: List[ChatMessage]
    astro_name: str
    profile_name: Optional[str] = None
    is_repeat: bool = False
    repeat_count: int = 0



class AstrologerApplicationSubmit(BaseModel):
    full_name: str
    email: str
    phone: str
    experience_years: int
    specialties: List[str]
    languages: List[str]
    bio: str
    profile_image: Optional[str] = None
    documents: Optional[List[str]] = None

class AstrologerApproveRequest(BaseModel):
    rate_per_min: int
    ai_persona_prompt: str

class UserCreate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: str
    role: str = "user"
    birth_place: Optional[str] = None
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    lat: Optional[str] = None
    lon: Optional[str] = None
    profession: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    profile_image: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    birth_place: Optional[str] = None
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    profession: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    profile_image: Optional[str] = None
    lat: Optional[str] = None
    lon: Optional[str] = None
    mobile_number: Optional[str] = None

class PublicUserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    birth_date: str
    birth_time: str
    birth_place: str
    lat: str
    lon: str
    profession: str
    gender: str
    mobile_number: str


app = FastAPI(title="AstroPinch V2.0 Astrology Engine")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Create tables
models.Base.metadata.create_all(bind=engine)

# Seed master user if not exists
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    master_email = "master@astropinch.com"
    master_user = db.query(models.User).filter(models.User.email == master_email).first()
    if not master_user:
        hashed_password = auth.get_password_hash("master123")
        new_master = models.User(
            email=master_email,
            hashed_password=hashed_password,
            role="master",
            full_name="Master Admin"
        )
        db.add(new_master)
        db.commit()
    db.close()

@app.post("/consultation/log")
async def log_chat(data: ChatLogModel):
    log_dir = "logs/chat_sessions"
    os.makedirs(log_dir, exist_ok=True)
    filename = f"{log_dir}/{data.session_id}_{data.astrologer_id}.json"
    with open(filename, "w") as f:
        json.dump(data.dict(), f, indent=4)

    # ── Auto-prune: keep only the 10 most recent session files ──────────────
    all_files = sorted(
        [os.path.join(log_dir, fn) for fn in os.listdir(log_dir) if fn.endswith(".json")],
        key=os.path.getmtime,
        reverse=True
    )
    for old_file in all_files[10:]:
        try:
            os.remove(old_file)
        except OSError:
            pass
    # ─────────────────────────────────────────────────────────────────────────

    return {"status": "success", "file": filename}

@app.get("/consultation/history")
async def get_all_history(profile_name: Optional[str] = None):
    from datetime import datetime
    import stat as stat_module
    log_dir = "logs/chat_sessions"
    if not os.path.exists(log_dir):
        return []

    files_with_mtime = []
    for filename in os.listdir(log_dir):
        if not filename.endswith(".json"):
            continue
        full_path = os.path.join(log_dir, filename)
        files_with_mtime.append((full_path, filename, os.path.getmtime(full_path)))

    files_with_mtime.sort(key=lambda x: x[2], reverse=True)

    history = []
    for full_path, filename, mtime in files_with_mtime[:10]:
        try:
            with open(full_path, "r") as f:
                data = json.load(f)
            
            if profile_name and data.get("profile_name") != profile_name:
                continue
                
            msgs = data.get("messages", [])

            # ── Session datetime from file timestamps ────────────────────────
            file_stat = os.stat(full_path)
            # macOS provides st_birthtime (actual creation), Linux falls back to mtime
            created_ts = getattr(file_stat, "st_birthtime", file_stat.st_mtime)
            modified_ts = file_stat.st_mtime
            session_dt = datetime.fromtimestamp(created_ts)

            # ── Parse message times for start / end ──────────────────────────
            def parse_msg_time(t_str: str, ref_dt: datetime):
                """Parse 'HH:MM AM/PM' or 'HH:MM' against a reference date."""
                for fmt in ("%I:%M %p", "%H:%M", "%I:%M%p"):
                    try:
                        t = datetime.strptime(t_str.strip(), fmt)
                        return ref_dt.replace(hour=t.hour, minute=t.minute, second=0, microsecond=0)
                    except ValueError:
                        continue
                return None

            start_dt = end_dt = None
            if msgs:
                first_time = msgs[0].get("time", "")
                last_time  = msgs[-1].get("time", "")
                start_dt = parse_msg_time(first_time, session_dt) if first_time else None
                end_dt   = parse_msg_time(last_time,  session_dt) if last_time  else None
                # Handle midnight roll-over
                if start_dt and end_dt and end_dt < start_dt:
                    from datetime import timedelta
                    end_dt += timedelta(days=1)

            # Fall back to file timestamps if parsing failed
            if not start_dt:
                start_dt = datetime.fromtimestamp(created_ts)
            if not end_dt:
                end_dt = datetime.fromtimestamp(modified_ts)

            duration_mins = max(0, int((end_dt - start_dt).total_seconds() / 60))
            if duration_mins == 0 and len(msgs) > 1:
                duration_mins = 1  # at least 1 min if there are multiple messages

            history.append({
                "session_id":       data.get("session_id"),
                "astrologer_id":    str(data.get("astrologer_id", "1")),
                "message_count":    len(msgs),
                "last_message":     msgs[-1].get("text", "")[:80] if msgs else "",
                "session_date":     session_dt.strftime("%d %b %Y"),
                "session_time":     session_dt.strftime("%I:%M %p"),
                "session_datetime": session_dt.strftime("%d %b %Y, %I:%M %p"),
                "start_time":       start_dt.strftime("%I:%M %p"),
                "end_time":         end_dt.strftime("%I:%M %p"),
                "duration_mins":    duration_mins,
                "duration_label":   f"{duration_mins} min" if duration_mins < 60 else f"{duration_mins // 60}h {duration_mins % 60}m",
            })
        except Exception:
            continue
    return history


@app.get("/consultation/history/{session_id:path}")
async def get_session_history(session_id: str):
    from urllib.parse import quote, unquote
    log_dir = "logs/chat_sessions"
    if not os.path.exists(log_dir):
        return {"error": "No sessions found"}
    # Try matching both the raw session_id and its URL-encoded form
    # (FastAPI auto-decodes %3D → = in path params, but filenames keep literal %3D)
    candidates = {session_id, quote(session_id, safe=''), unquote(session_id)}
    for filename in os.listdir(log_dir):
        if not filename.endswith(".json"):
            continue
        # Strip the trailing _<astrologer_id>.json to get the session_id part
        fn_session = filename[: filename.rfind('_')]
        if fn_session in candidates:
            with open(os.path.join(log_dir, filename), "r") as f:
                return json.load(f)
    return {"error": "Session not found", "looked_for": list(candidates)}

class MatchRequest(BaseModel):
    profile_name: Optional[str] = None
    concern: Optional[str] = ""  # user's free-text concern, if any

@app.post("/consultation/match")
async def match_astrologer(data: MatchRequest, db: Session = Depends(get_db)):
    """
    Analyzes the user's current Dasha planet + concern keyword
    and returns the best-fit astrologer ID + a short reason.
    """
    from services.astrology import AstrologyEngine
    from services.vedic_timing import build_timing_report
    import pytz, swisseph as swe
    from datetime import datetime

    # Astrologer specialty map
    SPECIALTY = {
        "1": {"name": "Acharya Rahul",    "specialties": ["career", "life purpose", "vedic", "general"]},
        "2": {"name": "Smt. Kavita",      "specialties": ["marriage", "karma", "family", "children", "relationships"]},
        "3": {"name": "Dr. Sanjay",       "specialties": ["finance", "timing", "prashna", "investment", "decision"]},
        "4": {"name": "Swami Ji",          "specialties": ["spiritual", "meditation", "health", "anxiety", "peace"]},
        "5": {"name": "Astrologer Priya", "specialties": ["numerology", "education", "modern", "love", "youth"]},
        "6": {"name": "Guru Dev",          "specialties": ["comprehensive", "complex", "multiple", "confusion"]},
    }

    # Dasha planet → astrologer affinity
    DASHA_AFFINITY = {
        "Sun":     "1",  # career, authority → Acharya Rahul
        "Moon":    "2",  # emotions, family → Smt. Kavita
        "Mars":    "3",  # action, decisions → Dr. Sanjay
        "Rahu":    "6",  # complex karmic → Guru Dev
        "Jupiter": "1",  # wisdom, life purpose → Acharya Rahul
        "Saturn":  "3",  # discipline, timing → Dr. Sanjay
        "Mercury": "5",  # communication, education → Astrologer Priya
        "Ketu":    "4",  # spirituality → Swami Ji
        "Venus":   "2",  # love, relationships → Smt. Kavita
    }

    best_id = "1"
    reason = "Acharya Rahul's deep Vedic expertise makes him the ideal starting point for your consultation."
    dasha_planet = None
    timing_info = ""

    # 1. Look up user profile for timing data
    user = None
    if data.profile_name:
        search = data.profile_name.strip().lower()
        user = db.query(models.User).filter(models.User.full_name.ilike(f"%{search}%")).first()

    if user and user.birth_date and user.birth_time and user.lat and user.lon:
        try:
            parts = user.birth_date.replace('/', '-').split('-')
            if len(parts[0]) == 4:
                year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            else:
                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
            h, m = [int(x) for x in user.birth_time.split(':')]
            local_tz = pytz.timezone("Asia/Kolkata")
            local_dt = local_tz.localize(datetime(year, month, day, h, m))
            utc_dt = local_dt.astimezone(pytz.utc)
            jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute / 60.0)

            astro_engine = AstrologyEngine()
            raw_planets = astro_engine.get_planets(jd_ut, float(user.lat), float(user.lon))
            asc = astro_engine.get_ascendant(jd_ut, float(user.lat), float(user.lon))
            fmt_planets = []
            for pname, p in raw_planets.items():
                house = astro_engine.get_house_number(p["longitude"], asc["longitude"])
                fmt_planets.append({"name": pname, "sign": astro_engine.SIGN_NAMES[p["sign_id"]-1],
                                     "degree": p["position_in_sign"], "house": house,
                                     "nakshatra": astro_engine.NAKSHATRA_NAMES[p["nakshatra_id"]-1],
                                     "nakshatra_id": p["nakshatra_id"], "longitude": p["longitude"],
                                     "is_retrograde": p.get("is_retrograde", False)})
            chart = {"planets": fmt_planets, "ascendant": {"sign": astro_engine.SIGN_NAMES[asc["sign_id"]-1], "degree": asc["position_in_sign"]}, "dasha": ""}
            timing = build_timing_report(chart, datetime(year, month, day, h, m), datetime.now())
            dasha_planet = timing.get("current_mahadasha", {}).get("planet")
            dasha_ends = timing.get("current_mahadasha", {}).get("ends", "")
            timing_info = f"Your current Mahadasha is {dasha_planet} (until {dasha_ends})."
        except Exception as e:
            print(f"Match timing error: {e}")

    # 2. Match by concern keywords first, then Dasha affinity
    concern_lower = (data.concern or "").lower()
    matched_by_concern = None
    for astro_id, info in SPECIALTY.items():
        if any(kw in concern_lower for kw in info["specialties"]):
            matched_by_concern = astro_id
            break

    if matched_by_concern:
        best_id = matched_by_concern
        astro_name = SPECIALTY[best_id]["name"]
        reason = f"{astro_name} specializes in exactly the area you've described. {timing_info}"
    elif dasha_planet and dasha_planet in DASHA_AFFINITY:
        best_id = DASHA_AFFINITY[dasha_planet]
        astro_name = SPECIALTY[best_id]["name"]
        reason = f"{timing_info} During a {dasha_planet} Mahadasha, {astro_name}'s expertise aligns perfectly with the themes this period brings."
    else:
        astro_name = SPECIALTY[best_id]["name"]
        reason = f"{astro_name}'s broad Vedic mastery makes them the ideal guide for your current cosmic phase."

    return {
        "astrologer_id": best_id,
        "astrologer_name": astro_name,
        "reason": reason,
        "timing_info": timing_info,
        "dasha_planet": dasha_planet,
    }


@app.post("/consultation/chat")
async def chat_with_astro(data: ChatQueryModel, db: Session = Depends(get_db)):
    from services.ai_service import AIService
    from services.astrology import AstrologyEngine
    import pytz
    ai_svc = AIService()
    messages_dict = [m.dict() for m in data.messages]
    
    user_profile = None
    print(f"\n🔍 [CONSULT] profile_name='{data.profile_name}' astro='{data.astro_name}' repeat={data.is_repeat}")
    if data.profile_name:
        # Case-insensitive name search
        search = data.profile_name.strip().lower()
        user = db.query(models.User).filter(
            models.User.full_name.ilike(f"%{search}%")
        ).first()
        
        if not user:
            print(f"  ❌ No DB user found for: '{search}'")
            all_names = [u.full_name for u in db.query(models.User).all()]
            print(f"  📋 DB users: {all_names}")
        if user:
            print(f"  ✅ User found: {user.full_name} | DOB={user.birth_date} T={user.birth_time} lat={user.lat} lon={user.lon}")
            user_profile = {
                "full_name":     user.full_name,
                "birth_date":    user.birth_date,
                "birth_time":    user.birth_time,
                "birth_place":   user.birth_place,
                "profession":    user.profession,
                "gender":        getattr(user, "gender", "") or "",
                "marital_status": user.marital_status,
                "chart": None
            }
            # Compute the chart if we have all required info
            if user.birth_date and user.birth_time and user.lat and user.lon:
                try:
                    astro_engine = AstrologyEngine()
                    parts = user.birth_date.replace('/', '-').split('-')
                    if len(parts[0]) == 4:
                        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
                    else:
                        day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                    
                    time_parts = user.birth_time.split(':')
                    hour, minute = int(time_parts[0]), int(time_parts[1])
                    
                    from datetime import datetime
                    local_tz = pytz.timezone("Asia/Kolkata")
                    local_dt = local_tz.localize(datetime(year, month, day, hour, minute))
                    utc_dt = local_dt.astimezone(pytz.utc)
                    import swisseph as swe
                    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                                       utc_dt.hour + utc_dt.minute / 60.0)
                    
                    # ── Build chart using correct AstrologyEngine API ──────────
                    raw_planets = astro_engine.get_planets(jd_ut, float(user.lat), float(user.lon))
                    asc = astro_engine.get_ascendant(jd_ut, float(user.lat), float(user.lon))
                    
                    formatted_planets = []
                    for pname, p in raw_planets.items():
                        house = astro_engine.get_house_number(p["longitude"], asc["longitude"])
                        formatted_planets.append({
                            "name": pname,
                            "sign": astro_engine.SIGN_NAMES[p["sign_id"] - 1],
                            "degree": p["position_in_sign"],
                            "house": house,
                            "nakshatra": astro_engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
                            "nakshatra_id": p["nakshatra_id"],
                            "longitude": p["longitude"],
                            "is_retrograde": p.get("is_retrograde", False)
                        })
                    
                    dasha_str = astro_engine.calculate_dasha(raw_planets, jd_ut)
                    chart = {
                        "planets": formatted_planets,
                        "ascendant": {
                            "sign": astro_engine.SIGN_NAMES[asc["sign_id"] - 1],
                            "degree": asc["position_in_sign"],
                        },
                        "dasha": dasha_str
                    }
                    user_profile["chart"] = chart
                    # ──────────────────────────────────────────────────────────

                    # ── Compute verified Vedic timing ──────────────────────────
                    from services.vedic_timing import build_timing_report
                    birth_dt = datetime(year, month, day, hour, minute)
                    today_dt = datetime.now()
                    timing = build_timing_report(chart, birth_dt, today_dt)
                    user_profile["vedic_timing"] = timing
                    # ──────────────────────────────────────────────────────────

                except Exception as e:
                    import traceback
                    print(f"Chart/Timing error for {user.full_name}: {e}\n{traceback.format_exc()}")
    
    response = await ai_svc.get_consultation_response(
        messages_dict, data.astro_name, user_profile,
        is_repeat=data.is_repeat, repeat_count=data.repeat_count
    )
    return {"text": response}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AstroPinch V2.0 Astrology Engine is Online", "version": "2.0.0"}

import json
import os

# Load local cities data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CITIES_FILE = os.path.join(DATA_DIR, "indian_cities.json")

try:
    with open(CITIES_FILE, "r") as f:
        INDIAN_CITIES = json.load(f)
except Exception as e:
    print(f"Error loading cities data: {e}")
    INDIAN_CITIES = []

@app.get("/geo/search")
async def geo_search(q: str = Query(...)):
    """
    Search for locations using Photon API (OpenStreetMap) with a local fallback.
    """
    query = q.lower().strip()
    if not query:
        return []

    # 1. Search in local data first (for speed and specific Indian cities)
    results = []
    for city in INDIAN_CITIES:
        search_target = f"{city['name']} {city['state']} {city.get('pincode', '')}".lower()
        if query in search_target:
            display_name = f"{city['name']}, {city['state']}, India"
            if "pincode" in city:
                display_name = f"{city['name']} ({city['pincode']}), {city['state']}, India"
                
            results.append({
                "display_name": display_name,
                "lat": str(city["lat"]),
                "lon": str(city["lon"])
            })
            if len(results) >= 10:
                return results

    # 2. Fallback to Photon API if local results are few
    try:
        async with httpx.AsyncClient() as client:
            # Photon is a free geocoding API based on OSM data
            response = await client.get(
                f"https://photon.komoot.io/api/?q={query}&limit=10",
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                for feature in data.get("features", []):
                    props = feature.get("properties", {})
                    coords = feature.get("geometry", {}).get("coordinates", [])
                    
                    if not coords: continue
                    
                    name = props.get("name", "")
                    city = props.get("city", props.get("state", ""))
                    country = props.get("country", "")
                    
                    display_name = f"{name}, {city}, {country}".strip(", ")
                    
                    results.append({
                        "display_name": display_name,
                        "lat": str(coords[1]),
                        "lon": str(coords[0])
                    })
    except Exception as e:
        print(f"External Geocoding Error: {e}")
    
    return results

@app.get("/health")
async def health():
    # Basic Swiss Ephemeris check
    swe_version = swe.version
    return {
        "status": "healthy",
        "swe_version": swe_version,
        "server_time": datetime.datetime.now().isoformat()
    }

class DailyHoroscopeRequest(BaseModel):
    name: str
    dob: str # YYYY-MM-DD
    time: str # HH:MM
    lat: float
    lon: float
    profession: str

@app.post("/astropinch_daily")
async def get_daily_horoscope(req: DailyHoroscopeRequest):
    print(f"DEBUG: Received Daily Horoscope request for {req.name}")
    from services.horoscope_service import HoroscopeService
    service = HoroscopeService()
    res = await service.get_daily_horoscope(req.dict())
    return res

@app.get("/api/daily-guidance")
async def test_get():
    return {"status": "ok", "message": "Daily guidance API is live. Use POST to get data."}

class ChartRequest(BaseModel):
    name: str = "Anonymous"
    year: int = 2000
    month: int = 1
    day: int = 1
    hour: int = 12
    minute: int = 0
    lat: float = 28.6
    lon: float = 77.2
    timezone: str = "Asia/Kolkata"
    target_year: int = 2026
    profession: str = "General"
    gender: Optional[str] = ""      # Male / Female / Other
    language: Optional[str] = "English"

# Initialize Global Services
engine = AstrologyEngine()
ai = AIService(engine)

def get_jd_ut_from_request(req: ChartRequest, engine):
    import pytz
    from datetime import datetime
    try:
        local_tz = pytz.timezone(req.timezone)
    except:
        local_tz = pytz.timezone("Asia/Kolkata")
    dt = datetime(req.year, req.month, req.day, req.hour, req.minute)
    local_dt = local_tz.localize(dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    return engine.get_julian_day(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second)


@app.post("/chart")
async def get_chart(req: ChartRequest):
    from openai import AsyncOpenAI

    jd_ut = get_jd_ut_from_request(req, engine)
    jd = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute)
    raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
    asc = engine.get_ascendant(jd_ut, req.lat, req.lon)

    lagna_sign = engine.SIGN_NAMES[asc["sign_id"] - 1]

    formatted_planets = []
    for name, p in raw_planets.items():
        house = engine.get_house_number(p["longitude"], asc["longitude"])
        formatted_planets.append({
            "name": name,
            "sign": engine.SIGN_NAMES[p["sign_id"] - 1],
            "degree": p["position_in_sign"],
            "house": house,
            "nakshatra": engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
            "is_retrograde": p.get("is_retrograde", False)
        })

    # ── DeepSeek Lagna Chart Validation ──────────────────────────────────────
    validation_note = "AI validation not available."
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")
    if api_key:
        try:
            client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            planet_summary = ", ".join(
                f"{p['name']} in {p['sign']} H{p['house']}" for p in formatted_planets
            )
            prompt = f"""You are a Vedic astrology computation auditor.

Birth Data: Lagna (Ascendant) = {lagna_sign}
Planet placements (sign + Whole Sign house from Lagna):
{planet_summary}

TASK — VALIDATE ONLY:
Using Whole Sign system (Lagna sign = House 1, next sign = House 2, etc.),
verify that each planet's house number is correct for its sign relative to {lagna_sign} as House 1.

Reply with ONE of:
- "MATH: OK" — if all house assignments are correct.
- "MATH: ERROR — <brief description of which planet is wrong and what the correct house should be>"

No extra text. No explanation beyond the one-line reply."""
            resp = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a strict Vedic astrology math auditor. Reply only with MATH: OK or MATH: ERROR — <detail>."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                max_tokens=60
            )
            validation_note = resp.choices[0].message.content.strip().split("\n")[0]
        except Exception as e:
            validation_note = f"AI skipped: {e}"
    # ─────────────────────────────────────────────────────────────────────────

    return {
        "jd": jd,
        "planets": formatted_planets,
        "ascendant": {
            "sign": lagna_sign,
            "degree": asc["position_in_sign"],
            "house": 1
        },
        "validation_note": validation_note
    }

@app.get("/muhurat/vivah")
async def get_vivah_muhurat(year: int = None, month: int = None, type: str = "Vivah"):
    service = MuhuratService()
    # Start searching from today
    today = datetime.date.today()
    results = service.get_muhurats(type, today, year=year, month=month, count=15)
    return results

@app.post("/calculate")
async def calculate_jyotish(req: ChartRequest):
    jd_ut = get_jd_ut_from_request(req, engine)
    jd = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute)
    
    planets = engine.get_planets(jd_ut, req.lat, req.lon)
    asc = engine.get_ascendant(jd_ut, req.lat, req.lon)
    
    # Advanced Vedic Features
    from services.ashtakavarga import AshtakavargaService
    from services.shadbala import ShadbalaService
    from services.nadi import NadiService
    
    sav_service = AshtakavargaService()
    shadbala_service = ShadbalaService()
    nadi_service = NadiService()
    
    sav_scores = sav_service.calculate_sav(planets, asc)
    shadbala_scores = shadbala_service.calculate_shadbala(planets, asc, jd_ut)
    karmic_tasks = nadi_service.evaluate_karmic_tasks(planets)
    d10_chart = engine.get_varga_chart(planets, asc, varga_num=10)
    
    return {
        "numerology": engine.calculate_numerology(req.day, req.month, req.year),
        "manglik": engine.check_manglik(planets, asc),
        "kaal_sarp": engine.check_kaal_sarp(planets),
        "sade_sati": engine.calculate_sade_sati(planets),
        "jatak": engine.get_jatak_aspects(planets),
        "sun_sign": engine.SIGN_NAMES[planets["Sun"]["sign_id"] - 1],
        "moon_sign": engine.SIGN_NAMES[planets["Moon"]["sign_id"] - 1],
        "ascendant": engine.SIGN_NAMES[asc["sign_id"] - 1],
        "dasha": engine.calculate_dasha(planets, jd_ut),
        "advanced_metrics": {
            "d10_chart": d10_chart,
            "ashtakavarga_sav": sav_scores,
            "shadbala": shadbala_scores,
            "nadi_karma": karmic_tasks
        },
        "jd_ut": jd_ut # For debugging
    }

@app.post("/panchang")
async def get_panchang(req: ChartRequest):
    from services.panchang import PanchangService
    service = PanchangService()
    # Correct for IST to UT (already handled inside PanchangService? Let's check...)
    # Actually, PanchangService calls engine.get_julian_day itself.
    # I should update PanchangService instead or pass the corrected JD.
    # For consistency, I'll update it here.
    res = service.get_daily_panchang(req.year, req.month, req.day, req.hour, req.minute, req.lat, req.lon, req.timezone)
    return res

@app.post("/ai/predict")
async def get_ai_prediction(req: ChartRequest):
    print(f"Guide Request: {req}")
    
    jd_ut = get_jd_ut_from_request(req, engine)
    raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
    asc = engine.get_ascendant(jd_ut, req.lat, req.lon)
    
    formatted_planets = []
    for name, p in raw_planets.items():
        house = engine.get_house_number(p["longitude"], asc["longitude"])
        formatted_planets.append({
            "name": name,
            "sign": engine.SIGN_NAMES[p["sign_id"] - 1],
            "degree": p["position_in_sign"],
            "house": house,
            "nakshatra": engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
            "is_retrograde": p.get("is_retrograde", False)
        })
    
    chart_data = {
        "planets": formatted_planets,
        "ascendant": {
            "sign": engine.SIGN_NAMES[asc["sign_id"] - 1],
            "degree": asc["position_in_sign"]
        }
    }
    
    user_profile = {
        "name": req.name or "User",
        "dob": f"{req.day}/{req.month}/{req.year}",
        "time": f"{req.hour}:{req.minute}",
        "place": f"Lat: {req.lat}, Lon: {req.lon}",
        "profession": req.profession,
        "gender": req.gender or ""
    }
    
    # Calculate dynamic dasha for synthesis context
    dasha_data = engine.calculate_dasha(raw_planets, jd_ut)
    dasha_str = f"Mahadasha: {dasha_data['mahadasha']} | Antardasha: {dasha_data['antardasha']} (Ends {dasha_data['ends_year']})"

    # Map codes to Names for the AI service
    lang_name = "Hindi" if req.language == "hi" else "English"

    prediction = await ai.get_ai_prediction(chart_data, user_profile, dasha_str, language=lang_name)
    return {"prediction": prediction}


@app.post("/moon-chart")
async def get_moon_chart(req: ChartRequest):
    """
    Returns the Chandra Lagna (Moon Chart) — all planets re-housed with the Moon's
    sign as the 1st house — plus a DeepSeek-validated, plain-English prediction.
    """
    from openai import AsyncOpenAI

    jd_ut = get_jd_ut_from_request(req, engine)
    raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
    asc = engine.get_ascendant(jd_ut, req.lat, req.lon)

    # ── 1. Lagna chart planets (normal) ─────────────────────────────────────
    lagna_planets = []
    for name, p in raw_planets.items():
        lagna_house = engine.get_house_number(p["longitude"], asc["longitude"])
        lagna_planets.append({
            "name": name,
            "sign": engine.SIGN_NAMES[p["sign_id"] - 1],
            "degree": round(p["position_in_sign"], 2),
            "house": lagna_house,
            "nakshatra": engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
            "is_retrograde": p.get("is_retrograde", False),
        })

    # ── 2. Chandra Lagna — Moon sign = House 1 (Whole Sign) ─────────────────
    moon_sign_id = raw_planets["Moon"]["sign_id"]
    chandra_planets = []
    for name, p in raw_planets.items():
        chandra_house = ((p["sign_id"] - moon_sign_id) % 12) + 1
        chandra_planets.append({
            "name": name,
            "sign": engine.SIGN_NAMES[p["sign_id"] - 1],
            "degree": round(p["position_in_sign"], 2),
            "house": chandra_house,
            "nakshatra": engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
            "is_retrograde": p.get("is_retrograde", False),
        })

    moon_sign      = engine.SIGN_NAMES[raw_planets["Moon"]["sign_id"] - 1]
    moon_nakshatra = engine.NAKSHATRA_NAMES[raw_planets["Moon"]["nakshatra_id"] - 1]
    lagna_sign     = engine.SIGN_NAMES[asc["sign_id"] - 1]

    # ── 3. DeepSeek validation + Moon-chart prediction ───────────────────────
    moon_prediction = None
    validation_note = "AI validation not available."

    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")

    if api_key:
        try:
            client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            chandra_summary = ", ".join(
                f"{p['name']} H{p['house']} ({p['sign']})" for p in chandra_planets
            )
            validation_prompt = f"""You are a Vedic astrology expert performing a math audit and prediction.

Birth Data:
- Lagna (Ascendant): {lagna_sign}
- Moon Sign (Chandra Lagna = House 1): {moon_sign}
- Moon Nakshatra: {moon_nakshatra}

Chandra Lagna Planet Positions:
{chandra_summary}

TASK 1 — VALIDATE:
Confirm each planet's Chandra Lagna house is correct using Whole Sign system (Moon sign = House 1).
Reply: "MATH: OK" or "MATH: ERROR — <brief description>".

TASK 2 — PREDICT (Moon Chart):
Write a detailed, warm, plain-English Moon Chart analysis for these 4 areas.
Provide a comprehensive and deep analysis in very simple English without any astrological jargon (no transit/aspect/dasha/nakshatra/lagna/retrograde/houses).
Write like a caring friend explaining deep truths. Provide 3-4 detailed sentences per area.

Format exactly:
Soul & Emotions: [detailed analysis]
Relationships & Family: [detailed analysis]
Mind & Mental Health: [detailed analysis]
Home & Comfort: [detailed analysis]
"""
            response = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a warm Vedic astrology expert. Validate math, then write simple, jargon-free, human predictions."},
                    {"role": "user", "content": validation_prompt}
                ],
                temperature=0.4
            )
            llm_text = response.choices[0].message.content.strip()

            # Extract validation note
            for line in llm_text.split("\n"):
                if line.strip().startswith("MATH:"):
                    validation_note = line.strip()
                    break

            # Parse 4 prediction sections
            sections = {}
            keys = ["Soul & Emotions", "Relationships & Family", "Mind & Mental Health", "Home & Comfort"]
            current_key = None
            for line in llm_text.split("\n"):
                matched = False
                for k in keys:
                    if line.strip().startswith(k + ":"):
                        current_key = k
                        sections[k] = line.split(":", 1)[1].strip()
                        matched = True
                        break
                if not matched and current_key and line.strip():
                    sections[current_key] = sections.get(current_key, "") + " " + line.strip()

            if len(sections) >= 3:
                moon_prediction = sections

        except Exception as e:
            print(f"Moon Chart AI Error: {e}")
            validation_note = f"AI skipped: {e}"

    # Fallback prediction
    if not moon_prediction:
        moon_prediction = {
            "Soul & Emotions": f"With your Moon in {moon_sign}, your emotional world is rich and deeply personal. You feel most balanced when your daily life matches your inner needs.",
            "Relationships & Family": "Family bonds and close friendships are your emotional anchor. You give warmth naturally and seek the same genuine care in return.",
            "Mind & Mental Health": "Your mind is reflective and perceptive. Regular quiet time helps you process feelings and keeps your mental energy steady.",
            "Home & Comfort": "Your home environment has a huge impact on your mood. Creating a calm, personal space genuinely recharges you."
        }

    return {
        "moon_sign": moon_sign,
        "moon_nakshatra": moon_nakshatra,
        "lagna_sign": lagna_sign,
        "chandra_lagna_planets": chandra_planets,
        "lagna_planets": lagna_planets,
        "moon_chart_ascendant": {
            "sign": moon_sign,
            "degree": round(raw_planets["Moon"]["position_in_sign"], 2),
            "house": 1
        },
        "moon_prediction": moon_prediction,
        "validation_note": validation_note
    }
@app.post("/year-book")
async def get_year_book(req: ChartRequest):
    """
    FAST endpoint — returns in ~200ms using pure Swiss Ephemeris.
    Predictions and transits computed via Gochara rules. No AI wait.
    """
    print(f"YearBook Request: {req}")
    try:
        jd_ut = get_jd_ut_from_request(req, engine)
        jd = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute)
        raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
        asc = engine.get_ascendant(jd_ut, req.lat, req.lon)

        # ── Swiss Ephemeris Gochara Engine (instant) ──
        natal_positions = yb_engine.compute_natal_positions(
            req.year, req.month, req.day, req.hour, req.minute
        )
        dasha_data = engine.calculate_dasha(raw_planets, jd)
        mahadasha_lord = dasha_data.get('mahadasha', 'Jupiter')

        predictions = yb_engine.compute_monthly_transit_scores(
            natal=natal_positions,
            target_year=req.target_year,
            mahadasha_lord=mahadasha_lord
        )

        transits = yb_engine.get_planet_transit_summary(natal_positions, req.target_year)

        planet_meanings = {
            "Sun":     {"good": "A period of increased confidence, career growth, and stepping into leadership roles.", "bad": "Watch out for ego clashes or taking on too much responsibility."},
            "Moon":    {"good": "A time of emotional growth, focus on family, and nurturing your inner peace.", "bad": "You may feel overly sensitive or emotionally drained at times."},
            "Mars":    {"good": "High energy, courage, and motivation to tackle difficult projects.", "bad": "Be careful of impatience, arguments, or impulsive decisions."},
            "Mercury": {"good": "Great for learning new skills, communication, and business networking.", "bad": "Avoid overthinking and stay away from unnecessary gossip."},
            "Jupiter": {"good": "A highly positive time for financial expansion, learning, and overall good luck.", "bad": "Be mindful of overspending or becoming too overly optimistic."},
            "Venus":   {"good": "Focuses on love, creativity, luxury, and building harmonious relationships.", "bad": "Avoid laziness or spending too much on unnecessary luxuries."},
            "Saturn":  {"good": "A time for discipline, hard work, and building long-lasting foundations.", "bad": "Can bring delays, feelings of restriction, or require extra patience."},
            "Rahu":    {"good": "Brings intense ambition, worldly success, and out-of-the-box thinking.", "bad": "Can cause confusion, anxiety, or chasing unrealistic desires."},
            "Ketu":    {"good": "Excellent for spiritual growth, intuition, and letting go of what you don't need.", "bad": "May bring feelings of detachment, isolation, or sudden changes."}
        }
        maha_planet = dasha_data['mahadasha']
        antar_planet = dasha_data['antardasha']
        maha_meaning = planet_meanings.get(maha_planet, {"good": f"Primary themes of {maha_planet} are highly active.", "bad": f"Avoid {maha_planet}-related excess."})
        antar_meaning = planet_meanings.get(antar_planet, {"good": f"Sub-period focus shifts toward {antar_planet} energy.", "bad": f"Minor fluctuations related to {antar_planet}."})

        dasha_timeline = [
            {"planet": maha_planet, "start": "Current", "end": f"{dasha_data['ends_year']}", "type": "Mahadasha", "good": maha_meaning["good"], "bad": maha_meaning["bad"]},
            {"planet": antar_planet, "start": "Current", "end": "Ongoing", "type": "Antardasha", "good": antar_meaning["good"], "bad": antar_meaning["bad"]}
        ]

        return {
            "year": req.target_year,
            "predictions": predictions,
            "dasha": dasha_timeline,
            "transits": transits,
            "ai_outlook": None  # Loaded separately via /year-book/outlook
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/year-book/outlook")
async def get_year_book_outlook(req: ChartRequest):
    """
    SLOW endpoint — calls DeepSeek for the AI narrative outlook.
    Now passes real chart + dasha + transit data for grounded predictions.
    """
    try:
        jd_ut = get_jd_ut_from_request(req, engine)
        jd    = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute)
        raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
        asc = engine.get_ascendant(jd_ut, req.lat, req.lon)

        # Format planets with house numbers
        formatted_planets = []
        for name, p in raw_planets.items():
            house = engine.get_house_number(p["longitude"], asc["longitude"])
            formatted_planets.append({
                "name":         name,
                "sign":         engine.SIGN_NAMES[p["sign_id"] - 1],
                "degree":       p["position_in_sign"],
                "house":        house,
                "nakshatra":    engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
                "is_retrograde": p.get("is_retrograde", False)
            })

        # Dasha from astro engine
        dasha_data = engine.calculate_dasha(raw_planets, jd)

        # Real transits from yearbook engine
        natal_positions = yb_engine.compute_natal_positions(
            req.year, req.month, req.day, req.hour, req.minute
        )
        transits = yb_engine.get_planet_transit_summary(natal_positions, req.target_year)

        chart_data = {
            "planets":    formatted_planets,
            "ascendant":  {"sign": engine.SIGN_NAMES[asc["sign_id"] - 1], "degree": asc["position_in_sign"]},
            "dasha":      dasha_data,
            "transits":   transits,
            "gender":     req.gender or "",
            "profession": req.profession or ""
        }
        user_profile = {
            "name":       req.name or "User",
            "dob":        f"{req.day}/{req.month}/{req.year}",
            "time":       f"{req.hour}:{req.minute}",
            "place":      f"Lat: {req.lat}, Lon: {req.lon}",
            "profession": req.profession,
            "gender":     req.gender or ""
        }

        ai_res = await ai.get_yearly_prediction(
            chart_data, user_profile,
            target_year=req.target_year,
            language=req.language
        )
        return {"ai_outlook": ai_res.get("ai_outlook", {})}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class SoulboundProfile(BaseModel):
    name: str
    dob: str # YYYY-MM-DD
    time: str # HH:MM
    lat: float
    lon: float
    mbti: Optional[str] = "INFJ"
    love_language: Optional[str] = "Quality Time"
    gender: Optional[str] = ""

class SoulboundMatchingRequest(BaseModel):
    person1: SoulboundProfile
    person2: SoulboundProfile

@app.post("/matching/soulbound")
async def get_soulbound_matching(req: SoulboundMatchingRequest):
    from services.soulbound_service import SoulboundService
    service = SoulboundService()
    res = await service.analyze_compatibility(req.person1.dict(), req.person2.dict())
    return res

@app.post("/matching/lovers")
async def get_lovers_matching(req: SoulboundMatchingRequest):
    from services.lovers_service import LoversService
    service = LoversService()
    res = await service.analyze_compatibility(req.person1.dict(), req.person2.dict())
    return res

class MatchingRequest(BaseModel):
    bride: ChartRequest
    groom: ChartRequest

@app.post("/matching")
async def get_matching(req: MatchingRequest):
    try:
        from services.marriage_matching import MarriageMatchingEngine
        engine = MarriageMatchingEngine()
        b_data = req.bride.dict()
        g_data = req.groom.dict()
        # Fallback for missing names
        b_data["name"] = b_data.get("name") or "Bride"
        g_data["name"] = g_data.get("name") or "Groom"
        res = await engine.get_match_report(b_data, g_data)
        return res
    except Exception as e:
        import traceback
        print(f"PERMANENT ERROR LOG: {e}")
        traceback.print_exc()
        # Return partial data instead of 500 if possible
        return {"error": str(e), "overall_score": 0, "grade": "Calculation Error"}

@app.get("/horoscope/sign")
async def get_sign_horoscope(sign: str = Query(...)):
    try:
        now = datetime.datetime.now()
        # Subtract 5.5 hours to convert IST (local) to UTC for Swiss Ephemeris
        jd = engine.get_julian_day(now.year, now.month, now.day, now.hour, now.minute)
        jd_ut = jd - (5.5 / 24.0)
        
        raw_planets = engine.get_planets(jd_ut, 28.6139, 77.2090) # Default to Delhi for general transits
        
        formatted_planets = []
        for name, p in raw_planets.items():
            formatted_planets.append({
                "name": name,
                "sign": engine.SIGN_NAMES[p["sign_id"] - 1],
                "degree": p["position_in_sign"],
                "nakshatra": engine.NAKSHATRA_NAMES[p["nakshatra_id"] - 1],
                "is_retrograde": p.get("is_retrograde", False)
            })
            
        chart_data = {"planets": formatted_planets}
        prediction = await ai.get_daily_horoscope(sign.capitalize(), chart_data, None)
        return prediction
    except Exception as e:
        print(f"ERROR in get_sign_horoscope: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# --- AUTH & USER MANAGEMENT ---

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/users")
async def list_users(db: Session = Depends(get_db), current_user_email: str = Depends(auth.get_current_user)):
    current_user = db.query(models.User).filter(models.User.email == current_user_email).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "master":
        users = db.query(models.User).all()
    else:
        users = [current_user]
    return users # FastAPI will serialize the model objects to JSON automatically

@app.post("/users")
async def create_user(user_data: UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user_obj)):
    # Only master users can create non-regular user roles
    if current_user.role != 'master' and user_data.role != 'user':
        raise HTTPException(status_code=403, detail="Only master admins can create non-user roles")
    # Check if email exists (only if provided)
    if user_data.email:
        existing = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user_data.password) if user_data.password else None
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name,
        role=user_data.role,
        birth_place=user_data.birth_place,
        birth_date=user_data.birth_date,
        birth_time=user_data.birth_time,
        lat=user_data.lat,
        lon=user_data.lon,
        profession=user_data.profession,
        marital_status=user_data.marital_status,
        profile_image=user_data.profile_image
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "user_id": new_user.id}

@app.put("/users/{user_id}")
async def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user_obj)):
    # Allow master users to edit anyone; regular users can only edit themselves
    if current_user.role != 'master' and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this profile")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.full_name is not None: user.full_name = user_data.full_name
    if user_data.role is not None and current_user.role == 'master': user.role = user_data.role
    if user_data.is_active is not None: user.is_active = user_data.is_active
    if user_data.birth_place is not None: user.birth_place = user_data.birth_place
    if user_data.birth_date is not None: user.birth_date = user_data.birth_date
    if user_data.birth_time is not None: user.birth_time = user_data.birth_time
    if user_data.profession is not None: user.profession = user_data.profession
    if user_data.gender is not None: user.gender = user_data.gender
    if user_data.marital_status is not None: user.marital_status = user_data.marital_status
    if user_data.profile_image is not None: user.profile_image = user_data.profile_image
    if user_data.lat is not None: user.lat = user_data.lat
    if user_data.lon is not None: user.lon = user_data.lon
    
    db.commit()
    db.refresh(user)
    return {"status": "success"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_master_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.email == "master@astropinch.com":
        raise HTTPException(status_code=400, detail="Cannot delete the master admin")
        
    db.delete(user)
    db.commit()
    return {"status": "success"}

@app.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...)):
    file_path = f"static/avatars/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"http://localhost:8000/{file_path}"}


@app.post("/matching_raw")
async def get_matching_raw(req: dict):
    try:
        from services.marriage_matching import MarriageMatchingEngine
        engine = MarriageMatchingEngine()
        bride = req.get("bride", {})
        groom = req.get("groom", {})
        bride["name"] = bride.get("name", "Bride")
        groom["name"] = groom.get("name", "Groom")
        res = await engine.get_match_report(bride, groom)
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "overall_score": 0, "grade": "Calculation Error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.post("/matching_raw")
async def get_matching_raw(req: dict):
    try:
        from services.marriage_matching import MarriageMatchingEngine
        engine = MarriageMatchingEngine()
        bride = req.get("bride", {})
        groom = req.get("groom", {})
        # Ensure name exists for the engine
        bride["name"] = bride.get("name", "Bride")
        groom["name"] = groom.get("name", "Groom")
        res = await engine.get_match_report(bride, groom)
        return res
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
async def chat_consultation(req: dict):
    try:
        user_name = req.get("profile", "User")
        query = req.get("query", "")
        if not query:
            return {"response": "Please ask a question."}
        
        ai_engine = AIService()
        response = await ai_engine.get_chat_response(user_name, query)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

from fastapi.responses import FileResponse
import uuid

@app.post("/api/pdf/generate")
async def generate_pdf(req: dict):
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from services.astrology import AstrologyEngine
        from services.shadbala import ShadbalaService
        from services.ashtakavarga import AshtakavargaService
        from services.nadi import NadiService
        from services.ai_service import AIService
        
        name = req.get("name", "AstroPinch User")
        year = int(req.get("year", 2000))
        month = int(req.get("month", 1))
        day = int(req.get("day", 1))
        hour = int(req.get("hour", 0))
        minute = int(req.get("minute", 0))
        lat = float(req.get("lat", 28.6139))
        lon = float(req.get("lon", 77.2090))
        
        # Calculate backend data
        engine = AstrologyEngine()
        from pydantic import BaseModel
        class MockReq:
            pass
        mreq = MockReq()
        mreq.year = year
        mreq.month = month
        mreq.day = day
        mreq.hour = hour
        mreq.minute = minute
        mreq.timezone = req.get("timezone", "Asia/Kolkata")
        
        jd_ut = get_jd_ut_from_request(mreq, engine)
        
        planets = engine.get_planets(jd_ut, lat, lon)
        ascendant = engine.get_ascendant(jd_ut, lat, lon)
        
        # Basic calculations
        numerology = engine.calculate_numerology(day, month, year)
        manglik = engine.check_manglik(planets, ascendant)
        sade_sati = engine.calculate_sade_sati(planets)
        jatak = engine.get_jatak_aspects(planets)
        dasha = engine.calculate_dasha(planets, jd_ut)
        
        # Advanced calculations
        shadbala = ShadbalaService().calculate_shadbala(planets, ascendant, jd_ut)
        sav = AshtakavargaService().calculate_sav(planets, ascendant)
        nadi = NadiService().evaluate_karmic_tasks(planets)
        
        # AI Prediction (Fast async generation)
        ai_engine = AIService()
        chart_data_for_ai = {
            "ascendant": {"sign": engine.SIGN_NAMES[ascendant["sign_id"] - 1]},
            "planets": [{"name": p_name, "sign": engine.SIGN_NAMES[p_data["sign_id"] - 1], "house": engine.get_house_number(p_data["longitude"], ascendant["longitude"])} for p_name, p_data in planets.items()]
        }
        ai_response = await ai_engine.get_prediction(chart_data_for_ai, "en")
        
        filename = f"/tmp/{uuid.uuid4()}_AstroPinch_Dossier.pdf"
        
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        def check_page(y_pos, space_needed=100):
            if y_pos < space_needed:
                c.showPage()
                return height - 50
            return y_pos

        def draw_wrapped_text(c, text, x, y, max_width, font="Helvetica", size=11):
            c.setFont(font, size)
            words = text.split()
            line = ""
            for w in words:
                if c.stringWidth(line + w, font, size) < max_width:
                    line += w + " "
                else:
                    c.drawString(x, y, line)
                    y -= (size + 4)
                    line = w + " "
            c.drawString(x, y, line)
            return y - (size + 10)

        # ── Header ──
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 60, "AstroPinch Premium Dossier")
        c.setFont("Helvetica", 14)
        c.drawString(50, height - 85, f"Prepared exclusively for: {name}")
        c.drawString(50, height - 105, f"DOB: {day}/{month}/{year} {hour}:{minute}")
        
        c.setLineWidth(1)
        c.line(50, height - 115, width - 50, height - 115)
        
        y = height - 150
        
        # ── Planetary Positions ──
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Planetary Positions")
        y -= 25
        
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, "Planet")
        c.drawString(180, y, "Sign")
        c.drawString(300, y, "House")
        c.drawString(420, y, "Degree")
        y -= 15
        
        c.setFont("Helvetica", 11)
        for p_name, p_data in planets.items():
            sign_name = engine.SIGN_NAMES[p_data["sign_id"] - 1]
            house_num = engine.get_house_number(p_data["longitude"], ascendant["longitude"])
            deg = f"{p_data['position_in_sign']:.2f}°"
            
            c.drawString(60, y, p_name)
            c.drawString(180, y, sign_name)
            c.drawString(300, y, str(house_num))
            c.drawString(420, y, deg)
            y -= 15
            y = check_page(y)
            
        y -= 20
        y = check_page(y)

        # ── Jatak & Dasha Analysis ──
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Jatak & Timeline Analysis")
        y -= 25
        
        c.setFont("Helvetica", 11)
        jatak_info = [
            f"Lagna: {engine.SIGN_NAMES[ascendant['sign_id'] - 1]}",
            f"Moon Sign: {engine.SIGN_NAMES[planets['Moon']['sign_id'] - 1]}",
            f"Mangal Dosha: {'Manglik' if manglik['is_manglik'] else 'Non-Manglik'}",
            f"Sade Sati: {sade_sati['phase'] if sade_sati['is_under_sade_sati'] else 'None'}",
            f"Numerology: Moolank {numerology['moolank']} | Bhagyank {numerology['bhagyank']}"
        ]
        for info in jatak_info:
            c.drawString(60, y, info)
            y -= 15
            y = check_page(y)
            
        y -= 5
        if dasha:
            c.setFont("Helvetica-Bold", 11)
            c.drawString(60, y, f"Current Mahadasha: {dasha['mahadasha']} (Ends {dasha['ends_year']})")
            y -= 15
            c.drawString(60, y, f"Current Antardasha: {dasha['antardasha']}")
            y -= 25
            y = check_page(y)
            
        # ── AI Insights ──
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "AI Chart Synthesis")
        y -= 25
        
        y = draw_wrapped_text(c, f"Soul Essence: {ai_response.get('soul_essence', '')}", 60, y, width - 100, "Helvetica-Oblique", 11)
        y = check_page(y, 80)
        y = draw_wrapped_text(c, f"Current Season: {ai_response.get('current_season', '')}", 60, y, width - 100, "Helvetica", 11)
        y = check_page(y, 80)
        y = draw_wrapped_text(c, f"Remedy: {ai_response.get('remedy', '')}", 60, y, width - 100, "Helvetica-Bold", 11)
        
        y -= 20
        y = check_page(y, 150)
        
        # ── Shadbala Section ──
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Premium Metric: Shadbala (Planetary Strength)")
        y -= 25
        c.setFont("Helvetica", 11)
        for p, data in sorted(shadbala.items(), key=lambda x: x[1]['percentage'], reverse=True):
            status = data['strength_label']
            c.drawString(60, y, f"{p}: {data['rupas']:.2f} Rupas ({status})")
            y -= 15
            c.setFont("Helvetica-Oblique", 10)
            c.drawString(70, y, f"Impact: {data.get('impact', '')}")
            y -= 15
            c.setFont("Helvetica-Bold", 10)
            c.drawString(70, y, f"Remedy: {data.get('solution', '')}")
            y -= 25
            c.setFont("Helvetica", 11)
            y = check_page(y)
        
        # ── Ashtakavarga Section ──
        y -= 20
        y = check_page(y, 120)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Premium Metric: Ashtakavarga (Supported Areas)")
        y -= 25
        c.setFont("Helvetica", 11)
        
        house_meanings = {
            1: "Self & Body", 2: "Wealth & Speech", 3: "Courage & Siblings", 4: "Home & Mother",
            5: "Intellect & Kids", 6: "Health & Debts", 7: "Marriage & Biz", 8: "Secrets & Longevity",
            9: "Luck & Dharma", 10: "Career & Fame", 11: "Gains & Network", 12: "Expenses & Travel"
        }
        
        sorted_houses = sorted(sav.items(), key=lambda x: x[1], reverse=True)[:4]
        for house, score in sorted_houses:
            c.drawString(60, y, f"House {house} ({house_meanings.get(house, '')}): {score} Points")
            y -= 20
            y = check_page(y)
                
        # ── Nadi Section ──
        y -= 20
        y = check_page(y, 120)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Premium Metric: Nadi Karmic Tasks")
        y -= 25
        c.setFont("Helvetica", 11)
        
        if not nadi:
            c.drawString(60, y, "No major karmic debts detected.")
        else:
            for task in nadi[:3]:
                c.setFont("Helvetica-Bold", 11)
                c.drawString(60, y, f"Debt: {task['debt']}")
                y -= 15
                c.setFont("Helvetica", 11)
                y = draw_wrapped_text(c, task['task'], 70, y, width - 120, "Helvetica", 11)
                y = check_page(y)
                    
        c.save()
        return FileResponse(filename, filename="AstroPinch_Dossier.pdf", media_type="application/pdf")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/profiles")
async def save_profile(req: dict):
    try:
        profiles_file = "profiles.json"
        if os.path.exists(profiles_file):
            with open(profiles_file, "r") as f:
                profiles = json.load(f)
        else:
            profiles = []
            
        exists = any(p.get("name") == req.get("name") and p.get("day") == req.get("day") for p in profiles)
        if not exists:
            req["id"] = str(uuid.uuid4())
            profiles.append(req)
            with open(profiles_file, "w") as f:
                json.dump(profiles, f)
        
        return {"status": "success", "saved": not exists, "total": len(profiles)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/profiles")
async def get_profiles():
    try:
        profiles_file = "profiles.json"
        if os.path.exists(profiles_file):
            with open(profiles_file, "r") as f:
                return json.load(f)
        return []
    except:
        return []

# ── ASTROLOGER ONBOARDING & BACKOFFICE ROUTES ──────────────────────────────

@app.post("/api/astrologers/apply")
async def apply_astrologer(application: AstrologerApplicationSubmit, db: Session = Depends(get_db)):
    # Check if email already applied
    existing = db.query(models.AstrologerApplication).filter(models.AstrologerApplication.email == application.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Application with this email already exists.")
    
    new_app = models.AstrologerApplication(
        full_name=application.full_name,
        email=application.email,
        phone=application.phone,
        experience_years=application.experience_years,
        specialties=json.dumps(application.specialties),
        languages=json.dumps(application.languages),
        bio=application.bio,
        profile_image=application.profile_image,
        documents=json.dumps(application.documents) if application.documents else None,
        created_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"status": "success", "message": "Application submitted successfully", "id": new_app.id}

@app.get("/api/backoffice/astrologers")
async def get_pending_astrologers(status: str = "PENDING", db: Session = Depends(get_db)):
    # In a real scenario, this would be protected by an AdminAuth dependency
    applications = db.query(models.AstrologerApplication).filter(models.AstrologerApplication.status == status).all()
    
    res = []
    for app in applications:
        res.append({
            "id": app.id,
            "full_name": app.full_name,
            "email": app.email,
            "phone": app.phone,
            "experience_years": app.experience_years,
            "specialties": json.loads(app.specialties) if app.specialties else [],
            "languages": json.loads(app.languages) if app.languages else [],
            "bio": app.bio,
            "status": app.status,
            "profile_image": app.profile_image,
            "documents": json.loads(app.documents) if app.documents else [],
            "created_at": app.created_at
        })
    return res

@app.put("/api/backoffice/astrologers/{app_id}/approve")
async def approve_astrologer(app_id: int, req: AstrologerApproveRequest, db: Session = Depends(get_db)):
    app_db = db.query(models.AstrologerApplication).filter(models.AstrologerApplication.id == app_id).first()
    if not app_db:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app_db.status == "ACTIVE":
        raise HTTPException(status_code=400, detail="Astrologer is already active")

    app_db.status = "ACTIVE"
    app_db.rate_per_min = req.rate_per_min
    app_db.ai_persona_prompt = req.ai_persona_prompt
    
    db.commit()
    return {"status": "success", "message": "Astrologer approved and is now active on the marketplace."}

@app.put("/api/backoffice/astrologers/{app_id}/reject")
async def reject_astrologer(app_id: int, db: Session = Depends(get_db)):
    app_db = db.query(models.AstrologerApplication).filter(models.AstrologerApplication.id == app_id).first()
    if not app_db:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_db.status = "REJECTED"
    db.commit()
    return {"status": "success", "message": "Application rejected."}

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

def send_welcome_email(to_email: str, full_name: str, otp: str):
    sender_email = "genpinch@gmail.com"
    sender_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    if not sender_password:
        print("Warning: GMAIL_APP_PASSWORD not set in environment.")
        return False
        
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to AstroPinch V2.0 - Verification"
    msg["From"] = sender_email
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0;">AstroPinch</h1>
          </div>
          <h2 style="color: #2c3e50; text-align: center;">Welcome to AstroPinch! 🌟</h2>
          <p style="color: #34495e; font-size: 16px;">Dear {full_name},</p>
          <p style="color: #34495e; font-size: 16px;">We are thrilled to have you join our cosmic community. Your journey into the stars begins now. To ensure the security of your account and complete your registration, please verify your email address.</p>
          <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #2c3e50;">Your One-Time Password (OTP) is:</p>
            <h3 style="text-align: center; color: #e74c3c; font-size: 28px; letter-spacing: 4px; margin: 10px 0;">{otp}</h3>
          </div>
          <p style="color: #34495e; font-size: 14px;">This OTP is valid for the next 10 minutes. If you did not request this registration, please ignore this email.</p>
          <p style="color: #34495e; font-size: 16px; margin-top: 30px;">Warm regards,<br><strong>The AstroPinch Team</strong></p>
        </div>
      </body>
    </html>
    """
    
    part = MIMEText(html, "html")
    msg.attach(part)
    
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

PENDING_REGISTRATIONS = {}

@app.post("/auth/register")
async def register_public(user_data: PublicUserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = auth.get_password_hash(user_data.password)
    otp = str(random.randint(100000, 999999))
    
    # Store temporarily instead of saving to DB
    PENDING_REGISTRATIONS[user_data.email] = {
        "user_data": user_data,
        "hashed_pwd": hashed_pwd,
        "otp": otp
    }
    
    # Send email
    email_sent = send_welcome_email(user_data.email, user_data.full_name, otp)
    if not email_sent:
        print("Warning: Email could not be sent. OTP:", otp)
    
    return {"status": "success", "message": "OTP generated and sent to email.", "email_sent": email_sent}

class OTPVerify(BaseModel):
    email: str
    otp: str

@app.post("/auth/verify-otp")
async def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    if data.email not in PENDING_REGISTRATIONS:
        raise HTTPException(status_code=404, detail="No pending registration found for this email")
        
    pending = PENDING_REGISTRATIONS[data.email]
    if pending["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Validation passed, save to DB
    user_data = pending["user_data"]
    new_user = models.User(
        email=user_data.email,
        hashed_password=pending["hashed_pwd"],
        full_name=user_data.full_name,
        role="user",
        birth_place=user_data.birth_place,
        birth_date=user_data.birth_date,
        birth_time=user_data.birth_time,
        lat=user_data.lat,
        lon=user_data.lon,
        profession=user_data.profession,
        gender=user_data.gender,
        mobile_number=user_data.mobile_number,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    
    # Create profile in profiles.json
    import uuid
    import json
    import os
    try:
        profiles_file = "profiles.json"
        profiles = []
        if os.path.exists(profiles_file):
            with open(profiles_file, "r") as f:
                try:
                    profiles = json.load(f)
                except:
                    pass
                    
        # Parse date and time
        d_parts = user_data.birth_date.split("-")
        t_parts = user_data.birth_time.split(":")
        
        new_profile = {
            "name": user_data.full_name,
            "year": int(d_parts[2]) if len(d_parts)==3 else 2000,
            "month": int(d_parts[1]) if len(d_parts)==3 else 1,
            "day": int(d_parts[0]) if len(d_parts)==3 else 1,
            "hour": int(t_parts[0]) if len(t_parts)==2 else 0,
            "minute": int(t_parts[1]) if len(t_parts)==2 else 0,
            "lat": float(user_data.lat) if user_data.lat else 0.0,
            "lon": float(user_data.lon) if user_data.lon else 0.0,
            "profession": user_data.profession or "General",
            "gender": user_data.gender or "Other",
            "birth_place": user_data.birth_place or "",
            "email": user_data.email or "",
            "mobile_number": user_data.mobile_number or "",
            "id": str(uuid.uuid4())
        }
        profiles.append(new_profile)
        with open(profiles_file, "w") as f:
            json.dump(profiles, f)
    except Exception as e:
        print(f"Failed to auto-create profile: {e}")
    
    # Remove from pending
    del PENDING_REGISTRATIONS[data.email]
    
    return {"status": "success", "message": "Email verified and registration complete."}
