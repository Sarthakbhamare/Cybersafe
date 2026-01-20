#!/usr/bin/env python3
"""Test ML Service Integration"""

import requests
import json

ML_SERVICE_URL = 'http://localhost:5001'

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing ML Service Health...")
    try:
        response = requests.get(f'{ML_SERVICE_URL}/health', timeout=5)
        print(f"   ✅ Status: {response.json()}")
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False

def test_scam_detection():
    """Test scam detection with sample texts"""
    print("\n🧪 Testing Scam Detection...")
    
    test_cases = [
        {
            'text': 'Claim your $500 prize now! Click here immediately!',
            'expected': 'scam',
            'channel': 'sms'
        },
        {
            'text': 'Hi, how are you? Let me know when you are free.',
            'expected': 'legitimate',
            'channel': 'general'
        },
        {
            'text': 'URGENT: Verify your account now or lose access!',
            'expected': 'scam',
            'channel': 'email'
        },
        {
            'text': 'Thanks for the update. See you tomorrow!',
            'expected': 'legitimate',
            'channel': 'whatsapp'
        }
    ]
    
    results = []
    for i, case in enumerate(test_cases, 1):
        try:
            response = requests.post(
                f'{ML_SERVICE_URL}/predict',
                json={'text': case['text'], 'channel': case['channel']},
                timeout=5
            )
            data = response.json()
            
            prediction = 'scam' if data['is_scam'] else 'legitimate'
            correct = '✅' if prediction == case['expected'] else '❌'
            
            print(f"\n   Test {i}: {correct}")
            print(f"   Text: {case['text'][:50]}...")
            print(f"   Expected: {case['expected']} | Got: {prediction}")
            print(f"   Probability: {data['scam_probability']:.3f} | Risk: {data['risk_level']}")
            
            results.append(prediction == case['expected'])
        except Exception as e:
            print(f"   ❌ Test {i} failed: {e}")
            results.append(False)
    
    accuracy = sum(results) / len(results) * 100
    print(f"\n   📊 Accuracy: {accuracy:.0f}% ({sum(results)}/{len(results)} correct)")
    return accuracy >= 75

def test_batch_prediction():
    """Test batch prediction"""
    print("\n🔄 Testing Batch Prediction...")
    
    texts = [
        'Win $1000 now!',
        'Hello, how are you?',
        'Claim your prize immediately!'
    ]
    
    try:
        response = requests.post(
            f'{ML_SERVICE_URL}/batch_predict',
            json={'texts': texts, 'channel': 'general'},
            timeout=10
        )
        data = response.json()
        
        print(f"   ✅ Batch predictions: {len(data['predictions'])} texts analyzed")
        for pred in data['predictions']:
            status = '🚨 SCAM' if pred['is_scam'] else '✅ SAFE'
            print(f"      {status} | Prob: {pred['scam_probability']:.3f} | {pred['text'][:40]}...")
        
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("ML SERVICE INTEGRATION TEST".center(70))
    print("="*70)
    
    # Run tests
    health_ok = test_health()
    detection_ok = test_scam_detection()
    batch_ok = test_batch_prediction()
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY".center(70))
    print("="*70)
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Scam Detection: {'✅ PASS' if detection_ok else '❌ FAIL'}")
    print(f"   Batch Prediction: {'✅ PASS' if batch_ok else '❌ FAIL'}")
    
    all_pass = health_ok and detection_ok and batch_ok
    print(f"\n   Overall: {'✅ ALL TESTS PASSED' if all_pass else '❌ SOME TESTS FAILED'}")
    print("="*70 + "\n")
    
    return 0 if all_pass else 1

if __name__ == '__main__':
    exit(main())
