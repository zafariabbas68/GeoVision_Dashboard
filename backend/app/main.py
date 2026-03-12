from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .database import engine, Base
from .auth import router as auth_router
from .satellites import router as satellites_router
from .indices import router as indices_router
from .weather import router as weather_router
from .sensors import router as sensors_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GeoVision Dashboard API",
    description="Earth Observation and Environmental Monitoring API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(satellites_router, prefix="/api/satellites", tags=["Satellites"])
app.include_router(indices_router, prefix="/api/indices", tags=["Indices"])
app.include_router(weather_router, prefix="/api/weather", tags=["Weather"])
app.include_router(sensors_router, prefix="/api/sensors", tags=["Sensors"])

@app.get("/")
def root():
    return {
        "message": "GeoVision Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
