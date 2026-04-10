# Working Log

## 2026-04-10

### Completed
- Created required directories:
  - `backend/`
  - `frontend/`
  - `model/`
  - `data/`
- Copied real dataset to `data/loan_approval_dataset.csv`.
- Implemented ML training pipeline in `model/train.py`:
  - data normalization
  - outlier clipping (IQR)
  - missing handling
  - encoding
  - scaling
  - model comparison (Logistic Regression, Decision Tree, Random Forest)
  - best-model persistence to `model/loan_model.pkl`
  - metrics output to `model/training_metrics.json`
- Implemented inference utilities in `model/inference.py`:
  - payload validation/normalization
  - probability and confidence output
  - rule-based risk factor extraction from model importance + stats
- Implemented Flask backend in `backend/app.py`:
  - `POST /train`
  - `POST /predict`
  - `GET /health`
  - CORS enabled
- Implemented SQLite layer in `backend/database.py`:
  - auto-initialize table
  - store prediction requests/results
- Added backend dependencies in `backend/requirements.txt`.
- Built React (Vite) frontend in `frontend/`:
  - form for applicant details
  - train action button
  - result card for decision, probabilities, risk factors, feature importance
  - Axios API integration with backend
  - responsive custom styling
- Added setup and API documentation in `README.md`.

### In Progress
- None.

### Verification Results
- Backend endpoint test executed using Flask test client:
  - `POST /train` returned HTTP 200 and selected `random_forest`.
  - `POST /predict` returned HTTP 200 with `Approved` prediction and confidence `0.98`.
- Frontend verification:
  - `npm install` completed successfully.
  - `npm run build` completed successfully and produced `frontend/dist`.

### Notes
- Backend expects model artifact at `model/loan_model.pkl`.
- If not trained yet, call `POST /train` first.

## 2026-04-10 (Frontend Upgrade)

### Completed
- Upgraded frontend to multi-page architecture with React Router:
  - `/` Home
  - `/apply` Application form
  - `/result` Prediction result
  - `/dashboard` Analytics dashboard
  - `/history` Prediction history
- Migrated UI styling to Tailwind CSS and added modern card-based responsive design.
- Added chart visualizations using Recharts:
  - Approval vs Rejection pie chart
  - Loan amount distribution chart
  - Risk factor frequency chart
  - Feature importance summary chart
- Added icon-driven UI improvements with Lucide React.
- Added shared app state using context for form/result flow.
- Extended backend for analytics integration:
  - `GET /history`
  - `GET /stats`
- Added backend database helper for reading stored predictions.

### Verification Results
- `GET /stats` returned HTTP 200 with analytics payload.
- `GET /history` returned HTTP 200 with saved prediction rows.
- Frontend `npm run build` succeeded after upgrade.

### Notes
- Build currently reports a Vite chunk-size warning due to chart libraries; app still builds and runs correctly.
