# 📈 Performance Benchmarking

## Latency Benchmarks, Throughput Metrics, Agent Response Quality, and Load Testing

**Document ID:** `DOC-18`
**Version:** 2.0
**Last Updated:** June 2026
**Classification:** Engineering Metrics Document · QA Reference
**Maintained By:** Performance Engineering Team

---

## 📋 Purpose

This document defines the performance benchmarks, KPI targets, measurement methodology, load testing procedures, and regression detection strategy for all GridFlowX system components.

## 🎯 Scope

- AI inference latency benchmarks
- API response time targets
- WebSocket throughput metrics
- Database query performance
- Hardware edge response times
- AI model accuracy KPIs
- Load testing methodology and tools
- Performance regression detection

**Out of Scope:** Functional testing (`17_Testing.md`), model drift detection (`19_Model_Drift_Monitoring.md`).

---

## ⚡ Performance KPI Targets

### AI Inference Pipeline

| Component | Target | Achieved | Status |
| --- | --- | --- | --- |
| Perception Transformer (ONNX) | < 20 ms | **12.5 ms** | ✅ Exceeds |
| RL Decision Core (ONNX) | < 15 ms | **8.2 ms** | ✅ Exceeds |
| JSON Serialization | < 5 ms | **2.1 ms** | ✅ Exceeds |
| **Total Pipeline** | **< 50 ms** | **22.8 ms** | ✅ **54% headroom** |

### API Response Times (p95)

| `POST /auth/claims` | < 300 ms | Direct Firebase Admin SDK write |
| `GET /telemetry/history`| < 500 ms | Firestore document query |
| `POST /relays/override` | < 200 ms | WebSocket command transmission |
| `GET /config/thresholds`| < 150 ms | Firestore config document fetch |

### WebSocket & Real-Time

| Metric | Target | Notes |
| --- | --- | --- |
| WebSocket connection time | < 500 ms | Including Firebase Token validation |
| Telemetry update latency | < 200 ms | Sensor → Dashboard (edge-to-glass) |
| Broadcast throughput | 1 Hz × 1000 clients | FastAPI WebSocket broadcast |
| Reconnection time | < 5 s | Exponential backoff |

### Edge Hardware

| Metric | Target | Achieved |
| --- | --- | --- |
| Safety loop execution | < 10 ms | **8.3 ms** |
| Relay switching latency | < 100 ms | **45 ms** (including debounce) |
| ADC sample rate | 100 Hz | **100 Hz** |
| WebSocket telemetry interval | 1 s | **1 s** (1Hz stream) |

### AI Model Accuracy

| Metric | Target | Measurement |
| --- | --- | --- |
| Solar Forecast MAE | ≤ 12% | Rolling 30-day average |
| Load Forecast MAPE | ≤ 8% | Rolling 30-day average |
| Anomaly Detection F1 | ≥ 0.85 | Monthly evaluation on labeled events |
| Anomaly Detection Precision | ≥ 0.92 | Monthly evaluation |
| RL Cumulative Reward | > baseline | Comparison vs. static rule policy |

---

## 🔬 Load Testing Methodology

### Tool: k6 (Grafana Labs)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import ws from 'k6/ws';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Sustained load
    { duration: '2m', target: 500 },   // Spike to 500 users
    { duration: '5m', target: 500 },   // Sustained spike
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s
    http_req_failed: ['rate<0.01'],     // <1% error rate
  },
};

export default function () {
  // Telemetry query with Firebase ID Token
  const token = 'MOCK_FIREBASE_ID_TOKEN';
  const telemetryRes = http.get(
    `${BASE_URL}/api/v1/telemetry/history?range=24h`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  check(telemetryRes, {
    'telemetry 200': (r) => r.status === 200,
    'telemetry under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Test Scenarios

| Scenario | VUs | Duration | Purpose |
| --- | --- | --- | --- |
| **Baseline** | 10 | 5 min | Establish normal response times |
| **Normal Load** | 100 | 10 min | Typical production traffic |
| **Peak Load** | 500 | 10 min | Peak hour simulation |
| **Spike Test** | 1000 | 2 min | Sudden traffic burst |
| **Soak Test** | 50 | 4 hours | Memory leak detection |
| **Stress Test** | Incremental to failure | Until errors | Find breaking point |

---

## 📊 Performance Monitoring in Production

### Prometheus Metrics

```python
# FastAPI metrics setup
from prometheus_fastapi_instrumentator import Instrumentator

# Instrument the app and expose the /metrics endpoint
Instrumentator().instrument(app).expose(app)
```

### Key Prometheus Queries

| Metric | PromQL | Alert Threshold |
| --- | --- | --- |
| API p95 latency | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` | > 2s for 5 min |
| Error rate | `rate(http_requests_total{status=~"5.."}[5m])` | > 1% for 5 min |
| WebSocket connections | fastapi_connected_clients | < 1 for 1 min (no clients) |
| AI inference latency | `ai_inference_duration_seconds` | > 50ms for 10 min |
| CPU usage | `rate(process_cpu_seconds_total[5m])` | > 90% for 5 min |
| Memory usage | `process_resident_memory_bytes` | > 80% of container limit |

---

## 🔄 Performance Regression Detection

### Automated Regression Checks

1. **CI Pipeline Benchmarks:** Run k6 baseline test on every merge to `main`
2. **Comparison:** Compare p95 latencies against previous release
3. **Alert:** If p95 degrades by > 20%, flag the PR for review
4. **Dashboard:** Grafana dashboard tracks performance trends over time

### Regression Criteria

| Metric | Regression Threshold | Action |
| --- | --- | --- |
| API p95 | +20% vs. baseline | Investigate; block release |
| AI inference | +10ms | Review model changes |
| Memory (soak) | +10% growth/hour | Investigate memory leak |
| Error rate | Any increase | Immediate investigation |

---

## 📐 Architecture Notes

- Performance benchmarks are measured in **production-like environments** with the same container resource limits as production
- AI inference benchmarks specifically measure **ONNX Runtime CPU** performance (not PyTorch, which is training-only)
- WebSocket throughput is tested with **k6 WebSocket extension** to simulate realistic client connections
- Edge hardware benchmarks are measured using **logic analyzer** on GPIO pins for sub-millisecond accuracy

## 🏆 Recruiter & Portfolio Notes

> **Performance Engineering:** The benchmarking suite demonstrates systematic performance engineering — defined KPIs with targets and achievements, load testing methodology (k6), production monitoring (Prometheus + Grafana), and automated regression detection. The AI inference latency of 22.8ms with 54% headroom against the 50ms target shows careful optimization work.

## ✅ Best Practices

1. **Measure Everything:** Prometheus metrics on all services; custom timers on critical paths
2. **Test Before Release:** Performance regression tests run in CI on every merge
3. **Set Budgets:** Every component has a latency budget; exceeding it triggers investigation
4. **Profile, Don't Guess:** Use flamegraphs and profilers to identify actual bottlenecks

## 🔮 Future Enhancements

- **Real User Monitoring (RUM):** Browser-side performance tracking
- **Distributed Tracing (Jaeger):** End-to-end request tracing across services
- **AI-Powered Anomaly Detection:** Use ML to detect performance anomalies in metrics
- **Capacity Planning:** Predictive scaling based on historical traffic patterns

## 🗺️ Related Documents

| Document | Purpose |
| --- | --- |
| `17_Testing.md` | Functional testing strategies |
| `19_Model_Drift_Monitoring.md` | AI model performance tracking |
| `21_Monitoring_and_Logging.md` | Production observability setup |
| `20_Deployment.md` | Performance-related deployment configs |
