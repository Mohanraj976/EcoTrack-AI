# backend/routes/habit_routes.py
from flask import Blueprint, request, jsonify
from routes.auth_routes import require_auth
from firebase.firebase_admin import get_db
from google.cloud.firestore import SERVER_TIMESTAMP, Increment

habit_bp = Blueprint('habit', __name__)

HABIT_SAVINGS = {
    'public_transport': {'saving': 2.0, 'points': 20, 'label': 'Used Public Transport'},
    'reusable_bottle':  {'saving': 0.5, 'points': 5,  'label': 'Used Reusable Bottle'},
    'plant_tree':       {'saving': 10.0,'points': 100, 'label': 'Planted a Tree'},
    'vegetarian_meal':  {'saving': 1.5, 'points': 15, 'label': 'Vegetarian Meal'},
    'led_bulbs':        {'saving': 0.3, 'points': 3,  'label': 'Used LED Bulbs'},
    'bike_instead_car': {'saving': 3.0, 'points': 30, 'label': 'Cycled Instead of Driving'},
    'recycled_waste':   {'saving': 0.8, 'points': 8,  'label': 'Recycled Waste'},
    'no_car_day':       {'saving': 4.0, 'points': 40, 'label': 'Car-Free Day'},
}

@habit_bp.route('/log', methods=['POST'])
@require_auth
def log_habit():
    data = request.get_json()
    key = data.get('key')
    if key not in HABIT_SAVINGS:
        return jsonify({'error': 'Invalid habit key'}), 400

    habit = HABIT_SAVINGS[key]
    db = get_db()
    db.collection('green_habits').add({
        'uid': request.uid, 'key': key, **habit, 'createdAt': SERVER_TIMESTAMP
    })
    # Update user eco points
    db.collection('users').document(request.uid).update({'ecoPoints': Increment(habit['points'])})
    return jsonify({'success': True, **habit}), 201

@habit_bp.route('/list', methods=['GET'])
@require_auth
def list_habits():
    db = get_db()
    docs = db.collection('green_habits').where('uid', '==', request.uid).order_by('createdAt', direction='DESCENDING').limit(30).stream()
    return jsonify({'habits': [{'id': d.id, **d.to_dict()} for d in docs]}), 200