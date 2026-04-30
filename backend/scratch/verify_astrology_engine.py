import asyncio
import os
from datetime import datetime
from services.astrology import AstrologyEngine

async def verify():
    engine = AstrologyEngine()
    
    # 1. Verify Sidereal Accuracy (Lahiri)
    # Testing for a known date: 2023-01-01 12:00 UTC
    jd = engine.get_julian_day(2023, 1, 1, 12, 0)
    planets = engine.get_planets(jd, 28.6139, 77.2090)
    
    print(f"Sun Sidereal Longitude: {planets['Sun']['longitude']:.4f}")
    # Lahiri Sun on 2023-01-01 12:00 UTC should be around 256 degrees (Sagittarius)
    
    # 2. Check D9 Mapping
    # Aries 0 degrees should map to Aries
    # Aries 3.33 degrees should map to Taurus
    p1_lon = 0.5
    p2_lon = 3.5
    
    def get_d9_sign(lon):
        sign_idx = int(lon // 30)
        pos_in_sign = lon % 30
        pada = int(pos_in_sign / (30/9))
        start_offsets = [0, 9, 6, 3]
        nav_sign_idx = (start_offsets[sign_idx % 4] + pada) % 12
        return nav_sign_idx + 1

    print(f"D9 Sign for 0.5 deg Aries: {get_d9_sign(p1_lon)} (Expected: 1)")
    print(f"D9 Sign for 3.5 deg Aries: {get_d9_sign(p2_lon)} (Expected: 2)")

    # 3. Check Sade Sati logic
    # Moon in Capricorn (10), Saturn in Aquarius (11) -> Rising (True)
    # Moon in Capricorn (10), Saturn in Pisces (12) -> Peak (False - actually Setting)
    # Let's check the code's math
    def check_ss(m_sign, s_sign):
        diff = (s_sign - m_sign)
        if diff < -1: diff += 12
        if diff > 10: diff -= 12
        is_under = diff in [-1, 0, 1]
        return is_under, diff

    print(f"Sade Sati Test (Moon 10, Sat 11): {check_ss(10, 11)}") # Should be (True, 1) - Setting
    print(f"Sade Sati Test (Moon 10, Sat 12): {check_ss(10, 12)}") # Should be (False, 2)

if __name__ == "__main__":
    asyncio.run(verify())
