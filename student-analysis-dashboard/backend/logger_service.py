import os
import json
import uuid
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE_PATH = os.path.join(BASE_DIR, "data", "ai_query_logs.json")
MAX_LOG_ENTRIES = 200

_log_lock = threading.Lock()
_in_memory_logs: List[Dict[str, Any]] = []

def _load_logs_from_disk() -> List[Dict[str, Any]]:
    """Loads stored logs from JSON file on disk."""
    if not os.path.exists(LOG_FILE_PATH):
        return []
    try:
        with open(LOG_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception as e:
        print(f"[AI Logger] Warning: Could not read {LOG_FILE_PATH}: {e}")
    return []

def _save_logs_to_disk(logs: List[Dict[str, Any]]):
    """Saves logs array to JSON file on disk."""
    try:
        os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)
        with open(LOG_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[AI Logger] Error saving logs to {LOG_FILE_PATH}: {e}")

# Initialize in-memory logs on startup
with _log_lock:
    _in_memory_logs = _load_logs_from_disk()

def add_ai_log_entry(
    question: str,
    mode: str,
    status: str,
    answer: str,
    model_used: str,
    intent: str = "database_query",
    raw_groq_prompt: Optional[str] = None,
    raw_groq_response: Optional[str] = None,
    query_plan: Optional[Dict[str, Any]] = None,
    graph_specification: Optional[Dict[str, Any]] = None,
    query_executed: bool = False,
    rows_count: int = 0,
    data_snippet: Optional[List[Dict[str, Any]]] = None,
    columns: Optional[List[str]] = None,
    execution_time_ms: int = 0,
    error: Optional[str] = None,
    error_stage: Optional[str] = None,
    error_type: Optional[str] = None,
    debug_info: Optional[Dict[str, Any]] = None,
    key_used: Optional[str] = None,
    failover_log: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Records a complete audit log entry of an AI query and response."""
    log_id = f"log_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    entry = {
        "id": log_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "question": question,
        "mode": mode,
        "status": status,
        "modelUsed": model_used,
        "keyUsed": key_used,
        "failoverLog": failover_log or [],
        "intent": intent,
        "answer": answer,
        "rawGroqPrompt": raw_groq_prompt,
        "rawGroqResponse": raw_groq_response,
        "queryPlan": query_plan,
        "graphSpecification": graph_specification,
        "queryExecuted": query_executed,
        "rowsCount": rows_count,
        "dataSnippet": data_snippet or [],
        "columns": columns or [],
        "executionTimeMs": execution_time_ms,
        "error": error,
        "errorStage": error_stage,
        "errorType": error_type,
        "debugInfo": debug_info
    }

    with _log_lock:
        global _in_memory_logs
        _in_memory_logs.insert(0, entry)  # Prepend newest first
        if len(_in_memory_logs) > MAX_LOG_ENTRIES:
            _in_memory_logs = _in_memory_logs[:MAX_LOG_ENTRIES]
        _save_logs_to_disk(_in_memory_logs)

    return entry

def get_ai_logs(
    limit: int = 50,
    status: Optional[str] = None,
    mode: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieves filtered AI interaction audit logs."""
    with _log_lock:
        results = list(_in_memory_logs)

    if status and status.lower() != "all":
        results = [l for l in results if l.get("status", "").lower() == status.lower()]

    if mode and mode.lower() != "all":
        results = [l for l in results if l.get("mode", "").lower() == mode.lower()]

    if search and search.strip():
        q = search.strip().lower()
        results = [
            l for l in results
            if q in l.get("question", "").lower()
            or q in l.get("answer", "").lower()
            or q in str(l.get("rawGroqResponse", "")).lower()
            or q in str(l.get("error", "")).lower()
            or q in l.get("modelUsed", "").lower()
        ]

    return results[:limit]

def get_ai_log_by_id(log_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single detailed log entry by its ID."""
    with _log_lock:
        for entry in _in_memory_logs:
            if entry.get("id") == log_id:
                return entry
    return None

def clear_ai_logs() -> bool:
    """Clears all audit logs in memory and on disk."""
    with _log_lock:
        global _in_memory_logs
        _in_memory_logs = []
        _save_logs_to_disk([])
    return True

def get_ai_logs_stats() -> Dict[str, Any]:
    """Calculates summary statistics across all logged queries."""
    with _log_lock:
        logs = list(_in_memory_logs)

    total = len(logs)
    if total == 0:
        return {
            "totalQueries": 0,
            "successCount": 0,
            "errorCount": 0,
            "successRate": 100.0,
            "avgExecutionTimeMs": 0,
            "lastQueryTime": None
        }

    successes = sum(1 for l in logs if l.get("status") == "success")
    errors = total - successes
    latencies = [l.get("executionTimeMs", 0) for l in logs if l.get("executionTimeMs")]
    avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0

    return {
        "totalQueries": total,
        "successCount": successes,
        "errorCount": errors,
        "successRate": round((successes / total) * 100.0, 1),
        "avgExecutionTimeMs": avg_latency,
        "lastQueryTime": logs[0].get("timestamp") if logs else None
    }
