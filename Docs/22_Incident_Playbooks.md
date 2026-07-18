# 🚨 Incident Playbooks

## Runbooks for Common Incidents, Recovery Procedures, and Escalation Protocols

**Document ID:** `DOC-22`
**Version:** 3.0
**Last Updated:** June 2026
**Classification:** Operations Reference · Runbook Library
**Maintained By:** Site Reliability Engineering Team

---

## 📋 Purpose

This document provides step-by-step incident response playbooks for the most common GridFlowX operational incidents, updated for the FastAPI WebSocket backend and Firebase database/auth architecture.

---

## 📕 Playbook 1: FastAPI Backend Service Down

### Symptoms
- Prometheus alert: `ServiceDown (fastapi-backend)`
- Client dashboard shows "Connection Lost"
- API endpoints returning 502/504 Bad Gateway (Nginx)

### Diagnosis Steps
```bash
# 1. Check docker container status
docker compose ps fastapi-backend

# 2. Check backend console logs for uncaught exceptions
docker compose logs --tail=100 fastapi-backend

# 3. Check container resource utilization
docker stats fastapi-backend

# 4. Check backend health endpoint directly
curl -f http://localhost:8000/health
```

### Recovery
```bash
# Option A: Restart the backend service container
docker compose restart fastapi-backend

# Option B: Force recreate the container if it remains unresponsive
docker compose up -d --force-recreate fastapi-backend
```

---

## 📕 Playbook 2: AI Orchestrator Failure

### Symptoms
- Anomaly alerts are not generated in Firestore
- Forecast panels show stale predictive lines
- Relay commands stop updating automatically (fallback to default edge state)

### Diagnosis Steps
```bash
# 1. Query the backend AI model health endpoint
curl http://localhost:8000/health/ai

# 2. Search logs for Model Loading or Inference errors
docker compose logs fastapi-backend | grep -E "model|inference|predict"
```

### Recovery
1. **Restart FastAPI backend container** to re-initialize model runtimes.
2. **Review configurations** in the `systemConfigurations` collection in Firestore.
3. If an anomaly detection or forecasting model is corrupted, revert to the baseline rule-based scheduler by editing the `aiAutoMode` field to `false` in `systemConfigurations/systemPreferences`.

---

## 📕 Playbook 3: WebSocket Connection Loss (Edge ↔ Backend)

### Symptoms
- Telemetry updates stop flowing to the dashboard (flat charts).
- The ESP32 16x2 LCD display shows "WS Disconnected".

### Diagnosis Steps
- **Verify Backend State:** Check if FastAPI is accepting WebSocket connections on `/ws/telemetry`.
- **Verify Network Path:** Check Nginx logs for connection dropouts:
  `docker compose logs nginx | grep "/ws"`
- **Edge Diagnostic:** Check ESP32 serial logs. Common causes:
  - Wrong `DEVICE_WS_TOKEN`.
  - Local WiFi connection lost (RSSI signal strength below -80dBm).

### Recovery
1. If the ESP32 is hung, perform a manual hardware reset (press EN button).
2. If backend credentials changed, update `DEVICE_WS_TOKEN` in the backend environment and redeploy.

---

## 📕 Playbook 4: Emergency Shutdown Event

### Symptoms
- All relays are de-energized.
- Dashboard shows an red emergency overlay.
- Firestore `audit_logs` collection contains an `EMERGENCY_SHUTDOWN` event document.

### Recovery Sequence
1. **Identify Root Cause:** Read the `alerts` and `telemetry` collections to find the triggering value (e.g., Heatsink Temp > 85°C, or Battery SoC < 2%).
2. **Physical Inspection:** Verify the hardware (relays, battery cells) is physically cool, undamaged, and safe to re-energize.
3. **Admin Authentication:** Only users with the `Admin` role can authorize a recovery command.
4. **Send Recovery Directive:** Post a recovery REST request to the FastAPI endpoint:
   ```http
   POST /api/v1/relays/recovery
   Authorization: Bearer <admin_firebase_id_token>
   Content-Type: application/json

   {
     "adminConfirmation": true,
     "reason": "Physical thermal check complete. Relays verified."
   }
   ```
5. **Monitor:** Ensure telemetry values stabilize in the first 15 minutes post-recovery.

---

## 📕 Playbook 5: Security Breach / Token Compromise

### Symptoms
- Unrecognized user logs in.
- Suspicious manual relay override logs appear in `audit_logs`.

### Containment & Recovery
1. **Block Compromised User:** Go to the Firebase Authentication Console, search for the user ID, and disable or delete the account.
2. **Revoke Active Tokens:** Use the Firebase Admin SDK to revoke all refresh tokens for the user:
   ```python
   from firebase_admin import auth
   auth.revoke_refresh_tokens(uid)
   ```
3. **Block IP Address:** Add suspicious source IPs to the Nginx deny rules block and reload:
   `docker compose exec nginx nginx -s reload`
