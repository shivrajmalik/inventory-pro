from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from . import models, schemas, crud, auth, database
from .config import settings

# Initialize Database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, orders, and inventory.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial admin user if none exists
@app.on_event("startup")
def seed_admin():
    db = database.SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            crud.create_user(db, schemas.UserCreate(username="admin", password="admin123"))
            print("Seeded default user: admin / admin123")
    except Exception as e:
        print(f"Error seeding user: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Inventory & Order Management System API!"}

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    return crud.create_user(db, user)

@app.post("/api/auth/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# --- PRODUCT ENDPOINTS ---

@app.post("/api/products", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_product(db, product)

@app.get("/api/products", response_model=List[schemas.ProductOut])
def get_all_products(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_products(db)

@app.get("/api/products/{id}", response_model=schemas.ProductOut)
def get_product_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    product = crud.get_product(db, id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found."
        )
    return product

@app.put("/api/products/{id}", response_model=schemas.ProductOut)
def update_product_by_id(
    id: int, 
    product: schemas.ProductUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.update_product(db, id, product)

@app.delete("/api/products/{id}", response_model=schemas.ProductOut)
def delete_product_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.delete_product(db, id)


# --- CUSTOMER ENDPOINTS ---

@app.post("/api/customers", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer: schemas.CustomerCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_customer(db, customer)

@app.get("/api/customers", response_model=List[schemas.CustomerOut])
def get_all_customers(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_customers(db)

@app.get("/api/customers/{id}", response_model=schemas.CustomerOut)
def get_customer_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    customer = crud.get_customer(db, id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {id} not found."
        )
    return customer

@app.put("/api/customers/{id}", response_model=schemas.CustomerOut)
def update_customer_by_id(
    id: int, 
    customer: schemas.CustomerUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.update_customer(db, id, customer)

@app.delete("/api/customers/{id}", response_model=schemas.CustomerOut)
def delete_customer_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.delete_customer(db, id)


# --- ORDER ENDPOINTS ---

@app.post("/api/orders", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_order(db, order)

@app.get("/api/orders", response_model=List[schemas.OrderOut])
def get_all_orders(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_orders(db)

@app.get("/api/orders/{id}", response_model=schemas.OrderOut)
def get_order_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    order = crud.get_order(db, id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found."
        )
    return order

@app.delete("/api/orders/{id}", response_model=schemas.OrderOut)
def delete_order_by_id(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.delete_order(db, id)


# --- DASHBOARD STATS ---

@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_dashboard_stats(db)
