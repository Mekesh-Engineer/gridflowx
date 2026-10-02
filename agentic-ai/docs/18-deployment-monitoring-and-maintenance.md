# 🚀 Deployment 18: Deployment, Monitoring & Maintenance Operations Manual

**Document ID:** `GFX-AI-SPEC-18`  
**Classification:** DevOps, MLOps & Production Operations Standard  
**Version:** `1.0.0-PROD`  
**Target Infrastructure:** Docker Compose / Linux VM / Nginx / Prometheus / Grafana  

---

## 1. Multi-Stage Deployment Topology

```mermaid
flowchart LR
    DEV["1. Local Development\n(VS Code / Python 3.11 / Colab)"] --> STAGING["2. Staging / CI Environment\n(GitHub Actions / Automated PyTests)"]
    STAGING --> PROD["3. Production Server\n(Docker Compose on Linux Host)"]
    
    subgraph DOCKER_PROD ["Production Docker Pod"]
        FE["gridflowx-frontend (Next.js 14)"]
        BE["gridflowx-backend (FastAPI + ONNX)"]
        DB["postgres-pgvector (DB & Vectors)"]
        RD["redis (Telemetry Cache & Pub/Sub)"]
    end
    
    PROD --> DOCKER_PROD
```

---

## 2. Production Docker Compose Configuration

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./gridflowx-app
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_WS_URL=ws://backend:8000
    depends_on:
      - backend

  backend:
    build:
      context: ./gridflow-agentic-ai
      dockerfile: Dockerfile.backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/gridflowx
      - REDIS_URL=redis://redis:6379/0
      - MODEL_REGISTRY_PATH=/app/models/model_registry.json
    volumes:
      - ./models:/app/models
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=gridflowx
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7.2-alpine
    restart: always
    ports:
      - "6379:6379"
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 3. Model Drift Monitoring & Retraining Triggers
- **Telemetry Distribution Drift:** Kolmogorov-Smirnov (KS) test evaluated weekly on input feature distributions ($P_{\text{solar}}, P_{\text{load}}, \text{Temp}$).
- **Residual MAE Drift:** If rolling 7-day $\text{MAE}_{\text{solar}} > 35\,W$ or $\text{RMSE}_{\text{load}} > 35\,W$, an automated retraining ticket is generated.
- **Zero-Downtime Hot-Reloading:** New ONNX models can be deployed by copying artifacts into `models/` and issuing a `POST /api/v1/ai/reload-models` command to reload the singleton `InferenceSession` instances without restarting the FastAPI server.

---

## 4. Rollback Strategy
If a newly deployed model exhibits erratic predictions or elevated inference latencies:
1. Revert `models/model_registry.json` to the previous version pointer (`v1.0.0`).
2. Trigger `POST /api/v1/ai/reload-models`.
3. In-memory sessions instantly revert to the proven model artifact in $<200\,\text{ms}$.

---

## 5. Maintenance Operations Checklist
- [ ] Configure daily automated PostgreSQL database backups to secure offsite storage.
- [ ] Verify Docker health checks for all 4 containers.
- [ ] Configure Prometheus metrics scraper at `/metrics`.
- [ ] Test zero-downtime model reload endpoint.
