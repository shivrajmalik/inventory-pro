# Inventory Pro - Containerized Inventory & Order Management System

Inventory Pro is a production-ready, full-stack application designed to help businesses manage products, register customers, place and track order invoices, and monitor stock levels in real-time.

---

## Technical Stack
- **Backend API**: Python, FastAPI (asynchronous/synchronous endpoints, Pydantic data validation, SQLAlchemy ORM, and JWT authentication).
- **Frontend App**: React (Vite-powered, ES6 JavaScript) utilizing **Tailwind CSS v3** combined with a highly polished, custom **glassmorphic dark-mode** design system.
- **Database**: PostgreSQL (persisted via Docker volumes).
- **Orchestration**: Docker & Docker Compose.

---

## Key Features
1. **JWT Authentication**: Secure user registration, sign-in, and auth-state persistence.
2. **Dashboard Overview**: Key performance widgets (total products, total customers, total orders) alongside a warning list identifying low stock items (less than 10 units in inventory).
3. **Product Inventory**: Complete CRUD capabilities for products including unique SKU checking and price/stock constraints.
4. **Customers Directory**: Manage customer profiles, unique email checks, and details.
5. **Orders & Checkout**:
   - Multi-item checkout in a single request.
   - Live invoice calculations on the checkout screen.
   - Atomic database transactions validating inventory levels before decrementing stock.
   - Deleting or cancelling an order automatically restores product stock.
6. **Docker Orchestration**: Complete multi-container architecture running PostgreSQL, FastAPI, and Nginx.

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) (with Docker Compose v2+)

### Run Locally (Docker Compose)
1. Clone or verify the repository.
2. Build and launch all services with a single command from the project root:
   ```bash
   docker-compose up --build
   ```
3. Once running, you can access the application layers:
   - **Frontend App**: [http://localhost](http://localhost) (Served on port 80 via Nginx)
   - **Backend REST API**: [http://localhost:8000](http://localhost:8000)
   - **API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs) (Served automatically by FastAPI)

### Default Admin Credentials
When the backend starts, it automatically seeds a default administrator user for testing:
- **Username**: `admin`
- **Password**: `admin123`

---

## Running Unit Tests
You can execute the automated pytest test suite directly inside the running backend container:
```bash
docker-compose exec backend pytest
```
This tests:
- User signup and JWT login.
- Products CRUD operations.
- Customer directory CRUD.
- Multi-item order placement.
- Stock checking (preventing checkout if stock is insufficient).
- Stock restoration when an order is cancelled/deleted.

---

## Final Submission Details

Please update the following links once you have completed the deployment steps:

- **GitHub Repository**: [Link to Repository]
- **Docker Hub Image**: [Link to Backend Image]
- **Live Frontend URL**: [Link to Live App]
- **Live Backend API URL**: [Link to Live API]

### Manual Deployment Checklist
1. **GitHub**: Push this repository to your GitHub account.
2. **Docker Hub**: 
   - `docker build -t <your-username>/inventory-backend ./backend`
   - `docker push <your-username>/inventory-backend`
3. **Render (Backend)**: Connect GitHub -> New Web Service -> Root: `backend` -> Start Command: `uvicorn app.main:app`.
4. **Vercel (Frontend)**: Connect GitHub -> New Project -> Root: `frontend` -> Framework: `Vite` -> Add ENV `VITE_API_URL`.
