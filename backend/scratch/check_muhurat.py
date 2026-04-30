import swisseph as swe
import datetime
import sys
import os

# Add the parent directory of 'services' to path
sys.path.append(os.getcwd())

from services.astrology import AstrologyEngine
from services.muhurat import MuhuratService

engine = AstrologyEngine()
service = MuhuratService()

def check_conditions(year, month, day):
    jd_ut = engine.get_julian_day(year, month, day, 12, 0) - (5.5 / 24.0)
    
    sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
    sun_sign = int(sun_res[0] // 30) + 1
    
    jup_combust = service.is_combust(jd_ut, swe.JUPITER, 11)
    ven_combust = service.is_combust(jd_ut, swe.VENUS, 8)
    
    planets = engine.get_planets(jd_ut, 28.6139, 77.2090)
    moon_lon = planets["Moon"]["longitude"]
    sun_lon = planets["Sun"]["longitude"]
    
    diff = (moon_lon - sun_lon) % 360
    tithi_num = int(diff / 12) + 1
    if tithi_num > 15: t_id = tithi_num - 15
    else: t_id = tithi_num
    
    nak_name = engine.NAKSHATRA_NAMES[planets["Moon"]["nakshatra_id"] - 1]
    
    print(f"Date: {year}-{month:02d}-{day:02d} | SunSign: {sun_sign} | JupComb: {jup_combust} | VenComb: {ven_combust} | Tithi: {t_id} | Nak: {nak_name}")

print("Checking first 15 days of April 2026:")
for d in range(1, 16):
    check_conditions(2026, 4, d)

print("\nChecking first 15 days of May 2026:")
for d in range(1, 16):
    check_conditions(2026, 5, d)
