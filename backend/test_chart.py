import requests
import json

url = "http://localhost:8080/chart"
payload = {
    "year": 1990,
    "month": 1,
    "day": 1,
    "hour": 12,
    "minute": 0,
    "lat": 28.6139,  # Delhi
    "lon": 77.2090
}

response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
