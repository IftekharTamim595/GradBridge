import os
import django
import sys

# Setup Django environment
sys.path.append('/home/tamim/Music/GradBridge/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from profiles.models import StudentProfile, AlumniProfile

def verify_signals():
    print("Verifying Student Profile Creation...")
    student_email = "test_signal_student@example.com"
    # Clean up if exists
    User.objects.filter(email=student_email).delete()
    
    student = User.objects.create_user(
        username="test_signal_student",
        email=student_email,
        password="password123",
        role="student"
    )
    
    if StudentProfile.objects.filter(user=student).exists():
        print("PASS: StudentProfile created automatically.")
    else:
        print("FAIL: StudentProfile NOT created.")

    print("\nVerifying Alumni Profile Creation...")
    alumni_email = "test_signal_alumni@example.com"
    # Clean up if exists
    User.objects.filter(email=alumni_email).delete()
    
    alumni = User.objects.create_user(
        username="test_signal_alumni",
        email=alumni_email,
        password="password123",
        role="alumni"
    )
    
    if AlumniProfile.objects.filter(user=alumni).exists():
        print("PASS: AlumniProfile created automatically.")
    else:
        print("FAIL: AlumniProfile NOT created.")

    # Cleanup
    student.delete()
    alumni.delete()

if __name__ == "__main__":
    verify_signals()
