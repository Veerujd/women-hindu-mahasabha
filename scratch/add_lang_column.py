import pymysql
import sys
import os

# Add the project root to sys.path to import config
sys.path.append(os.getcwd())

try:
    from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT
    
    conn = pymysql.connect(
        host=MYSQL_HOST, 
        user=MYSQL_USER, 
        password=MYSQL_PASSWORD, 
        database=MYSQL_DB, 
        port=MYSQL_PORT
    )
    cursor = conn.cursor()
    
    # Check if column exists first
    cursor.execute("SHOW COLUMNS FROM membership_applications LIKE 'submission_lang'")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE membership_applications ADD COLUMN submission_lang VARCHAR(5) DEFAULT 'kn' AFTER photo_filename")
        print("Column 'submission_lang' added successfully.")
    else:
        print("Column 'submission_lang' already exists.")
        
    conn.commit()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
