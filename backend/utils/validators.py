import os
from rest_framework.exceptions import ValidationError

def validate_file(file, max_size_mb=5, allowed_extensions=None):
    """
    Validates file size and extension.
    :param file: The file object
    :param max_size_mb: Maximum allowed size in megabytes
    :param allowed_extensions: List of allowed extensions (e.g. ['.jpg', '.pdf'])
    """
    if not file:
        return

    # Check file size
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"File size too large. Max size is {max_size_mb}MB")

    # Check extension
    if allowed_extensions:
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in allowed_extensions:
            raise ValidationError(f"Unsupported file extension. Allowed: {', '.join(allowed_extensions)}")

def validate_image(file, max_size_mb=2):
    return validate_file(file, max_size_mb, ['.jpg', '.jpeg', '.png', '.webp'])

def validate_resume(file, max_size_mb=5):
    return validate_file(file, max_size_mb, ['.pdf', '.doc', '.docx'])
