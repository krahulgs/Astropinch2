import swisseph as swe

def check_asc(y, m, d, h, lat, lon):
    jd = swe.julday(y, m, d, h)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)
    cusps, ascmc = swe.houses(jd, lat, lon, b'P')
    sid_asc = (ascmc[0] - ayanamsa) % 360
    res, flags = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    moon_lon = res[0]
    sign_names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    print(f"Time: {h}UT -> Asc: {sign_names[int(sid_asc//30)]}, Moon: {sign_names[int(moon_lon//30)]}")

# 6:20 AM IST = 00:50 UT
check_asc(1976, 11, 12, 0.8333, 23.6693, 86.1511)
# 6:20 PM IST = 12:50 UT
check_asc(1976, 11, 12, 12.8333, 23.6693, 86.1511)
