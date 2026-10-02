"""
GridFlowX Application Lifecycle Events
"""

import asyncio
from typing import Callable, Coroutine, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI


def create_start_app_handler(app: FastAPI) -> Callable[[], Coroutine[Any, Any, None]]:
    async def start_app() -> None:
        print("[BACKEND] Initializing GridFlowX Server Engine...")
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable[[], Coroutine[Any, Any, None]]:
    async def stop_app() -> None:
        print("[BACKEND] Shutting down GridFlowX Server Engine...")
    return stop_app
