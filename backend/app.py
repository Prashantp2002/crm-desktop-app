import os
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  


from flask import Flask, request, Response
from flask_cors import CORS
from config import Config
from extensions import db, bcrypt, jwt, migrate
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.accounts import accounts_bp
from models import *
from routes.tasks import tasks_bp
from routes.contacts import contacts_bp
from routes.leads import leads_bp
from routes.opportunities import opportunities_bp
from routes.users import users_bp
from routes.teams import teams_bp
from routes.calls import calls_bp
from routes.calendar import calendar_bp
from routes.meetings import meetings_bp
from routes.email import email_bp

def create_app():
    app = Flask(__name__)
    app.secret_key = "super-secret-key-123"
    app.config.from_object(Config)

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"]      = "http://localhost:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            res = Response()
            res.headers["Access-Control-Allow-Origin"]      = "http://localhost:3000"
            res.headers["Access-Control-Allow-Credentials"] = "true"
            res.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
            res.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            return res, 200

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(auth_bp,          url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp,     url_prefix="/api")
    app.register_blueprint(tasks_bp,         url_prefix="/api")
    app.register_blueprint(accounts_bp,      url_prefix="/api")
    app.register_blueprint(contacts_bp,      url_prefix="/api")
    app.register_blueprint(leads_bp,         url_prefix="/api")
    app.register_blueprint(opportunities_bp, url_prefix="/api")
    app.register_blueprint(users_bp,         url_prefix="/api")
    app.register_blueprint(teams_bp,         url_prefix="/api")
    app.register_blueprint(calls_bp,         url_prefix="/api")
    app.register_blueprint(calendar_bp,      url_prefix="/api")
    app.register_blueprint(meetings_bp,      url_prefix="/api")
    app.register_blueprint(email_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {"message": "Backend API is running successfully"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

