from app import app

if __name__ == "__main__":
    # The app is configured in app/__init__.py
    app.run(debug=True, port=5000)
