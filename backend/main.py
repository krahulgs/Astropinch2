from fastapi import FastAPI, Query, Body, Depends, HTTPException, status, File, UploadFile
from fastapi.staticfiles import StaticFiles
import shutil
from fastapi.middleware.cors import CORSMiddleware
import swisseph as swe
import datetime
import httpx
import os
import json
from pydantic import BaseModel
from typing import List, Optional
from services.astrology import AstrologyEngine
from services.ai_service import AIService
from services.muhurat import MuhuratService
from services.payment_service import PaymentService
from services.marriage_matching import MarriageMatchingEngine
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

class ChatQueryModel(BaseModel):
    messages: List[ChatMessage]
    astro_name: str

class PaymentOrderRequest(BaseModel):
    amount: float
    customer_id: str
    customer_phone: str
    customer_email: str

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
    marital_status: Optional[str] = None
    profile_image: Optional[str] = None
    lat: Optional[str] = None
    lon: Optional[str] = None

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
    return {"status": "success", "file": filename}

@app.post("/consultation/chat")
async def chat_with_astro(data: ChatQueryModel):
    from services.ai_service import AIService
    ai = AIService()
    messages_dict = [m.dict() for m in data.messages]
    response = await ai.get_consultation_response(messages_dict, data.astro_name)
    return {"text": response}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://0.0.0.0:3000"],
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
    jd_ut = get_jd_ut_from_request(req, engine)
    jd = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute) # Local JD just for reference
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
        
    return {
        "jd": jd,
        "planets": formatted_planets,
        "ascendant": {
            "sign": engine.SIGN_NAMES[asc["sign_id"] - 1],
            "degree": asc["position_in_sign"],
            "house": 1
        }
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
        "name": req.profession if req.profession != "General" else "User", # Placeholder
        "dob": f"{req.day}/{req.month}/{req.year}",
        "time": f"{req.hour}:{req.minute}",
        "place": f"Lat: {req.lat}, Lon: {req.lon}",
        "profession": req.profession
    }
    
    # Calculate dynamic dasha for synthesis context
    dasha_data = engine.calculate_dasha(raw_planets, jd_ut)
    dasha_str = f"Mahadasha: {dasha_data['mahadasha']} | Antardasha: {dasha_data['antardasha']} (Ends {dasha_data['ends_year']})"

    # Map codes to Names for the AI service
    lang_name = "Hindi" if req.language == "hi" else "English"

    prediction = await ai.get_ai_prediction(chart_data, user_profile, dasha_str, language=lang_name)
    return {"prediction": prediction}

