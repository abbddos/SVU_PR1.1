from database import db
import datetime 

class Beneficiary(db.Model):
    __tablename__ = "beneficiaries"
    #Personal Information
    id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(225), nullable = False)
    middle_name = db.Column(db.String(225), nullable = False)
    mother_first_name = db.Column(db.String(225), nullable = False)
    last_name = db.Column(db.String(225), nullable = False)
    date_of_birth =db.Column(db.DateTime, nullable = False)
    place_of_birth = db.Column(db.String(225), nullable = False)
    sex = db.Column(db.String(10), nullable = False)
    
    #Residency and contact
    contact_number = db.Column(db.String(225), nullable = True)
    current_address = db.Column(db.String(225), nullable = False)
    displacement_status = db.Column(db.String(10), nullable = False, default = "Resident")
    
    #Identification(s)
    national_identifier = db.Column(db.String(25), nullable = False, default = "National ID")
    other_national_identifier = db.Column(db.String(25), nullable = True)
    national_identifier_number = db.Column(db.String(25), nullable = True)
    beneficiary_pic = db.Column(db.String(255), nullable=True)
    
    #Household Information
    household_size = db.Column(db.Integer, nullable = False, default = 1)
    disability_in_household = db.Column(db.String(3), nullable = True, default = "No")
    disability_type = db.Column(db.String(10), nullable = True, default = "None")
    elders_in_household = db.Column(db.String(3), nullable = True, default = "No")
    number_of_elders = db.Column(db.Integer, nullable = True, default = 0)
    infants_in_household = db.Column(db.String(3), nullable = True, default = "No")
    number_of_infants = db.Column(db.Integer, nullable = True, default = 0)
    
    #Education/Occupation
    occupation = db.Column(db.String(225), nullable = True)
    education = db.Column(db.String(225), nullable = True, default = "None")
    
    #Last Updated
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    last_update = db.Column(db.DateTime, default=datetime.datetime.now)
    last_updated_by = db.Column(db.String(80), nullable = True)
    
    
    #Relation with Actions...
    #services = db.relationship('Service', secondary='actions', backref='beneficiaries_served')
    
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
    
    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "mother_first_name": self.mother_first_name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth,
            "place_of_birth": self.place_of_birth,
            "sex": self.sex,
            "contact_number": self.contact_number,
            "current_address": self.current_address,
            "displacement_status": self.displacement_status,
            "national_identifier": self.national_identifier,
            "national_identifier_number": self.national_identifier_number,
            "other_national_identifier": self.other_national_identifier,
            "beneficiary_pic": self.beneficiary_pic,
            "household_size": self.household_size,
            "disability_in_household": self.disability_in_household,
            "disability_type": self.disability_type,
            "elders_in_household": self.elders_in_household,
            "number_of_elders": self.number_of_elders,
            "infants_in_household": self.infants_in_household,
            "number_of_infants": self.number_of_infants,
            "occupation": self.occupation,
            "education": self.education,
            "created_at": self.created_at,
            "last_update": self.last_update,
            "last_updated_by": self.last_updated_by
        }
        
        
        
    def __repr__(self):
        return f"<Beneficiary: {self.first_name} {self.middle_name} {self.last_name}"
    
    
    
    