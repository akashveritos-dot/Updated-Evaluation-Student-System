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
        print("Making old columns nullable for backward compatibility...")
        
        # Make old QuestionPaper columns nullable
        print("\n1. Updating administration_questionpaper...")
        cursor.execute("""
            ALTER TABLE administration_questionpaper 
            MODIFY COLUMN name VARCHAR(200) NULL
        """)
        print("  ✓ Made 'name' column nullable")
        
        cursor.execute("""
            ALTER TABLE administration_questionpaper 
            MODIFY COLUMN total_marks FLOAT NULL DEFAULT 0
        """)
        print("  ✓ Made 'total_marks' column nullable with default")
        
        # Make old Question columns nullable
        print("\n2. Updating administration_question...")
        cursor.execute("""
            ALTER TABLE administration_question 
            MODIFY COLUMN question_no VARCHAR(20) NULL
        """)
        print("  ✓ Made 'question_no' column nullable")
        
        cursor.execute("""
            ALTER TABLE administration_question 
            MODIFY COLUMN text TEXT NULL
        """)
        print("  ✓ Made 'text' column nullable")
        
        cursor.execute("""
            ALTER TABLE administration_question 
            MODIFY COLUMN max_marks FLOAT NULL
        """)
        print("  ✓ Made 'max_marks' column nullable")
        
        cursor.execute("""
            ALTER TABLE administration_question 
            MODIFY COLUMN co VARCHAR(50) NULL
        """)
        print("  ✓ Made 'co' column nullable")
        
        cursor.execute("""
            ALTER TABLE administration_question 
            MODIFY COLUMN bl VARCHAR(50) NULL
        """)
        print("  ✓ Made 'bl' column nullable")
        
        connection.commit()
        print("\n✅ All columns updated successfully!")
        print("\nOld columns are now nullable. New question papers will use the new columns.")
            
finally:
    connection.close()
