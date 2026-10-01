import time
from datetime import datetime, timezone
from typing import List, Dict, Any
from collections import deque

# Max 200 recent logs stored in memory ring buffer
_logs = deque(maxlen=200)


def log_event(function_name: str, duration_ms: float, status: str = "SUCCESS", details: Dict[str, Any] = None):
    """Record a function execution event for developer telemetry."""
    entry = {
        "id": len(_logs) + 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "function_name": function_name,
        "duration_ms": round(duration_ms, 2),
        "status": status,
        "details": details or {},
    }
    _logs.appendleft(entry)
    return entry


def get_recent_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Return recent telemetry logs."""
    return list(_logs)[:limit]


def clear_logs():
    """Clear telemetry logs."""
    _logs.clear()
