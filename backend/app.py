# backend/app.py

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from firebase.firebase_admin import init_firebase
from routes.auth_routes import auth_bp
from routes.bill_routes import bill_bp
from routes.activity_routes import activity_bp
from routes.dashboard_routes import dashboard_bp
from routes.habit_routes import habit_bp
from routes.product_routes import product_bp

app = Flask(__name__)

# CORS configuration
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": os.getenv("FRONTEND_URL", "http://localhost:5173")
        }
    }
)

# Initialize Firebase
init_firebase()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(bill_bp, url_prefix="/api/bill")
app.register_blueprint(activity_bp, url_prefix="/api/activity")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(habit_bp, url_prefix="/api/habit")
app.register_blueprint(product_bp, url_prefix="/api/product")

# Health check API
@app.route("/api/health")
def health():
    return {"status": "ok", "message": "EcoTrack API running"}, 200


# TEST ROUTE (for debugging)
@app.route("/test")
def test():
    return {"message": "server working"}, 200


if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
        port=5000
    )