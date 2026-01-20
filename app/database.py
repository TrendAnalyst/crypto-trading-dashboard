"""
SQLite Database Setup mit SQLAlchemy
Persistent Volume: /data/trading.db (Railway)
Lokal: data/trading.db
"""

from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger(__name__)

# Database URL (Railway Volume oder lokal)
DATA_DIR = os.environ.get("DATA_DIR", "data")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DATA_DIR}/trading.db")

# Ensure data dir exists
os.makedirs(DATA_DIR, exist_ok=True)

# SQLAlchemy Setup
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CoinState(Base):
    """Model für Coin-Status"""
    __tablename__ = "coin_states"
    
    symbol = Column(String, primary_key=True)
    display_name = Column(String)
    trend_1w = Column(String, nullable=True)
    trend_3d = Column(String, nullable=True)
    trend_1d = Column(String, nullable=True)
    last_signal_type = Column(String, nullable=True)
    last_signal_price = Column(Float, nullable=True)
    last_signal_time = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<CoinState {self.symbol}>"


def init_db():
    """Initialisiert die Datenbank und fügt Seed-Daten hinzu."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        initial_coins = [
            {"symbol": "HYPEUSDT.P", "display_name": "HYPE", "trend_1w": "downtrend", "trend_3d": "uptrend", "trend_1d": "downtrend", "last_signal_type": "sell", "last_signal_time": now - timedelta(minutes=5), "last_updated": now - timedelta(minutes=2)},
            {"symbol": "VIRTUALUSDT.P", "display_name": "VIRTUAL", "trend_1w": "uptrend", "trend_3d": "uptrend", "trend_1d": "uptrend", "last_signal_type": "buy", "last_signal_time": now - timedelta(minutes=12), "last_updated": now - timedelta(minutes=1)},
            {"symbol": "FARTCOINUSDT.P", "display_name": "FARTCOIN", "trend_1w": "downtrend", "trend_3d": "uptrend", "trend_1d": "uptrend", "last_signal_type": "buy", "last_signal_time": now - timedelta(hours=1), "last_updated": now - timedelta(minutes=5)},
            {"symbol": "PEPEUSDT.P", "display_name": "PEPE", "trend_1w": "uptrend", "trend_3d": "downtrend", "trend_1d": "uptrend", "last_signal_type": "sell", "last_signal_time": now - timedelta(hours=3), "last_updated": now - timedelta(minutes=3)},
            {"symbol": "DOGEUSDT.P", "display_name": "DOGE", "trend_1w": "uptrend", "trend_3d": "uptrend", "trend_1d": "downtrend", "last_signal_type": "buy", "last_signal_time": now - timedelta(hours=6), "last_updated": now - timedelta(minutes=4)},
        ]
        
        for coin_data in initial_coins:
            existing = db.query(CoinState).filter_by(symbol=coin_data["symbol"]).first()
            if not existing:
                coin = CoinState(**coin_data, created_at=now)
                db.add(coin)
                logger.info(f"➕ Coin hinzugefügt: {coin_data['display_name']}")
        
        db.commit()
        logger.info(f"✅ {len(initial_coins)} Coins in Datenbank")
        
    except Exception as e:
        logger.error(f"❌ Database init error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def get_db():
    """Dependency für FastAPI Endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
