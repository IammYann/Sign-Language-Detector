"""
Main FastAPI application for Sign Language Translator
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.translate import router as translate_router
from utils.config import API_HOST, API_PORT, GESTURES
import uvicorn

app = FastAPI(
    title="Sign Language Translator API",
    description="Real-time AI-powered sign language translation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(translate_router, prefix="/api", tags=["translation"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sign Language Translator API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "detect": "/api/detect",
            "batch_detect": "/api/batch_detect"
        }
    }


@app.get("/api/gestures")
async def get_supported_gestures():
    """Get list of supported gestures"""
    return {
        "gestures": GESTURES,
        "count": len(GESTURES)
    }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=API_HOST,
        port=API_PORT,
        reload=True
    )
