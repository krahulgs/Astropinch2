class AshtakavargaService:
    """
    Calculates Ashtakavarga bindus (points) for planetary transits.
    Provides Sarvashtakavarga (SAV) points for all 12 houses.
    """
    
    def __init__(self):
        # Placeholder for the exhaustive BPHS Ashtakavarga tables.
        # Each planet distributes points to specific houses from itself, other planets, and the Lagna.
        # We will use a simplified robust approximation for the framework.
        pass
        
    def _get_planet_bindus(self, planet_name, planet_sign_idx, all_planets, asc_sign_idx):
        """
        Calculates the Bhinnashtakavarga (BAV) for a single planet.
        Returns a list of 12 integers representing the bindus in each sign (0-11).
        """
        # In a real implementation, we look up the rules.
        # E.g. Sun gives 1 bindu in 1st, 2nd, 4th... from itself.
        # Here we generate a mock standard distribution (total 337 points across 12 signs).
        # Average points per sign per planet is roughly 3 to 5.
        
        # Simplified mock generation for structural purposes
        bindus = [0] * 12
        # Assigning an average of 4 points per house, slightly varied based on the planet's sign
        for i in range(12):
            dist = (i - planet_sign_idx) % 12
            # Some arbitrary logic to give varied scores (0-8)
            score = 3 + (dist % 4) + (1 if (dist + asc_sign_idx) % 2 == 0 else 0)
            bindus[i] = min(8, score)
            
        return bindus

    def calculate_sav(self, natal_planets, ascendant):
        """
        Calculates the Sarvashtakavarga (total points for each sign).
        Returns a dictionary mapping sign index (1-12) to total points.
        """
        sav_scores = {i: 0 for i in range(1, 13)}
        
        # We only calculate for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
        planets_to_check = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
        
        asc_sign_idx = ascendant["sign_id"] - 1 # 0-indexed
        
        for planet in planets_to_check:
            p_data = natal_planets.get(planet)
            if not p_data:
                continue
                
            p_sign_idx = p_data["sign_id"] - 1
            
            bav_scores = self._get_planet_bindus(planet, p_sign_idx, natal_planets, asc_sign_idx)
            
            # Add to total SAV
            for i in range(12):
                sav_scores[i + 1] += bav_scores[i]
                
        return sav_scores

    def get_transit_strength(self, transit_planet_name, transit_sign_id, sav_scores):
        """
        Evaluates how strong a planet's transit is based on the SAV score of the sign it is transiting.
        """
        score = sav_scores.get(transit_sign_id, 28)
        
        if score >= 30:
            severity = "Highly Auspicious"
            color = "Green"
        elif score >= 25:
            severity = "Neutral"
            color = "Yellow"
        else:
            severity = "Challenging"
            color = "Red"
            
        return {
            "planet": transit_planet_name,
            "transiting_sign": transit_sign_id,
            "sav_score": score,
            "severity": severity,
            "color_code": color
        }
