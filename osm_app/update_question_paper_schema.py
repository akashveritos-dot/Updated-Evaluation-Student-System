import os
import django
import pymysql

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

from django.conf import settings

# Connect to MySQL
db_settings = settings.DATABASES['default']
connection = pymysql.connect(
    host=db_settings['HOST'],
    user=db_settings['USER'],
    password=db_settings['PASSWORD'],
    database=db_settings['NAME']
)

try:
    with connection.cursor() as cursor:
        print("Updating database schema for Question Paper system...")
        
        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        
        # Helper function to check if column exists
        def column_exists(table, column):
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = %s 
                AND COLUMN_NAME = %s
            """, (db_settings['NAME'], table, column))
            return cursor.fetchone()[0] > 0
        
        # 1. Update administration_questionpaper table
        print("\n1. Updating administration_questionpaper table...")
        
        # Add paper_id column
        if not column_exists('administration_questionpaper', 'paper_id'):
            cursor.execute("""
                ALTER TABLE administration_questionpaper 
                ADD COLUMN paper_id VARCHAR(50) NULL UNIQUE
            """)
            print("  ✓ Added paper_id column")
        else:
            print("  - paper_id already exists")
        
        # Add title column
        if not column_exists('administration_questionpaper', 'title'):
            cursor.execute("""
                ALTER TABLE administration_questionpaper 
                ADD COLUMN title VARCHAR(255) NULL
            """)
            print("  ✓ Added title column")
        else:
            print("  - title already exists")
        
        # Add subject_id foreign key
        if not column_exists('administration_questionpaper', 'subject_id'):
            cursor.execute("""
                ALTER TABLE administration_questionpaper 
                ADD COLUMN subject_id BIGINT NULL
            """)
            
            # Add foreign key constraint
            try:
                cursor.execute("""
                    ALTER TABLE administration_questionpaper 
                    ADD CONSTRAINT administration_questionpaper_subject_fk 
                    FOREIGN KEY (subject_id) REFERENCES administration_subject(id)
                """)
                print("  ✓ Added subject_id column with FK")
            except:
                print("  ✓ Added subject_id column (FK already exists)")
        else:
            print("  - subject_id already exists")
        
        # Add file column
        if not column_exists('administration_questionpaper', 'file'):
            cursor.execute("""
                ALTER TABLE administration_questionpaper 
                ADD COLUMN file VARCHAR(100) NULL
            """)
            print("  ✓ Added file column")
        else:
            print("  - file already exists")
        
        connection.commit()
        print("  ✓ Updated administration_questionpaper")
        
        # 2. Update administration_question table
        print("\n2. Updating administration_question table...")
        
        # Add question_id column
        if not column_exists('administration_question', 'question_id'):
            cursor.execute("""
                ALTER TABLE administration_question 
                ADD COLUMN question_id VARCHAR(100) NULL UNIQUE
            """)
            print("  ✓ Added question_id column")
        else:
            print("  - question_id already exists")
        
        # Add index_number column
        if not column_exists('administration_question', 'index_number'):
            cursor.execute("""
                ALTER TABLE administration_question 
                ADD COLUMN index_number INT NULL
            """)
            print("  ✓ Added index_number column")
        else:
            print("  - index_number already exists")
        
        # Add description column
        if not column_exists('administration_question', 'description'):
            cursor.execute("""
                ALTER TABLE administration_question 
                ADD COLUMN description TEXT NULL
            """)
            print("  ✓ Added description column")
        else:
            print("  - description already exists")
        
        connection.commit()
        print("  ✓ Updated administration_question")
        
        # 3. Update administration_answersheet table
        print("\n3. Updating administration_answersheet table...")
        
        # Add question_paper_id foreign key
        if not column_exists('administration_answersheet', 'question_paper_id'):
            cursor.execute("""
                ALTER TABLE administration_answersheet 
                ADD COLUMN question_paper_id BIGINT NULL
            """)
            
            # Add foreign key constraint
            try:
                cursor.execute("""
                    ALTER TABLE administration_answersheet 
                    ADD CONSTRAINT administration_answersheet_qp_fk 
                    FOREIGN KEY (question_paper_id) REFERENCES administration_questionpaper(id)
                """)
                print("  ✓ Added question_paper_id column with FK")
            except:
                print("  ✓ Added question_paper_id column (FK already exists)")
        else:
            print("  - question_paper_id already exists")
        
        connection.commit()
        print("  ✓ Updated administration_answersheet")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")
        connection.commit()
        
        print("\n✅ All database schema updates completed successfully!")
        print("\nNote: Old columns (name, question_no, text, etc.) are kept for backward compatibility.")
        print("New features will use the new columns (paper_id, title, question_id, description, etc.)")
            
finally:
    connection.close()
