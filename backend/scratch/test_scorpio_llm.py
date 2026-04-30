import asyncio
import os
from dotenv import load_dotenv
from services.ai_service import AIService
from services.astrology import AstrologyEngine

load_dotenv()

async def test():
    engine = AstrologyEngine()
    ai = AIService(engine)
    
    # Mock chart data for general transit
    chart_data = {
        "planets": [
            {"name": "Moon", "sign": "Libra"} # Current transit
        ]
    }
    
    print("Fetching Scorpio Daily Horoscope (LLM)...")
    res = await ai.get_daily_horoscope("Scorpio", chart_data, None)
    
    print("\nResponse for Scorpio:")
    print(res['modules']['soul_essence'])

if __name__ == "__main__":
    asyncio.run(test())
