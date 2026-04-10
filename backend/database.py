import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = PROJECT_ROOT / "backend" / "predictions.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_payload TEXT NOT NULL,
                prediction TEXT NOT NULL,
                approved_probability REAL NOT NULL,
                rejected_probability REAL NOT NULL,
                confidence REAL NOT NULL,
                risk_factors TEXT NOT NULL,
                model_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def save_prediction(input_payload: Dict[str, Any], result: Dict[str, Any]) -> int:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO predictions (
                input_payload,
                prediction,
                approved_probability,
                rejected_probability,
                confidence,
                risk_factors,
                model_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                json.dumps(input_payload),
                result["prediction"],
                float(result["probability"]["approved"]),
                float(result["probability"]["rejected"]),
                float(result["confidence"]),
                json.dumps(result["risk_factors"]),
                result.get("model_name", "unknown"),
            ),
        )
        conn.commit()
        return int(cur.lastrowid)


def fetch_predictions(decision: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    query = """
        SELECT
            id,
            input_payload,
            prediction,
            approved_probability,
            rejected_probability,
            confidence,
            risk_factors,
            model_name,
            created_at
        FROM predictions
    """
    params: List[Any] = []

    if decision:
        query += " WHERE prediction = ?"
        params.append(decision)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    with get_connection() as conn:
        rows = conn.execute(query, tuple(params)).fetchall()

    results: List[Dict[str, Any]] = []
    for row in rows:
        payload = json.loads(row["input_payload"])
        risks = json.loads(row["risk_factors"])
        results.append(
            {
                "id": row["id"],
                "input_payload": payload,
                "prediction": row["prediction"],
                "approved_probability": row["approved_probability"],
                "rejected_probability": row["rejected_probability"],
                "confidence": row["confidence"],
                "risk_factors": risks,
                "model_name": row["model_name"],
                "created_at": row["created_at"],
            }
        )

    return results
