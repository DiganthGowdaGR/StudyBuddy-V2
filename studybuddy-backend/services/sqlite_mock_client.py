import sqlite3
import os
import uuid
import json
import logging
from datetime import datetime

logger = logging.getLogger("sqlite_mock_client")

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "studybuddy_offline.db"
)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class ExecuteResult:
    def __init__(self, data):
        self.data = data

class QueryBuilder:
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self.action = None  # 'select', 'insert', 'update', 'delete'
        self.payload = None
        self.filters = []  # list of (column, val)
        self.in_filters = []  # list of (column, list_of_vals)
        self.ordering = []  # list of (column, desc)
        self._limit = None
        self._single = False
        self.columns = "*"

    def select(self, columns="*"):
        self.action = "select"
        self.columns = columns
        return self

    def insert(self, payload):
        self.action = "insert"
        self.payload = payload
        return self

    def update(self, payload):
        self.action = "update"
        self.payload = payload
        return self

    def delete(self):
        self.action = "delete"
        return self

    def eq(self, column, value):
        self.filters.append((column, value))
        return self

    def in_(self, column, values):
        self.in_filters.append((column, values))
        return self

    def order(self, column, desc=False):
        self.ordering.append((column, desc))
        return self

    def limit(self, limit):
        self._limit = limit
        return self

    def single(self):
        self._single = True
        return self

    def execute(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            if self.action == "insert":
                return self._execute_insert(conn, cursor)
            elif self.action == "update":
                return self._execute_update(conn, cursor)
            elif self.action == "delete":
                return self._execute_delete(conn, cursor)
            else:  # select
                return self._execute_select(conn, cursor)
        finally:
            conn.close()

    def _execute_insert(self, conn, cursor):
        payloads = self.payload if isinstance(self.payload, list) else [self.payload]
        inserted_rows = []

        for item in payloads:
            row_data = dict(item)
            if "id" not in row_data:
                row_data["id"] = str(uuid.uuid4())
            
            # Default timestamps
            now_iso = datetime.utcnow().isoformat()
            if self.table_name == "documents" and "upload_time" not in row_data:
                row_data["upload_time"] = now_iso
            elif self.table_name in ["org_members", "subject_enrollments"]:
                if "requested_at" not in row_data:
                    row_data["requested_at"] = now_iso
                if self.table_name == "subject_enrollments" and "enrolled_at" not in row_data:
                    row_data["enrolled_at"] = now_iso
                if "status" not in row_data:
                    row_data["status"] = "pending"
            elif "created_at" not in row_data:
                row_data["created_at"] = now_iso

            keys = list(row_data.keys())
            values = []
            for k in keys:
                val = row_data[k]
                if isinstance(val, list) or isinstance(val, dict):
                    val = json.dumps(val)
                elif isinstance(val, bool):
                    val = 1 if val else 0
                values.append(val)

            sql = f"INSERT INTO {self.table_name} ({', '.join(keys)}) VALUES ({', '.join(['?']*len(keys))})"
            cursor.execute(sql, values)
            
            # Fetch inserted row
            cursor.execute(f"SELECT * FROM {self.table_name} WHERE id = ?", (row_data["id"],))
            inserted = cursor.fetchone()
            if inserted:
                inserted_rows.append(self._postprocess_row(inserted))

        conn.commit()
        return ExecuteResult(inserted_rows if isinstance(self.payload, list) else inserted_rows)

    def _execute_update(self, conn, cursor):
        set_clauses = []
        params = []

        for k, val in self.payload.items():
            if isinstance(val, list) or isinstance(val, dict):
                val = json.dumps(val)
            elif isinstance(val, bool):
                val = 1 if val else 0
            set_clauses.append(f"{k} = ?")
            params.append(val)

        sql = f"UPDATE {self.table_name} SET {', '.join(set_clauses)}"

        where_clauses = []
        for col, val in self.filters:
            where_clauses.append(f"{col} = ?")
            params.append(val)

        for col, vals in self.in_filters:
            if vals:
                placeholders = ", ".join(["?"] * len(vals))
                where_clauses.append(f"{col} IN ({placeholders})")
                params.extend(vals)

        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)

        cursor.execute(sql, params)
        conn.commit()

        # Fetch affected rows to return
        select_sql = f"SELECT * FROM {self.table_name}"
        select_params = []
        select_where = []
        for col, val in self.filters:
            select_where.append(f"{col} = ?")
            select_params.append(val)
        for col, vals in self.in_filters:
            if vals:
                placeholders = ", ".join(["?"] * len(vals))
                select_where.append(f"{col} IN ({placeholders})")
                select_params.extend(vals)
        if select_where:
            select_sql += " WHERE " + " AND ".join(select_where)

        cursor.execute(select_sql, select_params)
        rows = cursor.fetchall()
        updated_rows = [self._postprocess_row(r) for r in rows]
        return ExecuteResult(updated_rows)

    def _execute_delete(self, conn, cursor):
        # Fetch matching rows first before deleting so we can return them
        select_sql = f"SELECT * FROM {self.table_name}"
        select_params = []
        select_where = []
        for col, val in self.filters:
            select_where.append(f"{col} = ?")
            select_params.append(val)
        for col, vals in self.in_filters:
            if vals:
                placeholders = ", ".join(["?"] * len(vals))
                select_where.append(f"{col} IN ({placeholders})")
                select_params.extend(vals)
        if select_where:
            select_sql += " WHERE " + " AND ".join(select_where)

        cursor.execute(select_sql, select_params)
        rows = cursor.fetchall()
        deleted_rows = [self._postprocess_row(r) for r in rows]

        # Perform deletion
        delete_sql = f"DELETE FROM {self.table_name}"
        if select_where:
            delete_sql += " WHERE " + " AND ".join(select_where)
        cursor.execute(delete_sql, select_params)
        conn.commit()

        return ExecuteResult(deleted_rows)

    def _execute_select(self, conn, cursor):
        sql = f"SELECT * FROM {self.table_name}"
        params = []
        where_clauses = []

        for col, val in self.filters:
            where_clauses.append(f"{col} = ?")
            params.append(val)

        for col, vals in self.in_filters:
            if vals:
                placeholders = ", ".join(["?"] * len(vals))
                where_clauses.append(f"{col} IN ({placeholders})")
                params.extend(vals)
            else:
                where_clauses.append("0 = 1")

        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)

        if self.ordering:
            order_clauses = []
            for col, desc in self.ordering:
                direction = "DESC" if desc else "ASC"
                order_clauses.append(f"{col} {direction}")
            sql += " ORDER BY " + ", ".join(order_clauses)

        if self._limit is not None:
            sql += f" LIMIT {self._limit}"

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        processed = []
        for r in rows:
            processed.append(self._apply_joins(self._postprocess_row(r)))

        if self._single:
            if not processed:
                raise ValueError("0 rows found (PGRST116)")
            return ExecuteResult(processed[0])
        return ExecuteResult(processed)

    def _postprocess_row(self, row):
        d = dict(row)
        for json_col in ["topics_covered", "goals"]:
            if json_col in d and d[json_col] is not None:
                try:
                    d[json_col] = json.loads(d[json_col])
                except Exception:
                    pass
        if self.table_name == "flashcards" and "mastered" in d:
            d["mastered"] = bool(d["mastered"])
        if self.table_name == "teachers" and "is_active" in d:
            d["is_active"] = bool(d["is_active"])
        return d

    def _apply_joins(self, row):
        select_str = self.columns
        
        if "students(" in select_str:
            student_id = row.get("student_id")
            row["students"] = self._query_single("students", student_id)

        if "organizations(" in select_str:
            org_id = row.get("org_id")
            row["organizations"] = self._query_single("organizations", org_id)

        if "teachers(" in select_str:
            teacher_id = row.get("teacher_id")
            row["teachers"] = self._query_single("teachers", teacher_id)

        if "subjects(" in select_str:
            subject_id = row.get("subject_id")
            sub = self._query_single("subjects", subject_id)
            if sub:
                sub["organizations"] = self._query_single("organizations", sub.get("org_id"))
                sub["teachers"] = self._query_single("teachers", sub.get("teacher_id"))
            row["subjects"] = sub

        if "mcq_questions(" in select_str:
            q_id = row.get("question_id")
            row["mcq_questions"] = self._query_single("mcq_questions", q_id)

        if "written_questions(" in select_str:
            q_id = row.get("question_id")
            row["written_questions"] = self._query_single("written_questions", q_id)

        return row

    def _query_single(self, table_name, item_id):
        if not item_id:
            return None
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (item_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            # Postprocess joined record
            d = dict(row)
            if table_name == "teachers" and "is_active" in d:
                d["is_active"] = bool(d["is_active"])
            return d
        return None

class MockSupabaseClient:
    def __init__(self):
        self.db_path = DB_PATH
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            filename TEXT,
            summary TEXT,
            upload_time TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            topics_covered TEXT,
            goals TEXT,
            duration_mins INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            question TEXT,
            answer TEXT,
            source TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS flashcards (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            subject TEXT,
            question TEXT,
            answer TEXT,
            mastered INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS flashcard_review_days (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            review_date TEXT,
            review_count INTEGER,
            created_at TEXT,
            UNIQUE(student_id, review_date)
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS schedule_events (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            title TEXT,
            subject TEXT,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            priority TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS emotion_logs (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            emotion TEXT,
            confidence REAL,
            session_date TEXT,
            detected_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            name TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS workspace_documents (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            workspace_id TEXT,
            document_id TEXT,
            created_at TEXT,
            UNIQUE(workspace_id, document_id)
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            invite_code TEXT UNIQUE,
            admin_email TEXT,
            password_hash TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            full_name TEXT,
            org_id TEXT,
            is_active INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            org_id TEXT,
            teacher_id TEXT,
            name TEXT,
            subject_code TEXT UNIQUE,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS org_members (
            id TEXT PRIMARY KEY,
            org_id TEXT,
            student_id TEXT,
            status TEXT,
            requested_at TEXT,
            reviewed_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS subject_enrollments (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            student_id TEXT,
            status TEXT,
            requested_at TEXT,
            reviewed_at TEXT,
            enrolled_at TEXT,
            UNIQUE(subject_id, student_id)
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            teacher_id TEXT,
            title TEXT,
            body TEXT,
            tag TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS assignments (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            teacher_id TEXT,
            title TEXT,
            description TEXT,
            due_date TEXT,
            max_score INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS exams (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            teacher_id TEXT,
            title TEXT,
            description TEXT,
            exam_type TEXT,
            duration_mins INTEGER,
            total_marks INTEGER,
            status TEXT DEFAULT 'draft',
            closes_at TEXT,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS mcq_questions (
            id TEXT PRIMARY KEY,
            exam_id TEXT,
            question_text TEXT,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            correct_option TEXT,
            marks INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS written_questions (
            id TEXT PRIMARY KEY,
            exam_id TEXT,
            question_text TEXT,
            max_marks INTEGER,
            created_at TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS exam_submissions (
            id TEXT PRIMARY KEY,
            exam_id TEXT,
            student_id TEXT,
            submitted_at TEXT,
            total_score REAL,
            status TEXT DEFAULT 'submitted',
            teacher_remarks TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS mcq_answers (
            id TEXT PRIMARY KEY,
            submission_id TEXT,
            question_id TEXT,
            selected_option TEXT,
            is_correct INTEGER,
            marks_awarded REAL
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS written_answers (
            id TEXT PRIMARY KEY,
            submission_id TEXT,
            question_id TEXT,
            answer_text TEXT,
            marks_awarded REAL,
            ai_suggested_score REAL,
            teacher_feedback TEXT,
            evaluated INTEGER
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            id TEXT PRIMARY KEY,
            exam_id TEXT,
            subject_id TEXT,
            student_id TEXT,
            student_name TEXT,
            total_score REAL,
            rank INTEGER,
            updated_at TEXT
        )
        """)
        
        # Insert default demo records for offline testing
        import hashlib
        def hash_pwd(p):
            return hashlib.sha256(p.encode()).hexdigest()

        # Check and insert Demo Organization
        c.execute("SELECT 1 FROM organizations WHERE id = 'default-org-uuid'")
        if not c.fetchone():
            c.execute("""
            INSERT INTO organizations (id, name, description, invite_code, admin_email, password_hash, created_at)
            VALUES ('default-org-uuid', 'Demo University', 'Global demonstration campus', 'DEMO123', 'admin@demo.edu', ?, ?)
            """, (hash_pwd("admin123"), datetime.utcnow().isoformat()))

        # Check and insert Demo Teacher
        c.execute("SELECT 1 FROM teachers WHERE id = 'default-teacher-uuid'")
        if not c.fetchone():
            c.execute("""
            INSERT INTO teachers (id, email, password_hash, full_name, org_id, is_active, created_at)
            VALUES ('default-teacher-uuid', 'teacher@demo.edu', ?, 'Professor Sharath', 'default-org-uuid', 1, ?)
            """, (hash_pwd("teacher123"), datetime.utcnow().isoformat()))

        # Check and insert Demo Subject (class)
        c.execute("SELECT 1 FROM subjects WHERE id = 'default-subject-uuid'")
        if not c.fetchone():
            c.execute("""
            INSERT INTO subjects (id, org_id, teacher_id, name, subject_code, created_at)
            VALUES ('default-subject-uuid', 'default-org-uuid', 'default-teacher-uuid', 'Introduction to AI', 'AI101', ?)
            """, (datetime.utcnow().isoformat(),))
            
        conn.commit()
        conn.close()

    def table(self, table_name):
        return QueryBuilder(self, table_name)
