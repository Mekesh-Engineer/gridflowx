# 📡 API Contract

## RESTful API Specifications, Request/Response Schemas, and Error Handling

**Document ID:** `DOC-API`
**Version:** 3.0
**Last Updated:** June 2026
**Classification:** API Engineering Document · Integration Reference
**Maintained By:** Backend Engineering Team

---

## 📋 Purpose

This document defines the REST API endpoints and data schemas provided by the Python FastAPI backend, as well as WebSocket connections for real-time telemetry streaming. All data formats have been updated to align with Firebase Firestore NoSQL models and Firebase Authentication.

---

## 🔗 Base Configuration

| Property | Value |
| --- | --- |
| **Base URL** | `https://api.gridflowx.local/api/v1` |
| **Protocol** | HTTPS (TLS 1.3) |
| **Content Type** | `application/json` |
| **Authentication** | Firebase ID Token in `Authorization: Bearer <token>` header |
| **Rate Limit** | 100 requests / 15 minutes |
| **API Version** | v1 (URL path versioning) |

---

## 🔐 Authentication & Claims Endpoints

Authentication is handled directly between the client browser and the Firebase Authentication service. However, custom user roles are assigned via a dedicated administrative endpoint on the FastAPI server:

### `POST /auth/claims` (Admin only)
Set custom claims (such as `role`) for a specific user UID in Firebase Authentication.

**Request:**
```json
{
  "uid": "fb_auth_uid_67890",
  "role": "Operator"
}
```

**Response (200):**
```json
{
  "status": "claims_updated",
  "uid": "fb_auth_uid_67890",
  "role": "Operator"
}
```

---

## 📡 Telemetry & Logging Endpoints

### `GET /telemetry/history`
Query historical telemetry documents stored in Firestore.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `range` | string | No | `24h` | Time range (`1h`, `6h`, `24h`, `7d`) |
| `limit` | integer | No | 100 | Maximum documents to return |

**Response (200):**
```json
{
  "range": "24h",
  "count": 96,
  "data": [
    {
      "deviceId": "esp32_001",
      "timestamp": "2026-06-19T14:30:15Z",
      "solarPower": 342.5,
      "loadPower": 48.2,
      "batterySoc": 72.3,
      "busVoltage": 12.15,
      "heatsinkTemp": 52.1,
      "ambientTemp": 28.4,
      "voltageRipple": 0.18,
      "gridStatus": "connected"
    }
  ]
}
```

### `GET /telemetry/kpi`
Retrieve calculated energy efficiency KPIs for dashboard presentation.

**Response (200):**
```json
{
  "period": "24h",
  "kpis": {
    "totalSolarGenerationKwh": 3.42,
    "totalLoadConsumptionKwh": 1.15,
    "avgBatterySoc": 65.8,
    "gridUsageHours": 2.5,
    "selfSufficiencyPercent": 78.3
  }
}
```

---

## 🔀 Relay Control Endpoints

### `POST /relays/override` (Operator+)
Manually override a relay channel state.

**Request:**
```json
{
  "relayIndex": 4,
  "newState": true,
  "reason": "Testing cooling unit relay path"
}
```

**Response (200):**
```json
{
  "status": "override_active",
  "relayIndex": 4,
  "newState": true,
  "expiresAt": "2026-06-19T15:00:00Z",
  "overrideDurationMinutes": 30
}
```

### `POST /relays/recovery` (Admin only)
Clear the emergency shutdown state and re-initialize relays.

**Request:**
```json
{
  "adminConfirmation": true,
  "reason": "Visual hardware inspection completed."
}
```

**Response (200):**
```json
{
  "status": "recovery_authorized",
  "timestamp": "2026-06-19T14:35:10Z"
}
```

---

## ⚙️ Configuration Endpoints

### `GET /config/thresholds`
Fetch current safety thresholds and sensor calibrations.

**Response (200):**
```json
{
  "thresholds": {
    "socTier2Shed": 40.0,
    "socTier3Shed": 30.0,
    "tempWarning": 70.0,
    "tempShutdown": 85.0,
    "voltageRippleMax": 1.2
  },
  "calibration": {
    "acs712Offset": 2.500,
    "acs712Scale": 0.185,
    "dividerRatio": 3.703
  }
}
```

### `PUT /config/thresholds` (Admin only)
Update system safety thresholds.

**Request:**
```json
{
  "thresholds": {
    "socTier2Shed": 45.0,
    "tempWarning": 68.0
  }
}
```

**Response (200):**
```json
{
  "status": "thresholds_updated"
}
```

---

## ❌ Error Response Format

FastAPI utilizes Pydantic validation errors and structured JSON outputs for all failures:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameter values",
  "details": {
    "relayIndex": "value is not a valid integer"
  },
  "timestamp": "2026-06-19T14:30:00Z"
}
```

### Standard Error Codes
- `VALIDATION_ERROR` (400): Bad parameters.
- `UNAUTHORIZED` (401): Missing or invalid Bearer ID Token.
- `INSUFFICIENT_PERMISSIONS` (403): Custom Claims role lacks access.
- `NOT_FOUND` (404): Requested document or route does not exist.
- `RATE_LIMIT_EXCEEDED` (429): API threshold reached.
- `INTERNAL_ERROR` (500): Server error.
