"""
Sends the password-reset email via Gmail SMTP.
"""
import smtplib
from email.mime.text import MIMEText

from app.config import settings


def send_reset_email(to_email: str, reset_token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    body = f"""Hi,

We received a request to reset your password for Marginal — AI Business Assistant.

Click the link below to set a new password. This link expires in 30 minutes.

{reset_link}

If you didn't request this, you can safely ignore this email.
"""

    msg = MIMEText(body)
    msg["Subject"] = "Reset your password — Marginal"
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_EMAIL, [to_email], msg.as_string())