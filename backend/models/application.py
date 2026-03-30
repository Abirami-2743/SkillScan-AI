from pydantic import BaseModel
from typing import Optional, List

class ApplicationResult(BaseModel):
    candidate_name: str
    candidate_email: str
    score: int
    skills_matched: List[str]
    skills_missing: List[str]
    experience_match: str
    recommendation: str
    reason: str