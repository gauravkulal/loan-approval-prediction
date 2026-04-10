import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "loan_approval_dataset.csv"
DEFAULT_MODEL_PATH = PROJECT_ROOT / "model" / "loan_model.pkl"
DEFAULT_METRICS_PATH = PROJECT_ROOT / "model" / "training_metrics.json"

TARGET_COLUMN = "loan_status"
DROP_COLUMNS = ["loan_id"]

NUMERIC_FEATURES = [
    "no_of_dependents",
    "income_annum",
    "loan_amount",
    "loan_term",
    "cibil_score",
    "residential_assets_value",
    "commercial_assets_value",
    "luxury_assets_value",
    "bank_asset_value",
]

CATEGORICAL_FEATURES = ["education", "self_employed"]

FEATURE_ORDER = [
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


def _normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.strip() for c in df.columns]

    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def _clip_outliers_iqr(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    clipped = df.copy()
    for col in columns:
        if col not in clipped.columns:
            continue
        q1 = clipped[col].quantile(0.25)
        q3 = clipped[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        clipped[col] = clipped[col].clip(lower, upper)
    return clipped


def _prepare_target(series: pd.Series) -> pd.Series:
    normalized = series.astype(str).str.strip().str.lower()
    mapped = normalized.map({"approved": 1, "rejected": 0})

    if mapped.isna().any():
        unique = sorted(normalized.dropna().unique().tolist())
        if len(unique) != 2:
            raise ValueError(
                "Target column must contain exactly 2 classes for binary classification."
            )
        mapping = {unique[0]: 0, unique[1]: 1}
        mapped = normalized.map(mapping)

    return mapped.astype(int)


def _build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )


def _build_models() -> Dict[str, Any]:
    return {
        "logistic_regression": LogisticRegression(max_iter=1500, random_state=42),
        "decision_tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=300, random_state=42),
    }


def _extract_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    return preprocessor.get_feature_names_out().tolist()


def _feature_importance(model: Any, feature_names: List[str]) -> List[Dict[str, float]]:
    if hasattr(model, "feature_importances_"):
        values = model.feature_importances_
    elif hasattr(model, "coef_"):
        values = np.abs(model.coef_[0])
    else:
        values = np.zeros(len(feature_names))

    ranked = sorted(
        [{"feature": name, "importance": float(val)} for name, val in zip(feature_names, values)],
        key=lambda x: x["importance"],
        reverse=True,
    )
    return ranked


def _fit_and_score(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> Tuple[Pipeline, Dict[str, Dict[str, Any]], str]:
    models = _build_models()
    preprocessor = _build_preprocessor()

    results: Dict[str, Dict[str, Any]] = {}
    best_name = ""
    best_score = -1.0
    best_pipeline: Pipeline | None = None

    for model_name, estimator in models.items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", estimator),
            ]
        )
        pipeline.fit(X_train, y_train)
        pred = pipeline.predict(X_test)

        accuracy = accuracy_score(y_test, pred)
        report = classification_report(y_test, pred, output_dict=True)

        results[model_name] = {
            "accuracy": float(accuracy),
            "classification_report": report,
        }

        if accuracy > best_score:
            best_score = float(accuracy)
            best_name = model_name
            best_pipeline = pipeline

    if best_pipeline is None:
        raise RuntimeError("Failed to train any model.")

    return best_pipeline, results, best_name


def _training_stats(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    stats: Dict[str, Dict[str, float]] = {}
    for col in NUMERIC_FEATURES:
        series = pd.to_numeric(df[col], errors="coerce")
        stats[col] = {
            "q1": float(series.quantile(0.25)),
            "median": float(series.quantile(0.50)),
            "q3": float(series.quantile(0.75)),
        }
    return stats


def train_and_save_model(
    dataset_path: Path = DEFAULT_DATASET_PATH,
    model_path: Path = DEFAULT_MODEL_PATH,
    metrics_path: Path = DEFAULT_METRICS_PATH,
    test_size: float = 0.2,
) -> Dict[str, Any]:
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    raw_df = pd.read_csv(dataset_path)
    df = _normalize_dataframe(raw_df)

    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Target column '{TARGET_COLUMN}' missing from dataset.")

    for col in DROP_COLUMNS:
        if col in df.columns:
            df = df.drop(columns=[col])

    df = _clip_outliers_iqr(df, NUMERIC_FEATURES)

    y = _prepare_target(df[TARGET_COLUMN])
    X = df.drop(columns=[TARGET_COLUMN])
    X = X[FEATURE_ORDER]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=42,
        stratify=y,
    )

    best_pipeline, all_results, best_name = _fit_and_score(X_train, X_test, y_train, y_test)

    preprocessor: ColumnTransformer = best_pipeline.named_steps["preprocessor"]
    model = best_pipeline.named_steps["model"]
    feature_names = _extract_feature_names(preprocessor)
    importances = _feature_importance(model, feature_names)

    artifact = {
        "pipeline": best_pipeline,
        "best_model_name": best_name,
        "feature_order": FEATURE_ORDER,
        "feature_importance": importances,
        "numeric_stats": _training_stats(df),
        "target_mapping": {"rejected": 0, "approved": 1},
        "metrics": all_results,
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, model_path)

    metrics_payload = {
        "best_model": best_name,
        "all_models": all_results,
    }
    metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    return {
        "model_path": str(model_path),
        "metrics_path": str(metrics_path),
        "best_model": best_name,
        "all_models": all_results,
        "top_feature_importance": importances[:10],
    }


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train loan approval model")
    parser.add_argument(
        "--dataset",
        type=str,
        default=str(DEFAULT_DATASET_PATH),
        help="Path to CSV dataset",
    )
    parser.add_argument(
        "--model-output",
        type=str,
        default=str(DEFAULT_MODEL_PATH),
        help="Path to output model pkl",
    )
    parser.add_argument(
        "--metrics-output",
        type=str,
        default=str(DEFAULT_METRICS_PATH),
        help="Path to output metrics json",
    )
    parser.add_argument(
        "--test-size",
        type=float,
        default=0.2,
        help="Test split ratio",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    result = train_and_save_model(
        dataset_path=Path(args.dataset),
        model_path=Path(args.model_output),
        metrics_path=Path(args.metrics_output),
        test_size=args.test_size,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
