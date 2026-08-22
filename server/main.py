from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import db, routes as r

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

@app.get(r.get_menu)
def get_menu():
    return db.get_menu()