import asyncio
import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from openai import AsyncOpenAI

async def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")
    
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    
    prompt = """
    In Vedic Astrology, I am analyzing the chart of Lovisha Gumber (DOB: 17/10/1997, 19:55, Jalandhar).
    Lagna (Ascendant): Taurus
    Moon Sign: Aries (Bharani Nakshatra)
    Mars is placed in Scorpio in the 7th house from Lagna.
    
    By standard rules, Mars in the 7th from Lagna and 8th from Moon creates Manglik Dosha (Kuja Dosha). 
    However, the astro-engine applies a "Parihara" (cancellation/neutralization) because Mars is in its own sign (Scorpio).
    
    Can you validate this specific cancellation rule? Why is Manglik Dosha neutralized when Mars is in its own sign (Scorpio) in the 7th house? Provide a proper, logical Vedic explanation referencing classical texts if possible.
    """
    
    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": "You are a master Vedic Astrologer."},
                  {"role": "user", "content": prompt}]
    )
    
    print(response.choices[0].message.content)

asyncio.run(main())
