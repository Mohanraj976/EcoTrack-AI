# backend/services/barcode_service.py
import requests

# Sample product emissions database (in production, use a real API or CSV)
PRODUCT_DB = {
    '5449000000996': {'name': 'Coca-Cola 500ml',       'emission': 0.35, 'category': 'Beverage',  'eco': 'Water in reusable bottle (0.01 kg CO₂)'},
    '5000159407236': {'name': 'Plastic Water Bottle',   'emission': 0.45, 'category': 'Beverage',  'eco': 'Steel reusable bottle (0.05 kg CO₂/use)'},
    '7622210449283': {'name': 'Oreo Cookies 154g',      'emission': 0.62, 'category': 'Snack',     'eco': 'Homemade oat cookies'},
    '8901725163003': {'name': 'Maggi Noodles 70g',      'emission': 0.31, 'category': 'Food',      'eco': 'Home-cooked rice and lentils (0.12 kg CO₂)'},
    '4006381333931': {'name': 'Faber-Castell Pen',      'emission': 0.08, 'category': 'Stationery','eco': 'Refillable pen'},
}

def get_product_info(barcode: str) -> dict | None:
    """
    Look up product carbon footprint by barcode.
    First checks local DB, then tries Open Food Facts API.
    """
    if barcode in PRODUCT_DB:
        return PRODUCT_DB[barcode]

    try:
        url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
        res = requests.get(url, timeout=5)
        data = res.json()
        if data.get('status') == 1:
            product = data['product']
            name = product.get('product_name', 'Unknown Product')
            # Estimate emission from ecoscore or default
            score = product.get('ecoscore_score', None)
            emission = round((100 - score) / 60, 2) if score else round(0.5, 2)
            return {
                'name': name,
                'emission': emission,
                'category': product.get('categories_tags', ['unknown'])[0].replace('en:', '').title(),
                'eco': 'Choose products with A/B ecoscore rating'
            }
    except Exception:
        pass

    return None