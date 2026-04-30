from .astrology import AstrologyEngine
from typing import Dict, Any
import datetime

class SoulboundService:
    def __init__(self):
        self.engine = AstrologyEngine()

    def calculate_life_path(self, dob_str: str) -> int:
        """Calculates Life Path Number from DOB (YYYY-MM-DD)."""
        try:
            digits = "".join(filter(str.isdigit, dob_str))
            total = sum(int(d) for d in digits)
            
            while total > 9 and total not in [11, 22, 33]:
                total = sum(int(d) for d in str(total))
            return total
        except:
            return 1

    def get_zodiac_element(self, sign: str) -> str:
        elements = {
            "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
            "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
            "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
            "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
        }
        return elements.get(sign, "Unknown")

    def infer_attachment_style(self, mbti: str) -> str:
        # Simplified mapping for demo purposes
        if not mbti: return "Secure"
        mbti = mbti.upper()
        if "I" in mbti and "P" in mbti: return "Avoidant"
        if "E" in mbti and "F" in mbti: return "Anxious"
        if "I" in mbti and "J" in mbti: return "Secure"
        return "Secure"

    async def analyze_compatibility(self, person1: Dict[str, Any], person2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs deep Soulbound analysis.
        Input profiles should contain: name, dob, lat, lon, time (HH:MM), mbti, love_language
        """
        # 1. Vedic Calculations
        def get_vedic_data(p):
            y, m, d = map(int, p['dob'].split('-'))
            h, min = map(int, p['time'].split(':'))
            jd = self.engine.get_julian_day(y, m, d, h, min)
            jd_ut = jd - (5.5 / 24.0) # Assume IST
            planets = self.engine.get_planets(jd_ut, p['lat'], p['lon'])
            jatak = self.engine.get_jatak_aspects(planets)
            return {
                "moon_sign": self.engine.SIGN_NAMES[planets["Moon"]["sign_id"] - 1],
                "sun_sign": self.engine.SIGN_NAMES[planets["Sun"]["sign_id"] - 1],
                "nakshatra": jatak["animal"], # Simplified
                "gana": jatak["gana"],
                "nadi": jatak["nadi"],
                "yoni": jatak["yoni"],
                "varna": jatak["varna"],
                "vashya": jatak["vashya"],
                "is_manglik": self.engine.check_manglik(planets, self.engine.get_ascendant(jd_ut, p['lat'], p['lon']))["is_manglik"]
            }

        v1 = get_vedic_data(person1)
        v2 = get_vedic_data(person2)

        # Mock Guna Milan Score (In production, use a lookup table)
        guna_score = 24 # Placeholder
        if v1['nadi'] == v2['nadi']: guna_score -= 8 # Nadi Dosha
        if v1['gana'] == "Rakshasa (Demon)" and v2['gana'] == "Deva (Divine)": guna_score -= 6

        # 2. Numerology
        lp1 = self.calculate_life_path(person1['dob'])
        lp2 = self.calculate_life_path(person2['dob'])

        # 3. Psych / Attachment
        attach1 = self.infer_attachment_style(person1.get('mbti', ''))
        attach2 = self.infer_attachment_style(person2.get('mbti', ''))

        # 4. Final Scoring Logic
        overall_score = 75 + (guna_score - 18) * 2
        if person1.get('love_language') == person2.get('love_language'):
            overall_score += 10
        
        overall_score = min(99, max(30, overall_score))

        verdicts = ["Challenging", "Growing", "Compatible", "Harmonious", "Soulbound"]
        verdict = verdicts[min(4, int((overall_score - 30) / 15))]

        # Constructing the Poetic Summary
        summary = f"The connection between {person1['name']} and {person2['name']} is a rare alignment of {self.get_zodiac_element(v1['sun_sign'])} and {self.get_zodiac_element(v2['sun_sign'])} energies. Their Life Path numbers {lp1} and {lp2} suggest a journey of mutual growth and shared purpose. While their {v1['gana']} and {v2['gana']} temperaments may occasionally clash, their shared values in {person1.get('love_language', 'quality time')} create a strong foundation for a lasting bond."

        return {
            "overall_score": overall_score,
            "verdict": verdict,
            "verdict_tagline": f"A celestial dance of {self.get_zodiac_element(v1['sun_sign'])} and {self.get_zodiac_element(v2['sun_sign'])} spirits finding harmony.",
            "scores": {
                "emotional": 82,
                "communication": 78,
                "physical_chemistry": 85,
                "intellectual": 90,
                "long_term_potential": 88,
                "values_alignment": 92
            },
            "vedic": {
                "guna_score": f"{guna_score} out of 36",
                "summary": f"Your Kundalis show a {v1['gana']} and {v2['gana']} alignment. The Guna score of {guna_score} indicates a strong spiritual and mental foundation, despite some minor { 'Nadi' if v1['nadi'] == v2['nadi'] else 'temperamental' } challenges."
            },
            "astrology": {
                "element_match": f"{self.get_zodiac_element(v1['sun_sign'])} + {self.get_zodiac_element(v2['sun_sign'])} — Sacred Balance",
                "summary": f"The {v1['sun_sign']} Sun and {v2['sun_sign']} Sun create a dynamic where {person1['name']}'s drive complements {person2['name']}'s depth. Your modalities are naturally supportive."
            },
            "numerology": {
                "person1_life_path": lp1,
                "person2_life_path": lp2,
                "summary": f"Life Path {lp1} and {lp2} are highly compatible, representing a blend of {'leadership' if lp1==1 else 'harmony'} and {'wisdom' if lp2==7 else 'adventure'}. You vibrate on a similar frequency."
            },
            "attachment_dynamic": f"{attach1} + {attach2} — { 'Grounded growth' if attach1 == 'Secure' else 'Intense discovery' }",
            "love_language_compatibility": "High — your shared focus on " + person1.get('love_language', 'Quality Time') + " bridges any emotional gaps.",
            "strengths": [
                f"Intellectual synergy rooted in your {person1.get('mbti', 'INFJ')} and {person2.get('mbti', 'ENTP')} personality types.",
                "Strong physical chemistry indicated by your Yoni compatibility.",
                "Deep mutual respect for each other's spiritual journeys."
            ],
            "challenges": [
                "Potential communication blocks when stress levels are high due to modality tensions.",
                "Balancing individual independence with the needs of the relationship.",
                "Navigating the {v1['nadi']} and {v2['nadi']} energy flow during big life transitions."
            ],
            "advice": [
                "Practice active listening during your 'Quality Time' to deepen the emotional bond.",
                "Schedule a monthly 'sync-up' to discuss goals and any unspoken tensions.",
                "Incorporate a shared spiritual or meditative practice into your routine."
            ],
            "romantic_summary": summary,
            "celebrity_match": "Like Shah Rukh Khan and Gauri Khan — a timeless bond that balances fame and family with grace.",
            "best_together_at": "Quiet evenings discussing big ideas and future dreams under the stars.",
            "watch_out_for": "Silent withdrawal during emotional conflicts; always keep the dialogue open."
        }
