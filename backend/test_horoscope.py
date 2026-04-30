import sys
import os
import asyncio

# Add the current directory to sys.path to import services
sys.path.append(os.path.abspath('backend'))

from services.horoscope_service import HoroscopeService

async def test():
    service = HoroscopeService()
    user_data = {
        "name": "Test User",
        "dob": "1990-01-01",
        "time": "12:00",
        "lat": 28.6139,
        "lon": 77.2090,
        "profession": "IT Professional"
    }
    try:
        result = await service.get_daily_horoscope(user_data)
        print("SUCCESS")
        print(result.keys())
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test())
