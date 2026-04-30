import swisseph as swe
from services.astrology import AstrologyEngine

engine = AstrologyEngine()

def debug_profile(name, y, m, d, h, mn, lat, lon):
    jd = engine.get_julian_day(y, m, d, h, mn)
    jd_ut = jd - (5.5 / 24.0)
    asc = engine.get_ascendant(jd_ut, lat, lon)
    planets = engine.get_planets(jd_ut, lat, lon)
    
    print(f"--- {name} ---")
    print(f"JD (IST): {jd}")
    print(f"JD (UT): {jd_ut}")
    print(f"Ascendant Sign: {engine.SIGN_NAMES[asc['sign_id']-1]} ({asc['sign_id']})")
    print(f"Moon Sign: {engine.SIGN_NAMES[planets['Moon']['sign_id']-1]}")
    print(f"Sun Sign: {engine.SIGN_NAMES[planets['Sun']['sign_id']-1]}")

if __name__ == "__main__":
    # Rahul Kumar
    debug_profile("Rahul Kumar", 1990, 11, 12, 6, 0, 28.6139, 77.2090)
    
    # Lovisha Gumber
    debug_profile("Lovisha Gumber", 1992, 10, 17, 18, 30, 28.6139, 77.2090)
