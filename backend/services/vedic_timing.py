"""
vedic_timing.py  —  AstroPinch V2.0
Computes verified Vimshottari Dasha periods and current planetary transits
from Swiss Ephemeris data so the LLM can narrate factually correct timelines.
"""
from datetime import datetime, timedelta
import swisseph as swe

# ─── Vimshottari Dasha constants (years) ──────────────────────────────────────
DASHA_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars",
    "Rahu", "Jupiter", "Saturn", "Mercury"
]
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}
DASHA_TOTAL = 120  # total years of one full cycle

# Nakshatra → ruling planet index into DASHA_ORDER (1-indexed, 27 nakshatras)
NAK_RULER = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,   # Ash, Bha, Kri, Roh, Mri, Ard, Pun, Pus, Ash
    1, 2, 3, 4, 5, 6, 7, 8, 9,   # Mag, PF, UF, Has, Chi, Swa, Vis, Anu, Jye
    1, 2, 3, 4, 5, 6, 7, 8, 9    # Mul, PA, UA, Shr, Dha, Sha, PB, UB, Rev
]  # 1=Ketu, 2=Venus, 3=Sun, 4=Moon, 5=Mars, 6=Rahu, 7=Jupiter, 8=Saturn, 9=Mercury


def _dasha_start_planet(nakshatra_id: int) -> str:
    """Return the Mahadasha planet ruling at birth (1-indexed nakshatra)."""
    idx = (nakshatra_id - 1) % 27
    ruler_idx = NAK_RULER[idx] - 1   # 0-based into DASHA_ORDER
    return DASHA_ORDER[ruler_idx]


def _balance_at_birth(moon_lon: float, nakshatra_id: int) -> float:
    """
    Returns the fraction of the birth dasha already elapsed at birth.
    Moon longitude within its nakshatra determines how much of that
    planet's dasha has been used up.
    """
    nak_span = 360.0 / 27.0               # 13.333°
    pos_in_nak = moon_lon % nak_span      # degrees into nakshatra
    fraction_elapsed = pos_in_nak / nak_span
    return fraction_elapsed


def compute_dasha_periods(moon_lon: float, nakshatra_id: int, birth_date: datetime) -> list:
    """
    Returns a list of dicts with Mahadasha planet, start_date, end_date
    spanning ~150 years from birth so we can find the current one.
    """
    start_planet = _dasha_start_planet(nakshatra_id)
    elapsed_frac = _balance_at_birth(moon_lon, nakshatra_id)

    start_idx = DASHA_ORDER.index(start_planet)
    total_years = DASHA_YEARS[start_planet]
    remaining_years = total_years * (1.0 - elapsed_frac)

    periods = []
    current_date = birth_date

    # First (partial) period
    end_date = current_date + timedelta(days=remaining_years * 365.25)
    periods.append({
        "planet": start_planet,
        "start": current_date,
        "end": end_date
    })
    current_date = end_date

    # Remaining full cycles
    for i in range(1, 27):   # enough to cover 120+ years
        planet = DASHA_ORDER[(start_idx + i) % 9]
        years = DASHA_YEARS[planet]
        end_date = current_date + timedelta(days=years * 365.25)
        periods.append({
            "planet": planet,
            "start": current_date,
            "end": end_date
        })
        current_date = end_date

    return periods


def compute_antardasha(maha: dict) -> list:
    """
    Compute Antardasha (sub-periods) within a given Mahadasha.
    """
    maha_planet = maha["planet"]
    maha_years = DASHA_YEARS[maha_planet]
    maha_start = maha["start"]
    
    start_idx = DASHA_ORDER.index(maha_planet)
    sub_periods = []
    current = maha_start

    for i in range(9):
        sub_planet = DASHA_ORDER[(start_idx + i) % 9]
        sub_years = (DASHA_YEARS[sub_planet] * maha_years) / DASHA_TOTAL
        sub_end = current + timedelta(days=sub_years * 365.25)
        sub_periods.append({
            "planet": sub_planet,
            "start": current,
            "end": sub_end
        })
        current = sub_end

    return sub_periods


def get_current_dasha(periods: list, today: datetime) -> dict:
    """Find the Mahadasha active on today's date."""
    for p in periods:
        if p["start"] <= today <= p["end"]:
            return p
    return periods[-1]


def get_jupiter_sign_today() -> str:
    """Return Jupiter's current sidereal sign using Swiss Ephemeris."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    jd_today = swe.julday(
        datetime.utcnow().year,
        datetime.utcnow().month,
        datetime.utcnow().day,
        datetime.utcnow().hour + datetime.utcnow().minute / 60.0
    )
    res, _ = swe.calc_ut(jd_today, swe.JUPITER, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
    sign_names = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    return sign_names[int(res[0] // 30)]


def build_timing_report(chart: dict, birth_date: datetime, today: datetime) -> dict:
    """
    High-level function: given chart data (from AstrologyEngine) and birth_date,
    returns a validated timing report ready to inject into the LLM prompt.
    """
    planets = chart.get("planets", [])
    moon_data = next((p for p in planets if p.get("name") == "Moon"), None)
    if not moon_data:
        return {"error": "Moon data missing"}

    moon_lon = moon_data.get("longitude", 0)
    nak_id = moon_data.get("nakshatra_id", 1)

    periods = compute_dasha_periods(moon_lon, nak_id, birth_date)
    current_maha = get_current_dasha(periods, today)
    antardasha_list = compute_antardasha(current_maha)
    current_antar = get_current_dasha(antardasha_list, today)

    # Next 3 upcoming mahadasha periods after today
    upcoming_maha = [p for p in periods if p["start"] > today][:3]

    jupiter_sign = get_jupiter_sign_today()

    def fmt(dt: datetime) -> str:
        return dt.strftime("%B %Y")

    return {
        "current_mahadasha": {
            "planet": current_maha["planet"],
            "ends": fmt(current_maha["end"])
        },
        "current_antardasha": {
            "planet": current_antar["planet"],
            "ends": fmt(current_antar["end"])
        },
        "upcoming_mahadashas": [
            {"planet": p["planet"], "starts": fmt(p["start"]), "ends": fmt(p["end"])}
            for p in upcoming_maha
        ],
        "jupiter_current_sign": jupiter_sign,
        "moon_nakshatra_id": nak_id,
        "moon_nakshatra_name": _get_nakshatra_name(nak_id)
    }


def _get_nakshatra_name(nak_id: int) -> str:
    names = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
        "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
        "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
        "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]
    return names[(nak_id - 1) % 27]
