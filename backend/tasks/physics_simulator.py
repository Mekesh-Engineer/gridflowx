"""
GridFlowX Asynchronous Physics Simulation Task
==============================================
Runs an infinite non-blocking background loop simulating real-time
cyber-physical microgrid behavior at 1Hz (1 sample per second).
"""

import asyncio
from backend.services.telemetry_service import telemetry_service
from backend.core.logging import logger


async def microgrid_physics_task():
    """Background task executing the 1Hz telemetry simulation cycle."""
    logger.info("Microgrid Physics Simulation Task started (1Hz stream loop).")
    try:
        while True:
            await telemetry_service.run_simulation_step()
            await asyncio.sleep(1.0)
    except asyncio.CancelledError:
        logger.info("Microgrid Physics Simulation Task stopped cleanly.")
