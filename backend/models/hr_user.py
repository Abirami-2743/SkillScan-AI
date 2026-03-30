from pydantic import BaseModel, EmailStr
from typing import Optional

class HRSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str
    company_location: Optional[str] = None

class HRLogin(BaseModel):
    email: EmailStr
    password: str

class HRResponse(BaseModel):
    id: str
    name: str
    email: str
    company_name: str
    company_location: Optional[str] = None