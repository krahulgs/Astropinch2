import requests
import json

def test_prediction(name, year, month, day, hour, minute, lat, lon):
    url = "http://localhost:8000/ai/predict"
    payload = {
        "year": year,
        "month": month,
        "day": day,
        "hour": hour,
        "minute": minute,
        "lat": lat,
        "lon": lon
    }
    response = requests.post(url, json=payload)
    print(f"\n--- Prediction for {name} ---")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    # Profile 1: Aries Rising (roughly)
    test_prediction("Aries Profile", 1990, 4, 15, 6, 0, 28.6139, 77.2090)
    
    # Profile 2: Scorpio Rising (roughly)
    test_prediction("Scorpio Profile", 1990, 11, 15, 18, 0, 28.6139, 77.2090)
