from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import routers directly
from app.auth import router as auth_router
from app.weather import router as weather_router
from app.satellites import router as satellites_router
from app.indices import router as indices_router
from app.sensors import router as sensors_router

app = FastAPI(
    title="GeoVision Dashboard API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(satellites_router, prefix="/api/satellites", tags=["satellites"])
app.include_router(indices_router, prefix="/api/indices", tags=["indices"])
app.include_router(sensors_router, prefix="/api/sensors", tags=["sensors"])

@app.get("/")
def root():
    return {"message": "GeoVision API", "status": "running"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "time": datetime.now().isoformat()}
