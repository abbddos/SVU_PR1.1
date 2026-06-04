from flask import Blueprint, request, Response, jsonify, url_for, current_app, redirect 
import requests
from config import Config 
from models.BeneficiariesModel import Beneficiary
from database import db
import os
from werkzeug.utils import secure_filename
import uuid
from PIL import Image
import datetime 
from flask_jwt_extended import jwt_required
from extensions import cache 

beneficiary_bp = Blueprint("beneficiary_bp", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = Config.BENEFICIARIES_PICS
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
TARGET_PROFILE_PIC_SIZE = (200, 200)

def allowed_file(filename):
    """Checks if a file's extension is allowed."""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
        
        
def process_profile_picture(filepath):
    """
    Resizes an image saved at filepath to TARGET_PROFILE_PIC_SIZE.
    Saves the resized image, overwriting the original.
    Returns the original filepath (as the file is processed in place).
    """
    try:
        img = Image.open(filepath)
        img.thumbnail(TARGET_PROFILE_PIC_SIZE, Image.Resampling.LANCZOS) 
        img.save(filepath) 
        return filepath
    except Exception as e:
        current_app.logger.error(f"Error processing image {filepath}: {e}")
        return filepath # Return original path, indicating processing failed.
    
    
    
@beneficiary_bp.route('/', methods = ['POST'], endpoint = 'create_beneficiary_endpoint')
@jwt_required()
def create_beneficiary():
    data = {}
    data = request.form.to_dict()
        
    if 'date_of_birth' in data and data['date_of_birth']:
        try:
            data['date_of_birth'] = datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    beneficiary_pic_path = None 
    if 'beneficiary_pic' in request.files and request.files['beneficiary_pic'] !=  '':
        file = request.files['beneficiary_pic']
        if file and allowed_file(file.filename):
            filename_orig = secure_filename(file.filename)
            unique_filename = str(uuid.uuid4()) + '_' + filename_orig
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            try:
                file.save(file_path)
                processed_file_path = process_profile_picture(file_path)
                beneficiary_pic_path = f"/static/beneficiaries_pics/{os.path.basename(processed_file_path)}"
                data['beneficiary_pic'] = beneficiary_pic_path
            except Exception as e:
                current_app.logger.error(f"Error during profile picture save/process for create_user: {e}")
                return jsonify({"error": "Failed to save or process profile picture"}), 500
            
        else:
            return jsonify({"error": "Invalid file type for profile picture"}), 400
        
    elif 'beneficiary_pic' in data: # Allows setting by URL directly or clearing it
        beneficiary_pic_path = data['beneficiary_pic']
        
    try:
        new_beneficiary = Beneficiary(**data)
        
        db.session.add(new_beneficiary)
        db.session.commit()
        cache.clear()
        
        return jsonify({**new_beneficiary.serialize()}), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during profile picture save/process for create_user: {e}")
        return jsonify({"error": str(e)})
    

@beneficiary_bp.route('/search', methods = ['POST'], endpoint = 'search_beneficiary_endpoint')
@jwt_required()
def search_beneficiary():
    data = request.get_json() or {}

    if data.get('id'):
        result = Beneficiary.query.get(data['id'])
        if result:
            return jsonify({"matches": result.serialize()})
        return jsonify({"matches": [], "count": 0, "message": "No matches found"})
    
    
    if data.get('national_identifier_number'):
        result = Beneficiary.query.filter_by(national_identifier_number=data['national_identifier_number']).first()
        if result:
            return jsonify({"matches": result.serialize()})
        return jsonify({"matches": [], "count": 0, "message": "No matches found"})
    
    if data.get('contact_number'):
        result = Beneficiary.query.filter_by(contact_number = data['contact_number']).first()
        if result:
            return jsonify({"matches": result.serialize()})
        return jsonify({"matches": [], "count": 0, "message": "No matches found"})
    
    query = Beneficiary.query 
    conditions = []
    fields = ['first_name', 'middle_name', 'last_name', 'date_of_birth']

    for field in fields:
        value = data.get(field)
        if value:
            if field == 'date_of_birth':
                try:
                    dob = datetime.datetime.strptime(value, '%Y-%m-%d').date()
                    conditions.append(Beneficiary.date_of_birth == dob)
                except:
                    pass 
            else:
                conditions.append(getattr(Beneficiary, field).like(f"%{value}%"))
    
    if not conditions:
        return jsonify({"error": "Need search criteria"}), 400
    
    results = query.filter(db.and_(*conditions)).limit(50).all()
    if results:
        return jsonify({
            "matches": [r.serialize() for r in results],
            "count": len(results)
        })
    
    return jsonify({"message": "No matches found"}), 404
    
    
@beneficiary_bp.route('/all', methods = ['GET'], endpoint = 'get_all_beneficiaries_endpoint')
@cache.cached(timeout = 300, query_string = True)
@jwt_required()
def get_all_users():
    page = request.args.get('page', 1, type = int)
    per_page = request.args.get('per_page', 20, type = int)
    
    beneficiaries = Beneficiary.query.paginate(
        page = page, 
        per_page = per_page,
        error_out = False
    )
    
    return jsonify({
            'beneficiaries': [ben.serialize() for ben in beneficiaries.items],
            'total': beneficiaries.total,
            'pages': beneficiaries.pages,
            'current_page': page
        }), 200
    
    

@beneficiary_bp.route('/<int:ben_id>', methods = ['GET'], endpoint = 'get_beneficiary_by_id_endpoint')
@jwt_required()
def get_ben_by_id(ben_id):
    ben = Beneficiary.query.get(ben_id)
    if not ben:
        return jsonify({"error":"record not found"}), 404
    
    return jsonify(ben.serialize()), 200


@beneficiary_bp.route('/<int:ben_id>', methods = ['PUT'], endpoint = 'update_beneficiary_endpoint')
@jwt_required()
def update_ben(ben_id):
    ben = Beneficiary.query.get(ben_id)
    if not ben:
        return jsonify({"error": "Beneficiary not found"}), 404
    
    data = request.form 
        
    if not data and not request.files:
        return jsonify({"error": "No data or files provided for update"}), 400
    
    try:
        if 'first_name' in data:
            ben.first_name = data.get('first_name')
        if 'middle_name' in data:
            ben.middle_name = data.get('middle_name')
        if 'mother_first_name' in data:
            ben.mother_first_name = data.get('mother_first_name')
        if 'last_name' in data:
            ben.last_name = data.get('last_name')
        if 'date_of_birth' in data and data.get('date_of_birth'):
            ben.date_of_birth = datetime.datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
        if 'place_of_birth' in data:
            ben.place_of_birth = data.get('place_of_birth')
        if 'sex' in data:
            ben.sex = data.get('sex')
        if 'contact_number' in data:
            ben.contact_number = data.get('contact_number')
        if 'current_address' in data:
            ben.current_address = data.get('current_address')
        if 'displacement_status' in data:
            ben.displacement_status = data.get('displacement_status')
        if 'national_identifier' in data:
            ben.national_identifier = data.get('national_identifier')
        if 'national_identifier_number' in data:
            ben.national_identifier_number = data.get('national_identifier_number')
        if 'other_national_identifier' in data:  # ✅ FIXED: removed underscore
            ben.other_national_identifier = data.get('other_national_identifier')
        
        # ✅ FIXED: Convert integers
        if 'household_size' in data and data.get('household_size'):
            ben.household_size = int(data.get('household_size'))
        if 'disability_in_household' in data:
            ben.disability_in_household = data.get('disability_in_household')
        if 'disability_type' in data:
            ben.disability_type = data.get('disability_type')
        if 'elders_in_household' in data:
            ben.elders_in_household = data.get('elders_in_household')
        if 'number_of_elders' in data and data.get('number_of_elders'):
            ben.number_of_elders = int(data.get('number_of_elders'), 0)
        if 'infants_in_household' in data:
            ben.infants_in_household = data.get('infants_in_household')
        if 'number_of_infants' in data and data.get('number_of_infants'):
            ben.number_of_infants = int(data.get('number_of_infants'), 0)
        if 'occupation' in data:
            ben.occupation = data.get('occupation')
        if 'education' in data:
            ben.education = data.get('education')
        if 'last_updated_by' in data:  # ✅ FIXED: uncommented and fixed field name
            ben.last_updated_by = data.get('last_updated_by')

        # ✅ FIXED: Profile picture handling
        if 'beneficiary_pic' in request.files and request.files['beneficiary_pic'].filename != '':
            file = request.files['beneficiary_pic']  # ✅ FIXED: was 'profile_pic'
            if file and allowed_file(file.filename):
                filename_orig = secure_filename(file.filename)
                unique_filename = str(uuid.uuid4()) + '_' + filename_orig
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                try:
                    # Delete old profile picture if it exists
                    if ben.beneficiary_pic:
                        old_file_path = os.path.join(current_app.root_path, ben.beneficiary_pic.lstrip('/'))
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)

                    file.save(file_path)
                    processed_file_path = process_profile_picture(file_path)
                    ben.beneficiary_pic = f"/static/beneficiaries_pics/{os.path.basename(processed_file_path)}"  # ✅ FIXED: path
                except Exception as e:
                    current_app.logger.error(f"Error during profile picture save/process: {e}")
                    return jsonify({"error": "Failed to save or process profile picture"}), 500
            else:
                return jsonify({"error": "Invalid file type for profile picture"}), 400
        elif 'beneficiary_pic' in data:
            ben.beneficiary_pic = data.get('beneficiary_pic')  # ✅ FIXED: was ben.profile_pic

        ben.last_update = datetime.datetime.now()
            
        db.session.commit()
        cache.clear()
        return jsonify(ben.serialize()), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": f"Invalid value: {str(e)}"}), 400
    except TypeError as e:
        db.session.rollback()
        return jsonify({"error": f"Invalid type: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating beneficiary {ben_id}: {e}")
        return jsonify({"error": "Failed to update beneficiary"}), 500
    
    
@beneficiary_bp.route('/<int:ben_id>', methods = ['DELETE'], endpoint = 'delete_beneficiary_endpoint')
@jwt_required()
def delete_ben(ben_id):
    ben = Beneficiary.query.get(ben_id)
    if not ben:
        return jsonify({"error": "Beneficiary not found"}), 404
    
    try:
        if ben.beneficiary_pic and \
            os.path.exists(os.path.join(current_app.root_path, ben.beneficiary_pic.lstrip('/'))):
            os.remove(os.path.join(current_app.root_path, ben.beneficiary_pic.lstrip('/')))
            
        db.session.delete(ben)
        db.session.commit()
        cache.clear()
        return jsonify({"message": f"Beneficiary {ben_id} deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting beneficiary {ben_id}: {e}")
        return jsonify({"error": "Failed to delete beneficiary", "details": str(e)}), 500
    


