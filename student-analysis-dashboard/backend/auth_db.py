import sqlite3
import os
import datetime
from typing import Optional, Dict, Any
import bcrypt
import jwt

# Database path resolution - stored in backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.getenv("AUTH_DB_PATH", os.path.join(BASE_DIR, "users.db"))

JWT_SECRET = os.getenv("JWT_SECRET", "bit-academic-intelligence-key-secret-2026-auth")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

def get_connection():
    """Returns a connection to the SQLite database with row_factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Securely hash a password using bcrypt with salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def init_db(db_path: Optional[str] = None):
    """
    Auto-creates the SQLite database and necessary tables if they do not exist.
    Pre-populates default academic accounts for instant evaluation.
    """
    global DB_PATH
    if db_path:
        DB_PATH = db_path
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            role TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)
    
    # 2. Security / Auth audit logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS auth_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            event_type TEXT NOT NULL,
            status TEXT NOT NULL,
            ip_address TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    
    # Check if default institutional accounts exist, if not seed them
    cursor.execute("SELECT COUNT(*) as count FROM users")
    count = cursor.fetchone()["count"]
    
    if count == 0:
        default_users = [
            (
                "admin@bit.edu",
                "Dr. Ramesh Sakthivel",
                "Academic Administration",
                "Dean / Administrator",
                hash_password("Admin@1234")
            ),
            (
                "hod.cs@bit.edu",
                "Dr. S. K. Sharma",
                "Computer Science & Engineering",
                "Head of Department (HOD)",
                hash_password("Hod@1234")
            ),
            (
                "faculty@bit.edu",
                "Prof. A. Priya",
                "Information Technology",
                "Assistant Professor",
                hash_password("Faculty@1234")
            ),
            (
                "advisor.ad@bit.edu",
                "Dr. K. Balaji",
                "Artificial Intelligence & Data Science",
                "Academic Advisor",
                hash_password("Advisor@1234")
            )
        ]
        
        cursor.executemany("""
            INSERT INTO users (email, full_name, department, role, hashed_password)
            VALUES (?, ?, ?, ?, ?)
        """, default_users)
        conn.commit()
        print(f"[*] SQLite database initialized at '{DB_PATH}' with {len(default_users)} institutional seed accounts.")
    else:
        print(f"[*] SQLite database connected at '{DB_PATH}'. Total registered users: {count}.")
        
    conn.close()

def log_auth_event(email: str, event_type: str, status: str, ip_address: Optional[str] = None):
    """Logs an authentication attempt or state change."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO auth_audit (email, event_type, status, ip_address) VALUES (?, ?, ?, ?)",
            (email, event_type, status, ip_address)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[!] Warning: Failed to write auth audit event: {e}")

def create_user(email: str, full_name: str, department: str, role: str, password: str) -> Dict[str, Any]:
    """Creates a new user with securely hashed password."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check uniqueness
    cursor.execute("SELECT id FROM users WHERE email = ?", (email.strip().lower(),))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An account with this email address already exists.")
        
    hashed_pwd = hash_password(password)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("""
        INSERT INTO users (email, full_name, department, role, hashed_password, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (email.strip().lower(), full_name.strip(), department.strip(), role.strip(), hashed_pwd, now))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    log_auth_event(email, "REGISTER", "SUCCESS")
    
    return {
        "id": user_id,
        "email": email.strip().lower(),
        "full_name": full_name.strip(),
        "department": department.strip(),
        "role": role.strip(),
        "created_at": now
    }

def authenticate_user(email: str, password: str, ip_address: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Validates user credentials against SQLite and returns user dict on success."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        log_auth_event(email, "LOGIN", "FAILED_USER_NOT_FOUND", ip_address)
        return None
        
    if not verify_password(password, row["hashed_password"]):
        conn.close()
        log_auth_event(email, "LOGIN", "FAILED_INVALID_PASSWORD", ip_address)
        return None
        
    # Update last login
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, row["id"]))
    conn.commit()
    
    user_dict = {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "department": row["department"],
        "role": row["role"],
        "is_active": bool(row["is_active"]),
        "created_at": row["created_at"],
        "last_login": now
    }
    conn.close()
    
    log_auth_event(email, "LOGIN", "SUCCESS", ip_address)
    return user_dict

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user by email."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, department, role, is_active, created_at, last_login FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a user by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, department, role, is_active, created_at, last_login FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

if __name__ == "__main__":
    init_db()

