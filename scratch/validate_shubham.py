import asyncio
import sys

sys.path.append("/Users/pranjay/Public/AstroPinchV2.0/backend")
from main import engine, get_jd_ut_from_request, ChartRequest

async def test():
    # Faridabad: lat ~28.4089, lon ~77.3178
    req = ChartRequest(
        name="Shubham Goel",
        year=1995,
        month=2, # Feb
        day=1,
        hour=12,
        minute=32,
        lat=28.4089,
        lon=77.3178,
        timezone="Asia/Kolkata"
    )
    jd_ut = get_jd_ut_from_request(req, engine)
    raw_planets = engine.get_planets(jd_ut, req.lat, req.lon)
    asc = engine.get_ascendant(jd_ut, req.lat, req.lon)
    
    print("Lagna (Ascendant):", engine.SIGN_NAMES[asc["sign_id"] - 1], "Sign ID:", asc["sign_id"])
    print("Planets in Lagna Chart:")
    for name, p in raw_planets.items():
        house = engine.get_house_number(p["longitude"], asc["longitude"])
        print(f"{name}: Sign {engine.SIGN_NAMES[p['sign_id'] - 1]} ({p['sign_id']}), House {house}")

    print("\nMoon Chart:")
    moon_sign_id = raw_planets["Moon"]["sign_id"]
    for name, p in raw_planets.items():
        chandra_house = ((p["sign_id"] - moon_sign_id) % 12) + 1
        print(f"{name}: Sign {engine.SIGN_NAMES[p['sign_id'] - 1]} ({p['sign_id']}), Chandra House {chandra_house}")

if __name__ == "__main__":
    asyncio.run(test())
