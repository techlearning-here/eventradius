import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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
    redirect_slashes=True,  # Redirect /api/events to /api/events/
)

# CORS configuration - support env variable for flexibility
# Local development origins (always allowed)
default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:4174",
    "http://localhost:3000",
    "http://localhost:8080",
]
# Production URLs should be set via BACKEND_CORS_ORIGINS env var

cors_origins_env = os.getenv("BACKEND_CORS_ORIGINS", "")
if cors_origins_env == "*":
    origins = ["*"]
elif cors_origins_env:
    # Merge env var origins with defaults
    env_origins = [origin.strip() for origin in cors_origins_env.split(",")]
    origins = list(set(default_origins + env_origins))  # Remove duplicates
else:
    origins = default_origins

logger.info(f"CORS allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Debug middleware to log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    # Skip logging for CORS preflight requests to reduce noise
    if request.method == "OPTIONS":
        return await call_next(request)
    logger.info(
        f"[{request.method}] {request.url.path} - Origin: {request.headers.get('origin', 'none')}"
    )
    try:
        response = await call_next(request)
        logger.info(
            f"[{request.method}] {request.url.path} - Status: {response.status_code}"
        )
        return response
    except Exception as e:
        logger.error(f"[{request.method}] {request.url.path} - Error: {e}")
        raise


from api.auth import router as auth_router

# Import routers
from api.events import router as events_router
from api.users import router as users_router
from api.verification import router as verification_router
from api.organizers import router as organizers_router

# Include routers first
app.include_router(events_router)
app.include_router(users_router)
app.include_router(verification_router)
app.include_router(organizers_router)
app.include_router(auth_router)


# NOTE: Custom OPTIONS handler removed - FastAPI's CORS middleware handles preflight automatically


# Exception handler for debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Exception on {request.method} {request.url.path}: {exc}")
    logger.error(f"Request headers: {dict(request.headers)}")
    # Return 500 for server errors, not 400
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Health check endpoint
@app.get("/")
async def root():
    return {"message": "EventPinger Backend API", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
