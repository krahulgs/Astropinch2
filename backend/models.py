from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="user") # "master" or "user"
    full_name = Column(String, nullable=True)
    birth_place = Column(String, nullable=True)
    birth_date = Column(String, nullable=True) # DD-MM-YYYY
    birth_time = Column(String, nullable=True) # HH:MM
    lat = Column(String, nullable=True)
    lon = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    gender = Column(String, nullable=True)  # Male / Female / Other
    marital_status = Column(String, nullable=True)
    profile_image = Column(String, nullable=True) # URL or path to image
    is_active = Column(Boolean, default=True)
    mobile_number = Column(String, nullable=True)
    otp = Column(String, nullable=True)
    created_by_id = Column(Integer, nullable=True)

class AstrologerApplication(Base):
    __tablename__ = "astrologer_applications"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    experience_years = Column(Integer)
    specialties = Column(String) # Stored as JSON string
    languages = Column(String) # Stored as JSON string
    bio = Column(String)
    status = Column(String, default="PENDING") # PENDING, ACTIVE, REJECTED
    documents = Column(String, nullable=True) # JSON string of paths
    profile_image = Column(String, nullable=True)
    rate_per_min = Column(Integer, nullable=True)
    ai_persona_prompt = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
