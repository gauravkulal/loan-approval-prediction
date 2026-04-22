import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import matplotlib
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

matplotlib.use("Agg")

# Project paths and default artifact locations.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "loan_approval_dataset.csv"
DEFAULT_MODEL_PATH = PROJECT_ROOT / "model" / "loan_model.pkl"
DEFAULT_METRICS_PATH = PROJECT_ROOT / "model" / "training_metrics.json"
DEFAULT_REPORTS_DIR = PROJECT_ROOT / "model" / "reports"

# Dataset schema configuration.
TARGET_COLUMN = "loan_status"
DROP_COLUMNS = ["loan_id"]

# Feature groups used by the preprocessing pipeline.
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
    """Normalize column names and trim string values for consistent preprocessing."""
    df = df.copy()
    df.columns = [c.strip() for c in df.columns]

    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def _clip_outliers_iqr(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Winsorize numeric outliers per column using the IQR rule."""
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
    """Convert target labels to binary integers expected by sklearn classifiers."""
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
    """Build preprocessing for numeric scaling and categorical one-hot encoding."""
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
    """Define the candidate models to train and compare."""
    return {
        "logistic_regression": LogisticRegression(max_iter=1500, random_state=42),
        "decision_tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=300, random_state=42),
        "xgboost": XGBClassifier(
            objective="binary:logistic",
            eval_metric="logloss",
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            n_jobs=-1,
        ),
    }


def _to_title(name: str) -> str:
    """Convert snake_case model keys into human-readable labels."""
    return name.replace("_", " ").title()


def _render_table(df: pd.DataFrame, title: str, output_path: Path) -> None:
    """Render a dataframe as an image table for report-style viewing."""
    fig_w = max(8, min(18, 2 + len(df.columns) * 1.8))
    fig_h = max(3.6, min(16, 1.6 + len(df) * 0.52))

    fig, ax = plt.subplots(figsize=(fig_w, fig_h))
    ax.axis("off")
    ax.set_title(title, fontsize=12, fontweight="bold", pad=12)

    formatted = df.copy()
    for col in formatted.columns:
        if pd.api.types.is_numeric_dtype(formatted[col]):
            formatted[col] = formatted[col].map(
                lambda x: f"{x:.4f}" if isinstance(x, (float, np.floating)) else x
            )

    table = ax.table(
        cellText=formatted.values,
        colLabels=formatted.columns,
        rowLabels=formatted.index,
        loc="center",
        cellLoc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.28)

    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def _plot_accuracy_comparison(summary_df: pd.DataFrame, output_path: Path) -> None:
    """Create a bar chart comparing model accuracy scores."""
    plot_df = summary_df.sort_values("Accuracy", ascending=False)
    labels = plot_df.index.tolist()
    values = plot_df["Accuracy"].tolist()

    fig, ax = plt.subplots(figsize=(10, 5.6))
    bars = ax.bar(labels, values)
    ax.set_ylim(0, 1.05)
    ax.set_ylabel("Accuracy")
    ax.set_title("Model Accuracy Comparison", fontsize=12, fontweight="bold")
    ax.grid(axis="y", linestyle="--", alpha=0.3)

    for bar, value in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            value + 0.01,
            f"{value:.4f}",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def _plot_confusion_matrix(
    model_label: str,
    matrix: np.ndarray,
    output_path: Path,
    class_labels: List[str],
) -> None:
    """Render and save confusion matrix heatmap for one model."""
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(matrix, cmap="Blues")

    ax.set_title(f"Confusion Matrix - {model_label}", fontsize=12, fontweight="bold")
    ax.set_xlabel("Predicted Label")
    ax.set_ylabel("True Label")
    ax.set_xticks(range(len(class_labels)), class_labels)
    ax.set_yticks(range(len(class_labels)), class_labels)

    threshold = matrix.max() / 2 if matrix.size else 0
    for i in range(matrix.shape[0]):
        for j in range(matrix.shape[1]):
            ax.text(
                j,
                i,
                str(int(matrix[i, j])),
                ha="center",
                va="center",
                color="white" if matrix[i, j] > threshold else "black",
                fontsize=10,
                fontweight="bold",
            )

    fig.colorbar(im, ax=ax, fraction=0.045, pad=0.04)
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def _generate_evaluation_reports(
    y_test: pd.Series,
    predictions: Dict[str, np.ndarray],
    all_results: Dict[str, Dict[str, Any]],
    reports_dir: Path,
) -> Dict[str, str]:
    """Generate all requested evaluation visuals and tables."""
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Overall comparison table similar to report-style model summary.
    summary_rows: List[Dict[str, Any]] = []
    for model_name, result in all_results.items():
        report = result["classification_report"]
        weighted = report["weighted avg"]
        summary_rows.append(
            {
                "Model Name": _to_title(model_name),
                "Accuracy": float(result["accuracy"]),
                "Precision": float(weighted["precision"]),
                "Recall": float(weighted["recall"]),
                "F1-Score": float(weighted["f1-score"]),
            }
        )

    summary_df = (
        pd.DataFrame(summary_rows)
        .sort_values("Accuracy", ascending=False)
        .set_index("Model Name")
    )

    summary_csv = reports_dir / "performance_summary.csv"
    summary_df.to_csv(summary_csv)

    summary_png = reports_dir / "performance_summary.png"
    _render_table(summary_df, "Performance Evaluation (All Models)", summary_png)

    accuracy_plot = reports_dir / "accuracy_comparison.png"
    _plot_accuracy_comparison(summary_df, accuracy_plot)

    # Per-model tables and confusion matrices.
    class_labels = ["Rejected (0)", "Approved (1)"]
    for model_name, y_pred in predictions.items():
        model_label = _to_title(model_name)
        report_df = pd.DataFrame(all_results[model_name]["classification_report"]).T
        report_df.index.name = "Class/Metric"

        report_csv = reports_dir / f"classification_report_{model_name}.csv"
        report_png = reports_dir / f"classification_report_{model_name}.png"
        report_df.to_csv(report_csv)
        _render_table(report_df, f"Performance Evaluation ({model_label})", report_png)

        cm = confusion_matrix(y_test, y_pred, labels=[0, 1])
        cm_png = reports_dir / f"confusion_matrix_{model_name}.png"
        _plot_confusion_matrix(model_label, cm, cm_png, class_labels)

    return {
        "reports_dir": str(reports_dir),
        "accuracy_comparison_plot": str(accuracy_plot),
        "performance_summary_table": str(summary_png),
        "performance_summary_csv": str(summary_csv),
    }


def _extract_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    """Get transformed feature names after preprocessing expansion."""
    return preprocessor.get_feature_names_out().tolist()


def _feature_importance(model: Any, feature_names: List[str]) -> List[Dict[str, float]]:
    """Compute feature importance across tree- and linear-style estimators."""
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
) -> Tuple[Pipeline, Dict[str, Dict[str, Any]], str, Dict[str, np.ndarray]]:
    """Train all candidate models, evaluate on test split, and return the best."""
    models = _build_models()
    preprocessor = _build_preprocessor()

    results: Dict[str, Dict[str, Any]] = {}
    predictions: Dict[str, np.ndarray] = {}
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
        predictions[model_name] = pred

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

    return best_pipeline, results, best_name, predictions


def _training_stats(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Capture numeric quartiles for later risk-factor explanations in inference."""
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
    reports_dir: Path = DEFAULT_REPORTS_DIR,
    test_size: float = 0.2,
) -> Dict[str, Any]:
    """Execute full training pipeline and persist model + metrics artifacts."""
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    raw_df = pd.read_csv(dataset_path)
    df = _normalize_dataframe(raw_df)

    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Target column '{TARGET_COLUMN}' missing from dataset.")

    for col in DROP_COLUMNS:
        if col in df.columns:
            df = df.drop(columns=[col])

    # Clip extreme values before splitting to keep model training stable.
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

    best_pipeline, all_results, best_name, predictions = _fit_and_score(X_train, X_test, y_train, y_test)

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

    # Save the full artifact used by prediction service.
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, model_path)

    # Save a lightweight metrics summary for quick inspection and dashboard use.
    metrics_payload = {
        "best_model": best_name,
        "all_models": all_results,
    }
    metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    report_paths = _generate_evaluation_reports(
        y_test=y_test,
        predictions=predictions,
        all_results=all_results,
        reports_dir=reports_dir,
    )

    return {
        "model_path": str(model_path),
        "metrics_path": str(metrics_path),
        **report_paths,
        "best_model": best_name,
        "all_models": all_results,
        "top_feature_importance": importances[:10],
    }


def _parse_args() -> argparse.Namespace:
    """Parse CLI flags for manual training runs from terminal."""
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
        "--reports-dir",
        type=str,
        default=str(DEFAULT_REPORTS_DIR),
        help="Directory where plots and evaluation tables will be saved",
    )
    parser.add_argument(
        "--test-size",
        type=float,
        default=0.2,
        help="Test split ratio",
    )
    return parser.parse_args()


def main() -> None:
    """CLI entrypoint that trains and prints a JSON summary to stdout."""
    args = _parse_args()
    result = train_and_save_model(
        dataset_path=Path(args.dataset),
        model_path=Path(args.model_output),
        metrics_path=Path(args.metrics_output),
        reports_dir=Path(args.reports_dir),
        test_size=args.test_size,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
