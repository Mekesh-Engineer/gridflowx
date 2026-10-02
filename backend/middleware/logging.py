"""
GridFlowX Request Logging Middleware
"""

import time
import logging
from fastapi import FastAPI, Request

logger = logging.getLogger("gridflowx.backend.http")


def setup_request_logging(app: FastAPI):
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time_ms = (time.time() - start_time) * 1000
        
        # Don't flood logs with frequent telemetry polls
        if not request.url.path.startswith("/api/v1/telemetry/live"):
            logger.info(
                f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms:.1f}ms)"
            )
        return response
