from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import random
import math

router = APIRouter()

def generate_weather_data(city: str):
    hour = datetime.now().hour
    temp_base = 20
    temp = temp_base + math.sin((hour - 6) * math.pi / 12) * 3 + random.randint(-2, 2)
    
    weather_types = [
        {"main": "Clear", "icon": "01d", "description": "clear sky"},
        {"main": "Clouds", "icon": "03d", "description": "scattered clouds"},
        {"main": "Rain", "icon": "10d", "description": "light rain"},
    ]
    weather = random.choice(weather_types)
    
    return {
        "location": city.capitalize(),
        "country": "IT",
        "temperature": round(temp, 1),
        "feels_like": round(temp - 1 + random.random() * 2, 1),
        "humidity": random.randint(50, 85),
        "pressure": 1010 + random.randint(-5, 10),
        "wind_speed": round(3 + random.random() * 8, 1),
        "wind_direction": random.randint(0, 359),
        "clouds": random.randint(0, 100),
        "visibility": 10000,
        "weather_main": weather["main"],
        "weather_description": weather["description"],
        "weather_icon": weather["icon"],
        "sunrise": int(datetime.now().replace(hour=6, minute=0).timestamp()),
        "sunset": int(datetime.now().replace(hour=19, minute=0).timestamp()),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/current")
async def get_current_weather(city: str = Query(..., description="City name")):
    return generate_weather_data(city)

@router.get("/forecast")
async def get_weather_forecast(city: str = Query(...), days: int = 5):
    forecast = []
    for i in range(days):
        day_weather = generate_weather_data(city)
        forecast.append({
            "date": (datetime.now().replace(hour=12, minute=0) + timedelta(days=i)).isoformat(),
            "temperature": day_weather["temperature"],
            "humidity": day_weather["humidity"],
            "wind_speed": day_weather["wind_speed"],
            "weather_main": day_weather["weather_main"],
            "weather_icon": day_weather["weather_icon"],
            "precipitation": random.randint(0, 30) if day_weather["weather_main"] == "Rain" else 0
        })
    return forecast
