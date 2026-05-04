import asyncio
import sys

sys.path.append("/Users/pranjay/Public/AstroPinchV2.0/backend")
from main import engine, get_jd_ut_from_request, ChartRequest

async def test():
    req = ChartRequest(
        name="Shubham",
        year=1995,
        month=2,
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
    
    print(f"Lagna: {engine.SIGN_NAMES[asc['sign_id']-1]} {asc['position_in_sign']:.2f}")
    for name, p in raw_planets.items():
        house = engine.get_house_number(p["longitude"], asc["longitude"])
        print(f"{name}: {engine.SIGN_NAMES[p['sign_id']-1]} {p['position_in_sign']:.2f} (H{house})")

if __name__ == "__main__":
    asyncio.run(test())