@app.post("/year-book")
async def get_year_book(req: ChartRequest):
    print(f"YearBook Request: {req}")
    try:
        jd_ut = get_jd_ut_from_request(req, engine)
        jd = engine.get_julian_day(req.year, req.month, req.day, req.hour, req.minute)
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
            "name": "User",
            "dob": f"{req.day}/{req.month}/{req.year}",
            "time": f"{req.hour}:{req.minute}",
            "place": f"Lat: {req.lat}, Lon: {req.lon}"
        }
        
        ai_res = await ai.get_yearly_prediction(chart_data, user_profile, target_year=req.target_year, language=req.language)
        
        # Calculate dynamic dasha for the user
        dasha_data = engine.calculate_dasha(raw_planets, jd)
        
        # Use AI generated predictions
        predictions = ai_res.get("predictions", [])
        ai_outlook_data = ai_res.get("ai_outlook", {})
        
        # Define plain English explanations for Dasha periods
        planet_meanings = {
            "Sun": {"good": "A period of increased confidence, career growth, and stepping into leadership roles.", "bad": "Watch out for ego clashes or taking on too much responsibility."},
            "Moon": {"good": "A time of emotional growth, focus on family, and nurturing your inner peace.", "bad": "You may feel overly sensitive or emotionally drained at times."},
            "Mars": {"good": "High energy, courage, and motivation to tackle difficult projects.", "bad": "Be careful of impatience, arguments, or impulsive decisions."},
            "Mercury": {"good": "Great for learning new skills, communication, and business networking.", "bad": "Avoid overthinking and stay away from unnecessary gossip."},
            "Jupiter": {"good": "A highly positive time for financial expansion, learning, and overall good luck.", "bad": "Be mindful of overspending or becoming too overly optimistic."},
            "Venus": {"good": "Focuses on love, creativity, luxury, and building harmonious relationships.", "bad": "Avoid laziness or spending too much on unnecessary luxuries."},
            "Saturn": {"good": "A time for discipline, hard work, and building long-lasting foundations.", "bad": "Can bring delays, feelings of restriction, or require extra patience."},
            "Rahu": {"good": "Brings intense ambition, worldly success, and out-of-the-box thinking.", "bad": "Can cause confusion, anxiety, or chasing unrealistic desires."},
            "Ketu": {"good": "Excellent for spiritual growth, intuition, and letting go of what you don't need.", "bad": "May bring feelings of detachment, isolation, or sudden changes."}
        }
        
        maha_planet = dasha_data['mahadasha']
        antar_planet = dasha_data['antardasha']
        
        maha_meaning = planet_meanings.get(maha_planet, {"good": f"Primary themes of {maha_planet} are highly active.", "bad": f"Avoid {maha_planet}-related excess."})
        antar_meaning = planet_meanings.get(antar_planet, {"good": f"Sub-period focus shifts toward {antar_planet} energy.", "bad": f"Minor fluctuations related to {antar_planet}."})
        
        dasha_timeline = [
            {
                "planet": maha_planet, 
                "start": "Current", 
                "end": f"{dasha_data['ends_year']}", 
                "type": "Mahadasha", 
                "good": maha_meaning["good"], 
                "bad": maha_meaning["bad"]
            },
            {
                "planet": antar_planet, 
                "start": "Current", 
                "end": "Ongoing", 
                "type": "Antardasha", 
                "good": antar_meaning["good"], 
                "bad": antar_meaning["bad"]
            }
        ]
        
        # Determine some dynamic transits for the target year
        jd_start = engine.get_julian_day(req.target_year, 1, 1, 12, 0)
        jd_end = engine.get_julian_day(req.target_year, 12, 31, 12, 0)
        p_start = engine.get_planets(jd_start, req.lat, req.lon)
        p_end = engine.get_planets(jd_end, req.lat, req.lon)
        
        transits = []
        if p_start["Jupiter"]["sign_id"] != p_end["Jupiter"]["sign_id"]:
            transits.append({"planet": "Jupiter", "event": f"Enters {engine.SIGN_NAMES[p_end['Jupiter']['sign_id']-1]}", "date": f"Mid-{req.target_year}"})
        else:
            transits.append({"planet": "Jupiter", "event": f"Remains in {engine.SIGN_NAMES[p_start['Jupiter']['sign_id']-1]}", "date": f"Throughout {req.target_year}"})
            
        if p_start["Saturn"]["sign_id"] != p_end["Saturn"]["sign_id"]:
            transits.append({"planet": "Saturn", "event": f"Enters {engine.SIGN_NAMES[p_end['Saturn']['sign_id']-1]}", "date": f"Late {req.target_year}"})
        else:
            transits.append({"planet": "Saturn", "event": f"Solidifies in {engine.SIGN_NAMES[p_start['Saturn']['sign_id']-1]}", "date": f"Throughout {req.target_year}"})
        
        return {
            "year": req.target_year,
            "predictions": predictions,
            "dasha": dasha_timeline,
            "transits": transits,
            "ai_outlook": ai_outlook_data
        }
    except Exception as e:
        print(f"YearBook Error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

class SoulboundProfile(BaseModel):
    name: str
    dob: str # YYYY-MM-DD
    time: str # HH:MM
    lat: float
    lon: float
    mbti: Optional[str] = "INFJ"
    love_language: Optional[str] = "Quality Time"

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

@app.post("/payments/create-order")
async def create_payment_order(req: PaymentOrderRequest):
    import uuid
    payment_service = PaymentService()
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    try:
        order_data = await payment_service.create_subscription_order(
            order_id=order_id,
            amount=req.amount,
            customer_id=req.customer_id,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email
        )
        return order_data
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/payments/verify/{order_id}")
async def verify_payment(order_id: str):
    payment_service = PaymentService()
    try:
        order_status = await payment_service.verify_payment(order_id)
        return order_status
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/payments/webhook")
async def cashfree_webhook(data: dict = Body(...)):
    # In a real app, verify the signature here
    print(f"Received Webhook: {data}")
    # Update subscription status in DB
    return {"status": "received"}

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
async def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_master_user)):
    users = db.query(models.User).all()
    return users # FastAPI will serialize the model objects to JSON automatically

@app.post("/users")
async def create_user(user_data: UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_master_user)):
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
async def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_master_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.full_name is not None: user.full_name = user_data.full_name
    if user_data.role is not None: user.role = user_data.role
    if user_data.is_active is not None: user.is_active = user_data.is_active
    if user_data.birth_place is not None: user.birth_place = user_data.birth_place
    if user_data.birth_date is not None: user.birth_date = user_data.birth_date
    if user_data.birth_time is not None: user.birth_time = user_data.birth_time
    if user_data.profession is not None: user.profession = user_data.profession
    if user_data.marital_status is not None: user.marital_status = user_data.marital_status
    if user_data.profile_image is not None: user.profile_image = user_data.profile_image
    if user_data.lat is not None: user.lat = user_data.lat
    if user_data.lon is not None: user.lon = user_data.lon
    
    db.commit()
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
