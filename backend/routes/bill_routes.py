# backend/routes/bill_routes.py

import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from services.carbon_calculator import calc_electricity_emission
from firebase.firebase_admin import get_db
from google.cloud.firestore import SERVER_TIMESTAMP
from config import Config

bill_bp = Blueprint('bill', __name__)


# -------------------------------
# Check allowed file types
# -------------------------------
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


# ===============================
# Upload Electricity Bill
# ===============================
@bill_bp.route('/upload', methods=['POST'])
def upload_bill():

    print("\n=== BILL UPLOAD DEBUG ===")
    print("Content-Type:", request.content_type)
    print("Files keys:", list(request.files.keys()))
    print("Upload folder:", Config.UPLOAD_FOLDER)
    print("=========================\n")

    if 'bill' not in request.files:
        return jsonify({
            "error": "No file provided. Use form-data key 'bill'"
        }), 400

    file = request.files['bill']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Allowed: {Config.ALLOWED_EXTENSIONS}"
        }), 400

    # -------------------------------
    # Ensure upload folder exists
    # -------------------------------
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Secure filename
    filename = secure_filename(file.filename)

    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)

    print("Saving file to:", filepath)

    try:
        file.save(filepath)
        print("File saved successfully")
    except Exception as e:
        print("File save error:", str(e))
        return jsonify({"error": "Failed to save uploaded file"}), 500

    # ===============================
    # OCR BILL SCAN
    # ===============================
    units = None
    ocr_error = None

    try:
        from services.ocr_service import extract_units_from_bill
        units = extract_units_from_bill(filepath)

        print("Detected units:", units)

    except RuntimeError as e:
        ocr_error = str(e)

    except ValueError as e:
        ocr_error = str(e)

    except Exception as e:
        ocr_error = f"OCR failed: {str(e)}"

    # If OCR failed
    if units is None:

        print("OCR ERROR:", ocr_error)

        try:
            os.remove(filepath)
            print("Removed failed upload file")
        except:
            pass

        return jsonify({
            "error": ocr_error or "Could not detect electricity units",
            "hint": "Use manual entry option"
        }), 422

    # ===============================
    # CARBON CALCULATION
    # ===============================
    emission = calc_electricity_emission(units)

    result = {
        "units": units,
        "emission": emission,
        "month": "Current Month",
        "factor": Config.ELECTRICITY_FACTOR,
        "filename": filename
    }

    # ===============================
    # SAVE TO FIREBASE
    # ===============================
    try:
        db = get_db()

        db.collection("electricity_bills").add({
            **result,
            "createdAt": SERVER_TIMESTAMP
        })

        print("Saved to Firebase")

    except Exception as e:
        print("Firebase save error:", str(e))

    return jsonify(result), 200


# ===============================
# BILL HISTORY
# ===============================
@bill_bp.route('/history', methods=['GET'])
def bill_history():

    db = get_db()

    docs = (
        db.collection("electricity_bills")
        .order_by("createdAt", direction="DESCENDING")
        .limit(12)
        .stream()
    )

    bills = [{"id": doc.id, **doc.to_dict()} for doc in docs]

    return jsonify({"bills": bills}), 200


# ===============================
# DELETE BILL
# ===============================
@bill_bp.route('/<bill_id>', methods=['DELETE'])
def delete_bill(bill_id):

    db = get_db()

    ref = db.collection("electricity_bills").document(bill_id)

    doc = ref.get()

    if not doc.exists:
        return jsonify({"error": "Bill not found"}), 404

    ref.delete()

    return jsonify({"success": True}), 200