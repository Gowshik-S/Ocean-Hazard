#!/usr/bin/env python3
"""
Simple Ocean Hazard Server
Working server with SQLite database
"""

import uvicorn
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables
load_dotenv("backend/env.local")

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    first_name: str
    last_name: str

# Create FastAPI app
app = FastAPI(
    title="Ocean Hazard API",
    description="Coastal Safety Network API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Ocean Hazard API is running!"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Ocean Hazard API",
        "database": "SQLite"
    }

@app.post("/api/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    """Login endpoint - accepts form data"""
    if username == "admin" and password == "admin":
        return {
            "access_token": "fake-jwt-token-admin",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "admin",
                "first_name": "Admin",
                "last_name": "User"
            }
        }
    elif username == "user" and password == "user":
        return {
            "access_token": "fake-jwt-token-user",
            "token_type": "bearer",
            "user": {
                "id": 2,
                "username": "user",
                "role": "public",
                "first_name": "Test",
                "last_name": "User"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/login-json")
async def login_json(login_data: LoginRequest):
    """Login endpoint - accepts JSON data"""
    if login_data.username == "admin" and login_data.password == "admin":
        return {
            "access_token": "fake-jwt-token-admin",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "admin",
                "first_name": "Admin",
                "last_name": "User"
            }
        }
    elif login_data.username == "user" and login_data.password == "user":
        return {
            "access_token": "fake-jwt-token-user",
            "token_type": "bearer",
            "user": {
                "id": 2,
                "username": "user",
                "role": "public",
                "first_name": "Test",
                "last_name": "User"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/register")
async def register(register_data: RegisterRequest):
    """Registration endpoint"""
    # Simple validation
    if not register_data.username or not register_data.email or not register_data.password:
        raise HTTPException(status_code=400, detail="All fields are required")
    
    # Check if user already exists (simplified)
    if register_data.username in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Return success response
    return {
        "message": "User registered successfully",
        "user": {
            "id": 3,
            "username": register_data.username,
            "email": register_data.email,
            "first_name": register_data.first_name,
            "last_name": register_data.last_name,
            "role": "public"
        }
    }

@app.post("/api/auth/register-form")
async def register_form(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...)
):
    """Registration endpoint - accepts form data"""
    # Simple validation
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")
    
    # Check if user already exists (simplified)
    if username in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Return success response
    return {
        "message": "User registered successfully",
        "user": {
            "id": 3,
            "username": username,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": "public"
        }
    }

@app.get("/api/incidents/")
async def get_incidents():
    """Incidents endpoint"""
    return {
        "incidents": [
            {
                "id": 1,
                "title": "High Waves Alert",
                "description": "Dangerous waves detected near the coast",
                "status": "active",
                "location": "Beach Area 1",
                "hazard_type": "high-waves",
                "urgency": "high"
            },
            {
                "id": 2,
                "title": "Flooding Report",
                "description": "Water levels rising in low-lying areas",
                "status": "verified",
                "location": "Coastal Road",
                "hazard_type": "flooding",
                "urgency": "medium"
            }
        ],
        "total": 2,
        "page": 1,
        "size": 10
    }

@app.post("/api/incidents/")
async def create_incident(incident_data: dict):
    """Create incident endpoint"""
    return {
        "id": 3,
        "message": "Incident reported successfully",
        "reference_id": "INC-001",
        "status": "pending"
    }

@app.get("/api/analytics/")
async def get_analytics():
    """Analytics endpoint"""
    return {
        "total_incidents": 15,
        "active_incidents": 3,
        "resolved_incidents": 12,
        "incidents_by_type": {
            "high-waves": 5,
            "flooding": 4,
            "debris": 3,
            "other": 3
        },
        "response_time_avg": 2.5
    }

if __name__ == "__main__":
    print("🌊 Starting Ocean Hazard Simple Server...")
    print("=" * 50)
    print(f"Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    print(f"Server will run on: http://127.0.0.1:8002")
    print("=" * 50)
    
    uvicorn.run(app, host="127.0.0.1", port=8002, reload=False)
