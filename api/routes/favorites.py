from fastapi import APIRouter, HTTPException
import sys
sys.path.append('..')
from database import get_connection
from pydantic import BaseModel

router = APIRouter()

class FavoriteCreate(BaseModel):
    user_id: int
    prop_id: int

@router.post("/")
async def add_to_favorites(fav: FavoriteCreate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT COUNT(*) FROM favorites WHERE user_id = %s AND prop_id = %s", 
            (fav.user_id, fav.prop_id)
        )
        if cursor.fetchone()[0] > 0:
            return {"status": "already_exists"}
        
        cursor.execute(
            "INSERT INTO favorites (user_id, prop_id) VALUES (%s, %s)",
            (fav.user_id, fav.prop_id)
        )
        conn.commit()
        return {"status": "success", "message": "Added to favorites"}
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/user/{user_id}")
async def get_user_favorites(user_id: int):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT f.*, p.title, p.price, p.description
            FROM favorites f
            JOIN properties p ON f.prop_id = p.prop_id
            WHERE f.user_id = %s
        """, (user_id,))
        favorites = cursor.fetchall()
        return {"count": len(favorites), "favorites": favorites}
    
    finally:
        cursor.close()
        conn.close()