import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EventPinger Backend API",
    description="Backend API for EventPinger event management platform",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://eventpinger.vercel.app",
    "https://eventradius.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.auth import router as auth_router

# Import routers
from api.events import router as events_router
from api.users import router as users_router
from api.verification import router as verification_router
from api.organizers import router as organizers_router

# Include routers
app.include_router(events_router)
app.include_router(users_router)
app.include_router(verification_router)
app.include_router(organizers_router)
app.include_router(auth_router)


# Health check endpoint
@app.get("/")
async def root():
    return {"message": "EventPinger Backend API", "status": "healthy"}


@app.get("/health")
async def health_check():
    try:
        # Test Supabase connection via config.database
        from config.database import SupabaseClient

        if SupabaseClient.test_connection():
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
