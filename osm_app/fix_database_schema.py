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
        print("Checking and adding missing columns...")
        
        # Disable foreign key checks temporarily
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        
        # 1. Check if subject_id column exists in administration_subject
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_subject' 
            AND COLUMN_NAME = 'subject_id'
        """, (db_settings['NAME'],))
        
        if cursor.fetchone()[0] == 0:
            print("Adding subject_id column to administration_subject...")
            
            # First, clear any existing rows (they're invalid without subject_id)
            cursor.execute("DELETE FROM administration_paperschema")
            cursor.execute("DELETE FROM administration_answersheet")
            cursor.execute("DELETE FROM administration_bundle")
            cursor.execute("DELETE FROM administration_subject")
            
            # Add column as nullable first
            cursor.execute("""
                ALTER TABLE administration_subject 
                ADD COLUMN subject_id VARCHAR(50) NULL UNIQUE FIRST
            """)
            connection.commit()
            print("✓ Added subject_id column")
        else:
            print("✓ subject_id column already exists")
        
        # 2. Check if name column exists in administration_subject
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_subject' 
            AND COLUMN_NAME = 'name'
        """, (db_settings['NAME'],))
        
        if cursor.fetchone()[0] == 0:
            print("Adding name column to administration_subject...")
            cursor.execute("""
                ALTER TABLE administration_subject 
                ADD COLUMN name VARCHAR(255) NULL
            """)
            connection.commit()
            print("✓ Added name column")
        else:
            print("✓ name column already exists")
        
        # 3. Check if code column exists in administration_subject
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_subject' 
            AND COLUMN_NAME = 'code'
        """, (db_settings['NAME'],))
        
        if cursor.fetchone()[0] == 0:
            print("Adding code column to administration_subject...")
            cursor.execute("""
                ALTER TABLE administration_subject 
                ADD COLUMN code VARCHAR(20) NULL
            """)
            connection.commit()
            print("✓ Added code column")
        else:
            print("✓ code column already exists")
        
        # 4. Check if created_at column exists in administration_subject
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_subject' 
            AND COLUMN_NAME = 'created_at'
        """, (db_settings['NAME'],))
        
        if cursor.fetchone()[0] == 0:
            print("Adding created_at column to administration_subject...")
            cursor.execute("""
                ALTER TABLE administration_subject 
                ADD COLUMN created_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6)
            """)
            connection.commit()
            print("✓ Added created_at column")
        else:
            print("✓ created_at column already exists")
        
        # 5. Modify Bundle.subject from VARCHAR to ForeignKey
        # First check current type
        cursor.execute("""
            SELECT DATA_TYPE, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'administration_bundle' 
            AND COLUMN_NAME = 'subject'
        """, (db_settings['NAME'],))
        
        result = cursor.fetchone()
        if result and 'varchar' in result[1].lower():
            print("Converting Bundle.subject from VARCHAR to ForeignKey...")
            
            # Clear existing bundles (they reference non-existent subjects)
            cursor.execute("DELETE FROM administration_answersheet")
            cursor.execute("DELETE FROM administration_bundle")
            
            # Drop the old column
            cursor.execute("""
                ALTER TABLE administration_bundle 
                DROP COLUMN subject
            """)
            
            # Add new subject_id column as foreign key
            cursor.execute("""
                ALTER TABLE administration_bundle 
                ADD COLUMN subject_id BIGINT NULL
            """)
            
            # Add foreign key constraint
            cursor.execute("""
                ALTER TABLE administration_bundle 
                ADD CONSTRAINT administration_bundle_subject_id_fk 
                FOREIGN KEY (subject_id) REFERENCES administration_subject(id)
            """)
            
            connection.commit()
            print("✓ Converted subject to foreign key")
        else:
            print("✓ Bundle.subject is already a foreign key or doesn't exist")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")
        connection.commit()
        
        print("\n✅ All database schema updates completed successfully!")
        print("\nNote: Existing bundles and subjects were cleared. You can now add new subjects and bundles.")
            
finally:
    connection.close()
