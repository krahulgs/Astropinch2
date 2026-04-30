import asyncio
import os
from dotenv import load_dotenv
from services.horoscope_service import HoroscopeService

load_dotenv()

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
    
    print("AI Enhanced Summary:")
    print(horoscope.get('llm_rephrased_summary'))

if __name__ == "__main__":
    asyncio.run(test())
