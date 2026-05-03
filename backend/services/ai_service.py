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
                client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
                import json as _kjson
                prompt = f"""Profile:Rising={asc_sign}|Moon={moon_sign}|Element={element}|Ruler={ruler}(H{ruler_house})|Profession={user_profile.get('profession','professional')}

JSON only:
{{"soul_essence":"2 sentences core nature, no jargon","current_season":"2 sentences current life theme","wealth":"1 practical tip ≤15 words","career":"1 tip ≤15 words","health":"1 tip ≤15 words","remedy":"1 simple habit ≤12 words"}}"""
                response = await client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "system", "content": "Vedic life coach. JSON only. No astrological jargon."},
                              {"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.2, max_tokens=350
                )
                llm_res = response.choices[0].message.content
                kd = _kjson.loads(llm_res)
                return {
                    "soul_essence": kd.get("soul_essence", soul_essence),
                    "current_season": kd.get("current_season", current_season),
                    "actionable_pillars": {
                        "wealth": kd.get("wealth", lang_map["pillars"]["wealth"]),
                        "career": kd.get("career", lang_map["pillars"]["career"]),
                        "health": kd.get("health", lang_map["pillars"]["health"])
                    },
                    "remedy": kd.get("remedy", lang_map["remedies"].get(element, lang_map["remedies"]["Ether"]))
                }
            except Exception as e:
                print(f"Kundali AI Error: {e}")

        return {
            "soul_essence": soul_essence,
            "current_season": current_season,
            "actionable_pillars": lang_map["pillars"],
            "remedy": lang_map["remedies"].get(element, lang_map["remedies"]["Ether"])
        }

    
    async def get_yearly_prediction(self, chart_data, user_profile, target_year=2026, language="English"):
        """Generates a detailed 12-month roadmap for the Year Book module with AI synthesis."""
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        
        natal_moon = next((p for p in chart_data["planets"] if p["name"] == "Moon"), None)
        natal_sign = natal_moon["sign"] if natal_moon else "Aries"
        
        from openai import AsyncOpenAI
        import json
        import math as _math
        import asyncio
        api_key = os.environ.get("OPENAI_API_KEY")
        ai_client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")) if api_key else None

        sign_offset = self.engine.SIGN_NAMES.index(natal_sign) if natal_sign in self.engine.SIGN_NAMES else 0
        seasons = [
            "Winter – rest and reflection season",
            "Late Winter – planning and new intentions season",
            "Spring – new beginnings and action season",
            "Spring – growth and momentum season",
            "Late Spring – expansion and opportunity season",
            "Summer – peak energy and social season",
            "Monsoon – emotion and introspection season",
            "Late Monsoon – transition and course-correction season",
            "Autumn – harvest and results season",
            "Mid-Autumn – consolidation and review season",
            "Pre-Winter – preparation and saving season",
            "Winter – completion and release season"
        ]

        # Precompute scores
        month_scores = []
        for idx, m in enumerate(months):
            score = int(60 + 20 * _math.sin((idx + sign_offset) * _math.pi / 6)) + (sign_offset % 5)
            score = max(40, min(98, score))
            month_scores.append({"month": m, "score": score, "season": seasons[idx]})

        async def fetch_12_months():
            monthly_preds = []
            if ai_client:
                try:
                    prompt = f"""
You are an expert Vedic astrologer and life strategist. Generate a deeply personalized 12-month forecast for a {natal_sign} Moon native for the year {target_year}.

Rules:
- Each month must reflect its real-world season and energy (e.g., January = winter planning, July = peak energy).
- Every prediction must be 1-2 powerful, jargon-free, actionable sentences.
- After each prediction, add a "Simple Tip:" followed by 1 practical action the user can take.
- Ground predictions in real Vedic transits for {target_year} (e.g., Jupiter in Taurus, Saturn in Aquarius).
- NO astrological jargon. Write for a modern, educated audience.

Return a STRICT JSON object with exactly 12 month keys:
{{
  "January": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "February": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "March": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "April": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "May": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "June": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "July": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "August": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "September": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "October": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "November": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}},
  "December": {{"career": "...", "finance": "...", "love": "...", "health": "...", "travel": "..."}}
}}
"""
                    
                    response = await ai_client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[{"role": "system", "content": "You are a master life coach and astrologer. Output pure valid JSON only."},
                                  {"role": "user", "content": prompt}],
                        response_format={"type": "json_object"},
                        temperature=0.3, max_tokens=1800
                    )
                    llm_data = json.loads(response.choices[0].message.content)
                    
                    if 'January' not in llm_data and len(llm_data.keys()) == 1:
                        llm_data = list(llm_data.values())[0]

                    for ms in month_scores:
                        m = ms["month"]
                        ai_month = llm_data.get(m, {})
                        monthly_preds.append({
                            "month": m,
                            "career": ai_month.get("career", "Steady progress continues."),
                            "finance": ai_month.get("finance", "Maintain balance in your spending."),
                            "love": ai_month.get("love", "Focus on emotional connections."),
                            "health": ai_month.get("health", "Prioritize rest and nutrition."),
                            "travel": ai_month.get("travel", "Short trips are favored."),
                            "score": ms["score"]
                        })
                except Exception as e:
                    print(f"Batch Monthly AI Error: {e}")

            if not monthly_preds:
                for ms in month_scores:
                    monthly_preds.append({
                        "month": ms["month"],
                        "career": "Your professional path remains stable. Focus on current goals.",
                        "finance": "A neutral month for finances. Avoid large risks.",
                        "love": "Warmth in relationships is highlighted.",
                        "health": "Vitality is good; keep up your routine.",
                        "travel": "Travel plans are neutral.",
                        "score": ms["score"]
                    })
            return monthly_preds

        # Run both AI requests concurrently
        if ai_client:
            ai_outlook, monthly_preds = await asyncio.gather(
                self.get_yearbook_outlook(natal_sign, target_year),
                fetch_12_months()
            )
        else:
            ai_outlook = None
            monthly_preds = await fetch_12_months()

        return {
            "year": target_year,
            "predictions": monthly_preds,
            "ai_outlook": ai_outlook
        }
    

    async def get_daily_horoscope(self, sign_name, chart_data, user_profile=None, language="English"):
        """Generates real-time daily insights based on lunar transits and sign-specific metrics."""
        if user_profile is None:
            user_profile = {}
            
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        ai_client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")) if api_key else None

        # Find Moon's house relative to the Sign
        moon_data = next((p for p in chart_data["planets"] if p["name"] == "Moon"), {"sign": "Aries", "nakshatra": "Ashwini"})
        
        # Get Dasha info if available
        dasha_info = user_profile.get("dasha", {})
        mahadasha = dasha_info.get("mahadasha", "Unknown")
        antardasha = dasha_info.get("antardasha", "Unknown")
        
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
        # LLM Synthesis — single batched JSON call (merged 4 calls → 1)
        if ai_client:
            try:
                import json as _json
                prompt = f"""Sign:{sign_name}|Profession:{user_profile.get('profession','person')}|MoonHouse:{moon_h}|Risk:{risk_label}|Mahadasha:{mahadasha}|Antardasha:{antardasha}

Return JSON only:
{{"vibe":"1 sentence daily energy (no jargon)","season":"1 sentence current life theme","wealth":"tip ≤12 words","career":"tip ≤12 words","health":"tip ≤12 words","remedy":"1 simple ritual ≤10 words","cautions":["warn1","warn2","warn3"],"actions":["action1","action2","action3"],"citation":"1 sentence source logic ≤15 words"}}"""
                resp = await ai_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "system", "content": "Life coach. JSON only. No jargon. Ultra concise."},
                              {"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.2, max_tokens=300
                )
                d = _json.loads(resp.choices[0].message.content)
                soul_essence   = d.get("vibe", soul_essence)
                current_season = d.get("season", current_season)
                wealth         = d.get("wealth", wealth)
                career         = d.get("career", career)
                health         = d.get("health", health)
                remedy         = d.get("remedy", remedy)
                citation       = d.get("citation", citation)
                if d.get("cautions"):  cautions      = d["cautions"]
                if d.get("actions"):   power_actions = d["actions"]
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
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
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a warm, friendly life coach. Use simple English. No jargon. No hashtags."},
                          {"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=500
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
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
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a financial advisor. Use simple English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=500
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
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
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a warm, practical life coach. No jargon. Very simple English."},
                          {"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=500
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
            prompt = f"""
            You are a master astrologer. Synthesize a 2026 Year Book outlook for {sign_name}.
            
            Synthesize:
            - A 'Year Theme' (e.g., Year of Growth, Year of Discipline)
            - A 'Summary' (Detailed, comprehensive overview of the year, around 80-100 words, Easy English, no jargon)
            - 4 'Quarters' (Period: Q1/Q2/Q3/Q4, Focus: 2-3 detailed sentences each)
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
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a professional life mentor. Simple English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=500
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
                    elif k in ['q1', 'q2', 'q3', 'q4']: 
                        period_map = {
                            "q1": "Q1 (Jan - Mar)",
                            "q2": "Q2 (Apr - Jun)",
                            "q3": "Q3 (Jul - Sep)",
                            "q4": "Q4 (Oct - Dec)"
                        }
                        quarters.append({"period": period_map[k], "focus": v})
                    elif k == 'turning point': data['key_date'] = v
            
            data['quarters'] = quarters
            data['citation'] = f"Grounded in {sign_name} Gochara Logic & 2026 Transit Alignment."
            return data
        except Exception as e:
            print(f"Yearbook Outlook Error: {e}")
            return None

    async def get_monthly_ai_prediction(self, sign_name, month, score, season_context=""):
        """Generates distinct, plain-English monthly predictions for all pillars with actionable tips."""
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key: return None
        
        # Tone descriptor based on score band
        if score >= 80:
            tone = "very positive and energising"
        elif score >= 65:
            tone = "moderately positive with some growth opportunities"
        elif score >= 50:
            tone = "mixed — some good days, some careful days"
        else:
            tone = "challenging but manageable with the right focus"
        
        try:
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
            prompt = f"""
You are writing a personalized monthly forecast for someone with their Moon in {sign_name}.

Month: {month}
Season: {season_context}
Overall Energy Score: {score}/100 — this month feels {tone}.

Write a UNIQUE and SPECIFIC forecast for {month} only. Do NOT write generic advice.
Reflect the season ({season_context}) and the energy score in every prediction.

For each of the 5 areas below, write:
- A main insight: 2 clear, conversational sentences specific to {month}.
- A Simple Tip: one short, practical action the person can take this month (max 12 words).

Rules:
- Use plain, everyday English. No astrology words (no 'transit', 'aspect', 'retrograde', 'nakshatra', 'lagna', 'dasha').
- Be warm, human, and direct — like a trusted friend giving advice.
- Each section MUST feel different from the others.

Format exactly like this (no extra text, no markdown):
Career: [main insight — 2 sentences] Simple Tip: [one tip]
Finance: [main insight — 2 sentences] Simple Tip: [one tip]
Love: [main insight — 2 sentences] Simple Tip: [one tip]
Health: [main insight — 2 sentences] Simple Tip: [one tip]
Travel: [main insight — 2 sentences] Simple Tip: [one tip]
"""
            response = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a warm, practical life guide. Write like you are texting a close friend. Use simple, clear everyday language. Never use astrological jargon."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.85, max_tokens=500  # Higher temp = more varied outputs per month
            )
            text = response.choices[0].message.content.replace("#", "").strip()
            preds = {}
            for line in text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                if ':' in line:
                    parts = line.split(':', 1)
                    k = parts[0].strip().lower()
                    v = parts[1].strip()
                    if k in ['career', 'finance', 'love', 'health', 'travel']:
                        preds[k] = v
            return preds if len(preds) >= 4 else None
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
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
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a warm relationship mentor. Use simple, direct English. No jargon."},
                          {"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=500
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
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
            prompt = f"""
            You are a wise, empathetic Vedic AI Astrologer. 
            The user is asking a question about a person named {user_name}.
            Question: "{query}"
            
            Provide a warm, intuitive, and reassuring astrological answer (max 60 words). 
            Use simple English without overly technical jargon. Maintain the persona of a master Jyotishi.
            """
            response = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "system", "content": "You are a master Jyotishi and life guide."},
                          {"role": "user", "content": prompt}],
                temperature=0.7, max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Chat AI Error: {e}")
            return f"I sense strong, transformative energies for {user_name}. The planetary alignments suggest a very promising path forward."

    async def get_consultation_response(self, messages, astro_name, user_profile=None, is_repeat=False, repeat_count=0):
        """
        Generates a highly accurate, engaging consultation response.
        Implements: full chart injection, topic detection, persona voices,
        follow-up questions, session arc, date guardrails, and repeat handling.
        """
        from openai import AsyncOpenAI
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return f"I am {astro_name}, your Vedic guide. The stars hold much wisdom for you today."

        try:
            client = AsyncOpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com"))
            today = datetime.now().strftime("%d %B %Y")
            msg_count = len([m for m in messages if m.get("role") == "user"])

            # ── 1. ASTROLOGER PERSONA LIBRARY ──────────────────────────────────
            PERSONAS = {
                "Acharya Rahul": {
                    "voice": "Warm, uses 'beta' affectionately, authoritative. Uses phrases like 'I see clearly in your chart...', 'Beta, let me tell you...'. Always ends with one practical tip and a short Sanskrit blessing like 'Jai Shri Ram' or 'Om Namah Shivaya'.",
                    "specialty": "Vedic and KP Astrology, career and life purpose"
                },
                "Smt. Kavita": {
                    "voice": "Motherly, deeply compassionate. Speaks about karma and soul lessons naturally. Uses phrases like 'My dear...', 'Your soul chose this path because...'. Always asks ONE gentle follow-up question at the end to understand deeper.",
                    "specialty": "Nadi Astrology and Vastu, karmic patterns and past life influences"
                },
                "Dr. Sanjay": {
                    "voice": "Precise, analytical, scientific tone. Cites specific astrological logic briefly. Uses phrases like 'Technically speaking...', 'The Prashna chart for this moment indicates...', 'With high confidence I can say...'. Gives a probability estimate like '70% likely'.",
                    "specialty": "Prashna Astrology, precise event timing and decision analysis"
                },
                "Swami Ji": {
                    "voice": "Deeply spiritual, poetic, uses metaphors from nature and ancient texts. Speaks slowly and profoundly. Uses phrases like 'The river of your destiny...', 'As the Gita says...'. Always closes with a 5-word mantra relevant to the question.",
                    "specialty": "Vedic meditation, spiritual guidance, and life purpose"
                },
                "Astrologer Priya": {
                    "voice": "Friendly, modern, upbeat and encouraging. Uses conversational language. Uses phrases like 'Okay so here's the thing...', 'Honestly?', 'The good news is...'. Always ends with a numbered list of 2-3 action steps.",
                    "specialty": "Numerology, Tarot, and practical life coaching for modern challenges"
                },
                "Guru Dev": {
                    "voice": "Supremely authoritative, minimal words, maximum impact. Rarely uses filler words. Speaks in short, powerful, memorable sentences. Never more than 3 sentences per response. Each sentence lands like a truth.",
                    "specialty": "Grand synthesis of Vedic, KP, Nadi and Prashna — the complete picture"
                },
            }
            persona = PERSONAS.get(astro_name, PERSONAS["Acharya Rahul"])

            # ── 2. TOPIC DETECTION → CONTEXT INJECTION ─────────────────────────
            last_user_msg = ""
            for m in reversed(messages):
                if m.get("role") == "user":
                    last_user_msg = m.get("text", "").lower()
                    break

            topic_map = {
                "career":       ["job", "career", "work", "business", "promotion", "boss", "office", "profession", "resign", "interview"],
                "finance":      ["money", "invest", "finance", "loan", "debt", "savings", "wealth", "profit", "loss", "stock", "property"],
                "marriage":     ["marriage", "marry", "wedding", "spouse", "husband", "wife", "partner", "relationship", "love", "divorce"],
                "health":       ["health", "sick", "disease", "illness", "hospital", "surgery", "pain", "recovery", "anxiety", "depression"],
                "children":     ["child", "baby", "pregnancy", "son", "daughter", "kids", "fertility", "conceive"],
                "travel":       ["travel", "abroad", "visa", "migration", "move", "foreign", "country", "relocate"],
                "education":    ["study", "exam", "degree", "education", "college", "university", "course", "scholarship"],
            }
            detected_topic = "general"
            for topic, keywords in topic_map.items():
                if any(kw in last_user_msg for kw in keywords):
                    detected_topic = topic
                    break

            # House relevance per topic for targeted chart injection
            TOPIC_HOUSES = {
                "career":    [10, 6, 2],
                "finance":   [2, 11, 8],
                "marriage":  [7, 5, 2],
                "health":    [6, 8, 1],
                "children":  [5, 2, 9],
                "travel":    [9, 12, 3],
                "education": [4, 5, 9],
                "general":   [1, 10, 7],
            }
            relevant_houses = TOPIC_HOUSES.get(detected_topic, [1, 10, 7])

            # ── 3. FULL CHART INJECTION ─────────────────────────────────────────
            chart_block = ""
            if user_profile and user_profile.get("chart"):
                chart = user_profile["chart"]
                planets = chart.get("planets", [])

                # All planetary positions
                planet_lines = []
                for p in planets:
                    planet_lines.append(f"{p['name']}: {p['sign']} House {p['house']} ({p['degree']:.1f}°){' [R]' if p.get('is_retrograde') else ''}")
                all_planets = " | ".join(planet_lines)

                # Topic-relevant planets
                topic_relevant = [p for p in planets if p.get("house") in relevant_houses]
                topic_context = ", ".join([f"{p['name']} in {p['sign']} (H{p['house']})" for p in topic_relevant])

                asc_sign = planets[0]["sign"] if planets else "Unknown"
                moon_p = next((p for p in planets if p["name"] == "Moon"), None)
                moon_sign = moon_p["sign"] if moon_p else "Unknown"

                chart_block = (
                    f"\n\n=== VERIFIED BIRTH CHART (Swiss Ephemeris) ==="
                    f"\nAscendant: {asc_sign} | Moon: {moon_sign}"
                    f"\nAll Planets: {all_planets}"
                    f"\nKey planets for {detected_topic.upper()} question: {topic_context}"
                    f"\nYOU HAVE THE COMPLETE CHART. DO NOT ASK FOR BIRTH DETAILS EVER."
                )

            # ── 4. TIMING DATA (EXACT DATES ONLY) ──────────────────────────────
            timing_block = ""
            timing = user_profile.get("vedic_timing") if user_profile else None
            if timing and "error" not in timing:
                maha = timing.get("current_mahadasha", {})
                antar = timing.get("current_antardasha", {})
                upcoming = timing.get("upcoming_mahadashas", [])
                upcoming_str = " → ".join([f"{u['planet']} ({u['starts']} to {u['ends']})" for u in upcoming[:3]])
                timing_block = (
                    f"\n\n=== EXACT VEDIC TIMING (use ONLY these dates, never invent) ==="
                    f"\nToday: {today}"
                    f"\nCurrent Mahadasha: {maha.get('planet','?')} (ends {maha.get('ends','?')})"
                    f"\nCurrent Antardasha: {antar.get('planet','?')} (ends {antar.get('ends','?')})"
                    f"\nUpcoming: {upcoming_str}"
                    f"\nJupiter transiting: {timing.get('jupiter_current_sign','?')}"
                    f"\nMoon Nakshatra: {timing.get('moon_nakshatra_name','?')}"
                    f"\nRULE: Every prediction must reference ONLY these computed dates."
                )

            # ── 5. USER PROFILE CONTEXT (with computed age) ──────────────────
            profile_block = ""
            if user_profile:
                name = user_profile.get("full_name", "the seeker")
                dob = user_profile.get("birth_date", "")
                birth_time = user_profile.get("birth_time", "")
                place = user_profile.get("birth_place", "")
                profession = user_profile.get("profession", "")
                marital = user_profile.get("marital_status", "")

                # Compute exact age from DOB
                age_str = ""
                age_rules = ""
                try:
                    from dateutil.parser import parse as parse_date
                    dob_dt = parse_date(dob, dayfirst=True)
                    age = (datetime.now() - dob_dt).days // 365
                    age_str = f" | Current Age: {age} years"
                    retirement_age = 60
                    years_to_retirement = max(0, retirement_age - age)
                    career_cutoff_year = datetime.now().year + years_to_retirement

                    # Topic-aware Dasha window filter
                    topic_age_rule = ""
                    if detected_topic == "career":
                        topic_age_rule = (
                            f"\nCAREER TIMING RULE: Person is {age} years old."
                            f"\n- Only Dasha periods starting BEFORE {career_cutoff_year} are actionable career windows."
                            f"\n- Dasha periods starting after {career_cutoff_year} must be described as retirement, legacy, or spiritual phase — NEVER as a job change opportunity."
                            f"\n- NEVER suggest a career change window when the person will be over 60 at that time."
                        )
                    elif detected_topic == "children":
                        topic_age_rule = (
                            f"\nCHILDREN TIMING RULE: Person is {age} years old."
                            + ("\n- Biological childbirth is inappropriate at this age. Re-frame 5th house as creativity, legacy, or mentorship." if age > 45 else "\n- Childbirth is contextually relevant.")
                        )

                    # General age-tier rules
                    if age > 55:
                        age_rules = (
                            f"\n\nAGE GUARDRAILS (person is {age} — approaching retirement):"
                            f"\n- Focus on legacy, wealth preservation, spiritual growth, and family harmony."
                            f"\n- Career advice: suggest consulting, mentoring, or part-time roles — never full career pivots."
                            f"\n- Do NOT suggest starting a new career from scratch at this age."
                            f"\n- Do NOT predict childbirth."
                            f"{topic_age_rule}"
                        )
                    elif age > 45:
                        age_rules = (
                            f"\n\nAGE GUARDRAILS (person is {age} years old):"
                            f"\n- Do NOT predict childbirth or pregnancy — biologically and contextually inappropriate."
                            f"\n- If asked about children, re-frame 5th house: creativity, legacy, students, mentorship."
                            f"\n- Career changes are still very relevant — anchor advice to next {years_to_retirement} years only."
                            f"\n- Do NOT flag any Dasha period starting after age {retirement_age} as a career opportunity."
                            f"\n- All timing must be cross-referenced with current age of {age}."
                            f"{topic_age_rule}"
                        )
                    elif age > 35:
                        age_rules = (
                            f"\n\nAGE CONTEXT (person is {age} years old):"
                            f"\n- Fertility/children questions are still contextually relevant."
                            f"\n- Career peak years are ahead. Dasha periods within next 20 years are all actionable."
                            f"{topic_age_rule}"
                        )
                    elif age < 25:
                        age_rules = (
                            f"\n\nAGE CONTEXT (person is {age} — early life stage):"
                            f"\n- Focus on education, career foundation, self-discovery."
                            f"\n- Marriage/children predictions should be exploratory, not fixed timelines."
                            f"{topic_age_rule}"
                        )
                    else:
                        age_rules = topic_age_rule
                except Exception:
                    pass

                profile_block = (
                    f"\n\n=== SEEKER PROFILE ==="
                    f"\nName: {name}{age_str} | DOB: {dob} {birth_time} | Place: {place}"
                    f"\nProfession: {profession} | Marital Status: {marital}"
                    f"\nQuestion Topic: {detected_topic.upper()}"
                    f"{age_rules}"
                )

            # ── 6. SESSION ARC (smart follow-up logic) ──────────────────────────
            # Detect if user's last message is a short agreement / closure signal
            CLOSURE_SIGNALS = {
                "yes", "no", "ok", "okay", "sure", "alright", "i see", "understood",
                "got it", "makes sense", "i will", "will do", "i'll try", "noted",
                "good", "fine", "agree", "correct", "right", "exactly", "true",
                "sounds good", "that helps", "thank you", "thanks", "great", "perfect"
            }
            user_msg_clean = last_user_msg.strip().lower().rstrip("!.?")
            is_short_agreement = (
                len(last_user_msg.split()) <= 4 and
                any(sig in user_msg_clean for sig in CLOSURE_SIGNALS)
            )

            if msg_count <= 2:
                arc_instruction = (
                    "OPENING phase: Build rapport warmly. Acknowledge their concern and give your first powerful insight. "
                    "End with ONE open question to understand their situation better."
                )
            elif is_short_agreement:
                arc_instruction = (
                    "AFFIRMATION phase: The user has just agreed, confirmed, or given a short positive reply. "
                    "Do NOT ask another question right now. Instead: affirm their choice warmly, give one final encouragement or reminder, "
                    "then INVITE them to share their NEXT concern with a soft opener like 'Is there another area of your life you'd like to explore?' "
                    "Keep the response under 50 words. Let the conversation breathe."
                )
            elif msg_count <= 6:
                arc_instruction = (
                    "DEEP DIVE phase: Give your most specific, chart-grounded insight. "
                    "Ask a follow-up question ONLY if you genuinely need more information to deepen the reading. "
                    "If you have given a complete, actionable recommendation, do NOT force a question — end with a decisive statement instead. "
                    "A question should feel natural, not mechanical."
                )
            else:
                arc_instruction = (
                    "CLOSING phase: Synthesize the key wisdom from this session. Offer a final remedy or practical action. "
                    "Close with a warm, persona-appropriate blessing. Do NOT ask any more questions."
                )

            # ── 7. NO-CHART / ON-THE-FLY CHART COMPUTATION ──────────────────────
            no_chart_guard = ""
            if not (user_profile and user_profile.get("chart")):
                import re
                
                # Scan all user messages for birth details
                full_conversation = " ".join(
                    m.get("text", "") for m in messages if m.get("role") == "user"
                )
                
                date_pattern = re.compile(
                    r'(\d{1,2}[\s/-](?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|'
                    r'jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2})[\s/-]\d{2,4})',
                    re.IGNORECASE
                )
                time_pattern = re.compile(r'(\d{1,2}:\d{2}\s*(?:am|pm)?)', re.IGNORECASE)
                place_pattern = re.compile(
                    r'(?:born in|from|in|at|place[:\s]+)([A-Za-z][A-Za-z\s]{2,20})', re.IGNORECASE
                )

                date_matches = date_pattern.findall(full_conversation)
                time_matches = time_pattern.findall(full_conversation)
                place_matches = place_pattern.findall(full_conversation)

                # Try to compute chart if details found
                chart_computed = False
                if date_matches and time_matches and place_matches:
                    try:
                        from dateutil.parser import parse as parse_date
                        from services.astrology import AstrologyEngine
                        import urllib.request
                        import json
                        import pytz, swisseph as swe

                        dob_str = date_matches[-1]
                        dob = parse_date(dob_str, dayfirst=True)
                        place = place_matches[-1].strip()
                        time_str = time_matches[-1]
                        
                        # Time parsing
                        t_obj = parse_date(time_str).time()
                        h, m = t_obj.hour, t_obj.minute

                        # Geocode
                        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(place)}&format=json&limit=1"
                        req = urllib.request.Request(url, headers={'User-Agent': 'AstroPinch/2.0'})
                        with urllib.request.urlopen(req, timeout=3) as response:
                            geo_data = json.loads(response.read().decode())
                            if geo_data:
                                lat, lon = float(geo_data[0]['lat']), float(geo_data[0]['lon'])
                                
                                local_tz = pytz.timezone("Asia/Kolkata")
                                local_dt = local_tz.localize(datetime(dob.year, dob.month, dob.day, h, m))
                                utc_dt = local_dt.astimezone(pytz.utc)
                                jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute / 60.0)

                                ae = AstrologyEngine()
                                planets = ae.get_planets(jd_ut, lat, lon)
                                asc = ae.get_ascendant(jd_ut, lat, lon)

                                plines = []
                                for pname, p in planets.items():
                                    house = ae.get_house_number(p["longitude"], asc["longitude"])
                                    retro = " [R]" if p.get("is_retrograde") else ""
                                    plines.append(f"{pname}: {ae.SIGN_NAMES[p['sign_id']-1]} H{house}{retro}")

                                asc_sign = ae.SIGN_NAMES[asc["sign_id"] - 1]
                                no_chart_guard = (
                                    f"\n\n=== COMPUTED CHART (Details just provided) ==="
                                    f"\nUser's Details Found: {dob_str} at {time_str} in {place}"
                                    f"\nAscendant: {asc_sign}"
                                    f"\nPlanets: {' | '.join(plines)}"
                                    f"\nRULE: You now have their chart! Proceed with a full, verified prediction based on this data."
                                )
                                print(f"  ✅ On-the-fly chart computed | ASC={asc_sign}")
                                chart_computed = True
                    except Exception as e:
                        print(f"  ⚠️ On-the-fly chart failed: {e}")
                
                # If no chart could be computed, strictly block and ask
                if not chart_computed:
                    missing = []
                    if not date_matches: missing.append("Date of Birth")
                    if not time_matches: missing.append("Time of Birth")
                    if not place_matches: missing.append("Place of Birth")
                    
                    # If everything is missing (initial state), politely ask for the Name as well for UX
                    if len(missing) == 3:
                        missing.insert(0, "Name")
                    
                    missing_str = ", ".join(missing)
                    no_chart_guard = (
                        f"\n\n=== STRICT RULE: NO BIRTH CHART AVAILABLE ==="
                        f"\nYou DO NOT have the user's birth chart. You CANNOT make any astrological predictions."
                        f"\nYou must ONLY do one thing: politely ask for their {missing_str}."
                        f"\nDO NOT guess, DO NOT use Prashna, DO NOT give any general advice."
                        f"\nTell them: 'To give you a precise, chart-grounded reading, I need your exact birth details. Could you please share your {missing_str}?'"
                    )


            # ── 8. REPEAT QUESTION HANDLING ────────────────────────────────────
            TOPIC_CLARIFIERS = {
                "career":    "What's holding you back most — financial risk, your current manager, or fear of the unknown?",
                "finance":   "Are you asking about a specific investment, or your overall financial direction?",
                "marriage":  "Is your concern about timing, compatibility, or family expectations?",
                "health":    "Is this about a current condition, or a general concern about your future health?",
                "children":  "Are you asking about timing for having children, or about an existing child?",
                "travel":    "Is this about a specific trip or a longer-term move abroad?",
                "education": "Are you asking about a specific course, or your overall education path?",
                "general":   "What is the deepest worry behind this question — can you share more?",
            }
            repeat_block = ""
            if is_repeat:
                clarifier = TOPIC_CLARIFIERS.get(detected_topic, TOPIC_CLARIFIERS["general"])
                prev_answers = [m.get("text", "")[:100] for m in messages if m.get("role") in ("assistant", "astrologer")][-3:]
                prev_summary = " | ".join(prev_answers) if prev_answers else "none"
                repeat_block = (
                    f"\n\n=== REPEATED QUESTION DETECTED (repeat #{repeat_count}) ==="
                    f"\nYour previous answers summarized: {prev_summary}"
                    f"\nDO NOT repeat any of the above advice."
                    f"\nINSTEAD: Acknowledge you heard them, then ask this specific clarifying question to go deeper: '{clarifier}'"
                    f"\nThen offer ONE new, different angle on their question that you have not mentioned before."
                )

            # ── 8b. THIRD-PARTY DETECTION ──────────────────────────────────────
            # Scan all user messages for mentions of a spouse/third party
            all_user_text = " ".join(
                m.get("text", "").lower() for m in messages if m.get("role") == "user"
            )
            THIRD_PARTY_KEYWORDS = [
                "wife", "husband", "partner", "expecting", "pregnant", "pregnancy",
                "spouse", "she is", "he is", "her chart", "his chart", "my son", "my daughter",
                "my mother", "my father", "my sister", "my brother", "my friend"
            ]
            third_party_mentioned = any(kw in all_user_text for kw in THIRD_PARTY_KEYWORDS)

            # Try to extract and compute spouse's chart from conversation
            spouse_chart_block = ""
            spouse_chart_computed = False
            if third_party_mentioned:
                import re
                # Look for birth date patterns in the conversation
                date_pattern = re.compile(
                    r'(\d{1,2}[\s/-](?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|'
                    r'jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2})[\s/-]\d{2,4})',
                    re.IGNORECASE
                )
                time_pattern = re.compile(r'(\d{1,2}:\d{2}\s*(?:am|pm)?)', re.IGNORECASE)
                place_pattern = re.compile(
                    r'(?:born in|from|in|at|place[:\s]+)([A-Za-z][A-Za-z\s]{2,20})', re.IGNORECASE
                )

                full_conversation = " ".join(
                    m.get("text", "") for m in messages if m.get("role") == "user"
                )
                date_matches = date_pattern.findall(full_conversation)
                time_matches = time_pattern.findall(full_conversation)
                place_matches = place_pattern.findall(full_conversation)

                if date_matches and place_matches:
                    try:
                        from dateutil.parser import parse as parse_date
                        from services.astrology import AstrologyEngine
                        import pytz, swisseph as swe

                        spouse_dob_str = date_matches[-1]  # use most recent date mentioned
                        spouse_dob = parse_date(spouse_dob_str, dayfirst=True)
                        spouse_place = place_matches[-1].strip()

                        # Try geocoding the place
                        import urllib.request, urllib.parse, json as json_lib
                        geo_url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(spouse_place)}&format=json&limit=1"
                        req = urllib.request.Request(geo_url, headers={"User-Agent": "AstroPinch/2.0"})
                        with urllib.request.urlopen(req, timeout=3) as r:
                            geo_data = json_lib.loads(r.read())

                        if geo_data:
                            sp_lat = float(geo_data[0]["lat"])
                            sp_lon = float(geo_data[0]["lon"])

                            # Parse time
                            sp_hour, sp_minute = 12, 0
                            if time_matches:
                                t = parse_date(time_matches[-1])
                                sp_hour, sp_minute = t.hour, t.minute

                            local_tz = pytz.timezone("Asia/Kolkata")
                            sp_local = local_tz.localize(
                                datetime(spouse_dob.year, spouse_dob.month, spouse_dob.day, sp_hour, sp_minute)
                            )
                            sp_utc = sp_local.astimezone(pytz.utc)
                            jd = swe.julday(sp_utc.year, sp_utc.month, sp_utc.day,
                                            sp_utc.hour + sp_utc.minute / 60.0)

                            astro_engine = AstrologyEngine()
                            sp_planets = astro_engine.get_planets(jd, sp_lat, sp_lon)
                            sp_asc = astro_engine.get_ascendant(jd, sp_lat, sp_lon)

                            sp_lines = []
                            for pname, p in sp_planets.items():
                                h = astro_engine.get_house_number(p["longitude"], sp_asc["longitude"])
                                sp_lines.append(f"{pname}: {astro_engine.SIGN_NAMES[p['sign_id']-1]} H{h}")

                            sp_age = (datetime.now() - spouse_dob).days // 365
                            spouse_chart_block = (
                                f"\n\n=== SPOUSE/THIRD-PARTY CHART (Swiss Ephemeris) ==="
                                f"\nDOB: {spouse_dob.strftime('%d %b %Y')} | Place: {spouse_place} | Age: {sp_age}"
                                f"\nAscendant: {astro_engine.SIGN_NAMES[sp_asc['sign_id']-1]}"
                                f"\nPlanets: {' | '.join(sp_lines)}"
                                f"\nUse THIS chart (not the seeker's) for questions about the spouse/third party."
                            )
                            spouse_chart_computed = True
                            print(f"  ✅ Spouse chart computed: {spouse_place} | ASC={astro_engine.SIGN_NAMES[sp_asc['sign_id']-1]}")
                    except Exception as sp_err:
                        print(f"  ⚠️ Spouse chart computation failed: {sp_err}")

                if not spouse_chart_computed:
                    spouse_chart_block = (
                        "\n\n=== THIRD PARTY MENTIONED (no chart available) ==="
                        "\nThe user has mentioned a spouse or family member. You do NOT have their birth chart."
                        "\nDO NOT make predictions about the third party based on the seeker's chart."
                        "\nInstead say: 'For an accurate reading about [spouse/family member], I need their date, time, and place of birth.'"
                        "\nYou may offer general context from the seeker's 7th house (spouse) or 5th house (children) as secondary context only."
                    )

            # ── 9. OFF-TOPIC / CASUAL INPUT DETECTION ─────────────────────────
            CASUAL_PHRASES = [
                "i love you", "love you", "thank you", "thanks", "ok", "okay",
                "lol", "haha", "hehe", "bye", "goodbye", "good night", "good morning",
                "hello", "hi", "hey", "nice", "great", "cool", "wow", "amazing",
                "you're amazing", "you are great", "appreciate", "namaste", "🙏"
            ]
            msg_lower = last_user_msg.strip().lower()
            is_casual = (
                len(msg_lower.split()) <= 5 and
                any(phrase in msg_lower for phrase in CASUAL_PHRASES)
            )

            casual_rule = ""
            if is_casual:
                casual_rule = (
                    f"\n\nOFF-TOPIC / CASUAL MESSAGE DETECTED:"
                    f"\nThe user sent a short casual or emotional message ('{last_user_msg.strip()}') that is not a real astrological question."
                    f"\nRespond with warm, light humor in your persona — like a wise elder who smiles and deflects gently."
                    f"\nFor 'I love you' type messages: laugh it off warmly, e.g. 'Haha! Save those words for your partner — the stars say they need to hear it more than I do!' then offer to continue the reading."
                    f"\nFor 'thank you': acknowledge graciously in your persona voice, then invite the next question."
                    f"\nFor greetings: respond warmly and invite them to share their concern."
                    f"\nNEVER get clinical or stiff about casual messages. Stay warm, human, and in character."
                    f"\nKeep response under 40 words for casual messages."
                )

            # ── 10. FINAL SYSTEM PROMPT ─────────────────────────────────────────
            system_prompt = f"""You are {astro_name}, a world-renowned Vedic Astrologer.

PERSONA & VOICE: {persona['voice']}
SPECIALTY: {persona['specialty']}
SESSION PHASE: {arc_instruction}

ABSOLUTE RULES:
- Use ONLY the verified chart data and timing below. NEVER hallucinate planetary positions or dates.
- Keep response under 100 words. Be impactful, not verbose.
- Never say "I cannot access your chart" — you have it below.
- STRICT JARGON BAN: Speak in simple, everyday English. NEVER use heavy astrological terms like "5th lord", "debilitated", "transiting your 10th house", or "Mahadasha" in your final output. Explain the *meaning* and the *human experience* behind the stars instead of reciting the technical chart data to the user.
- Always speak in first person as {astro_name}.
- ALWAYS write a COMPLETE, self-contained response. Never end with phrases like 'Let me explain', 'I will elaborate', 'More on this...', or any cliffhanger. Every response must be a complete thought.
- When the user sends a casual, playful, or emotional message: respond warmly in persona — never get robotic or clinical about it.

ETHICAL PREDICTION LIMITS (NON-NEGOTIABLE):
- NEVER predict a child's gender with a percentage or certainty. It is not possible from any single chart alone.
- NEVER say "You are correct" or "I re-calculate" when the user states a future date or fact. Instead say: "Thank you for sharing this. Working with the {detected_topic} window you've mentioned..."
- NEVER agree with user-stated future facts as if your chart analysis confirmed them — you are acknowledging, not validating.
- NEVER predict medical outcomes (smooth delivery, complications, health of mother/child).
- For gender questions: note the classical Vedic indicators briefly, then always add: "This is a traditional indicator, not a certainty."
- If asked to predict something you cannot verify, say so honestly, then offer what you CAN say.
- NEVER give fabricated probability percentages (like "70% likely" or "80% confident") unless you can name the SPECIFIC planet and its position from the verified chart data that supports that number. If you cannot name the basis, do not give a percentage.
- PRASHNA vs NATAL: If you only have the Prashna (current sky) chart and NOT a birth chart, make it clear you are reading the current cosmic moment — not the user's personal natal chart. Never blend natal and Prashna language.
{chart_block}{timing_block}{profile_block}{spouse_chart_block}{no_chart_guard}{repeat_block}{casual_rule}"""

            # ── 8. BUILD MESSAGE HISTORY ────────────────────────────────────────
            openai_messages = [{"role": "system", "content": system_prompt}]

            # Memory compression: summarize if > 8 messages
            user_messages = [m for m in messages if m.get("role") != "system"]
            if len(user_messages) > 8:
                old_msgs = user_messages[:-6]
                summary_pairs = []
                for m in old_msgs:
                    r = "User" if m.get("role") == "user" else astro_name
                    summary_pairs.append(f"{r}: {m.get('text','')[:80]}")
                summary = "Earlier conversation summary: " + " | ".join(summary_pairs)
                openai_messages.append({"role": "system", "content": summary})
                user_messages = user_messages[-6:]

            for msg in user_messages:
                role = "assistant" if msg.get("role") in ("astrologer", "assistant", "astro") else "user"
                text = msg.get("text", msg.get("content", ""))
                if text:
                    openai_messages.append({"role": role, "content": text})

            # Temperature: lower for repeats to reduce variance
            temperature = 0.3 if is_repeat else 0.72

            response = await client.chat.completions.create(
                model="deepseek-chat",
                messages=openai_messages,
                temperature=temperature,
                max_tokens=320
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Consultation AI Error: {e}")
            import traceback; traceback.print_exc()
            return "I am sensing deep energies around your question. Could you share a little more context so I can guide you with precision?"

    async def get_sign_prediction(self, sign, chart_data):
        """Mock sign prediction."""
        return {
            "sign": sign,
            "prediction": "A day of great clarity and progress.",
            "scores": {"love": 80, "career": 85, "health": 90}
        }

