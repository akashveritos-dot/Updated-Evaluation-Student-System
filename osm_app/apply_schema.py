
import os
import django
from django.db import connection, transaction

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

def run_schema_script(script_path):
    print(f"Reading SQL script from {script_path}...")
    with open(script_path, 'r') as f:
        sql_script = f.read()

    # Split by semicolon to execute statement by statement if possible, 
    # but some statements like CREATE TRIGGER might differ. 
    # However, for standard CREATE TABLE, splitting is usually safer for python drivers.
    # NOTE: We can try executing the whole block if the driver supports it, 
    # but MySQL drivers often prefer one statement per call.
    
    statements = sql_script.split(';')
    
    with connection.cursor() as cursor:
        print("Starting schema execution...")
        for statement in statements:
            if statement.strip():
                try:
                    cursor.execute(statement)
                except Exception as e:
                    print(f"Error executing statement: {statement[:50]}...")
                    print(e)
        print("Schema execution finished.")

if __name__ == "__main__":
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema_reset.sql')
    run_schema_script(script_path)
