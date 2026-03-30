from pydantic import BaseModel

class ScanSession(BaseModel):
    job_title: str
    job_description: str