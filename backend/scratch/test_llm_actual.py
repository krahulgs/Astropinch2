import asyncio
import os
from dotenv import load_dotenv
from services.horoscope_service import HoroscopeService

# Load .env explicitly to ensure we have the key
load_dotenv()

async def test():
    key = os.environ.get("OPENAI_API_KEY")
    print(f"DEBUG: Key found (first 5 chars): {key[:5]}..." if key else "DEBUG: No Key found")
    
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
    
    print("\nLLM Rephrased Summary:")
    print(horoscope.get('llm_rephrased_summary'))

if __name__ == "__main__":
    asyncio.run(test())
