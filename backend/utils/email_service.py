import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_email(to_email, subject, message, html_message=None):
    """
    Reusable function to send emails.
    Returns True if success, False otherwise.
    """
    try:
        logger.info(f"Attempting to send email to {to_email} with subject: {subject}")
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"Successfully sent email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}. Error: {str(e)}")
        return False
