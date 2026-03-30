import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email(candidate_email: str, candidate_name: str, job_title: str, company_name: str, recommendation: str, reason: str):
    
    sender = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["From"] = sender
    msg["To"] = candidate_email

    if recommendation == "shortlist":
        msg["Subject"] = f"Your Application for {job_title} at {company_name} — Shortlisted! 🎉"
        body = f"""
Dear {candidate_name},

Thank you for applying for the {job_title} position at {company_name}.

We are pleased to inform you that your profile has been shortlisted! 
Our HR team was impressed with your background and experience.

Our team will reach out to you shortly with the next steps.

Best Regards,
HR Team
{company_name}

─────────────────────────
Powered by SkillScan AI
        """
    else:
        msg["Subject"] = f"Your Application for {job_title} at {company_name}"
        body = f"""
Dear {candidate_name},

Thank you for taking the time to apply for the {job_title} position at {company_name}.

After careful review of your profile, we regret to inform you that 
we will not be moving forward with your application at this time.

We appreciate your interest and encourage you to apply for future openings.

Best Regards,
HR Team
{company_name}

─────────────────────────
Powered by SkillScan AI
        """

    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, candidate_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False