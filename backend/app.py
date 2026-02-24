from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

# Import models
from models.role import Role
from models.user import User
from models.lead import Lead

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {"message": "CRM Backend Running 🚀"}

if __name__ == "__main__":
    app.run(port=5000, debug=True)