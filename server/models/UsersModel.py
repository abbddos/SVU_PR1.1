from database import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime 
from itsdangerous import URLSafeTimedSerializer as Serializer, SignatureExpired, BadTimeSignature 
from flask import current_app 

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(80), unique = True, nullable = False)
    password_hash = db.Column(db.String(128), nullable = False)
    
    first_name = db.Column(db.String(80), nullable = True)
    last_name = db.Column(db.String(80), nullable = True)
    job_title = db.Column(db.String(80), nullable = True)
    role = db.Column(db.String(50), default = 'user')
    profile_pic = db.Column(db.String(255), nullable=True)
    isActive = db.Column(db.Boolean, default = True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    last_update = db.Column(db.DateTime, default=datetime.datetime.now)
    last_login = db.Column(db.DateTime, nullable = True)
    updated_by = db.Column(db.String(80), nullable = True)
    
    
    def __init__(self, email, password, first_name = None, last_name = None, role = 'user', profile_pic = None, updated_by = None, last_update = None):
        self.email = email 
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
        self.profile_pic = profile_pic
        self.updated_by = updated_by
        self.last_update = last_update
    
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password) 
    
    def get_reset_token(self, expires_sec = 1800):
        s = Serializer(current_app.config['SECRET_KEY'], expires_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8')
    
    @staticmethod
    def verify_reset_token(token):
        """
        Verifies a password reset token.
        Returns the User object if the token is valid and not expired, otherwise None.
        """
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token)['user_id']
        except (SignatureExpired, BadTimeSignature):
            # Token is expired or invalid
            return None
        except Exception:
            # Catch any other unexpected errors during token loading
            return None
        return User.query.get(user_id)
    
    
    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'job_title': self.job_title,
            'role': self.role,
            'profile_pic': self.profile_pic,
            'isActive': self.isActive,
            'created_at': self.created_at,
            'last_update': self.last_update,
            'updated_by':self.updated_by,
            'last_login': self.last_login,
        }
        
        
    def __repr__(self):
        return f'<User {self.id}, {self.email}>'