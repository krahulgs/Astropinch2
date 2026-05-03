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
    In Vedic Astrology, I am analyzing a specific Manglik Dosha case.
    
    Data: 17 Oct 1997, 19:55, Jalandhar, India.
    
    Astrological Logic to Validate:
    1. Lagna Sandhi: The Ascendant at this exact time is on the boundary between Aries and Taurus. Because astrology is highly sensitive to exact time, a difference of 2-5 minutes flips the Lagna, making this a borderline case where the Dosha shouldn't be treated as an absolute binary.
    2. Mars Placement: If we assume a Taurus Lagna, Mars falls in the 8th house (creating Manglik Dosha). However, Mars is placed in Sagittarius. Since Sagittarius is ruled by Jupiter (a friendly, dharmic sign), the aggression of Mars is significantly reduced. This leads to a Mild or Cancelled Manglik Dosha rather than a severe one.
    
    Can you validate this two-step logic? Is it astrologically sound to consider Lagna Sandhi as a mitigating factor in absolute predictions, and does Mars in Sagittarius genuinely reduce the severity of Kuja Dosha? Please provide a brief, professional validation.
    """
    
    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": "You are an expert Vedic Astrologer."},
                  {"role": "user", "content": prompt}]
    )
    
    print(response.choices[0].message.content)

asyncio.run(main())
