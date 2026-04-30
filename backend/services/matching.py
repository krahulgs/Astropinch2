from .astrology import AstrologyEngine

class MatchingService:
    def __init__(self):
        self.engine = AstrologyEngine()

    def calculate_guna_milan(self, bride_data, groom_data):
        # In a real system, this uses complex lookup tables based on 
        # Moon Nakshatra and Charana.
        # Simplified mock calculation for the full-fledged demo:
        
        kootas = [
            {"name": "Varna", "max": 1, "score": 1, "desc": "Work compatibility and ego alignment."},
            {"name": "Vashya", "max": 2, "score": 2, "desc": "Mutual attraction and dominance."},
            {"name": "Tara", "max": 3, "score": 1.5, "desc": "Destiny and longevity of relationship."},
            {"name": "Yoni", "max": 4, "score": 3, "desc": "Physical and biological compatibility."},
            {"name": "Maitri", "max": 5, "score": 4, "desc": "Mental and psychological friendship."},
            {"name": "Gana", "max": 6, "score": 6, "desc": "Temperament and behavior (Deva/Manushya/Rakshasa)."},
            {"name": "Bhakoot", "max": 7, "score": 0, "desc": "Constructive growth and family prosperity."},
            {"name": "Nadi", "max": 8, "score": 8, "desc": "Progeny and health compatibility."}
        ]
        
        total_score = sum(k['score'] for k in kootas)
        
        return {
            "kootas": kootas,
            "total_score": total_score,
            "max_score": 36,
            "verdict": "Harmonious Match" if total_score >= 25 else "Compatible Match" if total_score >= 18 else "Challenging Match",
            "verdict_tagline": "A union grounded in tradition and mutual respect.",
            "mangal_dosha": {
                "bride": False,
                "groom": True,
                "compatibility": "Caution: Groom has Mangal Dosha"
            },
            "scores": {
                "emotional": 70 + (total_score % 20),
                "communication": 65 + (total_score % 25),
                "physical_chemistry": 80,
                "intellectual": 75,
                "long_term_potential": 85,
                "values_alignment": 90
            },
            "romantic_summary": "This bond is built on a solid foundation of Vedic compatibility. Your stars suggest a relationship where duty and devotion go hand in hand, creating a peaceful and prosperous home environment.",
            "strengths": [
                "Exceptional alignment in family values and long-term goals.",
                "Strong mental friendship (Maitri) ensuring smooth communication.",
                "Mutual support in spiritual and professional growth."
            ],
            "challenges": [
                "Managing expectations during major life transitions.",
                "Balancing traditional roles with modern aspirations.",
                "Addressing the minor Mangal Dosha influence through patience."
            ],
            "advice": [
                "Prioritize open dialogue about financial planning and family expansion.",
                "Dedicate time each week to a shared spiritual or cultural activity.",
                "Practice small acts of gratitude to maintain emotional warmth."
            ],
            "celebrity_match": "Like Abhishek Bachchan and Aishwarya Rai — a graceful union of tradition and modern success.",
            "best_together_at": "Hosting warm family gatherings and planning for future milestones.",
            "watch_out_for": "Occasional ego clashes during decision-making; seek middle ground."
        }
