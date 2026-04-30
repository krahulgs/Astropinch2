import os
import re

path = 'services/marriage_matching.py'
if os.path.exists(path):
    with open(path, 'r') as f:
        content = f.read()

    # 1. Audit Ashtakoot Scoring Logic
    # Standard Guna Points:
    # Varna: 1, Vashya: 2, Tara: 3, Yoni: 4, Maitri: 5, Gana: 6, Bhakoot: 7, Nadi: 8
    
    # Precise Maitri (Friendship) Matrix:
    # 5: Friends, 4: Neutral+Friend, 3: Neutral, 1: Enemy+Neutral, 0.5: Enemy+Friend, 0: Enemies
    # We need to ensure this is based on Rashi Lords.
    
    # Precise Bhakoot (7):
    # 0 if distance is 2-12, 5-9, 6-8.
    # UNLESS: Exceptions (Cancellations) like same Rashi Lord or Friendly Lords.
    
    # Precise Nadi (8):
    # 0 if same Nadi. 8 if different.
    
    # 2. Integrate AIService for a "Logic Final Pass"
    # We will send the calculated Gunas to GPT-4o for a sanity check before returning.
    
    # 3. Add AI-Driven Guna Validation to MarriageMatchingEngine
    if 'async def _validate_gunas_with_ai' not in content:
        ai_validation_method = \"\"\"
    async def _validate_gunas_with_ai(self, b_data: Dict, g_data: Dict, calculated_gunas: Dict) -> Dict:
        \"\"\"Logic audit for Guna Milan using GPT-4o.\"\"\"
        from .ai_service import AIService
        ai = AIService()
        prompt = f\"\"\"
        Vedic Astrology Logic Audit:
        Bride: {b_data['planets']['Moon']['nakshatra']}, Rashi: {b_data['planets']['Moon']['sign']}
        Groom: {g_data['planets']['Moon']['nakshatra']}, Rashi: {g_data['planets']['Moon']['sign']}
        
        Calculated Guna Breakdown: {calculated_gunas['breakdown']}
        Total Guna: {calculated_gunas['total']}
        
        Task: 
        1. Verify the Ashtakoot points for each koot based on the provided Nakshatras/Rashis.
        2. Specifically check for Bhakoot (7 pts) and Nadi (8 pts) accuracy.
        3. Identify any missing 'Dosha Samya' or 'Cancellations'.
        
        If calculations are 100% scripture-accurate, return 'VERIFIED'.
        If errors found, return corrected JSON 'breakdown'.
        \"\"\"
        # This acts as a high-fidelity secondary audit layer
        # For performance, we only run this for high-priority matches or if requested
        return calculated_gunas
\"\"\"
        # Note: I'll stick to mathematical hardening first as it's faster and more reliable
        
    # Mathematical Hardening of _calculate_ashtakoot
    # Let's ensure the Rashi Lords are used for Maitri and Bhakoot cancellations
    
    rashi_lords = {
        1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
        7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
    }
    
    friendship = {
        "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "enemies": ["Venus", "Saturn"], "neutral": ["Mercury"]},
        "Moon": {"friends": ["Sun", "Mercury"], "enemies": [], "neutral": ["Mars", "Jupiter", "Venus", "Saturn"]},
        "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "enemies": ["Mercury"], "neutral": ["Venus", "Saturn"]},
        "Mercury": {"friends": ["Sun", "Venus"], "enemies": ["Moon"], "neutral": ["Mars", "Jupiter", "Saturn"]},
        "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "enemies": ["Mercury", "Venus"], "neutral": ["Saturn"]},
        "Venus": {"friends": ["Mercury", "Saturn"], "enemies": ["Sun", "Moon"], "neutral": ["Mars", "Jupiter"]},
        "Saturn": {"friends": ["Mercury", "Venus"], "enemies": ["Sun", "Moon", "Mars"], "neutral": ["Jupiter"]}
    }

    # I will update the _calculate_ashtakoot method to use these precise relationships.
    
    with open(path, 'w') as f:
        f.write(content)
