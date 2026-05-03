import asyncio
import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from openai import AsyncOpenAI

async def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")
    
    if not api_key:
        print("No API Key")
        return
        
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    
    prompt = """
    In Vedic Astrology, consider the following chart details:
    Lagna: Taurus
    Moon: Aries (Bharani)
    Mars is placed in Scorpio in the 7th house.
    
    The software calculates Kuja Dosha (Manglik Dosha) as present from Lagna (7th house) and Moon (8th house). 
    However, it applies a Parihara (neutralization/cancellation) because "Mars is in its own sign (Scorpio)".
    
    Is this cancellation rule authentic according to classical Jyotish texts (like BPHS, Phaladeepika, or Muhurta Chintamani)? Provide a proper logical validation for why Mars in its own sign (Scorpio) in the 7th house neutralizes Manglik Dosha.
    """
    
    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": "You are a master Vedic Astrologer."},
                  {"role": "user", "content": prompt}]
    )
    
    print(response.choices[0].message.content)

asyncio.run(main())
