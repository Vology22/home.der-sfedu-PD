from fastapi import APIRouter, HTTPException
from typing import Optional, List
import sys
sys.path.append('..')
from database import get_connection
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PropertyCreate(BaseModel):
    owner_id: int
    price: Optional[int] = 0
    title: str
    description: str
    city: Optional[str] = ""

class PropertyResponse(BaseModel):
    prop_id: int
    owner_id: int
    price: Optional[int]
    title: Optional[str]
    description: Optional[str]
    city: Optional[str]
    created_at: Optional[datetime]

@router.post("/", response_model=PropertyResponse)
async def create_property(property: PropertyCreate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO properties (owner_id, price, title, description, city) 
               VALUES (%s, %s, %s, %s, %s)""",
            (property.owner_id, property.price, property.title, property.description, property.city)
        )
        prop_id = cursor.lastrowid
        conn.commit()
        
        return PropertyResponse(
            prop_id=prop_id,
            owner_id=property.owner_id,
            price=property.price,
            title=property.title,
            description=property.description,
            city=property.city
        )
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[PropertyResponse])
async def get_properties(limit: int = 50, offset: int = 0):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM properties ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
        properties = cursor.fetchall()
        return [PropertyResponse(**p) for p in properties]
    
    finally:
        cursor.close()
        conn.close()