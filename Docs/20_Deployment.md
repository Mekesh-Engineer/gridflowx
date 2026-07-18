# 🚀 Deployment Strategy

## Docker Compose, CI/CD Pipeline (GitHub Actions & Firebase), and Production Deployment

**Document ID:** `DOC-20`
**Version:** 3.0
**Last Updated:** June 2026
**Classification:** DevOps Engineering Document · Operations Reference
**Maintained By:** DevOps Engineering Team

---

## 📋 Purpose

This document defines the deployment strategy for the GridFlowX platform. With the transition to a serverless Firebase frontend/database and a FastAPI backend, the deployment architecture is streamlined. The database (Firestore), auth (Firebase Authentication), and hosting are managed as serverless cloud services, while the FastAPI WebSocket Server is containerized and deployed.

---

## 🎯 Scope

- Docker Compose configuration for local testing (FastAPI + Nginx)
- CI/CD pipeline using GitHub Actions (testing, Firebase Deploy, Container builds)
- Firebase Hosting and App Hosting configuration
- Production environment parameters

---

## 🐳 Docker Compose Configuration (Local Backend Environment)

For local development and integration testing, a lightweight Docker Compose file runs the FastAPI backend behind an Nginx reverse proxy.

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  # ── Nginx Proxy (SSL/TLS Termination) ──
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - fastapi-backend
    restart: unless-stopped
    networks:
      - gridflowx-net

  # ── FastAPI Backend (REST API + WebSocket Server + AI Agent) ──
  fastapi-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: gridflowx/fastapi-backend:${TAG:-latest}
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - DEVICE_WS_TOKEN=${DEVICE_WS_TOKEN}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
    networks:
      - gridflowx-net

networks:
  gridflowx-net:
    driver: bridge
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The CI/CD pipeline automates testing, container building, and serverless deployments to Firebase.

```yaml
name: GridFlowX CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main, develop]

jobs:
  # ── Phase 1: Test & Lint ──
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install Backend Dependencies & Run Tests
        run: |
          cd backend
          pip install -r requirements.txt pytest httpx
          pytest -v
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install Frontend Dependencies & Lint
        run: |
          cd frontend
          npm ci
          npm run lint

  # ── Phase 2: Deploy Frontend & Rules (Firebase) ──
  deploy-firebase:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Build Frontend Next.js App
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Deploy to Firebase App Hosting & Rules
        uses: w9jds/firebase-action@v2.2.0
        with:
          args: deploy --only apphosting,firestore:rules,firestore:indexes
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

  # ── Phase 3: Build & Deploy Backend (Docker / Container Registry) ──
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          
      - name: Build and Push FastAPI Container
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: gridflowx/fastapi-backend:latest,gridflowx/fastapi-backend:${{ github.sha }}
```

---

## ⚙️ Environment Configurations

### Backend Settings
- **`FIREBASE_SERVICE_ACCOUNT_JSON`**: Service account credentials mapping to a Firebase Project with editor access.
- **`DEVICE_WS_TOKEN`**: A high-entropy pre-shared key (PSK) used during the ESP32 WebSocket handshake.

### Frontend Settings
- **`NEXT_PUBLIC_WS_URL`**: Target address of the FastAPI WebSocket server (`wss://api.gridflowx.com`).
- **Firebase config (API Key, Project ID, App ID)**: Bundled into the Next.js bundle during build step.
