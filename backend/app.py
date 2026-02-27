from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize database
    db.init_app(app)

    # Import models AFTER db init (prevents circular imports)
    from models.role import Role
    from models.user import User
    from models.lead import Lead

    # Create tables
    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return {"message": "CRM Backend Running 🚀"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True)