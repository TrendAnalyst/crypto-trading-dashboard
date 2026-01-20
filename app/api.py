"""
API Routes für das Trading Dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import logging

from .database import get_db, CoinState
from .webhook_parser import parse_webhook

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook")
async def receive_webhook(request: Request, db: Session = Depends(get_db)):
    """Empfängt TradingView Webhook-Nachrichten."""
    
    body = await request.body()
    message = body.decode("utf-8")
    
    logger.info(f"📩 Webhook empfangen: {message}")
    
    parsed = parse_webhook(message)
    
    if not parsed:
        logger.warning(f"❌ Ungültiges Format: {message}")
        raise HTTPException(status_code=400, detail=f"Invalid webhook format: {message}")
    
    coin = db.query(CoinState).filter_by(symbol=parsed["symbol"]).first()
    
    if not coin:
        display_name = parsed["symbol"].replace("USDT.P", "").replace("USDT", "")
        coin = CoinState(symbol=parsed["symbol"], display_name=display_name, created_at=datetime.utcnow())
        db.add(coin)
        logger.info(f"➕ Neuer Coin erstellt: {display_name}")
    
    update_msg = ""
    
    if parsed["type"] == "trend":
        timeframe = parsed["timeframe"]
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
            coin.trend_1d = parsed["value"]
            update_msg = f"trend_1d = {parsed['value']} (from {timeframe})"
            
    elif parsed["type"] == "signal":
        coin.last_signal_type = parsed["value"]
        coin.last_signal_time = datetime.utcnow()
        update_msg = f"signal = {parsed['value']}"
    
    coin.last_updated = datetime.utcnow()
    
    try:
        db.commit()
        logger.info(f"✅ {parsed['symbol']} updated: {update_msg}")
        return {"status": "success", "message": f"{parsed['symbol']} updated: {update_msg}"}
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Database error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/coins")
def get_coins(db: Session = Depends(get_db)):
    """Liefert alle Coins mit aktuellem Status."""
    
    coins = db.query(CoinState).order_by(CoinState.display_name).all()
    now = datetime.utcnow()
    
    def minutes_ago(dt: Optional[datetime]) -> Optional[int]:
        if not dt:
            return None
        delta = now - dt
        return max(0, int(delta.total_seconds() / 60))
    
    result = []
    for coin in coins:
        result.append({
            "symbol": coin.symbol,
            "display_name": coin.display_name,
            "trends": {"1w": coin.trend_1w, "3d": coin.trend_3d, "1d": coin.trend_1d},
            "last_signal": {
                "type": coin.last_signal_type,
                "price": coin.last_signal_price,
                "time": coin.last_signal_time.isoformat() + "Z" if coin.last_signal_time else None,
                "minutes_ago": minutes_ago(coin.last_signal_time)
            },
            "last_updated": coin.last_updated.isoformat() + "Z" if coin.last_updated else None,
            "last_updated_minutes_ago": minutes_ago(coin.last_updated)
        })
    
    return {"coins": result, "total_coins": len(result), "timestamp": now.isoformat() + "Z"}


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health Check Endpoint für Monitoring."""
    
    try:
        count = db.query(CoinState).count()
        latest = db.query(CoinState).order_by(CoinState.last_updated.desc()).first()
        last_webhook = latest.last_updated.isoformat() + "Z" if latest and latest.last_updated else None
        
        return {"status": "healthy", "database": "connected", "coins_tracked": count, "last_webhook": last_webhook, "version": "1.0.0"}
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
