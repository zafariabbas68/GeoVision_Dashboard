from fastapi import APIRouter, HTTPException, Query, Body
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random
import math

router = APIRouter(prefix="/api/indices", tags=["indices"])

# Predefined regions of interest
REGIONS = {
    "alps": {
        "name": "Italian Alps",
        "bounds": {"north": 47.0, "south": 45.5, "east": 12.5, "west": 6.5}
    },
    "tuscany": {
        "name": "Tuscany",
        "bounds": {"north": 44.5, "south": 42.5, "east": 12.5, "west": 9.5}
    },
    "sicily": {
        "name": "Sicily",
        "bounds": {"north": 38.5, "south": 36.5, "east": 16.0, "west": 12.0}
    },
    "poValley": {
        "name": "Po Valley",
        "bounds": {"north": 45.5, "south": 44.5, "east": 12.0, "west": 8.0}
    }
}

def simulate_ndvi_value(lat: float, lng: float, date: datetime = None) -> float:
    """
    Simulate NDVI value based on location and date
    In production, this would use satellite imagery
    """
    if date is None:
        date = datetime.utcnow()
    
    # Base NDVI based on land cover
    # Forests: high NDVI, Water: low/negative, Urban: low, Agriculture: medium
    if lat > 46:  # Alps region - forests
        base = 0.7 + random.random() * 0.2
    elif lat < 37:  # Southern Italy - mix
        base = 0.4 + random.random() * 0.3
    elif 42 < lat < 44 and 10 < lng < 12:  # Tuscany - agriculture
        base = 0.5 + random.random() * 0.3
    elif 44 < lat < 45 and 8 < lng < 12:  # Po Valley - intensive agriculture
        base = 0.6 + random.random() * 0.25
    else:
        base = 0.3 + random.random() * 0.4
    
    # Seasonal variation
    month = date.month
    if 4 <= month <= 9:  # Growing season (April-September)
        seasonal_factor = 1.2
    else:  # Dormant season
        seasonal_factor = 0.8
    
    # Add some random variation
    variation = (random.random() - 0.5) * 0.1
    
    ndvi = base * seasonal_factor + variation
    return max(-0.2, min(1.0, ndvi))  # Clamp to valid range

@router.get("/ndvi/point")
async def get_ndvi_at_point(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get NDVI value at a specific point"""
    ndvi = simulate_ndvi_value(lat, lon)
    
    return {
        "lat": lat,
        "lng": lon,
        "value": round(ndvi, 3),
        "date": datetime.utcnow().isoformat(),
        "source": "Simulated from Sentinel-2"
    }

@router.post("/ndvi/region")
async def get_ndvi_for_region(bounds: Dict[str, float]):
    """Get NDVI data for a region"""
    required = ["north", "south", "east", "west"]
    if not all(k in bounds for k in required):
        raise HTTPException(status_code=400, detail="Missing bounds parameters")
    
    # Generate grid of points within bounds
    points = []
    lat_step = (bounds["north"] - bounds["south"]) / 10
    lng_step = (bounds["east"] - bounds["west"]) / 10
    
    for i in range(10):
        for j in range(10):
            lat = bounds["south"] + i * lat_step + lat_step/2
            lng = bounds["west"] + j * lng_step + lng_step/2
            ndvi = simulate_ndvi_value(lat, lng)
            
            points.append({
                "lat": round(lat, 4),
                "lng": round(lng, 4),
                "value": round(ndvi, 3)
            })
    
    return points

@router.post("/ndvi/statistics")
async def get_ndvi_statistics(bounds: Dict[str, float]):
    """Get NDVI statistics for a region"""
    # Generate sample points
    values = []
    lat_step = (bounds["north"] - bounds["south"]) / 20
    lng_step = (bounds["east"] - bounds["west"]) / 20
    
    for i in range(20):
        for j in range(20):
            lat = bounds["south"] + i * lat_step
            lng = bounds["west"] + j * lng_step
            values.append(simulate_ndvi_value(lat, lng))
    
    # Calculate statistics
    mean_val = sum(values) / len(values)
    max_val = max(values)
    min_val = min(values)
    
    # Calculate variance
    variance = sum((x - mean_val) ** 2 for x in values) / len(values)
    std_val = math.sqrt(variance)
    
    # Calculate land cover percentages
    vegetation = sum(1 for v in values if v > 0.4) / len(values) * 100
    water = sum(1 for v in values if v < 0) / len(values) * 100
    bare = sum(1 for v in values if 0 <= v <= 0.2) / len(values) * 100
    urban = 100 - vegetation - water - bare
    
    return {
        "mean": round(mean_val, 3),
        "max": round(max_val, 3),
        "min": round(min_val, 3),
        "std": round(std_val, 3),
        "vegetationCover": round(vegetation, 1),
        "waterBodies": round(water, 1),
        "bareSoil": round(bare, 1),
        "urbanAreas": round(urban, 1)
    }

@router.get("/ndvi/timeseries")
async def get_ndvi_timeseries(
    lat: float = Query(...),
    lon: float = Query(...),
    days: int = Query(30)
):
    """Get NDVI time series for a location"""
    dates = []
    values = []
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    current = start_date
    while current <= end_date:
        ndvi = simulate_ndvi_value(lat, lon, current)
        dates.append(current.strftime("%Y-%m-%d"))
        values.append(round(ndvi, 3))
        current += timedelta(days=1)
    
    return {
        "dates": dates,
        "values": values,
        "location": f"{lat:.4f}, {lon:.4f}"
    }

@router.get("/regions")
async def get_regions():
    """Get predefined regions"""
    regions = []
    for key, data in REGIONS.items():
        regions.append({
            "name": data["name"],
            "bounds": data["bounds"]
        })
    return regions

@router.post("/ndvi/export")
async def export_ndvi_geotiff(bounds: Dict[str, float]):
    """Export NDVI data as GeoTIFF (simulated)"""
    # In production, this would generate a real GeoTIFF
    from fastapi.responses import FileResponse
    import tempfile
    import numpy as np
    from osgeo import gdal
    
    # This is a placeholder - would need GDAL installed
    # For now, return a simple text file
    with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp:
        tmp.write(b"GeoTIFF export simulation\n")
        tmp.write(f"Bounds: {bounds}\n".encode())
        tmp.write(f"Timestamp: {datetime.utcnow().isoformat()}\n".encode())
        tmp_path = tmp.name
    
    return FileResponse(tmp_path, media_type='application/octet-stream', filename='ndvi_export.txt')
