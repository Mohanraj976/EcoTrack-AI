# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from firebase.firebase_admin import get_db, verify_token
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing token'}), 401
        token = auth_header.split('Bearer ')[1]
        try:
            decoded = verify_token(token)
            request.uid = decoded['uid']
            request.email = decoded.get('email', '')
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'detail': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    db = get_db()
    doc = db.collection('users').document(request.uid).get()
    if doc.exists:
        return jsonify({'user': doc.to_dict()}), 200
    return jsonify({'error': 'User not found'}), 404

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    data = request.get_json()
    allowed = {'displayName', 'photoURL'}
    update = {k: v for k, v in data.items() if k in allowed}
    db = get_db()
    db.collection('users').document(request.uid).update(update)
    return jsonify({'success': True}), 200