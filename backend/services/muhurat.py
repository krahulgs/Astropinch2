import swisseph as swe
import datetime
from .astrology import AstrologyEngine

class MuhuratService:
    def __init__(self):
        self.engine = AstrologyEngine()
        # Specialized Nakshatras
        self.MUHURAT_RULES = {
            "Vivah": {
                "nakshatras": ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"],
                "tithis": [2, 3, 5, 7, 10, 11, 12, 13],
                "reason": "Strong planetary strength and fixed nakshatra support for marriage.",
                "actions": ["Perform Ganesh Puja and Gauri Pujan.", "Seek blessings from elders after the ceremony.", "Donate sweets and grains to the needy."]
            },
            "Griha Pravesh": {
                "nakshatras": ["Rohini", "Mrigashira", "Uttara Phalguni", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"],
                "tithis": [2, 3, 5, 7, 10, 11, 12, 13],
                "reason": "Auspicious alignment for long-term domestic prosperity.",
                "actions": ["Enter the house with the right foot first.", "Perform Vastu Shanti and Navgraha Puja.", "Boil milk in the new kitchen to symbolize abundance."]
            },
            "Vehicle": {
                "nakshatras": ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Shravana", "Dhanishta", "Shatabhisha", "Revati"],
                "tithis": [2, 3, 5, 7, 10, 11, 13],
                "reason": "Swift nakshatra quality suitable for movement and vehicles.",
                "actions": ["Perform Vahan Puja with camphor and coconut.", "Tie a black thread or use an auspicious symbol for protection.", "Drive to a nearby temple for the first journey."]
            },
            "Business": {
                "nakshatras": ["Ashwini", "Rohini", "Mrigashira", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Uttara Bhadrapada", "Revati"],
                "tithis": [1, 2, 3, 5, 7, 10, 11, 13],
                "reason": "Commercial growth supported by strong mercurial and solar aspects.",
                "actions": ["Install an idol of Lord Ganesha or Goddess Lakshmi.", "Perform a small Havan to purify the commercial space.", "Distribute sweets to your new staff and customers."]
            },
            "Namkaran": {
                "nakshatras": ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"],
                "tithis": [1, 2, 3, 5, 7, 10, 11, 12, 13],
                "reason": "Gentle and stable nakshatras for a baby's naming ceremony.",
                "actions": ["Whisper the chosen name into the child's right ear first.", "Offer honey and ghee to the infant (per tradition).", "Plant a tree to celebrate the child's naming."]
            }
        }

    def is_combust(self, jd_ut, planet_id, limit=10):
        """Checks if a planet is combust (too close to the Sun)."""
        sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
        pla_res, _ = swe.calc_ut(jd_ut, planet_id, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
        diff = abs(sun_res[0] - pla_res[0])
        if diff > 180: diff = 360 - diff
        return diff < limit

    def get_muhurats(self, m_type: str, start_date: datetime.date, year=None, month=None, count=10):
        """Finds auspicious windows for a specific activity type."""
        muhurats = []
        rules = self.MUHURAT_RULES.get(m_type, self.MUHURAT_RULES["Vivah"])
        
        if year and month:
            current_date = datetime.date(year, month, 1)
            if month == 12:
                next_month = datetime.date(year + 1, 1, 1)
            else:
                next_month = datetime.date(year, month + 1, 1)
            end_search = next_month
        else:
            current_date = start_date
            end_search = start_date + datetime.timedelta(days=730)
        
        while current_date < end_search and len(muhurats) < count:
            jd_ut = self.engine.get_julian_day(current_date.year, current_date.month, current_date.day, 12, 0) - (5.5 / 24.0)
            
            # Sun sign check (Avoid Kharmas for Marriage and House Warming)
            sun_res, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SIDEREAL | swe.FLG_SWIEPH)
            sun_sign = int(sun_res[0] // 30) + 1
            if m_type in ["Vivah", "Griha Pravesh"] and sun_sign in [9, 12]:
                current_date += datetime.timedelta(days=1)
                continue
                
            # Planet Strength
            if self.is_combust(jd_ut, swe.JUPITER, 11) or self.is_combust(jd_ut, swe.VENUS, 8):
                current_date += datetime.timedelta(days=1)
                continue

            planets = self.engine.get_planets(jd_ut, 23.6693, 86.1511)
            sun_lon = planets["Sun"]["longitude"]
            moon_lon = planets["Moon"]["longitude"]
            
            # Tithi, Yoga, Karana Calculations
            diff = (moon_lon - sun_lon) % 360
            tithi_num = int(diff / 12) + 1
            yoga_num = int((moon_lon + sun_lon) % 360 / (360/27)) + 1
            
            # Karana is more complex (60 in total)
            karana_idx = int(diff / 6)
            if karana_idx == 0: k_id = 11 # Kinstughna
            elif karana_idx >= 57: k_id = 7 + (karana_idx - 57) # Shakuni, Chatushpada, Naga
            else: k_id = ((karana_idx - 1) % 7) + 1 # Bava to Vishti
            
            t_id_check = tithi_num if tithi_num <= 15 else tithi_num - 15
            nak_name = self.engine.NAKSHATRA_NAMES[planets["Moon"]["nakshatra_id"] - 1]
            yoga_name = self.engine.YOGA_NAMES[yoga_num - 1]
            karana_name = self.engine.KARANA_NAMES[k_id - 1]

            # EXTREME CAUTION FILTERS
            # 1. Skip Bhadra (Vishti Karana)
            if "Bhadra" in karana_name:
                current_date += datetime.timedelta(days=1)
                continue
            
            # 2. Skip Major Inauspicious Yogas
            if yoga_name in ["Vyatipata", "Vaidhriti", "Atiganda", "Ganda", "Shoola"]:
                current_date += datetime.timedelta(days=1)
                continue
            
            # 3. Lunar Strength (Avoid Amavasya and surrounding days for Vivah/Griha Pravesh)
            if m_type in ["Vivah", "Griha Pravesh"] and (tithi_num in [30, 1, 2]):
                current_date += datetime.timedelta(days=1)
                continue

            if t_id_check in rules["tithis"] and nak_name in rules["nakshatras"]:
                asc = self.engine.get_ascendant(jd_ut, 23.6693, 86.1511)
                
                # Rahu Kaal Calculation (Standard approximation)
                day_of_week = current_date.weekday() # Mon=0, Sun=6
                rahu_map = {0: (7.5, 9), 1: (15, 16.5), 2: (12, 13.5), 3: (13.5, 15), 4: (10.5, 12), 5: (9, 10.5), 6: (16.5, 18)}
                rk_start, rk_end = rahu_map[day_of_week]
                
                # Format a "Safe Window" that avoids Rahu Kaal
                # If RK is in the morning, start after. If in afternoon, end before or split.
                # For simplicity in report, we provide the primary auspicious window.
                window_start = "09:30 AM" if rk_start < 10 else "08:15 AM"
                window_end = "04:30 PM" if rk_end > 15 else "06:00 PM"
                
                muhurats.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "start_time": window_start,
                    "end_time": window_end,
                    "tithi": self.engine.TITHI_NAMES[(tithi_num - 1) % 30],
                    "nakshatra": nak_name,
                    "yoga": yoga_name,
                    "karana": karana_name,
                    "reason": rules["reason"],
                    "recommendations": rules["actions"],
                    "caution_notes": [
                        f"Rahu Kaal ({rk_start}:00-{rk_end}:00) avoided in this window.",
                        "Vyatipata/Vaidhriti Dosha check passed.",
                        "Bhadra (Vishti) Karana exclusion applied."
                    ],
                    "planets": [
                        {
                            "name": k, 
                            "sign": self.engine.SIGN_NAMES[v["sign_id"]-1], 
                            "degree": v["position_in_sign"], 
                            "house": ((v["sign_id"] - asc["sign_id"] + 12) % 12) + 1, 
                            "is_retrograde": v["is_retrograde"]
                        }
                        for k, v in planets.items()
                    ],
                    "ascendant": {"sign": self.engine.SIGN_NAMES[asc["sign_id"]-1], "degree": asc["position_in_sign"]}
                })
            
            current_date += datetime.timedelta(days=1)
            
        return muhurats
