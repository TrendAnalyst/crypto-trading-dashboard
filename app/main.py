"""
FastAPI App für Multi-Coin Trading Dashboard
Optimiert für Railway.app, SQLite-basiert
Version 2.0 - Mit Macro Dashboard
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
    version="2.0.0",
    lifespan=lifespan
)

# Static Files Directory - React build output
# In Docker: /app/static (copied from frontend build)
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")


# Import und registriere API Routes FIRST (before catch-all)
from .api import router
app.include_router(router)


# Mount static files for React assets (JS, CSS, media)
# React build creates: build/static/js/, build/static/css/, etc.
if os.path.exists(static_dir):
    static_assets = os.path.join(static_dir, "static")
    if os.path.exists(static_assets):
        app.mount("/static", StaticFiles(directory=static_assets), name="static_assets")
        logger.info(f"✅ Static assets mounted from {static_assets}")


@app.get("/")
async def root():
    """Serve das React Dashboard"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Dashboard not built. Run npm build in frontend/"}


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """
    Catch-all route for React Router and static files.
    """
    # First check if the file exists in the static directory root
    file_path = os.path.join(static_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise return index.html for React Router
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Not found"}
