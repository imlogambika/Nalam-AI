"""
AQI Service — OpenWeatherMap Air Quality Index.
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")

# Default city coordinates (Delhi)
DEFAULT_CITIES = {
    "Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639},
}


async def get_aqi(city: str = "Delhi") -> dict:
    """
    Fetch current Air Quality Index from OpenWeatherMap.
    Returns dict with aqi number and level string.
    """
    coords = DEFAULT_CITIES.get(city, DEFAULT_CITIES["Delhi"])

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/air_pollution",
            params={
                "lat": coords["lat"],
                "lon": coords["lon"],
                "appid": OPENWEATHERMAP_API_KEY,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        aqi_index = data["list"][0]["main"]["aqi"]  # 1-5 scale
        levels = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}

        # Map 1-5 scale to approximate AQI number
        aqi_number = aqi_index * 60

        return {"aqi": aqi_number, "level": levels.get(aqi_index, "Unknown")}
    except Exception as e:
        print(f"[AQI] Error fetching AQI: {e}")
        return {"aqi": 0, "level": "Unknown"}
