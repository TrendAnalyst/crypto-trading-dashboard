#!/bin/bash
# Test script for TradingView Webhooks
# Usage: ./test_webhooks.sh [base_url]

BASE_URL="${1:-http://localhost:8000}"

echo "🧪 Testing Webhooks against: $BASE_URL"
echo "=================================="

# Test Coin Trend Webhooks
echo ""
echo "📈 Testing Coin Trends..."

curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 1W - UPTREND" && echo " ✓ HYPE 1W Uptrend"
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 3D - DOWNTREND" && echo " ✓ HYPE 3D Downtrend"
curl -s -X POST "$BASE_URL/webhook" -d "HYPEUSDT.P, 1D - UPTREND" && echo " ✓ HYPE 1D Uptrend"

# Test Signal Webhooks
echo ""
echo "🔔 Testing Signals..."

curl -s -X POST "$BASE_URL/webhook" -d "VIRTUALUSDT.P, 1D - Buy Signal" && echo " ✓ VIRTUAL Buy Signal"
curl -s -X POST "$BASE_URL/webhook" -d "PEPEUSDT.P, 1D - Sell Signal" && echo " ✓ PEPE Sell Signal"

# Test Macro Webhooks
echo ""
echo "🌐 Testing Macro Indicators..."

curl -s -X POST "$BASE_URL/webhook" -d "BTC MACRO - 1M - BULLISH" && echo " ✓ BTC Macro Trend Bullish"
curl -s -X POST "$BASE_URL/webhook" -d "BTC MACRO MACD - 1M - BEARISH" && echo " ✓ BTC Macro MACD Bearish"
curl -s -X POST "$BASE_URL/webhook" -d "USDT.D MACRO - 1M - BEARISH" && echo " ✓ USDT.D Macro Trend Bearish"
curl -s -X POST "$BASE_URL/webhook" -d "USDT.D MACRO MACD - 1M - BULLISH" && echo " ✓ USDT.D Macro MACD Bullish"
curl -s -X POST "$BASE_URL/webhook" -d "TOTAL MACRO - 1M - BULLISH" && echo " ✓ TOTAL Macro Trend Bullish"
curl -s -X POST "$BASE_URL/webhook" -d "TOTAL2 MACRO - 1M - BEARISH" && echo " ✓ TOTAL2 Macro Trend Bearish"
curl -s -X POST "$BASE_URL/webhook" -d "TOTAL3 MACRO - 1M - BEARISH" && echo " ✓ TOTAL3 Macro Trend Bearish"
curl -s -X POST "$BASE_URL/webhook" -d "OTHERS MACRO - 1M - BEARISH" && echo " ✓ OTHERS Macro Trend Bearish"

# Health Check
echo ""
echo "💚 Health Check..."
curl -s "$BASE_URL/health" | python -m json.tool 2>/dev/null || curl -s "$BASE_URL/health"

# Get Coins
echo ""
echo "🪙 Fetching Coins..."
curl -s "$BASE_URL/api/coins" | python -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/coins"

# Get Macro
echo ""
echo "🌐 Fetching Macro..."
curl -s "$BASE_URL/api/macro" | python -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/macro"

echo ""
echo "=================================="
echo "✅ All tests completed!"
