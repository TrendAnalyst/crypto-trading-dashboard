#!/bin/bash
# TradingView Webhook Test Script

BASE_URL="${1:-http://localhost:8000}"

echo "🔗 Testing against: $BASE_URL"
echo "==========================================="

# HYPE Trends
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 1W - DOWNTREND"
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 3D - UPTREND"
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 1D - DOWNTREND"

# VIRTUAL Trends
curl -s -X POST "$BASE_URL/webhook" -d "VIRTUALUSDT.P, 1W - UPTREND"
curl -s -X POST "$BASE_URL/webhook" -d "VIRTUALUSDT.P, 3D - UPTREND"

# Signals
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 1D - Buy Signal"
curl -s -X POST "$BASE_URL/webhook" -d "VIRTUALUSDT.P, 1D - Sell Signal"
curl -s -X POST "$BASE_URL/webhook" -d "DOGEUSDT.P, 4H - Buy Signal"

echo ""
echo "✅ All tests completed!"
echo "🌐 Open Dashboard: $BASE_URL"
