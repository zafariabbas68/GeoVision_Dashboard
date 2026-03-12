from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import random

router = APIRouter()

SATELLITES = [
    {"id": "25544", "name": "ISS (ZARYA)", "country": "International", "altitude": 408, "speed": 7.66},
    {"id": "20580", "name": "HUBBLE", "country": "USA", "altitude": 540, "speed": 7.5},
    {"id": "39084", "name": "LANDSAT 8", "country": "USA", "altitude": 705, "speed": 7.5},
    {"id": "40697", "name": "SENTINEL-2A", "country": "Europe", "altitude": 786, "speed": 7.4},
]

@router.get("/positions")
async def get_satellite_positions():
    positions = []
    for sat in SATELLITES:
        positions.append({
            "name": sat["name"],
            "noradId": sat["id"],
            "latitude": round(random.uniform(-90, 90), 4),
            "longitude": round(random.uniform(-180, 180), 4),
            "altitude": sat["altitude"],
            "velocity": sat["speed"],
            "timestamp": datetime.now().isoformat()
        })
    return positions

@router.get("/active")
async def get_active_satellites():
    return [{"name": s["name"], "noradId": s["id"], "status": "active"} for s in SATELLITES]
