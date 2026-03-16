# backend/models/user_model.py
from dataclasses import dataclass, field, asdict
from datetime import datetime

@dataclass
class UserModel:
    uid: str
    email: str
    displayName: str = ''
    photoURL: str = ''
    ecoPoints: int = 0
    totalEmission: float = 0.0
    treesPlanted: int = 0
    createdAt: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return asdict(self)