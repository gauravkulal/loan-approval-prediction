# Loan Approval Prediction & Risk Analysis System

A complete full-stack application that predicts whether a loan application is approved or rejected and explains major risk factors.

## Tech Stack
- Backend: Flask + SQLite
- Machine Learning: scikit-learn
- Frontend: React (Vite) + React Router + Tailwind CSS + Recharts + Lucide React + Axios
- Data: CSV dataset in `data/loan_approval_dataset.csv`

## Project Structure
- `backend/` Flask API + SQLite database
- `frontend/` React Vite application
- `model/` training and inference logic
- `data/` dataset
- `model/loan_model.pkl` trained model artifact

## Dataset and Target
- Dataset: `data/loan_approval_dataset.csv`
- Target column: `loan_status`

## ML Pipeline
The training flow mirrors the notebook logic and productionizes it:
1. Trim column names and categorical values.
2. Drop `loan_id`.
3. Handle outliers with IQR clipping on numeric features.
4. Split train/test with stratification.
5. Preprocess with:
   - Numeric: median imputation + standard scaling
   - Categorical: most-frequent imputation + one-hot encoding
6. Train and compare:
   - Logistic Regression
   - Decision Tree
   - Random Forest
7. Save best pipeline to `model/loan_model.pkl` and metrics to `model/training_metrics.json`.

## Backend API
Base URL: `http://localhost:5000`

### `GET /`
API information and endpoint list.

### `GET /health`
Health-check endpoint.

### `POST /train`
Triggers training using the real dataset.

Request body (optional):
```json
{ "test_size": 0.2 }
```

Response (example):
```json
{
  "status": "completed",
  "best_model": "random_forest",
  "all_models": {
    "logistic_regression": {"accuracy": 0.94},
    "decision_tree": {"accuracy": 0.96},
    "random_forest": {"accuracy": 0.98}
  }
}
```

### `POST /predict`
Returns prediction, probabilities, confidence, and risk factors.

Request body:
```json
{
  "no_of_dependents": 2,
  "education": "Graduate",
  "self_employed": "No",
  "income_annum": 9600000,
  "loan_amount": 29900000,
  "loan_term": 12,
  "cibil_score": 778,
  "residential_assets_value": 2400000,
  "commercial_assets_value": 17600000,
  "luxury_assets_value": 22700000,
  "bank_asset_value": 8000000
}
```

### `GET /history`
Returns previous predictions from SQLite.

Optional query parameter:
- `decision=Approved` or `decision=Rejected`

### `GET /stats`
Returns dashboard analytics:
- total predictions
- approval and rejection counts
- average loan amount
- approval vs rejection series
- loan amount distribution
- risk factor frequency
- feature importance summary
- recent predictions

## Frontend Routes
- `/` Home landing page
- `/apply` Loan application form (personal, financial, loan sections)
- `/result` Prediction decision and explainability
- `/dashboard` Analytics dashboard with charts
- `/history` Filterable prediction history table

## Setup Instructions

### 1. Backend (Terminal 1)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5000`.

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Alternative from project root:
```bash
npm run dev
```

If frontend cannot connect to backend, set API URL explicitly:
```bash
cd frontend
echo VITE_API_BASE_URL=http://127.0.0.1:5000 > .env
npm run dev
```

## SQLite Storage
The backend stores every prediction in `backend/predictions.db` with:
- input payload
- decision
- probabilities
- confidence
- risk factors
- model name
- timestamp

## Integration Flow
1. Start backend.
2. Start frontend.
3. Open `/apply`, submit an application.
4. Review output in `/result`.
5. Explore portfolio analytics in `/dashboard`.
6. Review records in `/history`.
