from fastapi import APIRouter, HTTPException, Request
from jose import jwt
from datetime import datetime, timedelta
from models.hr_user import HRSignup, HRLogin
import bcrypt
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_token(data: dict, expires_days: int = 7):
    expire = datetime.utcnow() + timedelta(days=expires_days)
    data.update({"exp": expire})
    return jwt.encode(data, os.getenv("JWT_SECRET"), algorithm="HS256")

def send_magic_link(to_email: str, name: str, token: str):
    sender = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")
    verify_url = f"http://localhost:5173/verify?token={token}"

    msg = MIMEMultipart("alternative")
    msg["From"] = sender
    msg["To"] = to_email
    msg["Subject"] = "Verify your SkillScan AI account ✅"

    body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8f9fb; padding: 40px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: #1a1f2e; padding: 32px; text-align: center;">
      <div style="display: inline-block; background: #4ade80; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 700; color: #1a1f2e;">S</div>
      <h1 style="color: white; font-size: 22px; margin: 16px 0 0;">SkillScan AI</h1>
    </div>
    <div style="padding: 40px 32px;">
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px;">Hi {name}! 👋</h2>
      <p style="color: #6b7280; line-height: 1.7; margin: 0 0 28px;">
        Welcome to SkillScan AI! Click the button below to verify your email address and activate your HR account.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="{verify_url}" style="display: inline-block; background: #1a1f2e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verify My Account →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
        This link expires in 24 hours. If you didn't create an account, ignore this email.
      </p>
    </div>
    <div style="background: #f8f9fb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by SkillScan AI · Built with FastAPI + Groq</p>
    </div>
  </div>
</body>
</html>
"""
    msg.attach(MIMEText(body, "html"))
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@router.post("/signup")
async def signup(user: HRSignup, request: Request):
    db = request.app.db
    existing = await db.hr_users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered!")

    verify_token = secrets.token_urlsafe(32)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "company_name": user.company_name,
        "company_location": user.company_location,
        "is_verified": False,
        "verify_token": verify_token,
        "avatar": None,
        "created_at": datetime.utcnow()
    }
    await db.hr_users.insert_one(new_user)
    send_magic_link(user.email, user.name, verify_token)

    return {
        "message": "Account created! Please check your email to verify your account.",
        "email": user.email
    }

@router.get("/verify")
async def verify_email(token: str, request: Request):
    db = request.app.db
    user = await db.hr_users.find_one({"verify_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link!")

    await db.hr_users.update_one(
        {"verify_token": token},
        {"$set": {"is_verified": True, "verify_token": None}}
    )
    auth_token = create_token({"user_id": str(user["_id"]), "email": user["email"]})

    return {
        "message": "Email verified successfully!",
        "token": auth_token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "company_name": user["company_name"],
            "is_verified": True,
            "avatar": user.get("avatar")
        }
    }

@router.post("/login")
async def login(user: HRLogin, request: Request):
    db = request.app.db
    existing = await db.hr_users.find_one({"email": user.email})
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found!")
    if not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=401, detail="Wrong password!")
    if not existing.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Please verify your email first! Check your inbox.")

    token = create_token({"user_id": str(existing["_id"]), "email": existing["email"]})
    return {
        "message": "Login successful!",
        "token": token,
        "user": {
            "name": existing["name"],
            "email": existing["email"],
            "company_name": existing["company_name"],
            "is_verified": existing.get("is_verified", False),
            "avatar": existing.get("avatar")
        }
    }

@router.post("/resend-verification")
async def resend_verification(email: str, request: Request):
    db = request.app.db
    user = await db.hr_users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found!")
    if user.get("is_verified"):
        raise HTTPException(status_code=400, detail="Email already verified!")

    new_token = secrets.token_urlsafe(32)
    await db.hr_users.update_one({"email": email}, {"$set": {"verify_token": new_token}})
    send_magic_link(email, user["name"], new_token)
    return {"message": "Verification email resent!"}

@router.post("/change-password")
async def change_password(data: dict, request: Request):
    db = request.app.db
    user = await db.hr_users.find_one({"email": data["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    if not verify_password(data["current_password"], user["password"]):
        raise HTTPException(status_code=401, detail="Current password is wrong!")

    new_hashed = hash_password(data["new_password"])
    await db.hr_users.update_one(
        {"email": data["email"]},
        {"$set": {"password": new_hashed}}
    )
    return {"message": "Password changed successfully!"}