from .astrology import AstrologyEngine
from .panchang import PanchangService
from .ai_service import AIService
from typing import Dict, Any
import datetime
import pytz
import os
from openai import AsyncOpenAI
from datetime import datetime as dt_class

class HoroscopeService:
    def __init__(self):
        self.engine = AstrologyEngine()
        self.panchang = PanchangService()
        self.ai_client = None
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key:
            self.ai_client = AsyncOpenAI(api_key=api_key)

    async def get_daily_horoscope(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates the ASTROPINCH daily guidance report.
        Input user_data should contain: name, dob, time, lat, lon, profession, goal (optional)
        """
        # 1. Vedic Data Extraction
        y, m, d = map(int, user_data['dob'].split('-'))
        h, mn = map(int, user_data['time'].split(':'))
        
        # Determine timezone (default to Asia/Kolkata for compatibility)
        tz_name = user_data.get('timezone', 'Asia/Kolkata')
        try:
            local_tz = pytz.timezone(tz_name)
        except:
            local_tz = pytz.timezone('Asia/Kolkata')
            
        local_dt = local_tz.localize(dt_class(y, m, d, h, mn))
        utc_dt = local_dt.astimezone(pytz.utc)
        
        jd_ut = self.engine.get_julian_day(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute)
        
        planets = self.engine.get_planets(jd_ut, user_data['lat'], user_data['lon'])
        asc = self.engine.get_ascendant(jd_ut, user_data['lat'], user_data['lon'])
        jatak = self.engine.get_jatak_aspects(planets)
        
        # 2. Current Transits (Today)
        now = datetime.datetime.now(pytz.utc)
        jd_now_ut = self.engine.get_julian_day(now.year, now.month, now.day, now.hour, now.minute)
        transits = self.engine.get_planets(jd_now_ut, user_data['lat'], user_data['lon'])
        panchang = self.panchang.get_daily_panchang(now.year, now.month, now.day, now.hour, now.minute, user_data['lat'], user_data['lon'])
        
        # 3. Construction Logic (Simulated AI / Template based on the Persona)
        # In production, this would call an LLM with the provided System Prompt.
        
        profession = user_data.get('profession', 'General')
        user_name = user_data.get('name', 'Seeker')
        
        # Logic for day energy based on Moon's relation to birth Moon and transits
        day_energy = "Strong"
        day_score = 8
        if panchang['tithi']['number'] in [4, 9, 14]: # Rikta Tithis
             day_energy = "Cautious"
             day_score = 4
        
        # This is a high-fidelity template that follows the ASTROPINCH persona exactly.
        # It uses the real calculated data from the engine.
        
        lagna_name = self.engine.SIGN_NAMES[asc['sign_id']-1]
        moon_name = self.engine.SIGN_NAMES[planets['Moon']['sign_id']-1]
        
        # Elements: 1=Fire, 2=Earth, 3=Air, 0=Water
        asc_element = asc['sign_id'] % 4
        moon_element = planets['Moon']['sign_id'] % 4

        # Dynamic profession handling
        if profession.lower() in ["developer", "engineer", "it"]:
            prof_advice = f"As someone in Tech, focus on debugging complex logic today. {moon_name}'s influence enhances your analytical depth."
        elif profession.lower() in ["doctor", "nurse", "healthcare"]:
            prof_advice = f"Your healing energy is amplified today by the {lagna_name} Lagna. Pay extra attention to patient communication."
        elif profession.lower() in ["business", "sales", "entrepreneur"]:
            prof_advice = f"Networking is highly favored today. Your {lagna_name} nature combined with current transits supports closing big deals."
        else:
            gen_advices = [
                f"As a {profession}, your intuition is your strongest asset today. Lean into your emotional depth to navigate office dynamics.", # Water
                f"As a {profession}, take bold actions today. Your Fire energy will help you stand out and execute swiftly.", # Fire
                f"As a {profession}, the current planetary configuration favors meticulous planning. Use your Earth strengths to guide your tasks.", # Earth
                f"As a {profession}, communication is key today. Use your {lagna_name} analytical skills to bridge gaps between teams." # Air
            ]
            prof_advice = gen_advices[asc_element]
        moon_element = planets['Moon']['sign_id'] % 4
        
        summary_themes = [
            f"This alignment encourages you to trust your intuitive depth and go with the flow.", # Water (0)
            f"This alignment ignites your natural leadership qualities and sparks immediate action.", # Fire (1)
            f"This alignment emphasizes discipline, structural focus, and building a solid foundation.", # Earth (2)
            f"This alignment stimulates your intellectual curiosity and desire for lively communication." # Air (3)
        ]
        theme_text = summary_themes[asc_element]

        day_summary = f"{user_name}, today the Moon transits through {panchang['nakshatra']['name']}, aligning with your {lagna_name} Lagna. {theme_text} {prof_advice}"

        # Dynamic Risk Map
        fin_details = [
            f"Your Water lagna brings intuitive financial moves today. Trust your gut.",
            f"Your Fire lagna ({lagna_name}) accelerates expenses. Guard against impulsive buying.",
            f"Your Earth lagna ({lagna_name}) secures your assets. Good day for long-term holds.",
            f"Your Air lagna ({lagna_name}) scatters focus. Double-check all transactions today."
        ]
        
        health_details = [
            f"Fluid retention is possible for {lagna_name}. Stay hydrated but avoid heavy sodium.",
            f"High energy but prone to burnout. {lagna_name} needs cooling foods today.",
            f"Digestive sensitivity. Stick to a simple routine suited for {lagna_name}.",
            f"Nervous energy is high. Protect your mental peace today."
        ]

        rel_details = [
            f"Deep emotional connections are favored by your {moon_name} Moon.",
            f"Passion is high, but avoid dominating conversations today.",
            f"Stable and grounding energy. A great day to support your partner.",
            f"Communication flows easily. Reach out to someone you haven't spoken to."
        ]
        
        travel_details = [
            f"Water signs should avoid long sea or river journeys today.",
            f"Avoid speeding. Fire signs need to remain calm in transit.",
            f"Safe for travel. Your Earth energy keeps you grounded.",
            f"Air travel is highly favored, but expect minor delays."
        ]

        reasonings = [
            f"Your {moon_name} Moon provides deep empathy, allowing you to read the room perfectly.",
            f"Your {moon_name} Moon gives you the courage to make swift, decisive calls.",
            f"Your {moon_name} Moon provides the emotional stability needed to navigate complex choices today.",
            f"Your {moon_name} Moon allows you to detach emotionally and see the purely logical path."
        ]
        decision_reasoning = reasonings[moon_element]
        
        # Dynamic Windows based on Tithi
        tithi_num = panchang['tithi']['number']
        best_times = ["9:15 AM - 11:00 AM", "11:45 AM – 1:30 PM", "2:00 PM - 3:45 PM", "4:15 PM - 5:30 PM"]
        avoid_times = ["Rahu Kaal 4:30–6:00 PM", "Yamaganda 1:30-3:00 PM", "Gulika 3:00-4:30 PM", "Rahu Kaal 9:00-10:30 AM"]

        # Dynamic Actions
        dynamic_do = [
            [f"Trust your {lagna_name} instincts when making spontaneous decisions.", f"Use the intuitive energy of your {moon_name} Moon to connect deeply.", "Meditate near a body of water or take a warm bath.", "Hydrate heavily to keep your energetic body clear."],
            [f"Leverage your core {lagna_name} strengths to lead complex projects.", f"Use the passionate energy of your {moon_name} Moon to inspire others.", "Engage in physical exercise or a brisk walk.", "Take the initiative in a stalled negotiation."],
            [f"Apply your practical {lagna_name} nature to reorganize your finances.", f"Use the grounding energy of your {moon_name} Moon to stabilize a chaotic meeting.", "Connect with a mentor or senior colleague for feedback.", "Organize your workspace to maintain energetic flow."],
            [f"Utilize your {lagna_name} intellect to solve logical puzzles.", f"Use the communicative energy of your {moon_name} Moon in negotiations.", "Read a chapter of a book or learn a new skill.", "Reach out to an old connection to spark new ideas."]
        ]

        dynamic_avoid = [
            [f"Ignoring your natural {lagna_name} intuition.", f"Letting {moon_name} mood swings dictate your financial choices.", "Isolating yourself when feeling overwhelmed."],
            [f"Over-exerting your {lagna_name} physical energy.", f"Allowing your {moon_name} Moon to provoke unnecessary conflicts.", "Making impulsive purchases without research."],
            [f"Being too rigid with your {lagna_name} routines.", f"Ignoring emotional cues because your {moon_name} Moon prefers logic.", f"Confronting colleagues during the {avoid_times[tithi_num % 4]} window."],
            [f"Overthinking simple {lagna_name} decisions.", f"Scattering your {moon_name} energy across too many tasks.", "Engaging in idle gossip."]
        ]
        
        # Dynamic Investment Guidance
        inv_sectors_favored = [
            ["Healthcare", "Shipping"], ["Energy", "Metals"], ["Real Estate", "Agriculture"], ["Technology", "Aviation"]
        ]
        inv_sectors_avoid = [
            ["Real Estate", "Metals"], ["Healthcare", "Agriculture"], ["Aviation", "Energy"], ["Shipping", "Real Estate"]
        ]
        inv_rationale = [
            f"Jupiter's placement favors {lagna_name}'s natural affinity for fluid and essential sectors.",
            f"Mars strongly supports your {lagna_name} drive in heavy industry and power generation.",
            f"Saturn creates a solid foundation for {lagna_name}'s investments in tangible assets.",
            f"Mercury's transit activates {lagna_name}'s sharp eye for emerging tech and communication."
        ]

        # Dynamic Remedies
        dynamic_remedies = [
            "Offer water to the Moon at night, chant Om Namah Shivaya.",
            "Offer water to the Sun facing East, chant Aditya Hridayam 3 times.",
            "Feed grass to a cow, or donate to an animal shelter.",
            "Feed birds or donate books to young students."
        ]

        # Dynamic Market Pulse
        market_sentiments = ["Neutral", "Bullish", "Cautious", "Volatile"]
        market_planets = [
            f"Moon in {moon_name}", f"Sun activating {lagna_name}", 
            f"Saturn stabilizing {lagna_name}", f"Mercury ruling {moon_name}"
        ]
        market_advices = [
            "Trust your gut feelings on intraday movements, but avoid heavy leverage.",
            "Great day for aggressive trades. Look for breakout patterns in the morning.",
            "Stick to your long-term plan. Avoid making sudden portfolio adjustments today.",
            "Information is power today. Read the news carefully before placing any trades."
        ]

        # Dynamic Wisdom
        wisdoms = [
            "Success flows like water. Do not force your path today, let it naturally carve its way through the obstacles.",
            "Your energy is a fire that can either warm the room or burn it down. Choose your battles wisely.",
            "Patience is the foundation of every empire. Build your day brick by brick.",
            "A clear mind catches the right breeze. Stay adaptable and let the winds of change guide you."
        ]

        # Dynamic Planetary Highlights
        jupiter_effects = [
            "Activating your intuitive reserves and bringing peace to your home environment.", # Water
            "Expanding your professional vision and bringing luck in leadership roles.", # Fire
            "Securing your long-term assets and bringing stability to your daily routines.", # Earth
            "Opening new avenues for communication and bringing luck in networking." # Air
        ]
        saturn_effects = [
            "Demanding emotional maturity and disciplined boundaries in relationships.", # Water
            "Demanding structural changes and disciplined work habits in your career.", # Fire
            "Enforcing financial responsibility and long-term planning.", # Earth
            "Testing your focus and requiring deep mental concentration." # Air
        ]

        # Dynamic Muhurta Micro-shifts (to individualize universal timings)
        m_shift = asc_element * 7 # 0, 7, 14, 21 minutes
        
        # 4. LLM Rephrasing (If API Key is available)
        llm_summary = None
        if self.ai_client:
            try:
                prompt = f"""
                You are a master Vedic Astrologer synthesizing complex celestial data into a clear, professional, and spiritually grounded daily guide.
                Rephrase the following astrological data into a sophisticated yet accessible report. 
                
                For each section, use the provided data but explain the COSMIC LOGIC behind it (e.g., 'Because the Moon is transiting your 10th house of career...').
                
                Input Data:
                - Native Name: {user_name}
                - Current Summary: {day_summary}
                - Profession: {profession}
                - Professional Advice: {prof_advice}
                - Key Planetary Influence: {moon_name} Moon & {lagna_name} Ascendant
                - Lucky Elements: Color {["Sea Green / White", "Red / Orange", "Brown / Emerald", "Sky Blue / Yellow"][asc_element]}, Direction {["North", "East"][planets['Moon']['sign_id'] > 6]}

                Required Format (Strictly follow this):
                
                ### 🌌 The Celestial Synthesis
                [A concise 1-2 sentence overview of the day's energy. Use clear, simple English. STICK TO UNDER 40 WORDS.]

                ### 🔭 The 'Why' Behind the Stars
                [Explain the cosmic logic in plain language without using any technical jargon like 'Nakshatra', 'Lagna', or house names. Explain it like a mentor to a student. STICK TO UNDER 50 WORDS.]

                ### ⚡ Power Move for Today
                [One short, actionable piece of advice. STICK TO UNDER 30 WORDS.]
                
                CRITICAL: Use ZERO astrological jargon. No mention of 'transits', 'aspects', or technical terms. Keep every section under 50 words.
                """
                response = await self.ai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a world-class Vedic Astrologer known for deep insights and practical wisdom."},
                              {"role": "user", "content": prompt}],
                    temperature=0.2
                )
                llm_summary = response.choices[0].message.content
            except Exception as e:
                print(f"LLM Rephrase Error: {e}")
                llm_summary = "Cosmic insights are being synthesized. Stay tuned."

        return {
            "date": now.strftime("%d %B %Y"),
            "llm_rephrased_summary": llm_summary,
            "user_name": user_name,
            "lagna": lagna_name,
            "moon_sign": moon_name,
            "current_dasha": "Jupiter - Venus", # Mocked for now, normally from JHora
            "birth_nakshatra": f"{self.engine.NAKSHATRA_NAMES[planets['Moon']['nakshatra_id']-1]} Pada {planets['Moon']['pada']}",
            "todays_nakshatra": f"{panchang['nakshatra']['name']}",
            "todays_tithi": panchang['tithi']['name'],

            "day_energy": day_energy,
            "day_score": day_score,

            "morning_mantra": [
                "ॐ नमः शिवाय (Om Namah Shivaya)\nMeaning: Salutations to the auspicious one. May your emotional waters remain calm.", # Water
                "ॐ सूर्याय नमः (Om Suryaya Namah)\nMeaning: Salutations to the Sun. May you radiate confidence and clarity.", # Fire
                "ॐ गं गणपतये नमः (Om Gam Ganapataye Namah)\nMeaning: Salutations to the Remover of Obstacles. May your material path be clear.", # Earth
                "ॐ बुं बुधाय नमः (Om Bum Budhaya Namah)\nMeaning: Salutations to Mercury. May your communication be precise and effective." # Air
            ][asc_element],

            "day_summary": day_summary,
            "profession_guidance": {
                "profession": profession,
                "todays_outlook": "Favorable" if day_score > 6 else "Neutral",
                "key_guidance": prof_advice,
                "best_time_to_work": best_times[tithi_num % 4],
                "avoid_time": f"{avoid_times[tithi_num % 4]} — avoid critical professional decisions",
                "decision_verdict": "Green Light — Take Decisions" if day_score > 6 else "Yellow — Wait for Clarity",
                "decision_reasoning": decision_reasoning
            },

            "risk_assessment": {
                "overall_risk_level": "Low" if day_score > 7 else "Moderate",
                "risk_score": 10 - day_score,
                "financial_risk": "Low" if asc_element in [0, 2] else "Moderate",
                "financial_risk_detail": fin_details[asc_element],
                "health_risk": "Moderate" if asc_element in [1, 3] else "Low",
                "health_risk_detail": health_details[asc_element],
                "relationship_risk": "Low" if moon_element in [0, 2] else "Moderate",
                "relationship_risk_detail": rel_details[moon_element],
                "travel_risk": "Low",
                "travel_risk_detail": travel_details[asc_element]
            },

            "do_today": dynamic_do[asc_element],

            "avoid_today": dynamic_avoid[asc_element],

            "investment_guidance": {
                "suitable_for_investing": "Yes" if day_score > 6 else "With Caution",
                "sectors_favored": inv_sectors_favored[asc_element],
                "sectors_to_avoid": inv_sectors_avoid[asc_element],
                "rationale": inv_rationale[asc_element]
            },

            "remedies": {
                "morning_remedy": dynamic_remedies[asc_element],
                "gemstone_activation": f"Wear your primary {lagna_name} gemstone touching the skin today.",
                "mantra_for_today": [
                    "Om Namah Shivaya (108 times)",
                    "Om Suryaya Namah (108 times)",
                    "Om Gam Ganapataye Namah (108 times)",
                    "Om Bum Budhaya Namah (108 times)"
                ][asc_element],
                "color_to_wear": ["Sea Green / White", "Red / Orange", "Brown / Emerald", "Sky Blue / Yellow"][asc_element]
            },

            "lucky_elements": {
                "lucky_number": (asc['sign_id'] + day_score) % 9 + 1,
                "lucky_color": "Blue" if asc['sign_id'] % 2 == 0 else "Red",
                "lucky_direction": "North" if planets['Moon']['sign_id'] <= 6 else "East",
                "lucky_time": f"12:{15 + m_shift} PM",
                "lucky_gemstone": "Sapphire" if asc['sign_id'] in [9, 12] else "Ruby"
            },

            "planetary_highlights": [
                {
                    "planet": "Jupiter",
                    "position": f"{self.engine.SIGN_NAMES[transits['Jupiter']['sign_id']-1]} 9th House",
                    "effect_today": jupiter_effects[asc_element]
                },
                {
                    "planet": "Saturn",
                    "position": f"{self.engine.SIGN_NAMES[transits['Saturn']['sign_id']-1]} 10th House",
                    "effect_today": saturn_effects[asc_element]
                }
            ],

            "important_muhurtas": {
                "auspicious_windows": [f"11:{45 - m_shift} AM - 12:{30 - m_shift} PM (Abhijit)", f"5:{30 + m_shift} PM - 6:{30 + m_shift} PM (Godhuli)"],
                "rahu_kaal": f"4:{30 + m_shift} PM – 6:{0 + m_shift if m_shift < 60 else m_shift} PM",
                "gulika_kaal": f"3:{0 + m_shift} PM – 4:{30 + m_shift} PM",
                "yamaganda": f"9:{0 + m_shift} AM – 10:{30 + m_shift} PM",
                "abhijit_muhurta": f"11:{54 - m_shift} AM"
            },

            "stock_market_pulse": {
                "market_sentiment": market_sentiments[asc_element],
                "confidence_level": "High" if day_score > 7 else "Medium",
                "key_planet_driving_markets": market_planets[asc_element],
                "sectors_to_watch": inv_sectors_favored[asc_element],
                "advice": market_advices[asc_element]
            },

            "closing_wisdom": wisdoms[asc_element]
        }
