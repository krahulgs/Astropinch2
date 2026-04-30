from .astrology import AstrologyEngine
import swisseph as swe

class PanchangService:
    def __init__(self):
        self.engine = AstrologyEngine()

    def get_daily_panchang(self, year, month, day, hour, minute, lat, lon, timezone="Asia/Kolkata"):
        import pytz
        from datetime import datetime
        
        try:
            local_tz = pytz.timezone(timezone)
        except:
            local_tz = pytz.timezone("Asia/Kolkata")
        dt = datetime(year, month, day, hour, minute)
        local_dt = local_tz.localize(dt)
        utc_dt = local_dt.astimezone(pytz.utc)
        jd_ut = self.engine.get_julian_day(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second)
        
        planets = self.engine.get_planets(jd_ut, lat, lon)
        asc = self.engine.get_ascendant(jd_ut, lat, lon)
        
        sun_lon = planets["Sun"]["longitude"]
        moon_lon = planets["Moon"]["longitude"]
        
        # 1. Tithi
        diff = (moon_lon - sun_lon) % 360
        tithi_id = int(diff / 12) + 1
        
        # 2. Nakshatra
        nakshatra_id = planets["Moon"]["nakshatra_id"]
        
        # 3. Yoga
        yoga_lon = (sun_lon + moon_lon) % 360
        yoga_id = int(yoga_lon / (360/27)) + 1
        
        # 4. Karana (60 in a lunar month)
        # Karana calculation is complex because of fixed vs repeating ones
        # Simplified for now: map to the 11 unique names
        karana_idx = (int(diff / 6) % 11)
        
        return {
            "tithi": {
                "name": self.engine.TITHI_NAMES[(tithi_id - 1) % 30],
                "number": tithi_id
            },
            "nakshatra": {
                "name": self.engine.NAKSHATRA_NAMES[(nakshatra_id - 1) % 27],
                "number": nakshatra_id
            },
            "yoga": {
                "name": self.engine.YOGA_NAMES[(yoga_id - 1) % 27],
                "number": yoga_id
            },
            "karana": {
                "name": self.engine.KARANA_NAMES[karana_idx],
                "number": int(diff / 6) + 1
            },
            "sun_sign": self.engine.SIGN_NAMES[planets["Sun"]["sign_id"] - 1],
            "moon_sign": self.engine.SIGN_NAMES[planets["Moon"]["sign_id"] - 1],
            "ascendant": asc
        }
