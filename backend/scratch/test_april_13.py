import swisseph as swe
import datetime
import sys
import os

sys.path.append(os.getcwd())

from services.astrology import AstrologyEngine
from services.muhurat import MuhuratService

engine = AstrologyEngine()
service = MuhuratService()

def test_specific_date(year, month, day, m_type):
    jd_ut = engine.get_julian_day(year, month, day, 12, 0) - (5.5 / 24.0)
    planets = engine.get_planets(jd_ut, 28.6139, 77.2090)
    
    sun_lon = planets["Sun"]["longitude"]
    moon_lon = planets["Moon"]["longitude"]
    diff = (moon_lon - sun_lon) % 360
    tithi_num = int(diff / 12) + 1
    if tithi_num > 15: t_id = tithi_num - 15
    else: t_id = tithi_num
    
    nak_name = engine.NAKSHATRA_NAMES[planets["Moon"]["nakshatra_id"] - 1]
    
    rules = service.MUHURAT_RULES.get(m_type)
    t_match = t_id in rules["tithis"]
    n_match = nak_name in rules["nakshatras"]
    
    print(f"Type: {m_type}")
    print(f"Date: {year}-{month}-{day}")
    print(f"Tithi: {t_id} (Match: {t_match})")
    print(f"Nakshatra: {nak_name} (Match: {n_match})")
    
    # Check Kharmas
    sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
    sun_sign = int(sun_res[0] // 30) + 1
    kharmas = (m_type in ["Vivah", "Griha Pravesh"] and sun_sign in [9, 12])
    print(f"Kharmas: {kharmas}")
    
    # Check Combustion
    jup_c = service.is_combust(jd_ut, swe.JUPITER, 11)
    ven_c = service.is_combust(jd_ut, swe.VENUS, 8)
    print(f"Combust: Jup={jup_c}, Ven={ven_c}")

test_specific_date(2026, 4, 13, "Vehicle")
