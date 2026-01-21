
import random
import string
from django.utils import timezone

def generate_user_id(role):
    """
    Generates a unique ID for users.
    Format: ROLE-YYYY-RAND
    e.g., FAC-2024-X9Z2
    """
    prefix = role[:3].upper()
    year = timezone.now().year
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{year}-{rand_str}"

def generate_bundle_id(subject_code):
    """
    Generates a unique Bundle ID.
    Format: BND-SUB-YYYY-RAND
    """
    year = timezone.now().year
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"BND-{subject_code}-{year}-{rand_str}"

def generate_sheet_id(bundle_id, sequence_num):
    """
    Generates a unique Answer Sheet ID.
    Format: SHT-BUNDLEID-SEQ
    """
    # Simply appending sequence to bundle ID or making a new hash
    return f"{bundle_id}-S{sequence_num:03d}"

def generate_subject_id():
    """
    Generates a unique Subject ID.
    Format: SUB-YYYY-RAND
    """
    year = timezone.now().year
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SUB-{year}-{rand_str}"

def generate_paper_id():
    """
    Generates a unique Question Paper ID.
    Format: QP-YYYY-RAND
    """
    year = timezone.now().year
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"QP-{year}-{rand_str}"

def generate_question_id(paper_id, index):
    """
    Generates a unique Question ID.
    Format: PAPER_ID-Q{index:02d}
    """
    return f"{paper_id}-Q{index:02d}"
