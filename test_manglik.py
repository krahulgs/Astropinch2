import asyncio
from datetime import datetime
import pytz
from backend.services.astrology import AstrologyEngine
import swisseph as swe

engine = AstrologyEngine()

# Lovisha Gumber
year, month, day = 1997, 10, 17
hour, minute = 19, 55
lat, lon = 28.6139, 77.2090 # Assuming Delhi if not provided

local_tz = pytz.timezone("Asia/Kolkata")
local_dt = local_tz.localize(datetime(year, month, day, hour, minute))
utc_dt = local_dt.astimezone(pytz.utc)

jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute / 60.0)

raw_planets = engine.get_planets(jd_ut, lat, lon)
asc = engine.get_ascendant(jd_ut, lat, lon)

res = engine.check_manglik(raw_planets, asc)
print(res)

for p, data in raw_planets.items():
    house = engine.get_house_number(data["longitude"], asc["longitude"])
    print(f"{p}: Sign {engine.SIGN_NAMES[data['sign_id']-1]}, House {house}")

