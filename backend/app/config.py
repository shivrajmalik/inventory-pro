import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/inventory_db"
    )
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8u7v6w5x4y3z"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        case_sensitive = True

settings = Settings()
