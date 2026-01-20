# TradingView Webhook Setup Guide

## 🔗 Your Webhook URL

Your webhook URL is your Railway domain + `/webhook`:

```
https://YOUR-APP-NAME.up.railway.app/webhook
```

---

## 📊 Setting Up Trend Alerts

### In TradingView:
1. Create an alert with your condition
2. Check **"Webhook URL"** and paste your URL
3. Set the **Message** in this format:

**For TRENDS:**
```
SYMBOL, TIMEFRAME - DIRECTION
```

**Examples:**
```
HYPEUSDT.P, 1W - UPTREND
HYPEUSDT.P, 1W - DOWNTREND
HYPEUSDT.P, 3D - UPTREND
HYPEUSDT.P, 1D - DOWNTREND
```

---

## 💰 Buy/Sell Signal Alerts

**Message format:**
```
SYMBOL, TIMEFRAME - Buy Signal
SYMBOL, TIMEFRAME - Sell Signal
```

**Examples:**
```
HYPEUSDT.P, 1D - Buy Signal
VIRTUALUSDT.P, 4H - Sell Signal
```

---

## 🎯 Supported Formats

| Type | Format | Example |
|------|--------|---------|
| Weekly Trend | `SYMBOL, 1W - UPTREND/DOWNTREND` | `HYPEUSDT.P, 1W - UPTREND` |
| 3-Day Trend | `SYMBOL, 3D - UPTREND/DOWNTREND` | `PEPEUSDT.P, 3D - DOWNTREND` |
| Daily Trend | `SYMBOL, 1D - UPTREND/DOWNTREND` | `DOGEUSDT.P, 1D - UPTREND` |
| Buy Signal | `SYMBOL, 1D - Buy Signal` | `VIRTUALUSDT.P, 1D - Buy Signal` |
| Sell Signal | `SYMBOL, 1D - Sell Signal` | `FARTCOINUSDT.P, 1D - Sell Signal` |

---

## 📊 Score Calculation

| Timeframe | Uptrend | Downtrend |
|-----------|---------|-----------|
| 1W | +3 pts | -3 pts |
| 3D | +2 pts | -2 pts |
| 1D | +1 pt | -1 pt |

**Range**: -6 (bearish) to +6 (bullish)

---

## ✅ Test Your Webhook

```bash
curl -X POST https://YOUR-APP.up.railway.app/webhook -d "HYPEUSDT.P, 1W - UPTREND"
```

---

## 💡 Tips

- Use **"Once Per Bar Close"** for trend alerts
- Symbol must match exactly (e.g., `HYPEUSDT.P`)
- New coins are auto-created
