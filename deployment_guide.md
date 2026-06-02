# Deployment Guide - Inventory Pro

Follow these steps to deploy your completed application to the internet using free hosting platforms.

---

## 1. Push Code to GitHub
You must first have your code on a GitHub repository.
1.  Go to [github.com/new](https://github.com/new) and create a repository named `inventory-pro`.
2.  Run these commands in your machine's terminal:
    ```bash
    cd Downloads/Assessment
    git remote add origin https://github.com/YOUR_USERNAME/inventory-pro.git
    git branch -M main
    git push -u origin main
    ```

---

## 2. Deploy Backend (Render)
1.  Log in to [Render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your `inventory-pro` repository.
4.  **Configuration**:
    *   **Name**: `inventory-api`
    *   **Environment**: `Python 3`
    *   **Root Directory**: `backend`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables** (Click "Advanced"):
    *   `DATABASE_URL`: (Render provides a free PostgreSQL database. Create that first, or use a temporary SQLite URL: `sqlite:///./inventory.db`)
    *   `SECRET_KEY`: `your-random-secret-key-here`
6.  Click **Create Web Service**. 
7.  **Copy the resulting URL** (e.g., `https://inventory-api.onrender.com`).

---

## 3. Deploy Frontend (Vercel)
1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your `inventory-pro` repository.
4.  **Configuration**:
    *   **Project Name**: `inventory-pro-frontend`
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://inventory-api.onrender.com` (Use the Backend URL from Step 2).
6.  Click **Deploy**.
7.  **Copy the resulting URL** (e.g., `https://inventory-pro-frontend.vercel.app`).

---

## 4. Push Image to Docker Hub
1.  Log in to your terminal: `docker login`.
2.  Build & Tag: 
    ```bash
    docker build -t YOUR_DOCKER_USERNAME/inventory-backend ./backend
    ```
3.  Push:
    ```bash
    docker push YOUR_DOCKER_USERNAME/inventory-backend
    ```

---

## 5. Final Submission
Update the links at the bottom of your `README.md` and submit your profile!
