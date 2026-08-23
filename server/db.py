from supabase import create_client, Client
from functools import lru_cache
import config, schema


# @lru_cache
# def get_Supabase_client() -> Client:
#     return create_client(config.SUPABASE_PROJECT_URL, config.SUPABASE_PROJECT_KEY)

supabase = create_client(config.SUPABASE_PROJECT_URL, config.SUPABASE_PROJECT_KEY)

# Helper function for running queries
def run_query(query) -> dict:
    try:
        res = query.execute()
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": None
        }

    return {
        "success": True,
        "error": None,
        "data": res.data
    }

# MENU 
def get_menu() -> dict:
    try:
        categories = supabase.table("categories").select("*").execute()
        items = supabase.table("items").select("*").execute()
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "categories" : None,
            "items" : None
        }

    return {
        "success": True,
        "error": None,
        "categories" : categories.data,
        "items" : items.data
    }


# CATEGORY
def add_category(target: schema.CreateUpdateCategory) -> dict:
    q = supabase.table("categories").insert(target.model_dump(mode="json"))
    return run_query(query=q)

def update_category(id: str, target: schema.CreateUpdateCategory) -> dict:
    q = supabase.table("categories").update(target.model_dump(mode="json")).eq("C_id", id)
    return run_query(query=q)

def delete_category(id: str) -> dict:
    q = supabase.table("categories").delete().eq("C_id", id)
    return run_query(query=q)


# ITEM
def add_item(target: schema.CreateItem) -> dict:
    q = supabase.table("items").insert(target.model_dump(mode="json"))
    return run_query(query=q)

def update_item(id: str, target: schema.UpdateItem) -> dict:
    q = supabase.table("items").update(target.model_dump(mode="json")).eq("I_id", id)
    return run_query(query=q)

def delete_item(id: str) -> dict:
    q = supabase.table("items").delete().eq("I_id", id)
    return run_query(query=q)

    


