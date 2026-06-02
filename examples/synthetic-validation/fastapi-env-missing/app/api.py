import os
from fastapi import FastAPI

api = FastAPI()
database_url = os.getenv("DATABASE_URL")

