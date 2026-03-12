from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/login")
async def login(username: str, password: str):
    if username == "admin" and password == "admin123":
        return {"access_token": "fake-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def get_current_user():
    return {"username": "admin", "role": "admin"}

@router.post("/register")
async def register(username: str, email: str, password: str):
    return {"message": "User registered", "username": username}
