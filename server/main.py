from fastapi import FastAPI, HTTPException, Cookie, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta
import bcrypt
import config, db, routes as r, schema as s


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://shaheer-frostbyte.github.io/Live-Menu/"
    # Another origin: hosted frontend url
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_credentials=True
)


# Auth
def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

def get_current_admin(access_token: str = Cookie(None)) -> str:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not Authenticated")

    try:
        payload = jwt.decode(access_token, config.JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload["sub"]


@app.post(r.login, response_model=dict)
def login(login_creds: s.Login_Request, response: Response) -> dict:
    if login_creds.email.strip().lower() != config.EMAIL.lower():
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(login_creds.password, config.PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {"sub": login_creds.email, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        config.JWT_SECRET,
        algorithm="HS256",
    )

    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=True, samesite="lax", max_age=1 * 3600,
    )

    return {
        "access": True
    }


# CRUD Operations
def convert_posgres_errors(result: dict, empty_data_possible: bool) -> dict:
    if result["success"] == False:
        raise HTTPException(status_code=400, detail=result["error"])
    elif empty_data_possible and (not result["data"]):
        raise HTTPException(status_code=404, detail="DATA NOT FOUND!!!")
    else:
        data = result["data"]
        return data[0] if isinstance(data, list) and data else data


@app.get(r.health_check)
def health_check():
    return "Server Running..."

@app.get(r.get_menu, response_model=dict)
def get_menu() -> dict:
    result = db.get_menu()

    if result["success"] == False:
        raise HTTPException(status_code=400, detail=result["error"])
# Not checking for empty data because data might be empty when no menu is created. If either query(for categories or items) is unsuccessful, success==False will catch it. Otherwise the received data will be sent to the frontend.
    else:
        return {
            "categories": result["categories"],
            "items": result["items"]
        }

# Category
@app.post(r.add_category, response_model=dict)
def add_category(new_cat: s.CreateUpdateCategory, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.add_category(new_cat), empty_data_possible=False)

@app.put(r.update_category, response_model=dict)
def update_category(id:str, upd_cat: s.CreateUpdateCategory, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.update_category(id, upd_cat), empty_data_possible=True)

@app.delete(r.delete_category, response_model=dict)
def delete_category(id: str, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.delete_category(id), empty_data_possible=True)

# Item
@app.post(r.add_item, response_model=dict)
def add_item(new_item: s.CreateItem, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.add_item(new_item), empty_data_possible=False)

@app.put(r.update_item, response_model=dict)
def update_item(id:str, upd_item: s.UpdateItem, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.update_item(id, upd_item), empty_data_possible=True)

@app.delete(r.delete_item, response_model=dict)
def delete_item(id: str, admin: str = Depends(get_current_admin)) -> dict:
    return convert_posgres_errors(db.delete_item(id), empty_data_possible=True)

