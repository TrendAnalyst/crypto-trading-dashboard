"""
TradingView Webhook Parser
Parst eingehende Webhook-Nachrichten im Format:
    "SYMBOL, TIMEFRAME - VALUE"
"""

import re
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


def parse_webhook(message: str) -> Optional[Dict]:
    """Parse TradingView Webhook Nachricht."""
    
    if not message or not message.strip():
        logger.warning("Leere Webhook-Nachricht empfangen")
        return None
    
    pattern = r"([A-Z0-9\.]+),\s*(\d+[WDMH])\s*-\s*(.+)"
    match = re.match(pattern, message.strip(), re.IGNORECASE)
    
    if not match:
        logger.warning(f"Ungültiges Webhook-Format: {message}")
        return None
    
    symbol = match.group(1).upper()
    timeframe = match.group(2).lower()
    value_raw = match.group(3).strip()
    value_lower = value_raw.lower()
    
    if "uptrend" in value_lower:
        return {"symbol": symbol, "timeframe": timeframe, "type": "trend", "value": "uptrend"}
    elif "downtrend" in value_lower:
        return {"symbol": symbol, "timeframe": timeframe, "type": "trend", "value": "downtrend"}
    elif "buy signal" in value_lower or "buy" in value_lower:
        return {"symbol": symbol, "timeframe": timeframe, "type": "signal", "value": "buy"}
    elif "sell signal" in value_lower or "sell" in value_lower:
        return {"symbol": symbol, "timeframe": timeframe, "type": "signal", "value": "sell"}
    
    logger.warning(f"Unbekannter Wert in Webhook: {value_raw}")
    return None
