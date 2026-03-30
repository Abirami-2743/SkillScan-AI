from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="SkillScan AI", version="1.0.0")

# CORS - allows frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React runs here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
@app.on_event("startup")
async def startup_db():
    app.mongodb_client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    app.db = app.mongodb_client[os.getenv("DB_NAME")]
    print("✅ Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db():
    app.mongodb_client.close()

# Test route
@app.get("/")
async def root():
    return {"message": "SkillScan AI Backend is Running! 🚀"}
from routes.auth import router as auth_router
app.include_router(auth_router)
from routes.resumes import router as resumes_router
app.include_router(resumes_router)