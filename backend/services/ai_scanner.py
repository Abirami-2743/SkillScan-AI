from groq import Groq
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def scan_resume(resume_text: str, job_title: str, job_description: str, company_name: str) -> dict:
    prompt = f"""
You are an expert HR assistant. Analyze this resume against the job description and return ONLY a JSON object.

Company: {company_name}
Job Title: {job_title}
Job Description: {job_description}

Resume:
{resume_text}

Return ONLY this JSON format, nothing else:
{{
    "candidate_name": "full name from resume",
    "candidate_email": "email from resume",
    "score": <number 0-100>,
    "skills_matched": ["skill1", "skill2"],
    "skills_missing": ["skill1", "skill2"],
    "experience_match": "good/average/poor",
    "recommendation": "shortlist/reject/maybe",
    "reason": "2 line explanation why"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()
    
    # Clean and parse JSON
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    return json.loads(raw)