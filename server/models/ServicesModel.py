from database import db
import datetime 

class Service(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key = True)
    service_type = db.Column(db.String(225), nullable = False, default = "Unknown")
    service_description = db.Column(db.Text, nullable = True)
    governorate = db.Column(db.String(25), nullable = False)
    district = db.Column(db.String(25), nullable = False)
    sub_district = db.Column(db.String(25), nullable = False)
    village_neighborhood = db.Column(db.String(25), nullable = False)
    start_date = db.Column(db.DateTime, default=datetime.datetime.now)
    end_date = db.Column(db.DateTime, default=datetime.datetime.now)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    last_update = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_by = db.Column(db.String(80), nullable = True)
    
    #Relations with Actions...
    #beneficiaries = db.relationship('Beneficiary', secondary='actions',backref='services_received')
    
    
    def __init__(self, service_type, service_description, governorate, district, sub_district, village_neighborhood, start_date, end_date, created_at, last_update, updated_by, **kwargs):
        self.service_type = service_type
        self.service_description = service_description
        self.governorate = governorate
        self.district = district 
        self.sub_district = sub_district
        self.village_neighborhood = village_neighborhood
        self.start_date = start_date
        self.end_date = end_date
        self.created_at = created_at
        self.last_update = last_update
        self.updated_by = updated_by
        
        for key, value in kwargs.items():
            setattr(self, key, value)
        
        
    def serialize(self):
        return {
            "id": self.id,
            "service_type": self.service_type,
            "service_description": self.service_description,
            "governorate": self.governorate,
            "district": self.district,
            "sub_district": self.sub_district,
            "village_neighborhood": self.village_neighborhood,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "created_at": self.created_at,
            "last_update": self.last_update,
            "updated_by": self.updated_by
        }
        
        
    def __repr__(self):
        return f"Service {self.id}_{self.service_type}"