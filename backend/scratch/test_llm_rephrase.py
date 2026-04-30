import asyncio
import os
from services.horoscope_service import HoroscopeService

async def test():
    # Force a dummy key if not present just to see the error/behavior
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = "sk-placeholder"
    
    service = HoroscopeService()
    user_data = {
        "name": "Pranjay",
        "dob": "1995-10-15",
        "time": "14:30",
        "lat": 28.6139,
        "lon": 77.2090,
        "profession": "Developer"
    }
    horoscope = await service.get_daily_horoscope(user_data)
    
    print("LLM Rephrased Summary:")
    print(horoscope.get('llm_rephrased_summary'))

if __name__ == "__main__":
    asyncio.run(test())
