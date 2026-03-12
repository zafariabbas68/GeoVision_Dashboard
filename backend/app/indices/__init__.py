from fastapi import APIRouter, Query
from datetime import datetime
import random

router = APIRouter()

@router.get("/ndvi/point")
async def get_ndvi_at_point(lat: float = Query(...), lon: float = Query(...)):
    ndvi = random.uniform(0.3, 0.9)
    return {
        "lat": lat,
        "lng": lon,
        "value": round(ndvi, 3),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "source": "Sentinel-2"
    }

@router.post("/ndvi/statistics")
async def get_ndvi_statistics(bounds: dict):
    return {
        "mean": round(random.uniform(0.4, 0.7), 3),
        "max": round(random.uniform(0.7, 0.9), 3),
        "min": round(random.uniform(0.1, 0.3), 3),
        "std": round(random.uniform(0.1, 0.2), 3),
        "vegetationCover": round(random.uniform(40, 70), 1),
        "waterBodies": round(random.uniform(5, 15), 1),
        "bareSoil": round(random.uniform(10, 25), 1),
        "urbanAreas": round(random.uniform(5, 20), 1)
    }
