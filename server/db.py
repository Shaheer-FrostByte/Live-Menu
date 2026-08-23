from supabase import create_client, Client
from functools import lru_cache
import config, schema

# @lru_cache
# def get_Supabase_client() -> Client:
#     return create_client(config.SUPABASE_PROJECT_URL, config.SUPABASE_PROJECT_KEY)

supabase = create_client(config.SUPABASE_PROJECT_URL, config.SUPABASE_PROJECT_KEY)


# MENU 
def get_menu() -> dict:
    success = True
    error = None
    categories = None
    items = None

    try:
        categories = supabase.table("categories").select("*").execute()
        items = supabase.table("items").select("*").execute()
    except Exception as e:
        success = False
        error = str(e)

    return {
        "success": success,
        "error": error,
        "categories" : categories.data,
        "items" : items.data
    }


# CATEGORY
def add_category(target: schema.CreateUpdateCategory) -> dict:
    success = True
    error = None
    res = None

    try:
        res = supabase.table("categories").insert(target.model_dump()).execute()
    except Exception as e:
        success = False
        error = str(e)
        

    return {
        "success": success,
        "error": error,
        "data": res.data
    }

def update_category(id: str, target: schema.CreateUpdateCategory) -> dict:
    success = True
    error = None
    res = None

    try:
        res = supabase.table("categories").update(target.model_dump()).eq("C_id", id).execute()
    except Exception as e:
        success = False
        error = str(e)

    return {
        "success": success,
        "error": error,
        "data": res.data
    }

def delete_category(id: str) -> dict:
    success = True
    error = None
    res = None

    try:
        res = supabase.table("categories").delete().eq("C_id", id).execute()
    except Exception as e:
        success = False
        error = str(e)

    return {
        "success": success,
        "error": error,
        "data": res.data
    }


# ITEM

