# backend/models/product_model.py
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class ProductModel:
    uid: str
    barcode: str
    name: str
    emission: float
    category: str
    eco: str = ''
    createdAt: str = ''

    def to_dict(self):
        d = asdict(self)
        if not d['createdAt']:
            d['createdAt'] = datetime.utcnow().isoformat()
        return d