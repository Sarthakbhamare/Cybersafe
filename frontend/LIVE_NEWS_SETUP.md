# 🔴 Live Digital Fraud & Scam News Integration

## ✅ What's Implemented

Your CyberSafe feed now automatically fetches **ONLY digital fraud and scam news** from multiple sources:

- ✅ **Auto-refreshes every hour**
- ✅ **Filters for fraud/scam keywords only** (no general tech news)
- ✅ **Multiple sources**: NewsAPI + GDELT
- ✅ **Offline fallback**: Mock data when API unavailable
- ✅ **Live indicator**: Shows 🔴 LIVE badge for real-time stories
- ✅ **Manual refresh**: Click refresh button anytime

## 🎯 How It Works

### Fraud Detection Filter
The system **ONLY shows** news that contains:

**Fraud Keywords:**
- scam, fraud, phishing, cheat, duped, conned, cyber crime, fake, stolen

**Digital Keywords:**
- online, digital, cyber, whatsapp, upi, payment, bank, app, website, sms, otp, phone, mobile, internet

**Both conditions must be met** to display a story!

### News Categories
- 💳 UPI/Payment Fraud
- 📱 Social Media Scam
- 🏦 Banking Fraud
- 💰 Investment Scam
- 💼 Job Scam
- 🎰 Lottery Scam
- 🆔 KYC Fraud
- 🎣 Phishing
- 📞 Vishing/Call Scam

## 🚀 Quick Start (No API Key Needed!)

The app works **immediately** with free GDELT API (no registration needed).

### For Better Results (Optional):

1. **Get Free NewsAPI Key** (100 requests/day):
   - Go to: https://newsapi.org/register
   - Sign up (free)
   - Copy your API key

2. **Add to your project**:
   ```bash
   # Create .env file in frontend folder:
   VITE_NEWS_API_KEY=your_api_key_here
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

## 📊 Features

### In the Feed:
- 🔴 **LIVE badge** - Shows number of real-time stories
- 🔄 **Refresh button** - Manually fetch latest news
- 📱 **Live Only toggle** - Show only real-time news
- ⏰ **Last updated** - Shows when news was last fetched
- 🔄 **Auto-refresh** - Updates every hour automatically

### Story Cards Show:
- Source name (e.g., "Times of India", "NDTV Profit")
- Published time ("2 hours ago")
- Severity level (Critical/High/Medium/Low)
- Category (UPI Fraud, Phishing, etc.)
- Target demographic
- Direct link to original article

## 🧪 Test It

1. **Start your app**:
   ```bash
   cd e:\cybersafe\frontend
   npm run dev
   ```

2. **Open**: http://localhost:5173

3. **Look for**:
   - 🔴 LIVE badge at top
   - Real-time stories mixed with curated ones
   - Click "🔴 Live Only" to see only fetched news
   - Click "↻ Refresh" to fetch latest

## 🔧 Customization

### Change Refresh Interval
In `CyberSafeFeed.jsx`:
```javascript
// Current: 1 hour (3600000 ms)
const interval = setInterval(loadLiveNews, 3600000);

// Every 30 minutes:
const interval = setInterval(loadLiveNews, 1800000);

// Every 15 minutes:
const interval = setInterval(loadLiveNews, 900000);
```

### Add More Keywords
In `newsService.js`:
```javascript
const FRAUD_KEYWORDS = [
  'digital fraud',
  'cyber scam',
  // Add your keywords:
  'QR code scam',
  'deepfake fraud',
  'social engineering'
];
```

### Filter by Location
In `newsService.js`:
```javascript
// Add more cities/states to extract from titles:
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'YourCity'];
const states = ['Maharashtra', 'Karnataka', 'YourState'];
```

## 📈 News Sources

### Currently Using:

1. **GDELT** (Free, No API Key)
   - Global news aggregator
   - Real-time updates
   - No rate limits

2. **NewsAPI** (Free Tier - 100 req/day)
   - 70,000+ sources worldwide
   - Indian news included
   - Better article descriptions

### Want More Sources?

Add in `newsService.js`:
```javascript
// MediaStack (Free 500 req/month)
export const fetchMediaStack = async (apiKey) => {
  const url = `http://api.mediastack.com/v1/news?` +
    `access_key=${apiKey}&` +
    `keywords=scam,fraud,cybercrime&` +
    `countries=in&` +
    `languages=en`;
  // ... implement
};
```

## 🐛 Troubleshooting

### No live news showing?
- Check browser console for errors
- Mock data should show as fallback
- Verify internet connection

### API key not working?
- Check `.env` file exists in `frontend` folder
- Restart dev server after adding key
- Verify key is valid at newsapi.org

### News not updating?
- Click manual refresh button
- Check console for "✅ Loaded X stories"
- Wait up to 1 hour for auto-refresh

## 💡 Tips

1. **Without API key**: You'll get 5-10 mock stories + some GDELT results
2. **With API key**: You'll get 30-50 real stories per hour
3. **Rate limits**: Free NewsAPI = 100 requests/day (enough for 1 fetch/hour for 4+ days)
4. **Best practice**: Use Live Only toggle to see freshest content
5. **Performance**: Stories are cached for 1 hour to avoid redundant fetches

## 🎯 What Makes It Special

Unlike generic news feeds, this implementation:
- ✅ **Filters aggressively** - Only fraud/scam stories
- ✅ **Dual keyword matching** - Must be digital AND fraudulent
- ✅ **Auto-categorizes** - Detects fraud type automatically
- ✅ **India-focused** - Prioritizes Indian locations
- ✅ **Demographic targeting** - Identifies target groups
- ✅ **Always works** - Falls back to curated stories

Your users get **ONLY digital fraud and scam news** - no tech reviews, no product launches, no general cybersecurity articles. Just pure scam alerts! 🎯
