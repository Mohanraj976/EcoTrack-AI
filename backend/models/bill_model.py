# backend/models/bill_model.py
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class BillModel:
    uid: str
    units: float
    emission: float
    month: str
    source: str = 'ocr'
    filename: str = ''
    createdAt: str = ''

    def to_dict(self):
        d = asdict(self)
        if not d['createdAt']:
            d['createdAt'] = datetime.utcnow().isoformat()
        return d