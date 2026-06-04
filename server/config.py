import os
from datetime import datetime, timedelta

class Config:
    # Configuring the base directory of the project
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    
    # Define the SQLite database URI. It will create `users.db` in the user-service directory.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASEDIR, 'braves.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Suppress warning
    SECRET_KEY = 'thisisasecretkeyforsomereasonidonotlikeatall'
    
    # Allowing CORS from the frontend application's development server
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3000/",
        "http://10.71.75.244:3000",
        "http://10.71.75", # Added with trailing slash
        "10.71.75.244:3000"          # Added without the http:// prefix
    ] # This should be adjusted if frontend runs on a different port/domain

    # Secret key for signing password reset and email verification tokens
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
    # Expiry time for password reset tokens (e.g., 1 hour = 3600 seconds)
    PASSWORD_RESET_TOKEN_EXPIRATION = 3600
    # Expiry time for email verification tokens (e.g., 24 hours = 86400 seconds)
    EMAIL_VERIFICATION_TOKEN_EXPIRATION = 86400

    # Upload folder for profile pictures
    UPLOAD_FOLDER = os.path.join(BASEDIR, 'static', 'profile_pics')
    BENEFICIARIES_PICS = os.path.join(BASEDIR, 'static', 'beneficiaries_pics')
    
    JWT_SECRET_KEY = 'thisisyetanothersecretkeyforjwttokenshitthatireallydontlike'  # Use environment variable in production
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CACHE_TYPE = 'SimpleCache'  # For development
    # CACHE_TYPE = 'RedisCache'  # For production (requires Redis)
    # CACHE_REDIS_HOST = 'localhost'
    # CACHE_REDIS_PORT = 6379
    # CACHE_REDIS_DB = 0
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_THRESHOLD = 500
    CACHE_IGNORE_ERRORS = True  # Don't crash if cache fails