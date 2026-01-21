
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "osm_app.settings")
django.setup()

tables_to_drop = [
    'administration_allocation',
    'administration_pdfassignment',
]

with connection.cursor() as cursor:
    for table in tables_to_drop:
        try:
            print(f"Dropping table {table}...")
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"Dropped {table}.")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
