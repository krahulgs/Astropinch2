from sqlalchemy import inspect, text
from database import engine, Base
import models

def migrate():
    print("Starting database migration check...")
    inspector = inspect(engine)
    
    # 1. Ensure tables exist (Base.metadata.create_all handles this)
    models.Base.metadata.create_all(bind=engine)
    
    # 2. Check for missing columns in 'users' table
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    # List of columns to check and their SQL types
    # Note: Using String for simplicity in ALTER TABLE, matching models.py
    required_columns = {
        'gender': 'VARCHAR',
        'marital_status': 'VARCHAR',
        'profile_image': 'VARCHAR',
        'mobile_number': 'VARCHAR',
        'otp': 'VARCHAR',
        'is_active': 'BOOLEAN DEFAULT TRUE',
        'created_by_id': 'INTEGER'
    }
    
    with engine.connect() as conn:
        for col_name, col_type in required_columns.items():
            if col_name not in columns:
                print(f"Adding missing column: {col_name} to table 'users'...")
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"Column {col_name} added successfully.")
                except Exception as e:
                    print(f"Error adding column {col_name}: {e}")
            else:
                print(f"Column {col_name} already exists.")

    print("Migration check complete.")

if __name__ == "__main__":
    migrate()
