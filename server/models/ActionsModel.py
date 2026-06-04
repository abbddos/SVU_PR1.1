from database import db
import datetime

class Action(db.Model):
    __tablename__ = "actions"
    
    id = db.Column(db.Integer, primary_key = True)
    beneficiary_id = db.Column(db.Integer, db.ForeignKey('beneficiaries.id'), nullable = False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id', ondelete='CASCADE'), nullable = False)
    action_date = db.Column(db.DateTime, default=datetime.datetime.now)
    quantity = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text, nullable=True)
    recorded_by = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    
    beneficiary = db.relationship('Beneficiary', backref='actions_received')
    service = db.relationship('Service', backref='actions_performed')
    
    
    def __init__(self, beneficiary_id, service_id, quantity, notes, **kwargs):
        self.beneficiary_id = beneficiary_id
        self.service_id = service_id
        self.quantity = quantity
        self.notes = notes 
        for key, value in kwargs.items():
            setattr(self, key, value)
            
            
            
    def serialize(self):
        """Serialize with nested objects using their own serialize() methods"""
        return {
            'id': self.id,
            'beneficiary': self.beneficiary.serialize() if self.beneficiary else None,
            'service': self.service.serialize() if self.service else None,
            'action_date': self.action_date.isoformat() if self.action_date else None,
            'quantity': self.quantity,
            'notes': self.notes,
            'recorded_by': self.recorded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }