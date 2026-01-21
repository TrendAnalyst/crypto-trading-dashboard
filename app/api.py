"""
API Routes für das Trading Dashboard
Endpoints:
    POST /webhook      - TradingView Webhook empfangen
    GET  /api/coins    - Alle Coins mit Status abrufen
    GET  /api/macro    - Alle Macro-Indikatoren abrufen
    GET  /health       - Health Check
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import logging

from .database import get_db, CoinState, MacroState
from .webhook_parser import parse_webhook

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook")
async def receive_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Empfängt TradingView Webhook-Nachrichten.
    
    Unterstützte Formate:
        - Trends:  "HYPEUSDT.P, 1W - DOWNTREND"
        - Signale: "HYPEUSDT.P, 1D - Buy Signal"
        - Macro:   "BTC MACRO - 1M - BEARISH"
        - Macro MACD: "BTC MACRO MACD - 1M - BULLISH"
    
    Returns:
        JSON mit Status und Nachricht
    """
    
    # Lese Raw Body (TradingView sendet text/plain)
    body = await request.body()
    message = body.decode("utf-8")
    
    logger.info(f"📩 Webhook empfangen: {message}")
    
    # Parse Nachricht
    parsed = parse_webhook(message)
    
    if not parsed:
        logger.warning(f"❌ Ungültiges Format: {message}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid webhook format: {message}"
        )
    
    update_msg = ""
    
    # Handle Macro messages
    if parsed["type"] in ["macro_trend", "macro_macd"]:
        macro = db.query(MacroState).filter_by(symbol=parsed["symbol"]).first()
        
        if not macro:
            # Auto-create for new macro symbols
            macro = MacroState(
                symbol=parsed["symbol"],
                display_name=parsed["symbol"],
                monthly_trend="bearish",
                monthly_macd="bearish",
                created_at=datetime.utcnow()
            )
            db.add(macro)
            logger.info(f"➕ Neuer Macro erstellt: {parsed['symbol']}")
        
        if parsed["type"] == "macro_trend":
            macro.monthly_trend = parsed["value"]
            update_msg = f"monthly_trend = {parsed['value']}"
        else:  # macro_macd
            macro.monthly_macd = parsed["value"]
            update_msg = f"monthly_macd = {parsed['value']}"
        
        macro.last_updated = datetime.utcnow()
    
    else:
        # Handle Coin messages (original logic)
        coin = db.query(CoinState).filter_by(symbol=parsed["symbol"]).first()
        
        if not coin:
            # Auto-Create für neue Coins
            display_name = parsed["symbol"].replace("USDT.P", "").replace("USDT", "")
            coin = CoinState(
                symbol=parsed["symbol"],
                display_name=display_name,
                created_at=datetime.utcnow()
            )
            db.add(coin)
            logger.info(f"➕ Neuer Coin erstellt: {display_name}")
        
        # Update basierend auf Typ
        if parsed["type"] == "trend":
            # Trend Update (1w, 3d, 1d, etc.)
            timeframe = parsed["timeframe"]
            
            # Mapping von Timeframe zu Spalte
            if timeframe in ["1w", "7d"]:
                coin.trend_1w = parsed["value"]
                update_msg = f"trend_1w = {parsed['value']}"
            elif timeframe in ["3d"]:
                coin.trend_3d = parsed["value"]
                update_msg = f"trend_3d = {parsed['value']}"
            elif timeframe in ["1d", "24h"]:
                coin.trend_1d = parsed["value"]
                update_msg = f"trend_1d = {parsed['value']}"
            else:
                # Für andere Timeframes: Speichere in 1d als Default
                coin.trend_1d = parsed["value"]
                update_msg = f"trend_1d = {parsed['value']} (from {timeframe})"
                
        elif parsed["type"] == "signal":
            # Signal Update (Buy/Sell)
            coin.last_signal_type = parsed["value"]
            coin.last_signal_time = datetime.utcnow()
            update_msg = f"signal = {parsed['value']}"
        
        coin.last_updated = datetime.utcnow()
    
    try:
        db.commit()
        logger.info(f"✅ {parsed['symbol']} updated: {update_msg}")
        
        return {
            "status": "success",
            "message": f"{parsed['symbol']} updated: {update_msg}",
            "data": {
                "symbol": parsed["symbol"],
                "type": parsed["type"],
                "value": parsed["value"],
                "timeframe": parsed["timeframe"]
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Database error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/coins")
def get_coins(db: Session = Depends(get_db)):
    """
    Liefert alle Coins mit aktuellem Status.
    
    Returns:
        JSON mit Liste aller Coins und Metadaten
    """
    
    coins = db.query(CoinState).order_by(CoinState.display_name).all()
    now = datetime.utcnow()
    
    def minutes_ago(dt: Optional[datetime]) -> Optional[int]:
        """Berechnet Minuten seit einem Timestamp"""
        if not dt:
            return None
        delta = now - dt
        return max(0, int(delta.total_seconds() / 60))
    
    result = []
    for coin in coins:
        result.append({
            "symbol": coin.symbol,
            "display_name": coin.display_name,
            "trends": {
                "1w": coin.trend_1w,
                "3d": coin.trend_3d,
                "1d": coin.trend_1d
            },
            "last_signal": {
                "type": coin.last_signal_type,
                "price": coin.last_signal_price,
                "time": coin.last_signal_time.isoformat() + "Z" if coin.last_signal_time else None,
                "minutes_ago": minutes_ago(coin.last_signal_time)
            },
            "last_updated": coin.last_updated.isoformat() + "Z" if coin.last_updated else None,
            "last_updated_minutes_ago": minutes_ago(coin.last_updated)
        })
    
    return {
        "coins": result, 
        "total_coins": len(result),
        "timestamp": now.isoformat() + "Z"
    }


@router.get("/api/macro")
def get_macro(db: Session = Depends(get_db)):
    """
    Liefert alle Macro-Indikatoren.
    
    Returns:
        JSON mit Liste aller Macro-Indikatoren
    """
    
    # Define order for display
    order = ["BTC", "USDT.D", "TOTAL", "TOTAL2", "TOTAL3", "OTHERS"]
    
    macros = db.query(MacroState).all()
    now = datetime.utcnow()
    
    def minutes_ago(dt: Optional[datetime]) -> Optional[int]:
        if not dt:
            return None
        delta = now - dt
        return max(0, int(delta.total_seconds() / 60))
    
    # Create result dict for ordering
    result_dict = {}
    for macro in macros:
        result_dict[macro.symbol] = {
            "symbol": macro.symbol,
            "display_name": macro.display_name,
            "monthly_trend": macro.monthly_trend,
            "monthly_macd": macro.monthly_macd,
            "last_updated": macro.last_updated.isoformat() + "Z" if macro.last_updated else None,
            "last_updated_minutes_ago": minutes_ago(macro.last_updated)
        }
    
    # Return in defined order, with any extras at end
    result = []
    for symbol in order:
        if symbol in result_dict:
            result.append(result_dict[symbol])
    
    # Add any symbols not in the predefined order
    for symbol, data in result_dict.items():
        if symbol not in order:
            result.append(data)
    
    return {
        "macros": result,
        "total_macros": len(result),
        "timestamp": now.isoformat() + "Z"
    }


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health Check Endpoint für Monitoring.
    
    Returns:
        JSON mit Status, DB-Verbindung und Coin-Anzahl
    """
    
    try:
        coin_count = db.query(CoinState).count()
        macro_count = db.query(MacroState).count()
        
        # Finde letztes Update
        latest = db.query(CoinState).order_by(CoinState.last_updated.desc()).first()
        last_webhook = latest.last_updated.isoformat() + "Z" if latest and latest.last_updated else None
        
        return {
            "status": "healthy",
            "database": "connected",
            "coins_tracked": coin_count,
            "macros_tracked": macro_count,
            "last_webhook": last_webhook,
            "version": "2.0.0"
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
