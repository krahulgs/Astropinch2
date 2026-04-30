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
    marital_status = Column(String, nullable=True)
    profile_image = Column(String, nullable=True) # URL or path to image
    is_active = Column(Boolean, default=True)
