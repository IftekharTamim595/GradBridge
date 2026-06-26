import logging
import threading
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailThread(threading.Thread):
    def __init__(self, subject, message, from_email, recipient_list, html_message=None):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        self.html_message = html_message
        threading.Thread.__init__(self)

    def run(self):
        try:
            logger.info(f"Attempting to send email to {self.recipient_list[0]} with subject: {self.subject}")
            send_mail(
                subject=self.subject,
                message=self.message,
                from_email=self.from_email,
                recipient_list=self.recipient_list,
                fail_silently=False,
                html_message=self.html_message
            )
            logger.info(f"Successfully sent email to {self.recipient_list[0]}")
        except Exception as e:
            logger.error(f"Failed to send email to {self.recipient_list[0]}. Error: {str(e)}")

def send_email(to_email, subject, message, html_message=None):
    """
    Reusable function to send emails asynchronously.
    Returns True immediately.
    """
    EmailThread(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message
    ).start()
    return True
