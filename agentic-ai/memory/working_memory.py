"""
GridFlowX Working Memory & Multi-Turn Context Sanitizer
=======================================================
Manages short-term rolling telemetry frames, active operator goals,
and conversational session context with dynamic telemetry sanitization.
"""

import re
from typing import Dict, Any, List, Optional
from collections import deque
from datetime import datetime, timezone


class WorkingMemory:
    """Manages short-term operational state and sanitized conversational context."""

    def __init__(self, max_frames: int = 300, max_chat_turns: int = 10):
        self.telemetry_history: deque = deque(maxlen=max_frames)
        self.active_goals: Dict[str, Any] = {}
        self.session_context: Dict[str, Any] = {
            "current_topic": "general_monitoring",
            "last_inspected_component": "system",
            "active_device_id": "GFX-ESP32-MASTER-01",
            "last_interaction_time": datetime.now(timezone.utc).isoformat()
        }
        self.recent_chat_history: deque = deque(maxlen=max_chat_turns)

    def push_telemetry(self, frame: Dict[str, Any]) -> None:
        self.telemetry_history.append({
            "receivedAt": datetime.now(timezone.utc).isoformat(),
            "frame": frame
        })

    def get_latest_telemetry(self) -> Optional[Dict[str, Any]]:
        if self.telemetry_history:
            return self.telemetry_history[-1]["frame"]
        return None

    def get_recent_frames(self, count: int = 10) -> List[Dict[str, Any]]:
        return [item["frame"] for item in list(self.telemetry_history)[-count:]]

    def update_session(self, key: str, value: Any) -> None:
        self.session_context[key] = value
        self.session_context["last_interaction_time"] = datetime.now(timezone.utc).isoformat()

    def sanitize_conversation_history(
        self,
        raw_history: List[Dict[str, str]],
        max_turns: int = 6
    ) -> List[Dict[str, str]]:
        """
        Sanitizes past conversation turns to prevent old telemetry measurements
        from polluting current diagnostic reasoning while preserving conversational flow.
        """
        if not raw_history:
            return []

        sanitized: List[Dict[str, str]] = []
        for turn in raw_history[-max_turns:]:
            role = turn.get("role", "user")
            content = turn.get("content", "").strip()
            if not content:
                continue

            if role == "assistant":
                # Strip out extensive raw ground-truth telemetry blocks from earlier turns
                cleaned_content = re.sub(
                    r"=== ACTIVE 1Hz MICROGRID TELEMETRY.*?===",
                    "",
                    content,
                    flags=re.DOTALL
                ).strip()
                # Clean repetitive physics engine disclaimers
                cleaned_content = re.sub(
                    r"\*\(Note: Standby.*?\)\*",
                    "",
                    cleaned_content
                ).strip()
                sanitized.append({"role": "assistant", "content": cleaned_content or content})
            else:
                sanitized.append({"role": "user", "content": content})

        return sanitized


working_memory = WorkingMemory()
