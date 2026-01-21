import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

tables_to_drop = [
    't_student_marks_obtained', 't_question_marks_raw', 't_examination_copy_raw',
    'm_answer_sheet_allocation', 'm_answer_sheet_allocation_batch',
    't_subquestions', 't_questions', 'm_question_paper',
    'm_student', 'm_subject', 'm_event',
    'm_course_part_term', 'm_course_part', 'm_course',
    'm_user', 'user_role', 'm_college', 'm_academic_year',
    'm_student_subject_answer_sheet' # Added based on FK
]

with connection.cursor() as cursor:
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    for table in tables_to_drop:
        try:
            print(f"Dropping table {table}...")
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
print("Done.")
