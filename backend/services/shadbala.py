class ShadbalaService:
    """
    Calculates Shadbala (Six-Fold Strength) for planets.
    """
    
    def __init__(self):
        pass

    def calculate_shadbala(self, planets, ascendant, jd_ut):
        """
        Computes an approximate Shadbala score (in Rupas) for the 7 classical planets.
        Standard strength is around 5 to 7 Rupas.
        """
        shadbala_scores = {}
        
        # 1. Sthana Bala (Positional)
        # 2. Dik Bala (Directional)
        # 3. Kala Bala (Temporal)
        # 4. Chesta Bala (Motional)
        # 5. Naisargika Bala (Natural)
        # 6. Drik Bala (Aspectual)
        
        # Natural strengths (Naisargika Bala) out of 1.0 Rupa (Sun is strongest, Saturn is weakest)
        naisargika_bala = {
            "Sun": 1.0,
            "Moon": 0.85,
            "Venus": 0.71,
            "Jupiter": 0.57,
            "Mercury": 0.43,
            "Mars": 0.28,
            "Saturn": 0.14
        }
        
        asc_sign = ascendant["sign_id"]
        
        for name in naisargika_bala.keys():
            p_data = planets.get(name)
            if not p_data:
                continue
                
            score = 0.0
            
            # Add Natural Strength
            score += naisargika_bala[name]
            
            # Sthana Bala (Simplified: Add points if in own sign, subtract if debilitated)
            # This is highly complex in reality, using a simplistic approximation here
            score += 2.0 
            
            # Dik Bala (Directional Strength)
            # Sun/Mars in 10th (strongest), Moon/Venus in 4th, Jup/Merc in 1st, Sat in 7th
            house = self._get_house_number(p_data["longitude"], ascendant["longitude"])
            if name in ["Sun", "Mars"] and house == 10:
                score += 1.0
            elif name in ["Moon", "Venus"] and house == 4:
                score += 1.0
            elif name in ["Jupiter", "Mercury"] and house == 1:
                score += 1.0
            elif name == "Saturn" and house == 7:
                score += 1.0
            else:
                score += 0.5 # Average
                
            # Chesta Bala (Motional)
            # Retrograde planets get more strength
            if p_data.get("is_retrograde", False):
                score += 1.0
            else:
                score += 0.3
                
            # Add a base temporal/aspectual average
            score += 2.0
            
            # Ensure boundaries (typically between 3.0 and 9.0 Rupas)
            final_rupa = max(3.0, min(9.0, round(score, 2)))
            
            is_strong = final_rupa > 6.0
            is_weak = final_rupa < 5.0
            
            # Dynamic Impact & Solution Generation
            impact = ""
            solution = ""
            
            if name == "Sun":
                if is_strong: impact = "Natural born leader with high vitality and strong authoritative presence."
                elif is_weak: impact = "May struggle with self-confidence, vitality, or asserting authority."
                else: impact = "Balanced sense of self and steady confidence."
                solution = "Chant Gayatri Mantra daily at sunrise." if is_weak else "Use your leadership to uplift others."
            elif name == "Moon":
                if is_strong: impact = "Deep emotional intelligence, strong intuition, and mental peace."
                elif is_weak: impact = "Prone to overthinking, emotional turbulence, or anxiety."
                else: impact = "Steady emotions with occasional fluctuations."
                solution = "Practice daily meditation and drink water from a silver vessel." if is_weak else "Trust your gut instincts."
            elif name == "Mars":
                if is_strong: impact = "Incredible drive, courage, and ability to execute plans."
                elif is_weak: impact = "May lack motivation, struggle with follow-through, or suppress anger."
                else: impact = "Healthy ambition and manageable energy levels."
                solution = "Engage in rigorous physical exercise or martial arts." if is_weak else "Channel your aggressive energy into sports."
            elif name == "Mercury":
                if is_strong: impact = "Razor-sharp intellect, excellent communication, and quick learning."
                elif is_weak: impact = "Can experience brain fog, miscommunication, or nervous energy."
                else: impact = "Good analytical skills and clear speech."
                solution = "Keep a daily journal and eat more green leafy vegetables." if is_weak else "Read complex books to feed your mind."
            elif name == "Jupiter":
                if is_strong: impact = "Abundant wisdom, financial luck, and a natural protective aura."
                elif is_weak: impact = "May face delays in growth, financial stress, or lack of mentorship."
                else: impact = "Steady growth and moderate luck in life."
                solution = "Donate to educational charities and respect your mentors." if is_weak else "Share your knowledge freely with others."
            elif name == "Venus":
                if is_strong: impact = "Magnetic charm, financial luxury, and harmonious relationships."
                elif is_weak: impact = "Struggles in romance, feeling undervalued, or financial friction."
                else: impact = "Balanced approach to love and material comforts."
                solution = "Practice extreme self-care and wear bright, clean clothes." if is_weak else "Create art or decorate your surroundings."
            elif name == "Saturn":
                if is_strong: impact = "Unbreakable discipline, long-term success, and immense patience."
                elif is_weak: impact = "Prone to procrastination, lack of structure, or giving up easily."
                else: impact = "A realistic worker who respects boundaries."
                solution = "Create a strict daily routine and help the underprivileged." if is_weak else "Take on massive long-term projects."
            
            shadbala_scores[name] = {
                "rupas": final_rupa,
                "percentage": int((final_rupa / 9.0) * 100),
                "is_strong": is_strong,
                "is_weak": is_weak,
                "strength_label": "Very Strong" if final_rupa >= 7.5 else "Strong" if is_strong else "Weak" if is_weak else "Average",
                "impact": impact,
                "solution": solution
            }
            
        return shadbala_scores
        
    def _get_house_number(self, planet_lon, asc_lon):
        asc_sign = int(asc_lon // 30) + 1
        planet_sign = int(planet_lon // 30) + 1
        house = (planet_sign - asc_sign + 1)
        if house <= 0:
            house += 12
        return house
