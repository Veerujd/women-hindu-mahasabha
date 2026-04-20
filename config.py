import os

# ── MySQL Database Configuration ──────────────────────────────────────────────
# Fill in your MySQL credentials here
MYSQL_HOST     = 'localhost'
MYSQL_USER     = 'root'          # your MySQL username
MYSQL_PASSWORD = 'root'              # ← put your MySQL password here
MYSQL_DB       = 'mahasabha_db'  # database name (will be created by schema.sql)
MYSQL_PORT     = 3306

# ── File Upload Configuration ─────────────────────────────────────────────────
UPLOAD_FOLDER  = os.path.join(os.path.dirname(__file__), 'static', 'uploads', 'member_photos')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB max upload

# ── Flask Secret Key ──────────────────────────────────────────────────────────
SECRET_KEY = 'mahasabha-secret-key-2024'
