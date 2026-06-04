from flask import Flask, jsonify
from flask_cors import CORS
from extensions import cache, jwt
from database import db, init_db
from config import Config

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)
    
    # Initialize extensions with app
    cache.init_app(app)
    CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})
    init_db(app)
    jwt.init_app(app)
    
    # Register blueprints
    from controllers.users import users_bp
    from controllers.beneficiaries import beneficiary_bp
    from controllers.services import service_bp
    from controllers.actions import actions_bp
    
    app.register_blueprint(users_bp, url_prefix="/api/v1/users")
    app.register_blueprint(beneficiary_bp, url_prefix="/api/v1/beneficiaries")
    app.register_blueprint(service_bp, url_prefix = "/api/v1/services")
    app.register_blueprint(actions_bp, url_prefix = "/api/v1/actions")
    
    @app.route('/')
    def home():
        return jsonify({"message": "User Service is running!", "status": "OK"})
    
    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)