from .astrology import AstrologyEngine
from typing import Dict, Any
import datetime

class LoversService:
    def __init__(self):
        self.engine = AstrologyEngine()

    def calculate_life_path(self, dob_str: str) -> int:
        try:
            digits = "".join(filter(str.isdigit, dob_str))
            total = sum(int(d) for d in digits)
            while total > 9 and total not in [11, 22, 33]:
                total = sum(int(d) for d in str(total))
            return total
        except:
            return 1

    def infer_attachment_style(self, mbti: str) -> str:
        if not mbti: return "Secure"
        mbti = mbti.upper()
        if "I" in mbti and "P" in mbti: return "Avoidant"
        if "E" in mbti and "F" in mbti: return "Anxious"
        if "I" in mbti and "J" in mbti: return "Secure"
        if "N" in mbti and "T" in mbti: return "Fearful-Avoidant"
        return "Secure"

    async def analyze_compatibility(self, person1: Dict[str, Any], person2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs deep LOVERS.EXE analysis.
        Input profiles should contain: name, dob, lat, lon, time (HH:MM), mbti, love_language
        """
        name1 = person1['name']
        name2 = person2['name']
        
        # 1. Vedic/Astro
        def get_astro(p):
            y, m, d = map(int, p['dob'].split('-'))
            h, min = map(int, p['time'].split(':'))
            jd = self.engine.get_julian_day(y, m, d, h, min)
            jd_ut = jd - (5.5 / 24.0)
            planets = self.engine.get_planets(jd_ut, p['lat'], p['lon'])
            asc = self.engine.get_ascendant(jd_ut, p['lat'], p['lon'])
            return {
                "sun": self.engine.SIGN_NAMES[planets["Sun"]["sign_id"] - 1],
                "moon": self.engine.SIGN_NAMES[planets["Moon"]["sign_id"] - 1],
                "venus": self.engine.SIGN_NAMES[planets["Venus"]["sign_id"] - 1],
                "mars": self.engine.SIGN_NAMES[planets["Mars"]["sign_id"] - 1],
                "rising": self.engine.SIGN_NAMES[asc["sign_id"] - 1]
            }

        a1 = get_astro(person1)
        a2 = get_astro(person2)

        lp1 = self.calculate_life_path(person1['dob'])
        lp2 = self.calculate_life_path(person2['dob'])

        attach1 = self.infer_attachment_style(person1.get('mbti', ''))
        attach2 = self.infer_attachment_style(person2.get('mbti', ''))

        overall_score = 68 # Placeholder logic
        if attach1 == "Secure" and attach2 == "Secure": overall_score += 20
        if person1['love_language'] == person2['love_language']: overall_score += 10
        
        overall_score = min(99, max(30, overall_score))

        verdict_map = [
            (85, "Endgame"),
            (70, "Main Character Couple"),
            (55, "Slow Burn"),
            (40, "It's Complicated"),
            (0, "Not It")
        ]
        verdict = next(v for s, v in verdict_map if overall_score >= s)

        return {
            "overall_score": overall_score,
            "verdict": verdict,
            "one_line_read": f"{name1} and {name2} are giving 'soulmate energy' but with a side of 'unresolved trauma' — heal first, love after.",
            "talking_stage_status": "Almost Relationship",
            "scores": {
                "emotional_safety": 72,
                "communication": 64,
                "physical_chemistry": 89,
                "intellectual_spark": 81,
                "long_term_potential": 58,
                "fun_factor": 75
            },
            "astrology": {
                "sun_compatibility": f"{a1['sun']} + {a2['sun']} — A clash of egos or a power couple in the making.",
                "venus_match": f"{name1}'s {a1['venus']} wants depth; {name2}'s {a2['venus']} wants space. Communication is key.",
                "mars_dynamic": f"Intense sparks! Your Mars signs are in a 'chase' dynamic that keeps the tension high.",
                "moon_match": f"The Moon signs are {'aligned' if a1['moon']==a2['moon'] else 'testing each other'}. Emotional safety needs work.",
                "overall_astro_vibe": f"It's giving cosmic magnetic pull. You both understood the assignment when it comes to chemistry, but the daily grind might be your final boss."
            },
            "attachment": {
                "person1_style": attach1,
                "person2_style": attach2,
                "dynamic_name": "The Classic Push-Pull" if attach1 != attach2 else "Two Secures Being Normal",
                "honest_prediction": f"If {name1} keeps pulling away and {name2} keeps chasing, this becomes a TikTok story about the one that got away.",
                "healing_path": "Practice radical transparency before the 'ick' sets in."
            },
            "love_language_breakdown": {
                "person1_language": person1['love_language'],
                "person2_language": person2['love_language'],
                "the_misfire": f"{name1} speaks in {person1['love_language']} but {name2} is waiting for {person2['love_language']}. You're both trying, but the frequency is off.",
                "fix": "Set a weekly reminder to perform one act in your partner's specific language. No cap."
            },
            "green_flags": [
                f"{name1} actually listens when {name2} talks about their interests.",
                "Shared taste in niche memes and deep-fried internet humor.",
                "Both have a 'growth mindset' (or at least you both follow therapy accounts)."
            ],
            "red_flags": [
                f"{name2} tends to ghost when things get too real.",
                "Unspoken resentment about that one thing that happened in the 'talking stage'.",
                "Differing views on what 'exclusive' actually means."
            ],
            "beige_flags": [
                f"{name1} spends 4 hours choosing a movie they've already seen.",
                "You both over-analyze every text for 30 minutes before replying."
            ],
            "numerology": {
                "person1_life_path": lp1,
                "person2_life_path": lp2,
                "lp_verdict": f"Life Path {lp1} and {lp2} are a 'main character' combo if you don't fight for the spotlight.",
                "soul_urge_vibe": "Seeking validation through shared success and aesthetic harmony."
            },
            "the_real_talk": f"Look, {name1} and {name2}, the chemistry is slay, but the foundation is giving 'situationship'. You need to decide if you're actually in this for the long haul or just for the dopamine. Start having the uncomfortable conversations now.",
            "their_song": "Ghostin by Ariana Grande — captures the lingering energy of what hasn't been said.",
            "their_movie": "Normal People — intense, magnetic, and occasionally frustrating for everyone watching.",
            "plot_twist_warning": "The moment one of you moves for a job or a new 'era', the distance will reveal if this was a habit or a heartbeat.",
            "if_this_works": f"You become the couple everyone looks at for 'aesthetic' goals, but behind the scenes, you're each other's safest harbor. Pure endgame energy.",
            "if_this_doesnt": f"{name1} goes on a self-discovery trip; {name2} writes a viral thread about 'men in their 20s'. You both stay rent-free in each other's heads.",
            "compatibility_era": "This is your Reputation era — chaotic, misunderstood by others, but deeply formative."
        }
