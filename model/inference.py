from pathlib import Path
from typing import Any, Dict, List

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = PROJECT_ROOT / "model" / "loan_model.pkl"


def load_artifact(model_path: Path = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}")
    return joblib.load(model_path)


def _normalize_input(payload: Dict[str, Any], feature_order: List[str]) -> pd.DataFrame:
    missing = [f for f in feature_order if f not in payload]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    row: Dict[str, Any] = {}
    for f in feature_order:
        value = payload.get(f)
        if f in {"education", "self_employed"}:
            row[f] = str(value).strip()
        else:
            row[f] = value

    # Canonicalize known categories.
    row["education"] = "Graduate" if str(row["education"]).lower() in {"1", "graduate", "yes"} else "Not Graduate"
    row["self_employed"] = "Yes" if str(row["self_employed"]).lower() in {"1", "yes", "true"} else "No"

    return pd.DataFrame([row], columns=feature_order)


def _risk_from_stats(
    payload: Dict[str, Any],
    numeric_stats: Dict[str, Dict[str, float]],
    sorted_importance: List[Dict[str, float]],
) -> List[str]:
    factors: List[str] = []

    for item in sorted_importance[:5]:
        feature_name = item["feature"].split("__")[-1]
        if feature_name not in payload:
            continue

        if feature_name in numeric_stats:
            val = float(payload[feature_name])
            q1 = numeric_stats[feature_name]["q1"]
            q3 = numeric_stats[feature_name]["q3"]
            if feature_name == "cibil_score" and val < q1:
                factors.append(f"Low CIBIL score ({int(val)}) increases rejection risk.")
            elif feature_name in {"loan_amount", "loan_term", "no_of_dependents"} and val > q3:
                factors.append(f"High {feature_name} ({val}) may increase repayment risk.")
            elif feature_name in {"income_annum", "bank_asset_value", "commercial_assets_value", "residential_assets_value"} and val < q1:
                factors.append(f"Lower {feature_name} ({val}) reduces financial strength.")

    if not factors:
        factors.append("No high-risk signals detected from top model features.")

    return factors


def predict_from_payload(payload: Dict[str, Any], model_path: Path = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    artifact = load_artifact(model_path)

    pipeline = artifact["pipeline"]
    feature_order = artifact["feature_order"]
    feature_importance = artifact["feature_importance"]

    df = _normalize_input(payload, feature_order)

    pred = int(pipeline.predict(df)[0])
    proba = pipeline.predict_proba(df)[0].tolist()

    decision = "Approved" if pred == 1 else "Rejected"

    risk_factors = _risk_from_stats(payload, artifact.get("numeric_stats", {}), feature_importance)

    return {
        "prediction": decision,
        "probability": {
            "rejected": float(proba[0]),
            "approved": float(proba[1]),
        },
        "confidence": float(max(proba)),
        "risk_factors": risk_factors,
        "top_feature_importance": feature_importance[:8],
        "model_name": artifact.get("best_model_name", "unknown"),
    }
