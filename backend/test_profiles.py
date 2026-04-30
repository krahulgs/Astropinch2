import requests
import json

url = "http://127.0.0.1:8000/astropinch_daily"

profile1 = {
    "name": "Rahul Kumar",
    "dob": "1976-11-12",
    "time": "18:20",
    "lat": 23.6693,
    "lon": 86.1511,
    "profession": "Developer"
}

profile2 = {
    "name": "Isha Kumari",
    "dob": "2002-08-31",
    "time": "10:40",
    "lat": 23.7957,
    "lon": 86.4304,
    "profession": "Business"
}

print("Testing Profile 1: Rahul Kumar")
r1 = requests.post(url, json=profile1)
data1 = r1.json()
print("Lagna:", data1.get("lagna"))
print("Moon Sign:", data1.get("moon_sign"))
print("Financial Risk:", data1.get("risk_assessment", {}).get("financial_risk_detail"))
print("Strategic Action (Do):", data1.get("do_today", [""])[0])
print("-" * 40)

print("Testing Profile 2: Isha Kumari")
r2 = requests.post(url, json=profile2)
data2 = r2.json()
print("Lagna:", data2.get("lagna"))
print("Moon Sign:", data2.get("moon_sign"))
print("Financial Risk:", data2.get("risk_assessment", {}).get("financial_risk_detail"))
print("Strategic Action (Do):", data2.get("do_today", [""])[0])
print("-" * 40)

