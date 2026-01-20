# 🎯 Crypto Trading Dashboard

A **production-ready** real-time cryptocurrency trading dashboard with TradingView webhook integration, optimized for Railway.app deployment.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-green) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- 📊 **Real-time Updates** - Auto-refresh every 3 seconds
- 🎨 **Premium Dark UI** - Glassmorphism, animations, responsive design
- 📡 **TradingView Webhooks** - Receive trends & signals automatically
- 💾 **SQLite Database** - Lightweight, persistent storage
- 🚀 **Railway Ready** - One-click deployment with Docker

## 🪙 Tracked Coins

| Symbol | Display Name |
|--------|-------------|
| HYPEUSDT.P | HYPE |
| VIRTUALUSDT.P | VIRTUAL |
| FARTCOINUSDT.P | FARTCOIN |
| PEPEUSDT.P | PEPE |
| DOGEUSDT.P | DOGE |

---

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/TrendAnalyst/crypto-trading-dashboard.git
cd crypto-trading-dashboard

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000

# Open dashboard
# http://localhost:8000
```

### Test Webhooks

```bash
# Send test trend
curl -X POST http://localhost:8000/webhook -d "HYPEUSDT.P, 1W - DOWNTREND"

# Send test signal
curl -X POST http://localhost:8000/webhook -d "HYPEUSDT.P, 1D - Buy Signal"

# Check API
curl http://localhost:8000/api/coins
```

---

## 🌐 Railway Deployment

### Step 1: Deploy from GitHub

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `crypto-trading-dashboard`
4. Railway will auto-build and deploy

### Step 2: Add Persistent Volume

1. In Railway Dashboard → Your Project → **Settings**
2. Click **Volumes** → **New Volume**
3. Configure:
   - **Mount Path**: `/data`
   - **Size**: 1 GB
4. Click **Deploy** to apply

### Step 3: Get Your URL

Your dashboard is now live at:
```
https://your-app-name.up.railway.app
```

---

## 📡 TradingView Webhook Setup

### 1. Create Alert in TradingView

1. Open TradingView chart for your coin
2. Click **"Alerts"** → **"Create Alert"**
3. Set your conditions

### 2. Configure Webhook

- **Webhook URL**: `https://your-app.railway.app/webhook`
- **Message Format**:

| Type | Format | Example |
|------|--------|---------|
| Trend | `SYMBOL, TIMEFRAME - DIRECTION` | `HYPEUSDT.P, 1W - DOWNTREND` |
| Signal | `SYMBOL, TIMEFRAME - Signal Type` | `HYPEUSDT.P, 1D - Buy Signal` |

### Supported Timeframes
- `1W` - Weekly
- `3D` - 3 Days
- `1D` - Daily
- `4H`, `1H` - Hourly (stored as 1D)

### Supported Values
- `UPTREND` / `DOWNTREND` - Trend direction
- `Buy Signal` / `Sell Signal` - Trading signals

---

## 📁 Project Structure

```
crypto-trading-dashboard/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI entry point
│   ├── database.py      # SQLite + SQLAlchemy
│   ├── webhook_parser.py # Message parsing
│   └── api.py           # API routes
├── static/
│   └── index.html       # Dashboard UI
├── data/                # SQLite database (gitignored)
├── Dockerfile
├── requirements.txt
├── railway.toml
└── README.md
```

---

## 🔌 API Reference

### POST `/webhook`

Receive TradingView webhooks.

```bash
curl -X POST https://your-app.railway.app/webhook \
  -H "Content-Type: text/plain" \
  -d "HYPEUSDT.P, 1W - UPTREND"
```

**Response:**
```json
{
  "status": "success",
  "message": "HYPEUSDT.P updated: trend_1w = uptrend"
}
```

### GET `/api/coins`

Get all coins with current state.

```json
{
  "coins": [
    {
      "symbol": "HYPEUSDT.P",
      "display_name": "HYPE",
      "trends": { "1w": "downtrend", "3d": "uptrend", "1d": "downtrend" },
      "last_signal": { "type": "sell", "minutes_ago": 5 },
      "last_updated_minutes_ago": 2
    }
  ],
  "total_coins": 5
}
```

### GET `/health`

Health check endpoint.

```json
{
  "status": "healthy",
  "database": "connected",
  "coins_tracked": 5,
  "version": "1.0.0"
}
```

---

## 💰 Estimated Costs

| Resource | Railway Free Tier | Hobby Tier |
|----------|------------------|------------|
| Compute | 500 hours/month | Unlimited |
| Memory | 512 MB | 8 GB |
| Volume | 1 GB | 10 GB |
| **Monthly Cost** | **$0** | **~$5** |

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.11)
- **Database**: SQLite + SQLAlchemy
- **Frontend**: HTML + Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Deployment**: Docker + Railway

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for crypto traders
