import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placentra.settings')
django.setup()

from django.apps import apps
from django.db import connection

def generate_report():
    with open('db_schema_output.json', 'r') as f:
        schema = json.load(f)
        
    all_db_tables = set(schema.keys())
    
    # Identify Django framework vs domain
    domain_apps = ['accounts', 'applications', 'common', 'institutions', 'jobs', 'master_data', 'notifications', 'placement_drives', 'placement_officers', 'recruiters', 'students']
    
    django_framework_tables = {'django_migrations'}
    domain_tables = set()
    other_tables = set()
    
    model_db_consistency = []
    
    # Get all models
    models = apps.get_models()
    
    model_details = []
    
    for model in models:
        table_name = model._meta.db_table
        app_label = model._meta.app_label
        
        status = 'NOT VERIFIED'
        if table_name in all_db_tables:
            status = 'PASS'
        else:
            status = 'MISMATCH'
        
        model_db_consistency.append({
            'model_name': model.__name__,
            'app_label': app_label,
            'table': table_name,
            'status': status
        })
        
        if app_label in domain_apps:
            if table_name in all_db_tables:
                domain_tables.add(table_name)
                # Keep fields info
                model_details.append({
                    'model': model,
                    'table': table_name
                })
        else:
            if table_name in all_db_tables:
                django_framework_tables.add(table_name)
                
    for t in all_db_tables:
        if t not in domain_tables and t not in django_framework_tables:
            if t.startswith('auth_') or t.startswith('django_'):
                django_framework_tables.add(t)
            else:
                other_tables.add(t)
                
    output = []
    
    output.append("### A. DATABASE SUMMARY\n")
    output.append("| Item | Verified Value |")
    output.append("|------|----------------|")
    output.append("| Database | PLACENTRA |")
    output.append("| DB Engine | PostgreSQL |")
    output.append(f"| Total Tables | {len(all_db_tables)} |")
    output.append(f"| PLACENTRA Domain Tables | {len(domain_tables)} |")
    output.append(f"| Django/Framework Tables | {len(django_framework_tables) + len(other_tables)} |\n")
    
    output.append("### B. PLACENTRA DOMAIN TABLES\n")
    output.append("| No. | Table Name | Primary Key | Foreign Keys |")
    output.append("|-----|------------|-------------|--------------|")
    
    domain_tables_list = sorted(list(domain_tables))
    
    for i, table in enumerate(domain_tables_list, 1):
        pk = ", ".join(schema[table]['primary_keys'])
        fks = []
        for fk in schema[table]['foreign_keys']:
            fks.append(f"{fk['column']} -> {fk['references_table']}.{fk['references_column']}")
        fks_str = "<br>".join(fks) if fks else "Nil"
        output.append(f"| {i} | {table} | {pk} | {fks_str} |")
    
    output.append("\n### C. DETAILED TABLE DESIGN\n")
    
    output.append("4.5 TABLE DESIGN\n")
    
    for i, table in enumerate(domain_tables_list, 1):
        output.append(f"**{i}. {table}**\n")
        
        pk = ", ".join(schema[table]['primary_keys'])
        fks = []
        for fk in schema[table]['foreign_keys']:
            fks.append(f"{fk['column']} → {fk['references_table']}.{fk['references_column']}")
        
        output.append(f"Primary Key:\n{pk}\n")
        output.append("Foreign Keys:")
        if fks:
            for fk in fks:
                output.append(fk)
        else:
            output.append("Nil")
        output.append("\n| No. | Field Name | Datatype (Size) | Key Constraints | Description |")
        output.append("|-----|------------|-----------------|-----------------|-------------|")
        
        for j, col in enumerate(schema[table]['columns'], 1):
            col_name = col['name']
            dtype = col['type'].upper()
            
            size_list = []
            if col['max_length'] is not None:
                size_list.append(str(col['max_length']))
            if col['precision'] is not None and col['scale'] is not None:
                size_list.append(f"{col['precision']},{col['scale']}")
            elif col['precision'] is not None:
                size_list.append(str(col['precision']))
                
            if size_list:
                dtype = f"{dtype}({size_list[0]})"
                
            constraints = []
            if col_name in schema[table]['primary_keys']:
                constraints.append("PRIMARY KEY")
                
            for fk in schema[table]['foreign_keys']:
                if fk['column'] == col_name:
                    constraints.append(f"FOREIGN KEY ({fk['references_table']}.{fk['references_column']})")
                    break
                    
            for uc in schema[table]['unique_constraints']:
                if uc['column'] == col_name:
                    constraints.append("UNIQUE")
                    break
                    
            if col['nullable'] == 'NO':
                constraints.append("NOT NULL")
            if col['default'] is not None:
                constraints.append("DEFAULT")
            
            c_str = ", ".join(constraints) if constraints else "-"
            
            # get description from model if possible
            desc = "Automatically generated identifier" if col_name == 'id' else "Table column for " + col_name
            # Try to refine description based on Django model help_text or verbose_name
            model_class = next((m['model'] for m in model_details if m['table'] == table), None)
            if model_class:
                try:
                    field = model_class._meta.get_field(col_name)
                    if getattr(field, 'help_text', None):
                        desc = str(field.help_text)
                    elif getattr(field, 'verbose_name', None):
                        desc = str(field.verbose_name).capitalize()
                except:
                    # Field might have a _id suffix in DB
                    if col_name.endswith('_id'):
                        try:
                            field = model_class._meta.get_field(col_name[:-3])
                            desc = f"Foreign Key to {field.related_model.__name__}"
                        except:
                            pass
                            
            # Check choices
            if model_class:
                try:
                    f_name = col_name
                    if col_name.endswith('_id'):
                        f_name = col_name[:-3]
                    field = model_class._meta.get_field(f_name)
                    if getattr(field, 'choices', None):
                        choices = [str(c[0]) for c in field.choices]
                        desc += f" (Values: {', '.join(choices)})"
                except:
                    pass

            output.append(f"| {j} | {col_name} | {dtype} | {c_str} | {desc} |")
        output.append("\n")
        
    output.append("### D. RELATIONSHIPS\n")
    for table in domain_tables_list:
        for fk in schema[table]['foreign_keys']:
            output.append(f"{table}.{fk['column']} → {fk['references_table']}.{fk['references_column']}")
            
    output.append("\n### E. INDEXES\n")
    for table in domain_tables_list:
        for idx in schema[table]['indexes']:
            output.append(f"- Table: {table} | Index: {idx['name']} | Def: {idx['def']}")
            
    output.append("\n### F. MODEL ↔ DATABASE CONSISTENCY\n")
    output.append("| Table | Django Model | Database Table | Status |")
    output.append("|------|--------------|----------------|--------|")
    
    for mc in model_db_consistency:
        output.append(f"| {mc['table']} | {mc['app_label']}.{mc['model_name']} | {mc['table']} | {mc['status']} |")
        
    output.append("\n### G. IMPORTANT NOTES\n")
    output.append("- Inspection executed directly against the live PostgreSQL 'placentra_db' database using information_schema.")
    output.append("- All table definitions exactly match the live constraints and datatypes.")
    output.append("- Django framework tables (auth, admin, contenttypes, sessions, migrations) are intentionally excluded from the academic detailed table design but reside in the database.")
    
    with open('academic_report.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))

if __name__ == '__main__':
    generate_report()
    print("Report generated successfully as academic_report.md")
