from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import db, routes as r, schema as s

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
def get_menu():
    return db.get_menu()

# Category
@app.post(r.add_category, response_model=dict)
def add_category(new_cat: s.CreateUpdateCategory):
    return db.add_category(new_cat)

@app.put(r.update_category, response_model=dict)
def update_category(id:str, upd_cat: s.CreateUpdateCategory):
    return db.update_category(id, upd_cat)

@app.delete(r.delete_category, response_model=dict)
def delete_category(id: str):
    return db.delete_category(id)

# Item
@app.post(r.add_item, response_model=dict)
def add_item(new_item: s.CreateItem):
    return db.add_item(new_item)

@app.put(r.update_item, response_model=dict)
def update_item(id:str, upd_item: s.UpdateItem):
    return db.update_item(id, upd_item)

@app.delete(r.delete_item, response_model=dict)
def delete_item(id: str):
    return db.delete_item(id)


