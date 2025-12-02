import requests
import json

API_URL = "http://localhost:8001/predict-scam"

test_cases = [
    {
        "type": "Phishing SMS",
        "text": "URGENT: Your bank account is locked. Click bit.ly/verify to unlock."
    },
    {
        "type": "Safe Email",
        "text": "Hey mom, I'll be home for dinner around 7 PM."
    },
    {
        "type": "Lottery Scam",
        "text": "CONGRATS! You won $1000. Call now to claim prize."
    },
    {
        "type": "Obfuscated",
        "text": "P@yPal security alert. V3rify now."
    }
]

print(f"{'Input Type':<15} | {'Detected':<10} | {'Conf':<6} | {'Text'}")
print("-" * 80)

for case in test_cases:
    try:
        response = requests.post(API_URL, json={"text": case["text"]})
        if response.status_code == 200:
            data = response.json()
            pred = "Scam" if data['prediction'] == "scam" else "Safe"
            conf = data['confidence']
            print(f"{case['type']:<15} | {pred:<10} | {conf:.2f} | {case['text']}")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Connection Error: {e}")
