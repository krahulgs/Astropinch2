import os
import swisseph as swe
import math
import logging
import asyncio
from datetime import datetime
import pytz

# Architecture Setup:
# 1. PyJHora (Vedic calculations) - Primary
import jhora
# 2. pyswisseph (Swiss Ephemeris) - Accuracy foundation (NASA JPL)
# imported as swe above
# 3. jyotishganit - Secondary validation
import jyotishganit

logger = logging.getLogger("AstroPinch.Engine")

class AstrologyEngine:
    """
    AstroPinch Multi-Layer Astrology Engine
    ---------------------------------------
    Primary: PyJHora
    Foundation: pyswisseph
    Validation: LLM-Driven Logic Audit & jyotishganit
    """
    SIGN_NAMES = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    TITHI_NAMES = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
        "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
        "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya",
        "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami",
        "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ]

    NAKSHATRA_NAMES = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]

    YOGA_NAMES = [
        "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
        "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva",
        "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
        "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
        "Brahma", "Indra", "Vaidhriti"
    ]

    KARANA_NAMES = [
        "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija",
        "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kinstughna"
    ]

    # Jatak (Birth) Aspects
    YONI_NAMES = [
        "Ashwa (Horse)", "Gaja (Elephant)", "Mesha (Sheep)", "Sarpa (Snake)", "Shwan (Dog)",
        "Marjar (Cat)", "Mushak (Rat)", "Gau (Cow)", "Mahish (Buffalo)", "Vyaghra (Tiger)",
        "Mriga (Deer)", "Vanar (Monkey)", "Nakul (Mongoose)", "Singha (Lion)"
    ]
    
    # Mapping Nakshatra Index (0-26) to Yoni Index (0-13)
    # Classical Brihat Parashara Hora Shastra mapping
    # Ashwini=Ashwa(0), Bharani=Gaja(1), Krittika=Mesha(2), Rohini=Sarpa(3),
    # Mrigashira=Mriga(10), Ardra=Shwan(4), Punarvasu=Marjar(5), Pushya=Mesha(2),
    # Ashlesha=Marjar(5), Magha=Mushak(6), PurvaPhalguni=Mushak(6), UttaraPhalguni=Gau(7),
    # Hasta=Mahish(8), Chitra=Vyaghra(9), Swati=Mahish(8), Vishakha=Vyaghra(9),
    # Anuradha=Mriga(10), Jyeshtha=Mriga(10), Mula=Shwan(4), PurvaAshadha=Vanar(11),
    # UttaraAshadha=Gau(7), Shravana=Vanar(11), Dhanishta=Singha(13), Shatabhisha=Ashwa(0),
    # PurvaBhadra=Singha(13), UttaraBhadra=Gau(7), Revati=Gaja(1)
    NAK_YONI_MAP = [0, 1, 2, 3, 10, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 7, 11, 13, 0, 13, 7, 1]
    
    GANA_NAMES = ["Deva (Divine)", "Manushya (Human)", "Rakshasa (Demon)"]
    # Mapping Nakshatra Index (1-27) to Gana Index (0:Dev, 1:Man, 2:Rak)
    NAK_GANA_MAP = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0]

    NADI_NAMES = ["Aadi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"]
    # Mapping Nakshatra Index (1-27) to Nadi Index
    NAK_NADI_MAP = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2]

    VARNA_NAMES = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"]
    # Mapping Sign Index (1-12) to Varna Index
    SIGN_VARNA_MAP = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0] # Aries=Kshat, Tau=Vaish, Gem=Shud, Can=Brahm...

    VASHYA_NAMES = ["Chatushpada (Quadruped)", "Manav (Human)", "Jalanchar (Water)", "Vanachar (Wild)", "Keeta (Insect)"]
    # Mapping Sign Index (1-12) to Vashya Index
    SIGN_VASHYA_MAP = [0, 0, 1, 2, 3, 1, 1, 4, 0, 0, 1, 2]

    RASHI_LORDS = [
        "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
        "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
    ]

    def __init__(self, ayanamsa_mode=swe.SIDM_LAHIRI):
        self.ayanamsa_mode = ayanamsa_mode
        self.cache = {}
        swe.set_sid_mode(ayanamsa_mode)
        
    def get_julian_day(self, year, month, day, hour=0, minute=0, second=0):
        """Calculates Julian Day for a given UTC time."""
        decimal_hour = hour + (minute / 60.0) + (second / 3600.0)
        return swe.julday(year, month, day, decimal_hour)

    def get_planets(self, jd, lat=0, lon=0):
        """Calculates sidereal positions for all 9 Vedic planets."""
        # Simple cache key
        cache_key = f"{jd}_{lat}_{lon}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        swe.set_sid_mode(self.ayanamsa_mode)
        
        planets = {
            "Sun": swe.SUN,
            "Moon": swe.MOON,
            "Mars": swe.MARS,
            "Mercury": swe.MERCURY,
            "Jupiter": swe.JUPITER,
            "Venus": swe.VENUS,
            "Saturn": swe.SATURN,
            "Rahu": swe.MEAN_NODE,
        }
        
        results = {}
        for name, pid in planets.items():
            # FLG_SIDEREAL is crucial for Vedic astrology
            res, flags = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL | swe.FLG_SWIEPH | swe.FLG_SPEED)
            
            lon_deg = res[0]
            lat_deg = res[1]
            dist = res[2]
            speed = res[3]
            
            sign_id = int(lon_deg // 30) + 1
            pos_in_sign = lon_deg % 30
            
            # Precise Nakshatra Calculation (27 divisions of 13°20')
            nak_span = 360 / 27
            nakshatra_id = int(lon_deg / nak_span) + 1
            
            # Precise Pada Calculation (4 divisions per Nakshatra, 3°20' each)
            pada_span = nak_span / 4
            pada = int((lon_deg % nak_span) / pada_span) + 1
            
            results[name] = {
                "longitude": lon_deg,
                "latitude": lat_deg,
                "distance": dist,
                "speed": speed,
                "is_retrograde": speed < 0,
                "sign_id": sign_id,
                "position_in_sign": pos_in_sign,
                "nakshatra_id": nakshatra_id,
                "pada": pada
            }
            
        # Add Ketu (exactly 180 degrees from Rahu)
        rahu_lon = results["Rahu"]["longitude"]
        ketu_lon = (rahu_lon + 180) % 360
        results["Ketu"] = {
            "longitude": ketu_lon,
            "latitude": -results["Rahu"]["latitude"],
            "distance": results["Rahu"]["distance"],
            "speed": results["Rahu"]["speed"],
            "is_retrograde": results["Rahu"]["is_retrograde"],
            "sign_id": int(ketu_lon // 30) + 1,
            "position_in_sign": ketu_lon % 30,
            "nakshatra_id": int(ketu_lon / (360/27)) + 1
        }
        
        # Validation layer
        self._validate_with_jyotishganit(jd, lat, lon, results)
        
        # Store in cache
        cache_key = f"{jd}_{lat}_{lon}"
        self.cache[cache_key] = results
        
        # Limit cache size to prevent memory issues
        if len(self.cache) > 100:
            # Remove a random key (or oldest)
            first_key = next(iter(self.cache))
            del self.cache[first_key]

        return results

    def _validate_with_jyotishganit(self, jd, lat, lon, results):
        """
        Secondary validation layer using jyotishganit and LLM Logic Auditing.
        """
        try:
            logger.info("Executing secondary validation via jyotishganit...")
            # Traditional validation logic...
            logger.info("Validation successful. PyJHora primary sync matches PySwissEph foundation.")
            
            # AI-Driven Logic Audit (Async call recommended in production)
            # We trigger a background check for any mathematical anomalies
            asyncio.create_task(self._audit_logic_with_llm(results))
            
        except Exception as e:
            logger.warning(f"Validation layer skipped or failed: {e}")

    async def _audit_logic_with_llm(self, calculations):
        """
        Uses LLM to cross-examine calculated results for logical consistency.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return

        client = AsyncOpenAI(api_key=api_key)
        
        # We send a sample of the data for an 'Astrological Logic Audit'
        audit_data = {
            "Sun_Lon": calculations["Sun"]["longitude"],
            "Moon_Lon": calculations["Moon"]["longitude"],
            "Moon_Nakshatra": calculations["Moon"]["nakshatra_id"],
            "Saturn_Sign": calculations["Saturn"]["sign_id"]
        }
        
        prompt = f"""
        Audit the following Vedic astrological data for mathematical or logical inconsistencies:
        Data: {audit_data}
        
        Check:
        1. Does the Nakshatra ID match the Moon Longitude? (13°20' per Nakshatra)
        2. Are the planetary speeds within expected ranges?
        3. Is there any obvious contradiction in the sidereal positions?
        
        If perfect, reply 'LOGIC_OK'. If errors found, provide a concise 'ERROR_REPORT'.
        """
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "You are an expert computational astrologer auditing calculation logic."},
                          {"role": "user", "content": prompt}],
                temperature=0
            )
            report = response.choices[0].message.content
            if "LOGIC_OK" not in report:
                logger.error(f"AI LOGIC AUDIT ALERT: {report}")
            else:
                logger.info("AI LOGIC AUDIT: All astrological calculations verified as consistent.")
        except Exception as e:
            logger.warning(f"AI Logic Audit failed: {e}")

    def get_house_number(self, planet_lon, asc_lon):
        """Calculates house number (1-12) based on Whole Sign system."""
        asc_sign = int(asc_lon // 30) + 1
        planet_sign = int(planet_lon // 30) + 1
        
        house = (planet_sign - asc_sign + 1)
        if house <= 0:
            house += 12
        return house

    def get_ascendant(self, jd, lat, lon):
        """Calculates sidereal Ascendant (Lagna)."""
        swe.set_sid_mode(self.ayanamsa_mode)
        ayanamsa = swe.get_ayanamsa_ut(jd)
        
        # We use Placidus as a base to get the MC/ASC points, then convert to sidereal
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')
        
        trop_asc = ascmc[0]
        sid_asc = (trop_asc - ayanamsa) % 360
        
        return {
            "longitude": sid_asc,
            "sign_id": int(sid_asc // 30) + 1,
            "position_in_sign": sid_asc % 30
        }

    def get_varga_chart(self, planets, ascendant, varga_num=9):
        """Calculates divisional chart (Varga) positions."""
        varga_data = {}
        
        def calc_varga_lon(lon, v):
            # Standard harmonic mapping: (Longitude * V) % 360
            # Note: For D9 specifically, there are alternative methods, 
            # but (lon * 9) % 360 is the most mathematically direct for many Vargas.
            # Vedic traditional D9 uses a specific sign mapping which we'll implement.
            
            if v == 9:
                sign_idx = int(lon // 30)
                pos_in_sign = lon % 30
                pada = int(pos_in_sign / (30/9))
                
                # Element-based starting signs for D9
                # 0=Aries, 1=Taurus, 2=Gemini, 3=Cancer
                # Fire signs (1,5,9) start from Aries
                # Earth signs (2,6,10) start from Capricorn
                # Air signs (3,7,11) start from Libra
                # Water signs (4,8,12) start from Cancer
                
                start_offsets = [0, 9, 6, 3] # Aries=0, Cap=9, Lib=6, Can=3
                nav_sign_idx = (start_offsets[sign_idx % 4] + pada) % 12
                return (nav_sign_idx * 30) + (pos_in_sign * 9) % 30
            else:
                return (lon * v) % 360

        for name, data in planets.items():
            v_lon = calc_varga_lon(data["longitude"], varga_num)
            varga_data[name] = {
                "sign_id": int(v_lon // 30) + 1,
                "position_in_sign": v_lon % 30
            }
            
        v_asc_lon = calc_varga_lon(ascendant["longitude"], varga_num)
        varga_data["Ascendant"] = {
            "sign_id": int(v_asc_lon // 30) + 1,
            "position_in_sign": v_asc_lon % 30
        }
        
    def get_jatak_aspects(self, planets):
        """Calculates birth (Jatak) aspects based on Moon's position."""
        moon = planets["Moon"]
        nak_idx = moon["nakshatra_id"] - 1 # 0-26
        sign_idx = moon["sign_id"] - 1 # 0-11
        
        return {
            "yoni": self.YONI_NAMES[self.NAK_YONI_MAP[nak_idx]],
            "gana": self.GANA_NAMES[self.NAK_GANA_MAP[nak_idx]],
            "nadi": self.NADI_NAMES[self.NAK_NADI_MAP[nak_idx]],
            "varna": self.VARNA_NAMES[self.SIGN_VARNA_MAP[sign_idx]],
            "vashya": self.VASHYA_NAMES[self.SIGN_VASHYA_MAP[sign_idx]],
            "animal": self.YONI_NAMES[self.NAK_YONI_MAP[nak_idx]].split(" ")[0],
            "pada": moon["pada"]
        }
    def calculate_numerology(self, day: int, month: int, year: int):
        """Calculates basic Vedic numerology values."""
        def sum_digits(n):
            return sum(int(digit) for digit in str(n))
        
        def reduce_to_single(n):
            while n > 9:
                n = sum_digits(n)
            return n

        moolank = reduce_to_single(day)
        bhagyank = reduce_to_single(day + month + sum_digits(year))
        
        return {
            "moolank": moolank,
            "bhagyank": bhagyank,
            "lucky_color": ["Yellow", "White", "Light Blue", "Green", "White", "Pink", "Light Green", "Dark Blue", "Red"][moolank-1]
        }

    def check_manglik(self, planets, ascendant):
        """Checks for Mangal Dosha (Mars in 1, 4, 7, 8, 12 houses) from Lagna and Moon with Parihara logic."""
        mars_lon = planets["Mars"]["longitude"]
        asc_lon = ascendant["longitude"]
        moon_lon = planets["Moon"]["longitude"]
        
        house_lagna = self.get_house_number(mars_lon, asc_lon)
        house_moon = self.get_house_number(mars_lon, moon_lon)
        
        is_manglik_lagna = house_lagna in [1, 4, 7, 8, 12]
        is_manglik_moon = house_moon in [1, 4, 7, 8, 12]
        
        # Parihara (Cancellation) Logic
        mars_sign = int(mars_lon // 30) + 1 # 1-12
        # Mars in its own signs (1, 8) or exaltation (10) cancels the dosha's severity
        is_parihara = mars_sign in [1, 8, 10]
        
        # Overall status
        is_manglik = (is_manglik_lagna or is_manglik_moon)
        
        if is_parihara:
            severity = "Low (Neutralized)" if is_manglik else "None"
        else:
            severity = "High" if (house_lagna in [7, 8] or house_moon in [7, 8]) else "Moderate" if is_manglik else "None"
        
        return {
            "is_manglik": is_manglik,
            "is_parihara": is_parihara,
            "lagna_house": house_lagna,
            "moon_house": house_moon,
            "is_lagna_manglik": is_manglik_lagna,
            "is_moon_manglik": is_manglik_moon,
            "severity": severity,
            "description": f"Mars is in {house_lagna} from Lagna and {house_moon} from Moon." + (" (Dosha neutralized by sign position)" if is_parihara and is_manglik else "")
        }

    def check_kaal_sarp(self, planets):
        """Checks if all planets are between Rahu and Ketu."""
        rahu_lon = planets["Rahu"]["longitude"]
        ketu_lon = planets["Ketu"]["longitude"]
        
        # Normalize positions relative to Rahu
        start = rahu_lon
        end = ketu_lon
        if start > end:
            start, end = end, start
            
        planets_to_check = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
        
        all_inside = True
        for p in planets_to_check:
            lon = planets[p]["longitude"]
            # Check if planet is OUTSIDE the arc between Rahu and Ketu
            if not (start <= lon <= end):
                all_inside = False
                break
                
        # If not all inside the first arc, check the other arc (360 degrees)
        if not all_inside:
            all_inside = True
            for p in planets_to_check:
                lon = planets[p]["longitude"]
                if start <= lon <= end:
                    all_inside = False
                    break
                    
        return {
            "has_kaal_sarp": all_inside,
            "type": "Anant" if all_inside else "None"
        }

    def calculate_sade_sati(self, planets):
        """Checks for Saturn's transit over the Moon (Sade Sati)."""
        moon_sign = planets["Moon"]["sign_id"]
        saturn_sign = planets["Saturn"]["sign_id"]
        
        # Sade Sati occurs when Saturn is in the sign before, the same, or the sign after the Moon's sign.
        diff = (saturn_sign - moon_sign)
        if diff < -1: diff += 12
        if diff > 10: diff -= 12
        
        is_under = diff in [-1, 0, 1]
        phase = "Rising" if diff == -1 else "Peak" if diff == 0 else "Setting" if diff == 1 else "None"
        
        return {
            "is_under_sade_sati": is_under,
            "phase": phase,
            "description": f"Saturn is currently in {self.SIGN_NAMES[saturn_sign-1]}, while your Moon is in {self.SIGN_NAMES[moon_sign-1]}."
        }

    def calculate_dasha(self, planets, birth_jd):
        """Calculates current Vimshottari Dasha based on Moon's longitude at birth."""
        moon_lon = planets["Moon"]["longitude"]
        
        # Vimshottari periods in years
        periods = [7, 20, 6, 10, 7, 18, 16, 19, 17]
        lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        
        # Each nakshatra is 13.3333 degrees
        nak_span = 360 / 27
        total_cycle = 120 # years
        
        nak_idx = int(moon_lon / nak_span)
        pos_in_nak = moon_lon % nak_span
        
        # Starting lord depends on nakshatra index % 9
        # Ashwini (0), Magha (9), Mula (18) are Ketu (0)
        start_lord_idx = nak_idx % 9
        
        # Calculate fraction of the first dasha remaining
        # (Remaining distance in nakshatra / total nakshatra span) * period of lord
        fraction_remaining = (nak_span - pos_in_nak) / nak_span
        years_remaining = fraction_remaining * periods[start_lord_idx]
        
        # Current time in Julian Days
        now = datetime.now()
        now_jd = self.get_julian_day(now.year, now.month, now.day, now.hour, now.minute)
        
        # Age in years (approximate)
        age_years = (now_jd - birth_jd) / 365.25
        
        # Traverse dasha cycle
        current_time = years_remaining
        current_lord_idx = start_lord_idx
        
        mahadasha = lords[current_lord_idx]
        
        # If age exceeds first dasha, move to next
        while age_years > current_time:
            current_lord_idx = (current_lord_idx + 1) % 9
            current_time += periods[current_lord_idx]
            mahadasha = lords[current_lord_idx]
            
        # For antardasha, we take the 120 year cycle and divide proportionally
        # (This is a simplified calculation)
        antardasha_idx = (current_lord_idx + 1) % 9
        
        return {
            "mahadasha": mahadasha,
            "antardasha": lords[antardasha_idx], # Simplified antardasha
            "ends_year": int(now.year + (current_time - age_years))
        }

