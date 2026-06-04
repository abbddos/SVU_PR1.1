from flask import Blueprint, request, Response, jsonify, url_for, current_app, redirect 
import requests
from config import Config 
from models.ServicesModel import Service
from models.ActionsModel import Action
from database import db
import datetime 
from flask_jwt_extended import jwt_required
from extensions import cache 

service_bp = Blueprint("service_bp", __name__)

@service_bp.route('/', methods = ['POST'], endpoint = 'create_service_endpoint')
@jwt_required()
def create_service():
    data = request.get_json(silent = True)
    if data is None:
        data = request.form
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    service_type = data.get('service_type')
    service_description = data.get('service_description')
    governorate = data.get('governorate')
    district = data.get('district')
    sub_district = data.get('sub_district')
    village_neighborhood = data.get('village_neighborhood')
    start_date = datetime.datetime.strptime(data.get('start_date'), '%Y-%m-%d')
    end_date = datetime.datetime.strptime(data.get('end_date'), '%Y-%m-%d')
    created_at= datetime.datetime.now()
    last_update = datetime.datetime.now()
    updated_by = data.get('updated_by')

    
    try:
        new_service = Service(
            service_type = service_type,
            service_description = service_description,
            governorate = governorate,
            district = district,
            sub_district = sub_district,
            village_neighborhood = village_neighborhood,
            start_date = start_date,
            end_date = end_date,
            created_at = created_at,
            last_update = last_update,
            updated_by = updated_by
        )    
        db.session.add(new_service)
        db.session.commit()
        cache.clear()
        
        return jsonify(new_service.serialize()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during profile picture save/process for create_user: {e}")
        return jsonify({"error": str(e)})
    
    
@service_bp.route('/all', methods = ['GET'], endpoint = 'get_all_services_endpoint')
@cache.cached(timeout = 300, query_string = True)
@jwt_required()
def get_all_services():
    page = request.args.get('page', 1, type = int)
    per_page = request.args.get('per_page', 20, type = int)
    
    services = Service.query.order_by(Service.created_at.desc()).paginate(
        page = page, 
        per_page = per_page,
        error_out = False
    )
    
    return jsonify({
            'services': [service.serialize() for service in services.items],
            'total': services.total,
            'pages': services.pages,
            'current_page': page
        }), 200
    
    

@service_bp.route('/<int:service_id>', methods = ['GET'], endpoint = 'get_service_by_id_endpoint')
@jwt_required() 
def get_service_by_id(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error":"record not found"}), 404
    
    return jsonify(service.serialize()), 200


@service_bp.route('/<int:service_id>', methods = ['PUT'], endpoint = 'update_service_endpoint')
@jwt_required()
def update_service(service_id):
    service = Service.query.get(service_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        service.service_type = data.get('service_type')
        service.service_description = data.get('service_description')
        service.governorate = data.get('governorate')
        service.district = data.get('district')
        service.sub_district = data.get('sub_district')
        service.village_neighborhood = data.get('village_neighborhood')
        service.start_date = datetime.datetime.strptime(data.get('start_date'), '%Y-%m-%d')
        service.end_date = datetime.datetime.strptime(data.get('end_date'), '%Y-%m-%d')
        service.last_update = datetime.datetime.now()
        service.updated_by = data.get('updated_by')


        
        db.session.commit()
        cache.clear()
        return jsonify(service.serialize()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating service {service_id}: {e}")
        return jsonify({"error": "Failed to update service", "details": str(e)}), 500
    
    
@service_bp.route('/<int:service_id>', methods = ['DELETE'], endpoint = 'delete_service_endpoint')
@jwt_required()
def delete_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error":"service not found"}), 404
    
    #Action.query.filter_by(service_id=service_id).delete()
    
    try:
        db.session.delete(service)
        db.session.commit()
        cache.clear()
        return jsonify({"message": f"Service {service_id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting service {service_id}: {e}")
        return jsonify({"error": "Failed to delete service", "details": str(e)}), 500
    
    