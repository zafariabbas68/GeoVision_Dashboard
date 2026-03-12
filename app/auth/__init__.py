from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

# Simple mock user database
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "email": "admin@example.com",
        "hashed_password": "fakehashedadmin",
        "disabled": False,
    }
}

@router.post("/login")
async def login(username: str, password: str):
    """Simple login endpoint"""
    if username in fake_users_db and password == "admin123":
        return {
            "access_token": "fake-jwt-token",
            "token_type": "bearer",
            "user": {
                "username": username,
                "full_name": fake_users_db[username]["full_name"]
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def get_current_user():
    """Get current user info"""
    return {"username": "admin", "role": "admin"}

@router.post("/register")
async def register(username: str, email: str, password: str):
    """Simple registration endpoint"""
    return {"message": "User registered successfully", "username": username}
