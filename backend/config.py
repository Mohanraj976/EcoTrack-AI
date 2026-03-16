# backend/config.py

import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:

    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    FIREBASE_CREDENTIALS = os.getenv(
        'FIREBASE_CREDENTIALS',
        os.path.join(BASE_DIR, 'firebase', 'serviceAccountKey.json')
    )

    # Upload folder (absolute path)
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'bills')

    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB

    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

    # Electricity emission factor
    ELECTRICITY_FACTOR = 0.82   # kg CO₂ per kWh

    TREES_ABSORPTION = 21  # kg CO₂ per tree per year

    EMISSION_FACTORS = {
        'car_petrol': 0.21,
        'car_diesel': 0.18,
        'motorbike': 0.11,
        'bus': 0.089,
        'train': 0.041,
        'electricity': 0.82,
        'flight_domestic': 0.255,
        'flight_international': 0.195
    }