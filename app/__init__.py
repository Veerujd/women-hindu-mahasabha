import os
from flask import Flask
from config import SECRET_KEY, UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from routes.web import web_bp

app = Flask(__name__, template_folder='../templates', static_folder='../static')

# ── Flask config ──────────────────────────────────────────────────────────────
app.secret_key = SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload folder exists on startup
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.register_blueprint(web_bp)
