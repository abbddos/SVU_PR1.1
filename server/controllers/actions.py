from flask import Blueprint, request, Response, jsonify, url_for, current_app, redirect 
import requests
from config import Config 
from models.ActionsModel import Action
from database import db
import datetime 
from flask_jwt_extended import jwt_required
from extensions import cache
import pandas as pd
import sqlite3
import warnings

warnings.filterwarnings('ignore')

actions_bp = Blueprint("actions_bp", __name__)


def actions_report():
    conn = sqlite3.connect('braves.db')
    df = pd.read_sql_query("""SELECT 
    actions.*,
    beneficiaries.*,
    services.*
    FROM actions
    INNER JOIN beneficiaries ON actions.beneficiary_id = beneficiaries.id
    INNER JOIN services ON actions.service_id = services.id;""", conn)
    conn.close()
    
    # FIX: Clean negative values before pivoting
    df['number_of_elders'] = df['number_of_elders'].apply(lambda x: max(x, 0))
    df['number_of_infants'] = df['number_of_infants'].apply(lambda x: max(x, 0))
    df['household_size'] = df['household_size'].apply(lambda x: max(x, 1))  # Household size should be at least 1

    result = pd.pivot_table(
    df,
    index=['service_type', 'start_date', 'governorate', 'district', 'sub_district', 'village_neighborhood'],
    values=['beneficiary_id', 'sex', 'household_size', 'number_of_elders', 'number_of_infants', 'disability_type', 'displacement_status'],
    aggfunc={
        'beneficiary_id': 'count',  # Total actions/beneficiaries served
        'sex': lambda x: {
            'Males': (x == 'Male').sum(),
            'Females': (x == 'Female').sum()
        },
        'household_size': 'sum',  # Total household size
        'number_of_elders': 'sum',  # Total elderly
        'number_of_infants': 'sum',  # Total infants
        'disability_type': lambda x: dict(x.value_counts()), # Count of each disability type
        'displacement_status': lambda x: dict(x.value_counts())
    }
    ).reset_index()

    # Flatten the nested dictionaries
    result['Males'] = result['sex'].apply(lambda x: x.get('Males', 0) if isinstance(x, dict) else 0)
    result['Females'] = result['sex'].apply(lambda x: x.get('Females', 0) if isinstance(x, dict) else 0)
    result['Total_Beneficiaries'] = result['beneficiary_id']
    result['Total_Household_Size'] = result['household_size']
    result['Total_Elderly'] = result['number_of_elders']
    result['Total_Infants'] = result['number_of_infants']

    # Create disability type columns
    disability_counts = df['disability_type'].value_counts().index.tolist()
    for disability in disability_counts:
        result[f'Disability_{disability}'] = result['disability_type'].apply(
            lambda x: x.get(disability, 0) if isinstance(x, dict) else 0
        )

    displacement_counts = df['displacement_status'].value_counts().index.tolist()
    for displacement in displacement_counts:
        result[f'Displacement_{displacement}'] = result['displacement_status'].apply(
            lambda x: x.get(displacement, 0) if isinstance(x, dict) else 0
        )

    # Select and reorder columns
    final_columns = [
        'service_type', 'start_date', 'governorate', 'district', 
        'sub_district', 'village_neighborhood', 'Total_Beneficiaries',
        'Males', 'Females', 'Total_Household_Size', 'Total_Elderly', 
        'Total_Infants'
    ] + [f'Disability_{d}' for d in disability_counts] + [f'Displacement_{s}' for s in displacement_counts]

    final_df = result[final_columns]

    # Sort by date and service
    final_df = final_df.sort_values(['start_date', 'service_type'])
    
    #json_data = final_df.to_json(orient='records', date_format='iso', indent=2)
    data_dict = final_df.to_dict(orient='records')

    return data_dict



def beneficiary_history(ben_id):
    conn = sqlite3.connect('braves.db')
    df = pd.read_sql_query("""
        SELECT
            actions.id as action_id,
            actions.action_date as delivery_date, 
            actions.recorded_by, 
            actions.created_at as action_created_at,
            beneficiaries.id as beneficiary_id, 
            services.id as service_id,
            services.service_type,
            services.service_description,
            services.governorate,
            services.district,
            services.sub_district,
            services.village_neighborhood,
            services.start_date,
            services.end_date,
            services.created_at as service_created_at,
            services.last_update as service_last_update,
            services.updated_by
        FROM actions 
        INNER JOIN beneficiaries ON actions.beneficiary_id = beneficiaries.id
        INNER JOIN services ON actions.service_id = services.id 
        WHERE beneficiaries.id = ? 
        ORDER BY actions.action_date DESC;
        
                           """, conn, params = (ben_id,))
    
    conn.close()

    return df.to_dict('records')
    

@actions_bp.route("/", methods = ['POST'], endpoint = 'create_action_endpoint')
@jwt_required()
def create_action():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    beneficiary_id = data.get('beneficiary_id')
    service_id = data.get('service_id')
    
    if not beneficiary_id or not service_id:
        return jsonify({"error": "beneficiary_id and service_id are required"}), 400

    existing_action = Action.query.filter_by(
        beneficiary_id=beneficiary_id,
        service_id=service_id
    ).first()
    
    if existing_action:
        return jsonify({
            "error": f"This beneficiary has already received this service",
            "existing_action": existing_action.serialize()
        }), 409  # 409 Conflict status code
    
    try:
        data['action_date'] = datetime.datetime.strptime(data.get('action_date'), '%Y-%m-%d')
        new_action = Action(**data)
        db.session.add(new_action)
        db.session.commit()
        cache.clear()
        return jsonify(new_action.serialize()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during profile picture save/process for create_user: {e}")
        return jsonify({"error": str(e)})
    

@actions_bp.route("/undo/<int:action_id>", methods = ['DELETE'], endpoint = 'delete_action_endpoint')
@jwt_required() 
def delete_action(action_id):
    action = Action.query.get(action_id)
    if not action:
        return jsonify({"error":"Action not found"}),404
    
    try:
        db.session.delete(action)
        db.session.commit()
        cache.clear()
        return jsonify({"message":"Action deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting action {action_id}: {e}")
        return jsonify({"error": "Failed to delete action", "details": str(e)}), 500

    

@actions_bp.route('/report', methods = ['GET'], endpoint = 'get_report_endpoint')
@jwt_required()
def get_report():
    report = actions_report()
    return jsonify(report), 200


@actions_bp.route('/history/<int:ben_id>', methods = ['GET'], endpoint = 'get_beneficiary_history_endpoint')
@jwt_required() 
def get_beneficiary_history(ben_id):
    try:
        history = beneficiary_history(ben_id)
        return jsonify(history), 200
    except Exception as e:
        current_app.logger.error(f"Error while finding beneficiary: {ben_id} history")
        return jsonify({"error":"Failed to find beneficiary history", "details": str(e)}), 500
    
    
