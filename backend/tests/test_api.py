import os
os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from decimal import Decimal

from app.database import Base, get_db
from app.main import app

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Helper to get auth headers
def get_auth_headers(username="testuser", password="password123"):
    # First, register the user
    client.post("/api/auth/register", json={"username": username, "password": password})
    # Then log in
    response = client.post(
        "/api/auth/login",
        data={"username": username, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(autouse=True)
def clean_db():
    # Drop and recreate tables for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_user_registration_and_login():
    # Register
    res = client.post(
        "/api/auth/register",
        json={"username": "newuser", "password": "newpassword123"}
    )
    assert res.status_code == 201
    assert res.json()["username"] == "newuser"

    # Login
    res = client.post(
        "/api/auth/login",
        data={"username": "newuser", "password": "newpassword123"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_product_crud():
    headers = get_auth_headers()
    
    # Create product
    res = client.post(
        "/api/products",
        json={"name": "Laptop", "sku": "LAP01", "price": 999.99, "quantity": 10},
        headers=headers
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Laptop"
    assert res.json()["sku"] == "LAP01"
    
    product_id = res.json()["id"]
    
    # Get all products
    res = client.get("/api/products", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
    
    # Get single product
    res = client.get(f"/api/products/{product_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["sku"] == "LAP01"
    
    # Update product
    res = client.put(
        "/api/products/{}".format(product_id),
        json={"price": 899.99, "quantity": 15},
        headers=headers
    )
    assert res.status_code == 200
    assert res.json()["price"] == "899.99"
    assert res.json()["quantity"] == 15
    
    # Delete product
    res = client.delete(f"/api/products/{product_id}", headers=headers)
    assert res.status_code == 200

def test_customer_crud():
    headers = get_auth_headers()
    
    # Create customer
    res = client.post(
        "/api/customers",
        json={"name": "Alice Smith", "email": "alice@example.com", "phone": "1234567890"},
        headers=headers
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Alice Smith"
    
    customer_id = res.json()["id"]
    
    # Get all
    res = client.get("/api/customers", headers=headers)
    assert len(res.json()) == 1
    
    # Delete
    res = client.delete(f"/api/customers/{customer_id}", headers=headers)
    assert res.status_code == 200

def test_customer_update():
    headers = get_auth_headers()
    
    # Create customer
    res = client.post(
        "/api/customers",
        json={"name": "Alice", "email": "alice@example.com"},
        headers=headers
    )
    customer_id = res.json()["id"]
    
    # Update email
    res = client.put(
        f"/api/customers/{customer_id}",
        json={"email": "alice.new@example.com"},
        headers=headers
    )
    assert res.status_code == 200
    assert res.json()["email"] == "alice.new@example.com"
    
    # Verify uniqueness on update
    client.post(
        "/api/customers",
        json={"name": "Bob", "email": "bob@example.com"},
        headers=headers
    )
    res = client.put(
        f"/api/customers/{customer_id}",
        json={"email": "bob@example.com"},
        headers=headers
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_order_creation_success():
    headers = get_auth_headers()
    
    # Create product and customer
    prod_res = client.post(
        "/api/products",
        json={"name": "Item A", "sku": "ITEM_A", "price": 10.00, "quantity": 100},
        headers=headers
    )
    cust_res = client.post(
        "/api/customers",
        json={"name": "Bob Jones", "email": "bob@example.com"},
        headers=headers
    )
    
    product_id = prod_res.json()["id"]
    customer_id = cust_res.json()["id"]
    
    # Create order
    order_res = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 5}]
        },
        headers=headers
    )
    
    assert order_res.status_code == 201
    assert order_res.json()["total_amount"] == "50.00"
    
    # Check that stock was reduced
    prod_res_after = client.get(f"/api/products/{product_id}", headers=headers)
    assert prod_res_after.json()["quantity"] == 95

def test_order_insufficient_stock():
    headers = get_auth_headers()
    
    # Create product and customer
    prod_res = client.post(
        "/api/products",
        json={"name": "Item B", "sku": "ITEM_B", "price": 10.00, "quantity": 4},
        headers=headers
    )
    cust_res = client.post(
        "/api/customers",
        json={"name": "Bob Jones", "email": "bob@example.com"},
        headers=headers
    )
    
    product_id = prod_res.json()["id"]
    customer_id = cust_res.json()["id"]
    
    # Create order requesting more than quantity (5 > 4)
    order_res = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 5}]
        },
        headers=headers
    )
    
    assert order_res.status_code == 400
    assert "Insufficient stock" in order_res.json()["detail"]

def test_delete_order_restores_stock():
    headers = get_auth_headers()
    
    prod_res = client.post(
        "/api/products",
        json={"name": "Item C", "sku": "ITEM_C", "price": 10.00, "quantity": 10},
        headers=headers
    )
    cust_res = client.post(
        "/api/customers",
        json={"name": "Charlie", "email": "charlie@example.com"},
        headers=headers
    )
    
    product_id = prod_res.json()["id"]
    customer_id = cust_res.json()["id"]
    
    # Create order
    order_res = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 3}]
        },
        headers=headers
    )
    order_id = order_res.json()["id"]
    
    # Stock should be 7
    prod_res_after = client.get(f"/api/products/{product_id}", headers=headers)
    assert prod_res_after.json()["quantity"] == 7
    
    # Delete order
    client.delete(f"/api/orders/{order_id}", headers=headers)
    
    # Stock should be restored to 10
    prod_res_restored = client.get(f"/api/products/{product_id}", headers=headers)
    assert prod_res_restored.json()["quantity"] == 10
