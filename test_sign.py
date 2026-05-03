import asyncio
from backend.main import get_sign_horoscope

async def test():
    try:
        res = await get_sign_horoscope("gemini")
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
