import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base

class Database:
    def __init__(self, database_uri):
        self.engine = create_engine(database_uri, echo=False)
        self.session_factory = sessionmaker(bind=self.engine)
        self.Session = scoped_session(self.session_factory)

    def init_db(self):
        """Initialize database with schema from SQL file"""
        db_path = 'database/geovocab.db'
        sql_path = 'database/geovocab.sql'

        # Only initialize if database doesn't exist
        if not os.path.exists(db_path):
            print("Initializing database...")
            print("This may take a moment as we load 32K+ word mappings...")

            with open(sql_path, 'r', encoding='utf-8') as f:
                sql_script = f.read()

            # Execute SQL script using raw connection for better compatibility
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()

            try:
                cursor.executescript(sql_script)
                conn.commit()
                print("Database initialized successfully!")
                print(f"Loaded word mappings from {sql_path}")
            except Exception as e:
                print(f"Error initializing database: {e}")
                conn.rollback()
                raise
            finally:
                conn.close()
        else:
            print("Database already exists, skipping initialization.")

    def get_session(self):
        return self.Session()

    def close_session(self):
        self.Session.remove()
