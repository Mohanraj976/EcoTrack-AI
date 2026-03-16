# backend/routes/product_routes.py
from flask import Blueprint, jsonify, request
from routes.auth_routes import require_auth
from services.barcode_service import get_product_info
from firebase.firebase_admin import get_db
from google.cloud.firestore import SERVER_TIMESTAMP

product_bp = Blueprint('product', __name__)

@product_bp.route('/scan/<barcode>', methods=['GET'])
@require_auth
def scan_product(barcode):
    product = get_product_info(barcode)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    # Save scan history
    db = get_db()
    db.collection('products').add({'uid': request.uid, 'barcode': barcode, **product, 'createdAt': SERVER_TIMESTAMP})
    return jsonify(product), 200

@product_bp.route('/history', methods=['GET'])
@require_auth
def product_history():
    db = get_db()
    docs = db.collection('products').where('uid', '==', request.uid).order_by('createdAt', direction='DESCENDING').limit(20).stream()
    return jsonify({'products': [{'id': d.id, **d.to_dict()} for d in docs]}), 200