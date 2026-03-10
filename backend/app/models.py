from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    saved_locations = relationship("SavedLocation", back_populates="user")
    search_history = relationship("SearchHistory", back_populates="user")
    api_keys = relationship("ApiKey", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")

class SavedLocation(Base):
    __tablename__ = "saved_locations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_type = Column(String)  # city, forest, water, agriculture
    notes = Column(Text)
    tags = Column(JSON)  # Array of tags
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_locations")
    weather_history = relationship("WeatherHistory", back_populates="location")
    ndvi_history = relationship("NdviHistory", back_populates="location")

class WeatherHistory(Base):
    __tablename__ = "weather_history"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    location_id = Column(String, ForeignKey("saved_locations.id"), nullable=False)
    temperature = Column(Float)
    feels_like = Column(Float)
    humidity = Column(Integer)
    pressure = Column(Integer)
    wind_speed = Column(Float)
    wind_direction = Column(Integer)
    condition = Column(String)
    icon = Column(String)
    data = Column(JSON)  # Full weather data
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    location = relationship("SavedLocation", back_populates="weather_history")

class NdviHistory(Base):
    __tablename__ = "ndvi_history"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    location_id = Column(String, ForeignKey("saved_locations.id"), nullable=False)
    ndvi_value = Column(Float)
    cloud_cover = Column(Float)
    satellite = Column(String)
    data = Column(JSON)  # Full NDVI data
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    location = relationship("SavedLocation", back_populates="ndvi_history")

class SatellitePass(Base):
    __tablename__ = "satellite_passes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    satellite_name = Column(String, nullable=False)
    norad_id = Column(String)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    max_elevation = Column(Float)
    azimuth = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    query = Column(String, nullable=False)
    result_count = Column(Integer)
    search_type = Column(String)  # location, satellite, weather
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="search_history")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    last_used = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String)
    details = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
