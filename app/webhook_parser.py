"""
TradingView Webhook Parser
Parst eingehende Webhook-Nachrichten im Format:
    "SYMBOL, TIMEFRAME - VALUE"

Beispiele:
    "HYPEUSDT.P, 1W - DOWNTREND"
    "HYPEUSDT.P, 1D - Buy Signal"
"""

import re
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


def parse_webhook(message: str) -> Optional[Dict]:
    """
    Parse TradingView Webhook Nachricht.
    
    Args:
        message: Rohe Webhook-Nachricht
        
    Returns:
        Dict mit geparsten Daten oder None bei ungültigem Format
        
    Beispiele:
        Input:  "HYPEUSDT.P, 1W - DOWNTREND"
        Output: {"symbol": "HYPEUSDT.P", "timeframe": "1w", "type": "trend", "value": "downtrend"}
        
        Input:  "HYPEUSDT.P, 1D - Buy Signal"
        Output: {"symbol": "HYPEUSDT.P", "timeframe": "1d", "type": "signal", "value": "buy"}
        
        Input:  "BTC MACRO 1M TREND - BEARISH"
        Output: {"symbol": "BTC", "type": "macro", "indicator": "trend", "value": "bearish"}
        
        Input:  "USDT.D MACRO 1M MACD - BULLISH"
        Output: {"symbol": "USDT.D", "type": "macro", "indicator": "macd", "value": "bullish"}
    """
    
    if not message or not message.strip():
        logger.warning("Leere Webhook-Nachricht empfangen")
        return None
    
    message = message.strip()
    
    # ===== MACRO PATTERN =====
    # Format: "BTC MACRO 1M TREND - BEARISH" or "USDT.D MACRO 1M MACD - BULLISH"
    macro_pattern = r"([A-Z0-9\.]+)\s+MACRO\s+1M\s+(TREND|MACD)\s*-\s*(BULLISH|BEARISH)"
    macro_match = re.match(macro_pattern, message, re.IGNORECASE)
    
    if macro_match:
        symbol = macro_match.group(1).upper()
        indicator = macro_match.group(2).lower()  # "trend" or "macd"
        value = macro_match.group(3).lower()      # "bullish" or "bearish"
        
        result = {
            "symbol": symbol,
            "type": "macro",
            "indicator": indicator,
            "value": value
        }
        logger.info(f"✅ Macro Webhook geparst: {result}")
        return result
    
    # ===== STANDARD PATTERN =====
    # Pattern: SYMBOL, TIMEFRAME - VALUE
    # Erfasst: Gruppe 1 = Symbol, Gruppe 2 = Timeframe, Gruppe 3 = Wert
    pattern = r"([A-Z0-9\.]+),\s*(\d+[WDMH])\s*-\s*(.+)"
    match = re.match(pattern, message, re.IGNORECASE)
    
    if not match:
        logger.warning(f"Ungültiges Webhook-Format: {message}")
        return None
    
    symbol = match.group(1).upper()
    timeframe = match.group(2).lower()
    value_raw = match.group(3).strip()
    
    # Normalisiere Timeframe (1w, 3d, 1d, etc.)
    # Akzeptiere auch andere wie 4h, 1h, etc.
    
    # Bestimme Typ und Wert
    value_lower = value_raw.lower()
    
    if "uptrend" in value_lower:
        result = {
            "symbol": symbol,
            "timeframe": timeframe,
            "type": "trend",
            "value": "uptrend"
        }
    elif "downtrend" in value_lower:
        result = {
            "symbol": symbol,
            "timeframe": timeframe,
            "type": "trend",
            "value": "downtrend"
        }
    elif "buy signal" in value_lower or "buy" in value_lower:
        result = {
            "symbol": symbol,
            "timeframe": timeframe,
            "type": "signal",
            "value": "buy"
        }
    elif "sell signal" in value_lower or "sell" in value_lower:
        result = {
            "symbol": symbol,
            "timeframe": timeframe,
            "type": "signal",
            "value": "sell"
        }
    else:
        logger.warning(f"Unbekannter Wert in Webhook: {value_raw}")
        return None
    
    logger.info(f"✅ Webhook geparst: {result}")
    return result
