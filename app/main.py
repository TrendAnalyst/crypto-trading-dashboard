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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from .database import init_db
    init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 Shutting down")


app = FastAPI(
    title="Crypto Trading Dashboard",
    description="Multi-Coin Trading Dashboard mit TradingView Webhooks",
    version="2.0.0",
    lifespan=lifespan
)

# Static directory
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")

# Import API routes
from .api import router
app.include_router(router)


@app.get("/")
async def root():
    """Serve the dashboard"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Dashboard not found"}


@app.get("/{path:path}")
async def static_files(path: str):
    """Serve static files"""
    file_path = os.path.join(static_dir, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Fallback to index.html for SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Not found"}
