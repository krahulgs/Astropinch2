import asyncio
from services.horoscope_service import HoroscopeService
from services.ai_service import AIService
import json

async def test():
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
    
    # We want to use the model's capability here to rephrase
    # Since I am the LLM, I will provide the rephrased version directly for now
    # or I can simulate how the code would look.
    
    print("Original Horoscope Summary:")
    print(horoscope['day_summary'])
    print("\nOriginal Career Guidance:")
    print(horoscope['profession_guidance']['key_guidance'])
    
if __name__ == "__main__":
    asyncio.run(test())
