from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from typing import List
import os
import shutil
import zipfile
from services.parser import parse_resume
from services.ai_scanner import scan_resume
from services.email_agent import send_email
from datetime import datetime

router = APIRouter(prefix="/resumes", tags=["Resumes"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/scan", summary="Scan Resumes")
async def scan_resumes(
    request: Request,
    job_title: str = Form(...),
    job_description: str = Form(...),
    company_name: str = Form(...),
    files: List[UploadFile] = File(description="Upload resume files")
):
    db = request.app.db
    results = []

    for file in files:
        # Save file temporarily
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Handle ZIP files
        if file.filename.endswith(".zip"):
            extracted = extract_zip(file_path)
            for extracted_file in extracted:
                result = process_single_resume(
                    extracted_file, job_title, job_description, company_name, db
                )
                if result:
                    results.append(result)
        else:
            result = await process_single_resume(
                file_path, job_title, job_description, company_name, db
            )
            if result:
                results.append(result)

    # Sort by score highest first
    results.sort(key=lambda x: x["score"], reverse=True)

    # Save scan session to MongoDB
    session = {
        "job_title": job_title,
        "job_description": job_description,
        "company_name": company_name,
        "total_resumes": len(results),
        "results": results,
        "created_at": datetime.utcnow()
    }
    await db.scan_sessions.insert_one(session)

    return {
        "message": f"Scanned {len(results)} resumes successfully!",
        "results": results
    }

def extract_zip(zip_path: str):
    extract_dir = zip_path.replace(".zip", "_extracted")
    os.makedirs(extract_dir, exist_ok=True)
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    
    files = []
    for f in os.listdir(extract_dir):
        if f.endswith((".pdf", ".docx", ".doc")):
            files.append(os.path.join(extract_dir, f))
    return files

async def process_single_resume(file_path, job_title, job_description, company_name, db):
    try:
        # Parse resume to text
        resume_text = parse_resume(file_path)
        
        if not resume_text:
            return None

        # AI scan
        ai_result = scan_resume(resume_text, job_title, job_description, company_name)

        # Send email automatically
        if ai_result.get("candidate_email"):
            send_email(
                candidate_email=ai_result["candidate_email"],
                candidate_name=ai_result["candidate_name"],
                job_title=job_title,
                company_name=company_name,
                recommendation=ai_result["recommendation"],
                reason=ai_result["reason"]
            )
            ai_result["email_sent"] = True
        else:
            ai_result["email_sent"] = False

        # Save to MongoDB
        await db.applications.insert_one({**ai_result, "job_title": job_title, "company_name": company_name, "created_at": datetime.utcnow()})

        return ai_result

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None
@router.get("/history")
async def get_history(request: Request):
    db = request.app.db
    sessions = []
    async for session in db.scan_sessions.find().sort("created_at", -1).limit(20):
        session["_id"] = str(session["_id"])
        sessions.append(session)
    return {"sessions": sessions}