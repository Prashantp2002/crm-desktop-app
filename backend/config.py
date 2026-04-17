import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI      = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY               = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES     = timedelta(hours=8)
    GOOGLE_CLIENT_ID           = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET       = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI        = os.getenv("GOOGLE_REDIRECT_URI")

