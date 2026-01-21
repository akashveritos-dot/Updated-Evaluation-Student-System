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
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'users_profile' 
            AND COLUMN_NAME = 'unique_user_id'
        """, (db_settings['NAME'],))
        
        exists = cursor.fetchone()[0]
        
        if exists:
            print("Column 'unique_user_id' already exists in users_profile table")
        else:
            # Add the column
            cursor.execute("""
                ALTER TABLE users_profile 
                ADD COLUMN unique_user_id VARCHAR(50) NULL UNIQUE
            """)
            connection.commit()
            print("Successfully added 'unique_user_id' column to users_profile table")
            
finally:
    connection.close()
