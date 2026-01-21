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
        print("Fixing subject_code column to allow NULL...")
        
        # Check if subject_code exists and is NOT NULL
        cursor.execute("""
            SELECT IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_subject' 
            AND COLUMN_NAME = 'subject_code'
        """, (db_settings['NAME'],))
        
        result = cursor.fetchone()
        if result and result[0] == 'NO':
            print("Modifying subject_code to allow NULL...")
            cursor.execute("""
                ALTER TABLE administration_subject 
                MODIFY COLUMN subject_code VARCHAR(50) NULL
            """)
            connection.commit()
            print("✓ subject_code column now allows NULL values")
        else:
            print("✓ subject_code already allows NULL or doesn't exist")
        
        print("\n✅ Database fix completed!")
            
finally:
    connection.close()
