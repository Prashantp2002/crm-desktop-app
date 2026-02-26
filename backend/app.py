from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, bcrypt, jwt
from routes.auth import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ ENABLE CORS (THIS WAS MISSING)
    CORS(app)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/")
    def home():
        return {"message": "Backend API is running successfully"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)