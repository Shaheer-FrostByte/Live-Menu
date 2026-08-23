from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import config, db, routes as r, schema as s


def convert_posgres_errors(result: dict, empty_data_possible: bool) -> dict:
    if result["success"] == False:
        raise HTTPException(status_code=400, detail=result["error"])
    elif empty_data_possible and (not result["data"]):
        raise HTTPException(status_code=404, detail="DATA NOT FOUND!!!")
    else:
        return result["data"]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)


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
def add_category(new_cat: s.CreateUpdateCategory) -> dict:
    return convert_posgres_errors(db.add_category(new_cat), empty_data_possible=False)

@app.put(r.update_category, response_model=dict)
def update_category(id:str, upd_cat: s.CreateUpdateCategory) -> dict:
    return convert_posgres_errors(db.update_category(id, upd_cat), empty_data_possible=True)

@app.delete(r.delete_category, response_model=dict)
def delete_category(id: str) -> dict:
    return convert_posgres_errors(db.delete_category(id), empty_data_possible=True)

# Item
@app.post(r.add_item, response_model=dict)
def add_item(new_item: s.CreateItem) -> dict:
    return convert_posgres_errors(db.add_item(new_item), empty_data_possible=False)

@app.put(r.update_item, response_model=dict)
def update_item(id:str, upd_item: s.UpdateItem) -> dict:
    return convert_posgres_errors(db.update_item(id, upd_item), empty_data_possible=True)

@app.delete(r.delete_item, response_model=dict)
def delete_item(id: str) -> dict:
    return convert_posgres_errors(db.delete_item(id), empty_data_possible=True)


# Auth
@app.post(r.login, response_model=dict)
def login(email: str, password: str) -> dict:
    if (email.strip().lower() == config.email) and (password.strip() == config.password):
        return { "access": True }
    else:
        return { "success": False }

