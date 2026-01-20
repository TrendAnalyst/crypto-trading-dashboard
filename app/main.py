"""
FastAPI App für Multi-Coin Trading Dashboard
Optimiert für Railway.app, SQLite-basiert
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging
import os

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle Management für FastAPI"""
    # Startup
    from .database import init_db
    init_db()
    logger.info("✅ Database initialized with seed data")
    yield
    # Shutdown
    logger.info("👋 Application shutting down")


# FastAPI App
app = FastAPI(
    title="Crypto Trading Dashboard",
    description="Multi-Coin Trading Dashboard mit TradingView Webhooks",
    version="1.0.0",
    lifespan=lifespan
)

# Static Files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    """Serve das Dashboard"""
    index_path = os.path.join(static_dir, "index.html")
    return FileResponse(index_path)


# Import und registriere API Routes
from .api import router
app.include_router(router)
