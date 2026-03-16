# backend/routes/activity_routes.py
from flask import Blueprint, request, jsonify
from routes.auth_routes import require_auth
from services.carbon_calculator import calc_activity_emission
from firebase.firebase_admin import get_db
from google.cloud.firestore import SERVER_TIMESTAMP

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/log', methods=['POST'])
@require_auth
def log_activity():
    data = request.get_json()
    required = ['type', 'quantity']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing fields'}), 400

    emission = calc_activity_emission(data['type'], float(data['quantity']))
    doc = {
        'uid': request.uid,
        'type': data['type'],
        'quantity': data['quantity'],
        'unit': data.get('unit', ''),
        'emission': emission,
        'note': data.get('note', ''),
        'createdAt': SERVER_TIMESTAMP
    }

    db = get_db()
    ref = db.collection('activities').add(doc)
    return jsonify({'id': ref[1].id, 'emission': emission}), 201

@activity_bp.route('/list', methods=['GET'])
@require_auth
def list_activities():
    db = get_db()
    docs = db.collection('activities').where('uid', '==', request.uid).order_by('createdAt', direction='DESCENDING').limit(30).stream()
    activities = [{'id': d.id, **d.to_dict()} for d in docs]
    return jsonify({'activities': activities}), 200

@activity_bp.route('/summary', methods=['GET'])
@require_auth
def activity_summary():
    db = get_db()
    docs = db.collection('activities').where('uid', '==', request.uid).stream()
    total = sum(d.to_dict().get('emission', 0) for d in docs)
    return jsonify({'totalEmission': round(total, 2)}), 200