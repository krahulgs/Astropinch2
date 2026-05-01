import os
import math
from datetime import datetime
from typing import Dict, List, Any
import numpy as np

class AIService:
    """
    Advanced AI Astrological Interpretation Engine for AstroPinch V2.0.
    Uses a combination of rule-based Vedic logic and localized synthesis.
    """
    
    def __init__(self, engine=None):
        from .astrology import AstrologyEngine
        self.engine = engine if engine else AstrologyEngine()

    async def get_ai_prediction(self, chart_data, user_profile, dasha_str=None, language="English"):
        """
        Generates a 4-module interpretation for the result page using natal placements.
        """
        # Ensure we have at least 2 planets for comparison
        if not chart_data.get("planets") or len(chart_data["planets"]) < 2:
            return {
                "soul_essence": "Your chart reveals a unique cosmic signature.",
                "current_season": "A phase of transition and growth.",
                "actionable_pillars": {"wealth": "Stable.", "career": "Positive.", "health": "Good."},
                "remedy": "Practice mindfulness."
            }

        asc_sign = chart_data["planets"][0]["sign"]
        # Moon is usually index 1 or we search for it
        moon_planet = next((p for p in chart_data["planets"] if p["name"] == "Moon"), chart_data["planets"][1])
        moon_sign = moon_planet["sign"]
        
        elements = {
            "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
            "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
            "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
            "Pisces": "Water", "Cancer": "Water", "Scorpio": "Water"
        }
        
        ruling_planets = {
            "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
            "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
            "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
        }

        ruler = ruling_planets.get(asc_sign, "your ruling planet")
        ruler_planet_data = next((p for p in chart_data["planets"] if p["name"] == ruler), None)
        ruler_house = ruler_planet_data["house"] if ruler_planet_data else 1
        element = elements.get(asc_sign, "Ether")

        translations = {
            "Hindi": {
                "signs": {"Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन", "Cancer": "कर्क", "Leo": "सिंह", "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक", "Sagittarius": "धनु", "Capricorn": "मकर", "Aquarius": "कुंभ", "Pisces": "मीन"},
                "planets": {"Sun": "सूर्य", "Moon": "चंद्रमा", "Mars": "मंगल", "Mercury": "बुध", "Jupiter": "बृहस्पति", "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु"},
                "adjectives": {
                    "Fire": "भावुक और ऊर्जावान",
                    "Earth": "व्यावहारिक और जमीन से जुड़े",
                    "Air": "बौद्धिक और सामाजिक",
                    "Water": "सहज और संवेदनशील",
                    "Ether": "विस्तारवादी"
                },
                "intro": "आपका व्यक्तित्व {asc} है और आपका हृदय {moon} जैसा है। यह आपको स्वाभाविक रूप से {adj} बनाता है। ",
                "p1": "आपका मार्गदर्शक ग्रह, {ruler}, एक शक्तिशाली स्थान पर है। यह आपको दिशा की एक मजबूत भावना देता है और आपको एक स्वाभाविक नेता बनाता है जो सही के लिए खड़ा होता है। ",
                "p2": "आपका मार्गदर्शक ग्रह, {ruler}, आपको जमीन से जोड़े रखता है। आप कड़ी मेहनत करने, अपने लक्ष्यों तक पहुँचने और यह सुनिश्चित करने पर बहुत ध्यान केंद्रित करते हैं कि आपका भविष्य सुरक्षित है। ",
                "p3": "आपका मार्गदर्शक ग्रह, {ruler}, आपके संपर्क क्षेत्र में है। आप तब सबसे अधिक विकसित होते हैं जब आप दूसरों से बात करते हैं, मित्र बनाते हैं और नए विचार साझा करते हैं। ",
                "p4": "आपका मार्गदर्शक ग्रह, {ruler}, आपके चार्ट के बहुत गहरे और शांत हिस्से में है। यह आपको एक विचारशील व्यक्ति बनाता है जो अपनी भावनाओं और अपने आध्यात्मिक पक्ष के साथ बहुत गहराई से जुड़ा हुआ है। ",
                "season_benefic": "आपके जीवन के इस वर्तमान अध्याय में, मुख्य विषय आत्म-खोज और व्यक्तिगत पहचान है। क्योंकि {planet}—भाग्य और विस्तार का ग्रह—आपके जीवन के इस क्षेत्र को सीधे आशीर्वाद दे रहा है, यह आपके लिए यहाँ बढ़ने और फलने-फूलने का एक प्रमुख समय है।",
                "season_malefic": "आप वर्तमान में एक परीक्षण चरण में हैं जहाँ आत्म-अनुशासन और धैर्य की आवश्यकता है। {planet} आपसे धीमे होने, भीतर देखने और आगे बढ़ने से पहले अपनी आदतों को सुधारने के लिए कह रहा है।",
                "season_neutral": "यह आपके लिए तैयारी का मौसम है। ग्रह आपको एक ठोस आधार बनाने में मदद करने के लिए संरेखित हो रहे हैं। अपने दीर्घकालिक लक्ष्यों पर ध्यान केंद्रित करें और अपने दैनिक अभ्यासों के साथ सुसंगत रहें।",
                "pillars": {
                    "wealth": "बचत करने और स्थिर संपत्तियों में निवेश करने का अच्छा समय है। अभी जोखिम भरे दांव लगाने से बचें।",
                    "career": "आपकी कड़ी मेहनत पर ध्यान दिया जा रहा है। केंद्रित रहें और कार्यस्थल की राजनीति से बचें।",
                    "health": "अपनी नींद और आहार को प्राथमिकता दें। रोजाना थोड़ी सैर आपकी ऊर्जा के लिए चमत्कार करेगी।"
                },
                "remedies": {
                    "Fire": "अपनी ऊर्जा को संतुलित रखने के लिए, पानी के पास कुछ समय बिताने या ठंडा करने वाले श्वास व्यायाम (प्राणायाम) का अभ्यास करें। सफेद या हल्के नीले जैसे हल्के, ठंडे रंग पहनने से आपका ध्यान बनाए रखने में मदद मिलेगी।",
                    "Earth": "प्रकृति के साथ जुड़ना आपकी सबसे बड़ी औषधि है। नंगे पैर घास पर चलने की कोशिश करें या कुछ बागवानी करें। पीले या भूरे जैसे मिट्टी के रंग आपको स्थिर और शांत महसूस कराएंगे।",
                    "Air": "आपका मन बहुत तेज चलता है, इसलिए शांति पाना महत्वपूर्ण है। प्रतिदिन 5-10 मिनट मौन ध्यान का अभ्यास करें। अपने विचारों को व्यवस्थित करने के लिए चंदन या लैवेंडर की सुगंध का उपयोग करें।",
                    "Water": "आप दूसरों की ऊर्जा को बहुत आसानी से सोख लेते हैं। हर शाम नमक के पानी से स्नान करके अपनी ऊर्जा को साफ करें। सुरक्षा के लिए हल्का केसरिया या क्रीम रंग पहनें।",
                    "Ether": "नियमित रूप से मंत्रों का जाप करने या सुनने से आपको बहुत लाभ होगा। अपने रहने की जगह को व्यवस्थित और साफ रखें ताकि सकारात्मक ऊर्जा का प्रवाह बना रहे।"
                }
            },
            "English": {
                "adjectives": {"Fire": "passionate and energetic", "Earth": "practical and grounded", "Air": "intellectual and social", "Water": "intuitive and sensitive", "Ether": "expansive"},
                "intro": "As a {asc} rising with your emotional foundation in {moon}, your core personality is driven by the element of {element}. This makes you naturally {adj}. ",
                "p1": "Your guide planet, {ruler}, connects with the deeper aspects of your chart, making you highly introspective and spiritual. ",
                "p2": "With {ruler} influencing your foundation, you possess profound emotional sensitivity and a strong connection to your roots. ",
                "p3": "The placement of {ruler} suggests your strength lies in your creative expression and your ability to shine in your chosen field. ",
                "p4": "Your planetary guide {ruler} emphasizes practical wisdom and a grounded approach to life\"s challenges. ",
                "season_benefic": "In this current chapter of your life, the main theme is self-discovery and personal branding. Because {planet}—the planet of luck and expansion—is directly blessing this area of your life, this is a prime time for you to grow and thrive here.",
                "season_malefic": "You are currently in a testing phase where self-discipline and patience are required. {planet} is asking you to slow down, look inward, and correct your habits before moving forward.",
                "season_neutral": "This is a season of preparation for you. The planets are aligning to help you build a solid foundation. Focus on your long-term goals and stay consistent with your daily practices.",
                "pillars": {
                    "wealth": "A good time to save and invest in stable assets. Avoid risky gambles right now.",
                    "career": "Your hard work is being noticed. Stay focused and avoid workplace politics.",
                    "health": "Prioritize your sleep and diet. A short walk daily will do wonders for your energy."
                },
                "remedies": {
                    "Fire": "To keep your energy balanced, try to spend some time near water or practice cooling breathing exercises. Wearing light, cool colors like white or soft blue will help maintain your focus.",
                    "Earth": "Connecting with nature is your best medicine. Try walking barefoot on grass or doing some gardening. Earthy tones like yellow or brown will keep you stable.",
                    "Air": "Your mind moves fast, so finding stillness is key. Practice 5-10 minutes of silent meditation daily. Use sandalwood or lavender scents to ground your thoughts.",
                    "Water": "You absorb others\" energy easily. Cleanse your energy by taking a salt-water bath each evening. Wear light saffron or cream colors for protection.",
                    "Ether": "Chanting or listening to mantras regularly will benefit you greatly. Keep your living space organized to allow positive energy to flow."
                }
            }
        }

        lang_map = translations.get(language, translations["English"])
        is_hindi = language == "Hindi"
        
        t_asc = lang_map.get("signs", {}).get(asc_sign, asc_sign) if is_hindi else asc_sign
        t_moon = lang_map.get("signs", {}).get(moon_sign, moon_sign) if is_hindi else moon_sign
        t_adj = lang_map.get("adjectives", {}).get(element, "unique") if is_hindi else lang_map.get("adjectives", {}).get(element, "versatile")
        t_ruler = lang_map.get("planets", {}).get(ruler, ruler) if is_hindi else ruler
        
        if is_hindi:
            soul_essence = lang_map["intro"].format(asc=t_asc, moon=t_moon, adj=t_adj)
            if ruler_house in [1, 5, 9]: soul_essence += lang_map["p1"].format(ruler=t_ruler)
            elif ruler_house in [2, 6, 10]: soul_essence += lang_map["p2"].format(ruler=t_ruler)
            elif ruler_house in [3, 7, 11]: soul_essence += lang_map["p3"].format(ruler=t_ruler)
            else: soul_essence += lang_map["p4"].format(ruler=t_ruler)
        else:
            soul_essence = lang_map["intro"].format(asc=asc_sign, moon=moon_sign, element=element, adj=t_adj)
            if ruler_house in [1, 5, 9]: soul_essence += lang_map["p1"].format(ruler=ruler)
            elif ruler_house in [4, 8, 12]: soul_essence += lang_map["p2"].format(ruler=ruler)
            elif ruler_house in [3, 7, 11]: soul_essence += lang_map["p3"].format(ruler=ruler)
            else: soul_essence += lang_map["p4"].format(ruler=ruler)

        benefic_transit = next((p for p in chart_data["planets"] if p["name"] in ["Jupiter", "Venus"] and p["house"] == 1), None)
        malefic_transit = next((p for p in chart_data["planets"] if p["name"] in ["Saturn", "Mars"] and p["house"] == 1), None)
        
        if benefic_transit:
            t_planet = lang_map.get("planets", {}).get(benefic_transit["name"], benefic_transit["name"]) if is_hindi else benefic_transit["name"]
            current_season = lang_map["season_benefic"].format(planet=t_planet)
        elif malefic_transit:
            t_planet = lang_map.get("planets", {}).get(malefic_transit["name"], malefic_transit["name"]) if is_hindi else malefic_transit["name"]
            current_season = lang_map["season_malefic"].format(planet=t_planet)
        else:
            current_season = lang_map["season_neutral"]

        # LLM Synthesis for Personal Kundali
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key:
            try:
                client = AsyncOpenAI(api_key=api_key)
                prompt = f"""
                You are a world-class Vedic Astrologer. Analyze this birth chart summary for a {user_profile.get('profession', 'professional')}.
                
                Data:
                - Rising Sign: {asc_sign}
                - Moon Sign: {moon_sign}
                - Element: {element}
                - Ruling Planet: {ruler} (in house {ruler_house})
                
                Synthesize a professional, jargon-free report.
                
                SECTION: Soul Essence
                [Concisely explain their core nature. Max 40 words.]
                
                SECTION: Life Chapter
                [Explain their current energetic focus. Max 40 words.]
                
                SECTION: Wealth Strategy
                [One concise tip for financial growth. Max 20 words.]
                
                SECTION: Career Path
                [One professional growth tip based on their profession. Max 20 words.]
                
                SECTION: Wellness Guide
                [One health or lifestyle tip. Max 20 words.]
                
                SECTION: Personal Remedy
                [One simple, practical ritual. Max 15 words.]
                """
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a friendly, expert astrologer. Use 'Easy English' that is simple to understand. No jargon. Explain things as a life mentor would."},
                              {"role": "user", "content": prompt}],
                    temperature=0.2
                )
                llm_res = response.choices[0].message.content
                
                # We can split these into the fields or just use the full synthesized report
                # For consistency with the existing 4-module UI, let's keep the return structure
                soul_essence = llm_res # The frontend handles splitting if needed, or we split here
                current_season = "Your unique birth chart analysis is being dynamically synthesized by our AI."
                
            except Exception as e:
                print(f"Kundali AI Error: {e}")

        # Parse LLM response if available
        if api_key and 'llm_res' in locals():
            lines = llm_res.split('\n')
            soul_essence = ""
            current_season = ""
            wealth_tip = ""
            career_tip = ""
            health_tip = ""
            personal_remedy = ""
            
            current_section = ""
            for line in lines:
                if 'SECTION: Soul Essence' in line: current_section = 'soul'
                elif 'SECTION: Life Chapter' in line: current_section = 'chapter'
                elif 'SECTION: Wealth Strategy' in line: current_section = 'wealth'
                elif 'SECTION: Career Path' in line: current_section = 'career'
                elif 'SECTION: Wellness Guide' in line: current_section = 'health'
                elif 'SECTION: Personal Remedy' in line: current_section = 'remedy'
                elif line.strip() and current_section:
                    if current_section == 'soul': soul_essence += line + " "
                    elif current_section == 'chapter': current_season += line + " "
                    elif current_section == 'wealth': wealth_tip += line + " "
                    elif current_section == 'career': career_tip += line + " "
                    elif current_section == 'health': health_tip += line + " "
                    elif current_section == 'remedy': personal_remedy += line + " "
            
            # Re-map tips to pillars for the UI
            wealth = wealth_tip.strip() if wealth_tip else lang_map["pillars"]["wealth"]
            career = career_tip.strip() if career_tip else lang_map["pillars"]["career"]
            health = health_tip.strip() if health_tip else lang_map["pillars"]["health"]
            remedy = personal_remedy.strip() if personal_remedy else lang_map["remedies"].get(element, lang_map["remedies"]["Ether"])
            
            return {
                "soul_essence": soul_essence.strip(),
                "current_season": current_season.strip(),
                "actionable_pillars": {
                    "wealth": wealth,
                    "career": career,
                    "health": health
                },
                "remedy": remedy
            }

        return {
            "soul_essence": soul_essence,
            "current_season": current_season,
            "actionable_pillars": lang_map["pillars"],
            "remedy": lang_map["remedies"].get(element, lang_map["remedies"]["Ether"])
        }

    
    async def get_yearly_prediction(self, chart_data, user_profile, target_year=2026, language="English"):
        """Generates a detailed 12-month roadmap for the Year Book module with AI synthesis."""
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        monthly_preds = []
        
        natal_moon = next((p for p in chart_data["planets"] if p["name"] == "Moon"), None)
        natal_sign = natal_moon["sign"] if natal_moon else "Aries"
        
        # 1. Get High-Level Annual Outlook
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        ai_client = AsyncOpenAI(api_key=api_key) if api_key else None
        
        ai_outlook = await self.get_yearbook_outlook(natal_sign, target_year) if ai_client else None
        
        # 2. Generate Monthly Predictions (with AI fallback)
        for idx, m in enumerate(months):
            score = 65 + (idx % 20) 
            ai_month = await self.get_monthly_ai_prediction(natal_sign, m, score) if ai_client else None
            
            if ai_month:
                monthly_preds.append({
                    "month": m,
                    "career": ai_month.get("career", "Steady progress continues."),
                    "finance": ai_month.get("finance", "Maintain balance in your spending."),
                    "love": ai_month.get("love", "Focus on emotional connections."),
                    "health": ai_month.get("health", "Prioritize rest and nutrition."),
                    "travel": ai_month.get("travel", "Short trips are favored."),
                    "score": score
                })
            else:
                monthly_preds.append({
                    "month": m,
                    "career": "Your professional path remains stable. Focus on current goals.",
                    "finance": "A neutral month for finances. Avoid large risks.",
                    "love": "Warmth in relationships is highlighted.",
                    "health": "Vitality is good; keep up your routine.",
                    "travel": "Travel plans are neutral.",
                    "score": score
                })
        
        return {
            "year": target_year,
            "predictions": monthly_preds,
            "ai_outlook": ai_outlook
        }
    

    async def get_daily_horoscope(self, sign_name, chart_data, user_profile, language="English"):
        """Generates real-time daily insights based on lunar transits and sign-specific metrics."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        ai_client = AsyncOpenAI(api_key=api_key) if api_key else None

        # Find Moon's house relative to the Sign
        moon_data = next((p for p in chart_data["planets"] if p["name"] == "Moon"), {"sign": "Aries"})
        try:
            moon_sign_id = self.engine.SIGN_NAMES.index(moon_data["sign"]) + 1
            target_sign_id = self.engine.SIGN_NAMES.index(sign_name) + 1
        except ValueError:
            moon_sign_id = 1
            target_sign_id = 1
            
        moon_h = ((moon_sign_id - target_sign_id + 12) % 12) + 1
        
        # Risk Assessment based on Moon's House (Gochara)
        # 8th house (Ashtama Chandra) or 12th house (Loss) are higher risk
        if moon_h == 8:
            risk_label, risk_score = "High", 82
            cautions = ["High risk of emotional misunderstandings.", "Avoid signing major legal documents today.", "Vigilance required in physical activity."]
        elif moon_h in [4, 12]:
            risk_label, risk_score = "Medium", 58
            cautions = ["Potential for domestic stress or overheads.", "Avoid over-exertion.", "Keep your plans flexible."]
        else:
            risk_label, risk_score = "Low", 28
            cautions = ["Avoid minor distractions.", "Stay focused on your primary goal."]

        # Default values for pillars/remedy/actions
        wealth = "Focus on conservation of resources today."
        career = "Steady progress; focus on administrative excellence."
        health = "Prioritize restorative practices and balanced diet."
        remedy = "Recite 'Om Namah Shivaya' 11 times or light a sandalwood incense to harmonize your lunar energy."
        power_actions = ["Plan your day carefully", "Stay hydrated", "Avoid unnecessary arguments"]
        citation = f"Grounded in Gochara Logic & {moon_data['sign']} Lunar Alignment."
        soul_essence = f"As a {sign_name}, you are experiencing the Moon's influence in your {moon_h} house today."
        current_season = "A period of steady growth and reflection."

        # LLM Synthesis
        if ai_client:
            try:
                prompt = f"""
                You are a world-class Vedic Astrologer. Synthesize a professional daily horoscope for {sign_name}.
                
                Data:
                - Moon is in the {moon_h} house from {sign_name}.
                - Risk Level: {risk_label} (Score: {risk_score}/100)
                - Transiting Sign: {moon_data['sign']}
                
                Format:
                SECTION: Celestial Vibe
                [Clear summary of how {sign_name} will feel. MAX 40 WORDS.]

                SECTION: Planetary Logic
                [Plain English explanation. NO JARGON. MAX 50 WORDS.]

                SECTION: Power Move
                [One actionable tip. MAX 30 WORDS.]
                
                CRITICAL: Use ONLY the SECTION: label format. Keep each section short and punchy.
                """
                response = await ai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a friendly mentor providing daily insights. Use very simple, 'Easy English.' Explain the vibe simply and avoid all technical terms."},
                              {"role": "user", "content": prompt}],
                    temperature=0.2
                )
                llm_response = response.choices[0].message.content

                # Split the response if it contains headers, or use as is
                soul_essence = llm_response
                # If LLM followed the format, current_season can be the 'Celestial Vibe' part
                # But to ensure it's fully AI, let's ask for the season specifically
                season_prompt = f"Explain the 'Current Season' for {sign_name} based on Moon in {moon_data['sign']} and risk {risk_label}. No jargon. Max 40 words."
                season_res = await ai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a professional astrologer. No jargon. Concise."},
                              {"role": "user", "content": season_prompt}],
                    temperature=0.2
                )
                current_season = season_res.choices[0].message.content.replace("#", "")

                # NEW: Pillar and Remedy LLM Integration
                pillar_prompt = f"""
                As a mentor, provide 3 short tips, 1 simple remedy, 3 concise cautions, and 3 power actions for {sign_name} today based on the Moon in house {moon_h}.
                
                Format:
                Wealth: [Tip, max 15 words]
                Career: [Tip, max 15 words]
                Health: [Tip, max 15 words]
                Remedy: [One simple ritual, max 12 words]
                Cautions: [List 3 short warnings separated by |]
                Actions: [List 3 short power actions separated by |]
                
                No jargon. Simple English only.
                """
                pillar_res = await ai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a warm, practical life coach. Use simple, easy-to-understand language. No technical terms."},
                              {"role": "user", "content": pillar_prompt}],
                    temperature=0.2
                )
                pillar_text = pillar_res.choices[0].message.content.replace("#", "")
                
                # Parse the pillar text
                p_lines = pillar_text.split('\n')
                wealth = next((l.split(': ')[1] for l in p_lines if 'Wealth' in l), wealth)
                career = next((l.split(': ')[1] for l in p_lines if 'Career' in l), career)
                health = next((l.split(': ')[1] for l in p_lines if 'Health' in l), health)
                remedy = next((l.split(': ')[1] for l in p_lines if 'Remedy' in l), remedy)
                
                # NEW: Cautions and Power Actions AI Integration
                c_line = next((l.split(': ')[1] for l in p_lines if 'Cautions' in l), "")
                if c_line: cautions = [c.strip() for c in c_line.split('|')]
                
                a_line = next((l.split(': ')[1] for l in p_lines if 'Actions' in l), "")
                if a_line: power_actions = [a.strip() for a in a_line.split('|')]
                
                # NEW: Citation LLM Integration
                cite_prompt = f"Create a short, professional 1-sentence citation for a horoscope based on Moon in {moon_data['sign']} for {sign_name}. No jargon. Explain the source logic simply. Max 20 words."
                cite_res = await ai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a data scientist. No jargon."},
                              {"role": "user", "content": cite_prompt}],
                    temperature=0.2
                )
                citation = cite_res.choices[0].message.content
            except Exception as e:
                print(f"LLM Sign Horoscope Error: {e}")
        else:
            wealth = "Moderate gains likely through digital channels." if moon_h in [2, 11] else "Focus on conservation of resources today."
            career = "Your influence is growing in your professional circle." if moon_h in [1, 10] else "Steady progress; focus on administrative excellence."
            health = "Vitality is high; excellent for rigorous activity." if moon_h in [1, 3, 6] else "Prioritize restorative practices and balanced diet."

        return {
            "sign": sign_name,
            "modules": {
                "soul_essence": soul_essence,
                "current_season": current_season,
                "actionable_pillars": {
                    "wealth": wealth,
                    "career": career,
                    "health": health
                },
                "remedy": remedy
            },
            "scores": {
                "love": 65 + (moon_h * 3) % 35,
                "career": 60 + (moon_h * 5) % 40,
                "health": 70 + (moon_h * 2) % 30
            },
            "risk_level": {"label": risk_label, "score": risk_score},
            "cautions": cautions,
            "power_actions": power_actions,
            "citation": citation
        }


    async def get_risk_synthesis(self, user_name, sign_name, element, moon_h):
        """
        Generates a 4-module risk assessment: Financial, Health, Relationship, Travel.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a friendly, expert Vedic Astrologer. Analyze the risks for {user_name} (Sign: {sign_name}) based on their {element} element and Moon in house {moon_h}.
            
            Synthesize a brief, 'Easy English' risk report for these 4 areas:
            1. Financial
            2. Health
            3. Relationships
            4. Travel
            
            For each, provide:
            - A Risk Level (Low, Moderate, High)
            - A 1-sentence friendly explanation of WHY.
            
            Format:
            Financial: [Level] | [Explanation, max 20 words]
            Health: [Level] | [Explanation, max 20 words]
            Relationships: [Level] | [Explanation, max 20 words]
            Travel: [Level] | [Explanation, max 20 words]
            
            No jargon. Warm, mentoring tone. No hashtags.
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a warm, friendly life coach. Use simple English. No jargon. No hashtags."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            return response.choices[0].message.content.replace("#", "")
        except Exception as e:
            print(f"Risk AI Error: {e}")
            return None
    

    async def get_market_synthesis(self, sign_name, element, moon_h):
        """
        Generates a 4-field market intelligence report: Sentiment, Suitable, Rationale, Sectors.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a Financial Astrologer. Analyze the markets for {sign_name} based on their {element} element and Moon in house {moon_h}.
            
            Synthesize a brief 'Easy English' market report with these fields:
            - Sentiment: [One word: Bullish, Cautious, Volatile, or Neutral]
            - Suitable: [One word: Yes, No, or With Caution]
            - Rationale: [One sentence explaining the cosmic reason. Max 20 words.]
            - Favored: [2 sectors separated by |]
            - Avoid: [2 sectors separated by |]
            
            Format:
            Sentiment: [Value]
            Suitable: [Value]
            Rationale: [Value]
            Favored: [Value]
            Avoid: [Value]
            
            No jargon. No hashtags.
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a financial advisor. Use simple English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            return response.choices[0].message.content.replace("#", "")
        except Exception as e:
            print(f"Market AI Error: {e}")
            return None
    

    async def get_actions_synthesis(self, user_name, sign_name, element, moon_h):
        """
        Generates a 3-bullet list of simple, jargon-free 'Do' actions.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return []
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a friendly life mentor. Suggest 3 simple, actionable 'Strategic Actions' for {user_name} (Sign: {sign_name}) based on their {element} energy today.
            
            Rules:
            - NO astrological jargon (no mention of signs, houses, moons, planets).
            - Use 'Easy English' (simple, direct words).
            - Each action must be under 15 words.
            - Focus on practical daily tasks (e.g., 'Clean your desk', 'Call a friend', 'Take a walk').
            
            Format:
            - Action 1
            - Action 2
            - Action 3
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a warm, practical life coach. No jargon. Very simple English."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            text = response.choices[0].message.content.replace("#", "")
            actions = [l.strip('- ').strip() for l in text.split('\n') if l.strip()]
            return actions[:3]
        except Exception as e:
            print(f"Actions AI Error: {e}")
            return []
    

    async def get_yearbook_outlook(self, sign_name, target_year):
        """Generates a high-level annual theme and outlook."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a master astrologer. Synthesize a 2026 Year Book outlook for {sign_name}.
            
            Synthesize:
            - A 'Year Theme' (e.g., Year of Growth, Year of Discipline)
            - A 'Summary' (max 40 words, Easy English, no jargon)
            - 4 'Quarters' (Period: Q1/Q2/Q3/Q4, Focus: 1 sentence each)
            - A 'Key Turning Point' (Specific date in 2026)
            
            Format:
            Theme: [Theme]
            Summary: [Summary]
            Q1: [Focus]
            Q2: [Focus]
            Q3: [Focus]
            Q4: [Focus]
            Turning Point: [Date]
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a professional life mentor. Simple English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            text = response.choices[0].message.content.replace("#", "")
            data = {}
            lines = text.split('\n')
            quarters = []
            for line in lines:
                if ':' in line:
                    parts = line.split(':', 1)
                    k = parts[0].strip().lower()
                    v = parts[1].strip()
                    if k == 'theme': data['theme'] = v
                    elif k == 'summary': data['summary'] = v
                    elif k in ['q1', 'q2', 'q3', 'q4']: quarters.append({"period": k.upper(), "focus": v})
                    elif k == 'turning point': data['key_date'] = v
            
            data['quarters'] = quarters
            data['citation'] = f"Grounded in {sign_name} Gochara Logic & 2026 Transit Alignment."
            return data
        except Exception as e:
            print(f"Yearbook Outlook Error: {e}")
            return None

    async def get_monthly_ai_prediction(self, sign_name, month, score):
        """Generates simplified, jargon-free monthly predictions for all pillars."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a friendly astrologer. Predict {month} for {sign_name} (Score: {score}/100).
            
            Synthesize 1 sentence each (max 15 words) for:
            - Career
            - Finance
            - Love
            - Health
            - Travel
            
            No jargon. Simple English. No hashtags.
            Format:
            Career: [Value]
            Finance: [Value]
            Love: [Value]
            Health: [Value]
            Travel: [Value]
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a helpful mentor. Easy English only."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            text = response.choices[0].message.content.replace("#", "")
            preds = {}
            for line in text.split('\n'):
                if ':' in line:
                    parts = line.split(':', 1)
                    k = parts[0].strip().lower()
                    v = parts[1].strip()
                    preds[k] = v
            return preds
        except Exception as e:
            print(f"Monthly AI Error: {e}")
            return None
    

    async def get_matching_synthesis(self, bride_name, groom_name, overall_score, grade, vedic_score, western_score):
        """
        Generates a 3-part compatibility synthesis: Narrative, Strengths, and Challenges.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a relationship counselor and master astrologer. Analyze the marriage compatibility between {bride_name} and {groom_name}.
            
            Inputs:
            - Overall Score: {overall_score}/100
            - Grade: {grade}
            - Vedic Guna: {vedic_score}/36
            - Western Sync: {western_score}%
            
            Synthesize:
            - A 'Narrative Summary' (max 50 words, warm, mentoring, no jargon).
            - 3 'Strengths' (bullet points, simple English).
            - 2 'Growth Areas' (bullet points, constructive, simple English).
            - 3 'Remedies' (Practical, actionable cosmic or behavioral safeguards, max 10 words each).
            
            Format:
            Narrative: [Summary]
            Strengths: [Strength 1] | [Strength 2] | [Strength 3]
            Growth: [Area 1] | [Area 2]
            Remedies: [Remedy 1] | [Remedy 2] | [Remedy 3]
            
            No jargon. No signs/planets mentioned. Just the human essence.
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a warm relationship mentor. Use simple, direct English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2
            )
            text = response.choices[0].message.content.replace("#", "")
            data = {}
            lines = text.split('\n')
            for line in lines:
                if ':' in line:
                    parts = line.split(':', 1)
                    k = parts[0].strip().lower()
                    v = parts[1].strip()
                    if k == 'narrative': data['narrative'] = v
                    elif k == 'strengths': data['strengths'] = [s.strip() for s in v.split('|')]
                    elif k == 'growth': data['challenges'] = [s.strip() for s in v.split('|')]
                    elif k == 'remedies': data['remedies'] = [s.strip() for s in v.split('|')]
            return data
        except Exception as e:
            print(f"Matching AI Error: {e}")
            return None
    
    async def get_chat_response(self, user_name, query):
        """Generates a dynamic astrological response to a user query for the free chat feature."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return f"I am your Vedic guide. Based on {user_name}'s chart, I see great potential."
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""
            You are a wise, empathetic Vedic AI Astrologer. 
            The user is asking a question about a person named {user_name}.
            Question: "{query}"
            
            Provide a warm, intuitive, and reassuring astrological answer (max 60 words). 
            Use simple English without overly technical jargon. Maintain the persona of a master Jyotishi.
            """
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a master Jyotishi and life guide."},
                          {"role": "user", "content": prompt}],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Chat AI Error: {e}")
            return f"I sense strong, transformative energies for {user_name}. The planetary alignments suggest a very promising path forward."

    async def get_consultation_response(self, messages, astro_name, user_profile=None):
        """Generates a dynamic response for the Marketplace Astrologer consultation chat, using actual chart data."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return f"I am {astro_name}, your Vedic guide. Based on your chart, I see great potential for growth."
        
        try:
            client = AsyncOpenAI(api_key=api_key)
            
            today = datetime.now().strftime("%d %B %Y")
            context_prompt = f"You are {astro_name}, an expert Vedic Astrologer. Write like a real human expert sharing wisdom, not a robot. Use a warm, conversational, and empathetic tone. Use natural phrases like 'I see here...', 'Looking at your charts...', or 'It's interesting to note...'. Today's date is {today}. IMPORTANT: Only predict events from today onwards. NEVER suggest past years as future opportunities. Keep responses under 60 words. Do not break character."
            if user_profile:
                name = user_profile.get("full_name", "the user")
                dob = user_profile.get("birth_date", "")
                birth_time = user_profile.get("birth_time", "")
                place = user_profile.get("birth_place", "")
                profession = user_profile.get("profession", "")
                marital = user_profile.get("marital_status", "")
                
                chart_context = ""
                if "chart" in user_profile and user_profile["chart"]:
                    chart = user_profile["chart"]
                    planets = chart.get("planets", [])
                    asc = planets[0].get("sign", "") if planets else ""
                    moon = next((p.get("sign", "") for p in planets if p.get("name") == "Moon"), "")
                    sun = next((p.get("sign", "") for p in planets if p.get("name") == "Sun"), "")
                    jupiter = next((p for p in planets if p.get("name") == "Jupiter"), None)
                    saturn = next((p for p in planets if p.get("name") == "Saturn"), None)
                    jupiter_info = f"Jupiter in House {jupiter['house']} ({jupiter['sign']})" if jupiter else ""
                    saturn_info = f"Saturn in House {saturn['house']} ({saturn['sign']})" if saturn else ""
                    dasha = chart.get("dasha", "")
                    chart_context = f" Birth Chart: Ascendant={asc}, Moon={moon}, Sun={sun}. {jupiter_info}. {saturn_info}. Current Dasha: {dasha}."
                
                context_prompt += f" You are consulting {name} (born {dob} at {birth_time} in {place}, profession: {profession}, marital status: {marital}).{chart_context} YOU ALREADY HAVE THEIR COMPLETE CHART. DO NOT ASK FOR BIRTH DETAILS. Give specific, date-aware predictions based on this data."
            
            # ── Inject verified Vedic timing data ───────────────────────────────
            timing = user_profile.get("vedic_timing") if user_profile else None
            if timing and "error" not in timing:
                maha = timing["current_mahadasha"]
                antar = timing["current_antardasha"]
                upcoming = timing.get("upcoming_mahadashas", [])
                upcoming_str = ", ".join(
                    [f"{u['planet']} Mahadasha ({u['starts']} to {u['ends']})" for u in upcoming]
                )
                jup_sign = timing.get("jupiter_current_sign", "")
                nak_name = timing.get("moon_nakshatra_name", "")
                timing_block = (
                    f" VERIFIED VEDIC TIMING (computed from Swiss Ephemeris, NOT guessed):"
                    f" Moon Nakshatra={nak_name}."
                    f" Current Mahadasha: {maha['planet']} (ends {maha['ends']})."
                    f" Current Antardasha: {antar['planet']} (ends {antar['ends']})."
                    f" Upcoming Mahadashas: {upcoming_str}."
                    f" Jupiter currently transiting {jup_sign}."
                    f" Use ONLY these computed dates when predicting timing. Never invent or approximate years."
                )
                context_prompt += timing_block
            # ──────────────────────────────────────────────────────────────────

            # Format history for OpenAI
            openai_messages = [{"role": "system", "content": context_prompt}]
            
            for msg in messages:
                # msg usually has 'role' ('astro' or 'user') and 'text'
                role = "assistant" if msg.get("role") == "astro" else "user"
                openai_messages.append({"role": role, "content": msg.get("text", "")})
                
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=openai_messages,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Consultation AI Error: {e}")
            return f"I am analyzing your energies right now. The cosmos are aligning favorably."

    async def get_sign_prediction(self, sign, chart_data):
        """Mock sign prediction."""
        return {
            "sign": sign,
            "prediction": "A day of great clarity and progress.",
            "scores": {"love": 80, "career": 85, "health": 90}
        }

