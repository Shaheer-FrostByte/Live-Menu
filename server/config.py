import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_PROJECT_URL = os.environ["SUPABASE_PROJECT_URL"]
SUPABASE_PROJECT_KEY = os.environ["SUPABASE_PROJECT_KEY"]

EMAIL = os.environ["EMAIL"]
PASSWORD_HASH = os.environ["PASSWORD_HASH"]
JWT_SECRET = os.environ["JWT_SECRET"]

