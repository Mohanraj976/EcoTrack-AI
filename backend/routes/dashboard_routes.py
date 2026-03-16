# backend/routes/dashboard_routes.py
from flask import Blueprint, jsonify
from routes.auth_routes import require_auth
from firebase.firebase_admin import get_db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@require_auth
def get_summary():
    db = get_db()
    uid = request.uid

    # Activities
    acts = list(db.collection('activities').where('uid', '==', uid).stream())
    total_emission = sum(a.to_dict().get('emission', 0) for a in acts)

    # Bills
    bills = list(db.collection('electricity_bills').where('uid', '==', uid).stream())
    total_bill_emission = sum(b.to_dict().get('emission', 0) for b in bills)

    # Habits
    habits = list(db.collection('green_habits').where('uid', '==', uid).stream())
    total_saved = sum(h.to_dict().get('saving', 0) for h in habits)

    # User
    user_doc = db.collection('users').document(uid).get()
    user_data = user_doc.to_dict() if user_doc.exists else {}

    return jsonify({
        'totalEmission': round(total_emission, 2),
        'billEmission': round(total_bill_emission, 2),
        'totalSaved': round(total_saved, 2),
        'ecoPoints': user_data.get('ecoPoints', 0),
        'treesPlanted': user_data.get('treesPlanted', 0),
        'activityCount': len(acts),
        'habitCount': len(habits),
    }), 200

@dashboard_bp.route('/leaderboard', methods=['GET'])
def leaderboard():
    db = get_db()
    docs = db.collection('users').order_by('ecoPoints', direction='DESCENDING').limit(10).stream()
    board = [{'uid': d.id, 'displayName': d.to_dict().get('displayName', 'Anonymous'), 'ecoPoints': d.to_dict().get('ecoPoints', 0)} for d in docs]
    return jsonify({'leaderboard': board}), 200