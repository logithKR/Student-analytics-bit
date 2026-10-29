"""
Academic Intelligence — AI Conversation History & State Persistence Service
Stores and manages conversation sessions, messages, and analytical context in SQLite.
"""

import sqlite3
import os
import json
import uuid
import datetime
from typing import Optional, Dict, Any, List

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.getenv("AUTH_DB_PATH", os.path.join(BASE_DIR, "users.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_conversation_tables():
    """Initializes tables for conversation sessions and messages."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                title TEXT NOT NULL,
                last_department TEXT,
                last_context TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                meta TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id)")
        conn.commit()
    finally:
        conn.close()

def create_conversation(user_id: Optional[int] = None, title: str = "New Academic Chat", conversation_id: Optional[str] = None) -> Dict[str, Any]:
    """Creates a fresh, isolated conversation session."""
    init_conversation_tables()
    conv_id = conversation_id or f"conv-{uuid.uuid4().hex[:12]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO ai_conversations (id, user_id, title, last_department, last_context, created_at, updated_at)
            VALUES (?, ?, ?, NULL, ?, ?, ?)
            """,
            (conv_id, user_id, title, json.dumps({}), now, now)
        )
        conn.commit()
        return {
            "id": conv_id,
            "user_id": user_id,
            "title": title,
            "last_department": None,
            "last_context": {},
            "created_at": now,
            "updated_at": now,
            "message_count": 0
        }
    finally:
        conn.close()

def get_conversation(conversation_id: str, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Fetches a conversation by ID, ensuring user boundary isolation if user_id is provided."""
    init_conversation_tables()
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if user_id is not None:
            cursor.execute("SELECT * FROM ai_conversations WHERE id = ? AND (user_id = ? OR user_id IS NULL)", (conversation_id, user_id))
        else:
            cursor.execute("SELECT * FROM ai_conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        if not row:
            return None
        
        last_ctx = {}
        if row["last_context"]:
            try:
                last_ctx = json.loads(row["last_context"])
            except Exception:
                last_ctx = {}

        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "title": row["title"],
            "last_department": row["last_department"],
            "last_context": last_ctx,
            "created_at": str(row["created_at"]),
            "updated_at": str(row["updated_at"])
        }
    finally:
        conn.close()

def list_conversations(user_id: Optional[int] = None, limit: int = 30) -> List[Dict[str, Any]]:
    """Lists conversations in reverse chronological order."""
    init_conversation_tables()
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if user_id is not None:
            cursor.execute(
                """
                SELECT c.*, COUNT(m.id) as message_count
                FROM ai_conversations c
                LEFT JOIN ai_messages m ON c.id = m.conversation_id
                WHERE (c.user_id = ? OR c.user_id IS NULL)
                GROUP BY c.id
                ORDER BY c.updated_at DESC
                LIMIT ?
                """,
                (user_id, limit)
            )
        else:
            cursor.execute(
                """
                SELECT c.*, COUNT(m.id) as message_count
                FROM ai_conversations c
                LEFT JOIN ai_messages m ON c.id = m.conversation_id
                GROUP BY c.id
                ORDER BY c.updated_at DESC
                LIMIT ?
                """,
                (limit,)
            )
        rows = cursor.fetchall()
        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "user_id": r["user_id"],
                "title": r["title"],
                "last_department": r["last_department"],
                "message_count": r["message_count"],
                "created_at": str(r["created_at"]),
                "updated_at": str(r["updated_at"])
            })
        return results
    finally:
        conn.close()

def update_conversation_context(
    conversation_id: str,
    last_department: Optional[str] = None,
    last_context: Optional[Dict[str, Any]] = None,
    title: Optional[str] = None
) -> bool:
    """Updates the conversation context, department memory, or auto-generated title."""
    init_conversation_tables()
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # Fetch current context to merge
        cursor.execute("SELECT last_department, last_context, title FROM ai_conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        if not row:
            return False

        existing_ctx = {}
        if row["last_context"]:
            try:
                existing_ctx = json.loads(row["last_context"])
            except Exception:
                existing_ctx = {}

        if last_context:
            existing_ctx.update(last_context)

        dept_val = last_department if last_department is not None else row["last_department"]
        title_val = title if title is not None else row["title"]
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        cursor.execute(
            """
            UPDATE ai_conversations
            SET last_department = ?, last_context = ?, title = ?, updated_at = ?
            WHERE id = ?
            """,
            (dept_val, json.dumps(existing_ctx), title_val, now, conversation_id)
        )
        conn.commit()
        return True
    finally:
        conn.close()

def delete_conversation(conversation_id: str, user_id: Optional[int] = None) -> bool:
    """Deletes a conversation and its messages."""
    init_conversation_tables()
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if user_id is not None:
            cursor.execute("DELETE FROM ai_conversations WHERE id = ? AND (user_id = ? OR user_id IS NULL)", (conversation_id, user_id))
        else:
            cursor.execute("DELETE FROM ai_conversations WHERE id = ?", (conversation_id,))
        cursor.execute("DELETE FROM ai_messages WHERE conversation_id = ?", (conversation_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()

def add_conversation_message(
    conversation_id: str,
    role: str,
    content: str,
    meta: Optional[Dict[str, Any]] = None,
    message_id: Optional[str] = None
) -> Dict[str, Any]:
    """Adds a message to the conversation."""
    init_conversation_tables()
    msg_id = message_id or f"msg-{uuid.uuid4().hex[:12]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    meta_json = json.dumps(meta or {})
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # Ensure conversation exists
        cursor.execute("SELECT id, title FROM ai_conversations WHERE id = ?", (conversation_id,))
        conv_row = cursor.fetchone()
        if not conv_row:
            # Auto-create conversation with snippet title if user's first query
            title = content[:36] + "..." if len(content) > 36 else content
            cursor.execute(
                """
                INSERT INTO ai_conversations (id, title, last_department, last_context, created_at, updated_at)
                VALUES (?, ?, NULL, ?, ?, ?)
                """,
                (conversation_id, title if role == 'user' else "Academic Analysis", json.dumps({}), now, now)
            )
        else:
            # If default title and role is user, update title to meaningful user question summary
            if conv_row["title"] in ("New Academic Chat", "New Conversation") and role == "user":
                new_title = content[:38].strip()
                if len(content) > 38:
                    new_title += "..."
                cursor.execute("UPDATE ai_conversations SET title = ?, updated_at = ? WHERE id = ?", (new_title, now, conversation_id))
            else:
                cursor.execute("UPDATE ai_conversations SET updated_at = ? WHERE id = ?", (now, conversation_id))

        cursor.execute(
            """
            INSERT INTO ai_messages (id, conversation_id, role, content, meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (msg_id, conversation_id, role, content, meta_json, now)
        )
        conn.commit()
        return {
            "id": msg_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "meta": meta or {},
            "created_at": now
        }
    finally:
        conn.close()

def get_conversation_messages(conversation_id: str) -> List[Dict[str, Any]]:
    """Retrieves all messages for a conversation strictly in chronological order."""
    init_conversation_tables()
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, conversation_id, role, content, meta, created_at
            FROM ai_messages
            WHERE conversation_id = ?
            ORDER BY rowid ASC
            """,
            (conversation_id,)
        )
        rows = cursor.fetchall()
        messages = []
        for r in rows:
            meta_dict = {}
            if r["meta"]:
                try:
                    meta_dict = json.loads(r["meta"])
                except Exception:
                    meta_dict = {}
            messages.append({
                "id": r["id"],
                "role": r["role"],
                "text": r["content"],
                "content": r["content"],
                "meta": meta_dict,
                "time": str(r["created_at"])[11:16] if len(str(r["created_at"])) >= 16 else "",
                "created_at": str(r["created_at"])
            })
        return messages
    finally:
        conn.close()

