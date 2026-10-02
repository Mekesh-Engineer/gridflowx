"""
GridFlowX Utilities Package
"""

import logging

logger = logging.getLogger("gridflowx.backend")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [BACKEND] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def format_watts(watts: float) -> str:
    if abs(watts) >= 1000.0:
        return f"{watts / 1000.0:.2f} kW"
    return f"{watts:.1f} W"


def format_kwh(kwh: float) -> str:
    return f"{kwh:.2f} kWh"
