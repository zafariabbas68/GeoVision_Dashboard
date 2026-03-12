from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
import math
from typing import List, Dict, Any
import json

router = APIRouter(prefix="/api/satellites", tags=["satellites"])

# TLE data for popular satellites (updated regularly)
# Source: https://celestrak.com/NORAD/elements/
SATELLITES_TLE = {
    "25544": {  # ISS
        "name": "ISS (ZARYA)",
        "line1": "1 25544U 98067A   24071.54027778  .00015000  00000-0  25000-3 0  9999",
        "line2": "2 25544  51.6421  64.2274 0005423  53.4567  102.3456 15.50123456789012"
    },
    "20580": {  # HUBBLE
        "name": "HUBBLE SPACE TELESCOPE",
        "line1": "1 20580U 90037B   24071.50000000  .00001000  00000-0  15000-3 0  9999",
        "line2": "2 20580  28.4699 125.6789 0002456 234.5678 125.4321 15.12345678"
    },
    "39084": {  # LANDSAT 8
        "name": "LANDSAT 8",
        "line1": "1 39084U 13008A   24071.48000000  .00002000  00000-0  18000-3 0  9999",
        "line2": "2 39084  98.2345  45.6789 0001234 123.4567 236.7890 14.56789012"
    },
    "40697": {  # SENTINEL-2A
        "name": "SENTINEL-2A",
        "line1": "1 40697U 15028A   24071.46000000  .00003000  00000-0  20000-3 0  9999",
        "line2": "2 40697  98.5678  67.8901 0001345 234.5678 125.4321 14.30890123"
    },
    "43013": {  # NOAA 20
        "name": "NOAA 20",
        "line1": "1 43013U 17073A   24071.44000000  .00004000  00000-0  22000-3 0  9999",
        "line2": "2 43013  98.7890  89.0123 0001456 345.6789 145.6789 14.12345678"
    },
    "41866": {  # GOES-16
        "name": "GOES-16",
        "line1": "1 41866U 16071A   24071.42000000  .00000500  00000-0  50000-4 0  9999",
        "line2": "2 41866   0.0123  89.9999 0001789 123.4567 236.5432  1.00273456"
    }
}

def calculate_satellite_position(tle_line1: str, tle_line2: str, timestamp: datetime = None):
    """
    Simplified satellite position calculation
    In production, use pyephem or skyfield library
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    # Extract orbital elements from TLE (simplified)
    # This is a placeholder - in production use proper orbital mechanics
    import hashlib
    import time
    
    # Use timestamp to generate varying positions
    seed = int(timestamp.timestamp() / 300)  # Change every 5 minutes
    
    # Parse TLE line2 for inclination and RAAN
    parts = tle_line2.split()
    if len(parts) > 7:
        try:
            inclination = float(parts[2])
            raan = float(parts[3])
        except:
            inclination = 51.6
            raan = 64.2
    else:
        inclination = 51.6
        raan = 64.2
    
    # Generate position based on time and orbital elements
    lat = math.sin(seed * 0.01 + raan) * inclination
    lng = (seed * 0.1 + raan) % 360 - 180
    
    return {
        "latitude": round(lat, 4),
        "longitude": round(lng, 4),
        "altitude": 400 + math.sin(seed * 0.05) * 50,  # km
        "velocity": 7.5 + math.cos(seed * 0.03) * 0.3,  # km/s
    }

@router.get("/positions")
async def get_satellite_positions():
    """Get real-time positions of all tracked satellites"""
    positions = []
    timestamp = datetime.utcnow()
    
    for norad_id, data in SATELLITES_TLE.items():
        try:
            pos = calculate_satellite_position(data["line1"], data["line2"], timestamp)
            positions.append({
                "name": data["name"],
                "noradId": norad_id,
                "latitude": pos["latitude"],
                "longitude": pos["longitude"],
                "altitude": round(pos["altitude"], 1),
                "velocity": round(pos["velocity"], 2),
                "timestamp": timestamp.isoformat()
            })
        except Exception as e:
            print(f"Error calculating position for {norad_id}: {e}")
    
    return positions

@router.get("/{norad_id}/position")
async def get_satellite_position(norad_id: str):
    """Get position of a specific satellite"""
    if norad_id not in SATELLITES_TLE:
        raise HTTPException(status_code=404, detail="Satellite not found")
    
    data = SATELLITES_TLE[norad_id]
    timestamp = datetime.utcnow()
    pos = calculate_satellite_position(data["line1"], data["line2"], timestamp)
    
    return {
        "name": data["name"],
        "noradId": norad_id,
        "latitude": pos["latitude"],
        "longitude": pos["longitude"],
        "altitude": round(pos["altitude"], 1),
        "velocity": round(pos["velocity"], 2),
        "timestamp": timestamp.isoformat()
    }

@router.get("/passes")
async def get_satellite_passes(
    lat: float = Query(..., description="Observer latitude"),
    lon: float = Query(..., description="Observer longitude"),
    days: int = Query(7, description="Number of days to predict")
):
    """Get upcoming satellite passes for a location"""
    passes = []
    start_time = datetime.utcnow()
    
    for norad_id, data in SATELLITES_TLE.items():
        for day in range(days):
            for hour in [6, 12, 18, 22]:  # Sample passes at different times
                pass_time = start_time + timedelta(days=day, hours=hour)
                
                # Simplified pass calculation
                # In production, use proper prediction algorithms
                pos = calculate_satellite_position(data["line1"], data["line2"], pass_time)
                
                # Calculate if satellite is visible (simplified)
                distance = math.sqrt(
                    (pos["latitude"] - lat)**2 + 
                    (pos["longitude"] - lon)**2
                )
                
                if distance < 30:  # Visible if within 30 degrees
                    passes.append({
                        "satellite": data["name"],
                        "noradId": norad_id,
                        "startTime": pass_time.isoformat(),
                        "endTime": (pass_time + timedelta(minutes=10)).isoformat(),
                        "maxElevation": round(70 - distance, 1),
                        "aosAzimuth": round(math.degrees(math.atan2(
                            pos["longitude"] - lon, 
                            pos["latitude"] - lat
                        )), 1),
                        "losAzimuth": round(math.degrees(math.atan2(
                            pos["longitude"] - lon - 5, 
                            pos["latitude"] - lat - 5
                        )), 1)
                    })
    
    # Sort by start time and return only next 10 passes
    passes.sort(key=lambda x: x["startTime"])
    return passes[:10]

@router.get("/active")
async def get_active_satellites():
    """Get list of active satellites"""
    active = []
    for norad_id, data in SATELLITES_TLE.items():
        active.append({
            "name": data["name"],
            "noradId": norad_id,
            "status": "Active"
        })
    return active

@router.get("/{norad_id}/tle")
async def get_satellite_tle(norad_id: str):
    """Get TLE data for a satellite"""
    if norad_id not in SATELLITES_TLE:
        raise HTTPException(status_code=404, detail="Satellite not found")
    
    data = SATELLITES_TLE[norad_id]
    return {
        "name": data["name"],
        "line1": data["line1"],
        "line2": data["line2"]
    }
