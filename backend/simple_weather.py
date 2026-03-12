from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
import math
import uvicorn

app = FastAPI(title="Weather API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock weather data generator
def generate_weather(city: str):
    # Generate realistic but random weather
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

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/weather/current")
async def get_current_weather(city: str = Query(..., description="City name")):
    return generate_weather(city)

@app.get("/api/weather/forecast")
async def get_weather_forecast(city: str = Query(...), days: int = 5):
    forecast = []
    for i in range(days):
        day_weather = generate_weather(city)
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
