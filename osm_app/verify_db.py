
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

def verify_tables():
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"{'Table Name':<40} | {'Row Count':<10}")
        print("-" * 55)
        
        legacy_tables = [
            'm_academic_year', 'm_college', 'm_course', 'm_course_part', 
            'm_course_part_term', 'm_event', 'm_question_paper', 
            'm_student', 'm_subject', 'm_user', 't_examination_copy_raw', 
            't_questions', 't_question_marks_raw', 't_student_marks_obtained', 
            't_student_marks_raw', 't_subquestions', 
            'm_answer_sheet_allocation', 'm_answer_sheet_allocation_batch'
        ]
        
        found_legacy = 0
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
            count = cursor.fetchone()[0]
            
            # Highlight legacy tables
            prefix = "* " if table_name in legacy_tables else "  "
            if table_name in legacy_tables:
                found_legacy += 1
                
            print(f"{prefix}{table_name:<38} | {count:<10}")

        print("-" * 55)
        print(f"Total Tables: {len(tables)}")
        print(f"Legacy Tables Found: {found_legacy}/{len(legacy_tables)}")

if __name__ == "__main__":
    verify_tables()
