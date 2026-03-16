# backend/firebase/firebase_admin.py
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

_db = None

def init_firebase():
    global _db
    cred_path = os.getenv('FIREBASE_CREDENTIALS', 'firebase/serviceAccountKey.json')
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    _db = firestore.client()
    return _db

def get_db():
    if _db is None:
        return init_firebase()
    return _db

def verify_token(id_token: str):
    """Verify Firebase ID token and return decoded claims."""
    return auth.verify_id_token(id_token)