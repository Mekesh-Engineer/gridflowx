"""
GridFlowX Asynchronous Background Tasks
"""

import asyncio
from backend.services.telemetry_service import microgrid_physics_simulator


def start_background_tasks():
    """Starts the 1Hz telemetry streaming loop."""
    task = asyncio.create_task(microgrid_physics_simulator())
    return task
