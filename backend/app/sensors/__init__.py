from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter()

@router.get("/status")
async def get_sensor_status():
    total = 156
    active = random.randint(150, 156)
    return {
        "total_sensors": total,
        "active": active,
        "offline": total - active,
        "last_update": datetime.now().isoformat(),
        "battery_levels": {
            "average": round(random.uniform(70, 95), 1),
            "critical": random.randint(0, 3),
            "low": random.randint(2, 8),
            "good": random.randint(50, 100)
        }
    }
