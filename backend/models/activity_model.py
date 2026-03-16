# backend/models/activity_model.py
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class ActivityModel:
    uid: str
    type: str
    quantity: float
    unit: str
    emission: float
    note: str = ''
    label: str = ''
    createdAt: str = ''

    def to_dict(self):
        d = asdict(self)
        if not d['createdAt']:
            d['createdAt'] = datetime.utcnow().isoformat()
        return d