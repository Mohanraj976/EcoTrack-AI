# backend/services/ocr_service.py

import re
import cv2
import pytesseract
from PIL import Image
import numpy as np

# Set tesseract path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def preprocess_image(image_path):
    """
    Improve image quality for OCR
    """

    img = cv2.imread(image_path)

    if img is None:
        raise RuntimeError("Could not read image")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # noise removal
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # threshold
    thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    return thresh


def extract_units_from_bill(filepath):
    """
    Extract electricity units from bill using OCR
    """

    image = preprocess_image(filepath)

    text = pytesseract.image_to_string(image)

    print("\n===== OCR TEXT =====")
    print(text)
    print("====================\n")

    # Common patterns for electricity units
    patterns = [
        r'(\d{2,5})\s?kwh',
        r'(\d{2,5})\s?units',
        r'units\s*[:\-]?\s*(\d{2,5})',
        r'consumption\s*[:\-]?\s*(\d{2,5})'
    ]

    text_lower = text.lower()

    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            units = float(match.group(1))
            return units

    # fallback: find largest number in bill
    numbers = re.findall(r'\d{2,5}', text)

    if numbers:
        units = max([int(n) for n in numbers])
        return float(units)

    return None