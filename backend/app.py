from pathlib import Path
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from backend.database import fetch_predictions, init_db, save_prediction
from model.inference import predict_from_payload
from model.train import train_and_save_model

app = Flask(__name__)
CORS(app)

DATASET_PATH = PROJECT_ROOT / "data" / "loan_approval_dataset.csv"
MODEL_PATH = PROJECT_ROOT / "model" / "loan_model.pkl"
METRICS_PATH = PROJECT_ROOT / "model" / "training_metrics.json"

REQUIRED_FIELDS = [
    "no_of_dependents",
    "education",
    "self_employed",
    "income_annum",
    "loan_amount",
    "loan_term",
    "cibil_score",
    "residential_assets_value",
    "commercial_assets_value",
    "luxury_assets_value",
    "bank_asset_value",
]

# Ensure DB schema exists whether app is started via `python app.py` or `flask run`.
init_db()


@app.route("/", methods=["GET"])
def index() -> tuple:
    return (
        jsonify(
            {
                "message": "Loan Approval Prediction API is running.",
                "available_endpoints": [
                    "GET /health",
                    "POST /train",
                    "POST /predict",
                    "GET /history",
                    "GET /stats",
                ],
            }
        ),
        200,
    )


@app.route("/health", methods=["GET"])
def health() -> tuple:
    return jsonify({"status": "ok"}), 200


@app.route("/train", methods=["POST"])
def train() -> tuple:
    payload = request.get_json(silent=True) or {}
    test_size = float(payload.get("test_size", 0.2))

    try:
        result = train_and_save_model(
            dataset_path=DATASET_PATH,
            model_path=MODEL_PATH,
            metrics_path=METRICS_PATH,
            test_size=test_size,
        )
        return jsonify({"status": "completed", **result}), 200
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"error": str(exc)}), 500


@app.route("/predict", methods=["POST"])
def predict() -> tuple:
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "JSON body is required."}), 400

    missing = [field for field in REQUIRED_FIELDS if field not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        result = predict_from_payload(payload, model_path=MODEL_PATH)
        record_id = save_prediction(payload, result)
        return jsonify({"id": record_id, **result}), 200
    except FileNotFoundError:
        try:
            train_and_save_model(
                dataset_path=DATASET_PATH,
                model_path=MODEL_PATH,
                metrics_path=METRICS_PATH,
                test_size=0.2,
            )
            result = predict_from_payload(payload, model_path=MODEL_PATH)
            record_id = save_prediction(payload, result)
            return jsonify({"id": record_id, **result, "note": "Model auto-trained before prediction."}), 200
        except Exception as exc:  # pylint: disable=broad-except
            return jsonify({"error": f"Model not found and auto-train failed: {exc}"}), 500
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"error": str(exc)}), 500


@app.route("/history", methods=["GET"])
def history() -> tuple:
    try:
        decision = request.args.get("decision")
        limit = int(request.args.get("limit", 100))
        rows = fetch_predictions(decision=decision, limit=limit)
        return jsonify({"count": len(rows), "items": rows}), 200
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"error": str(exc)}), 500


@app.route("/stats", methods=["GET"])
def stats() -> tuple:
    try:
        rows = fetch_predictions(limit=5000)

        total = len(rows)
        approved_count = sum(1 for row in rows if row["prediction"] == "Approved")
        rejected_count = sum(1 for row in rows if row["prediction"] == "Rejected")

        loan_amounts = [float(row["input_payload"].get("loan_amount", 0) or 0) for row in rows]
        average_loan_amount = (sum(loan_amounts) / total) if total else 0.0

        risk_frequency = {}
        for row in rows:
            for factor in row.get("risk_factors", []):
                risk_frequency[factor] = risk_frequency.get(factor, 0) + 1

        loan_distribution = [
            {
                "label": "0-5M",
                "count": sum(1 for v in loan_amounts if 0 <= v < 5_000_000),
            },
            {
                "label": "5M-10M",
                "count": sum(1 for v in loan_amounts if 5_000_000 <= v < 10_000_000),
            },
            {
                "label": "10M-20M",
                "count": sum(1 for v in loan_amounts if 10_000_000 <= v < 20_000_000),
            },
            {
                "label": "20M+",
                "count": sum(1 for v in loan_amounts if v >= 20_000_000),
            },
        ]

        feature_importance_summary = []
        if MODEL_PATH.exists():
            import joblib

            artifact = joblib.load(MODEL_PATH)
            feature_importance_summary = artifact.get("feature_importance", [])[:10]

        return (
            jsonify(
                {
                    "total_predictions": total,
                    "approval_count": approved_count,
                    "rejection_count": rejected_count,
                    "average_loan_amount": average_loan_amount,
                    "approval_vs_rejection": [
                        {"name": "Approved", "value": approved_count},
                        {"name": "Rejected", "value": rejected_count},
                    ],
                    "loan_amount_distribution": loan_distribution,
                    "risk_factor_frequency": [
                        {"factor": k, "count": v}
                        for k, v in sorted(
                            risk_frequency.items(),
                            key=lambda item: item[1],
                            reverse=True,
                        )[:10]
                    ],
                    "feature_importance_summary": feature_importance_summary,
                    "recent_predictions": rows[:10],
                }
            ),
            200,
        )
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
