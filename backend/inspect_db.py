import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placentra.settings')
django.setup()

from django.db import connection

def get_schema():
    schema = {}
    with connection.cursor() as cursor:
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        for table in tables:
            schema[table] = {
                'columns': [],
                'primary_keys': [],
                'foreign_keys': [],
                'unique_constraints': [],
                'check_constraints': [],
                'indexes': []
            }
            
            # Get columns
            cursor.execute(f"""
                SELECT column_name, data_type, character_maximum_length, 
                       numeric_precision, numeric_scale, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = '{table}'
                ORDER BY ordinal_position;
            """)
            for row in cursor.fetchall():
                schema[table]['columns'].append({
                    'name': row[0],
                    'type': row[1],
                    'max_length': row[2],
                    'precision': row[3],
                    'scale': row[4],
                    'nullable': row[5],
                    'default': row[6]
                })
            
            # Get constraints (PK, Unique)
            cursor.execute(f"""
                SELECT tc.constraint_type, kcu.column_name, tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = 'public' AND tc.table_name = '{table}'
            """)
            for row in cursor.fetchall():
                c_type = row[0]
                c_col = row[1]
                c_name = row[2]
                if c_type == 'PRIMARY KEY':
                    schema[table]['primary_keys'].append(c_col)
                elif c_type == 'UNIQUE':
                    schema[table]['unique_constraints'].append({'column': c_col, 'name': c_name})
                    
            # Get foreign keys
            cursor.execute(f"""
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='{table}';
            """)
            for row in cursor.fetchall():
                schema[table]['foreign_keys'].append({
                    'column': row[0],
                    'references_table': row[1],
                    'references_column': row[2]
                })
                
            # Get indexes
            cursor.execute(f"""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE schemaname = 'public' AND tablename = '{table}';
            """)
            for row in cursor.fetchall():
                schema[table]['indexes'].append({
                    'name': row[0],
                    'def': row[1]
                })

    return schema

if __name__ == '__main__':
    data = get_schema()
    with open('db_schema_output.json', 'w') as f:
        json.dump(data, f, indent=4)
    print("Schema dumped to db_schema_output.json")
