from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User Schemas
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    sku: str = Field(..., min_length=1, max_length=50)
    price: Decimal = Field(..., ge=0.0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[Decimal] = Field(None, ge=0.0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductOut(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Customer Schemas
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, max_length=20)

class CustomerOut(CustomerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Order Item Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    customer: CustomerOut
    items: List[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductOut]
