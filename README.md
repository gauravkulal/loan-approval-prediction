# 🏦 Loan Approval Prediction & Risk Analysis System

A full-stack web application that uses Machine Learning to predict whether a loan application will be **Approved** or **Rejected** based on financial and personal attributes. The system trains and compares three classification models and selects the best one (**Random Forest — 98% accuracy**) for real-time predictions.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Features Demonstration](#features-demonstration)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [ML Pipeline](#ml-pipeline)
- [Evaluation Criteria](#evaluation-criteria)

---

## 🎯 Project Overview

This project addresses the **Loan Approval Prediction** problem using supervised machine learning. Given an applicant's financial and personal details (income, CIBIL score, loan amount, assets, etc.), the system predicts whether the loan will be approved or rejected, along with:

- **Confidence score** (probability of the prediction)
- **Risk factor analysis** (what factors increase rejection risk)
- **Feature importance** (which attributes the model relies on most)
- **Dashboard analytics** (approval trends, loan distribution, risk frequency)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite) + Tailwind CSS + Recharts + Lucide React |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (via `better-sqlite3`) |
| **AI / ML** | Python + scikit-learn + pandas + joblib |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt |

---

## 📁 Project Structure

```
loan_approval/
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Navbar
│   │   │   ├── dashboard/  # StatCard, RecentPredictionsTable
│   │   │   ├── LoanForm.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/        # React Contexts
│   │   │   ├── AppContext.jsx    # Loan form & result state
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   ├── pages/          # Route pages
│   │   │   ├── LoginPage.jsx     # Login & Register
│   │   │   ├── HomePage.jsx      # Landing page
│   │   │   ├── ApplyPage.jsx     # Loan application form
│   │   │   ├── ResultPage.jsx    # Prediction result
│   │   │   ├── DashboardPage.jsx # Analytics dashboard
│   │   │   ├── HistoryPage.jsx   # Prediction history
│   │   │   └── AboutPage.jsx     # Project description
│   │   ├── api.js          # API client (Axios + JWT interceptor)
│   │   ├── App.jsx         # Router & route definitions
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Node.js/Express backend
│   ├── routes/
│   │   ├── auth.js         # POST /api/auth/register, login, me
│   │   └── api.js          # POST /api/predict, GET /api/history, stats
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── db.js               # SQLite setup (users + predictions)
│   ├── pythonBridge.js     # Spawns Python ML scripts
│   ├── index.js            # Express app entry point
│   └── package.json
│
├── model/                  # ML model code
│   ├── train.py            # Training pipeline (3 models)
│   ├── inference.py        # Prediction logic
│   ├── predict_bridge.py   # stdin/stdout bridge for Node.js
│   ├── train_bridge.py     # stdin/stdout bridge for Node.js
│   ├── loan_model.pkl      # Trained model artifact
│   └── training_metrics.json
│
├── data/
│   └── loan_approval_dataset.csv   # Training dataset (4,269 records)
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **Python** (3.9 or later) — [Download](https://python.org/)
- **pip** (comes with Python)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd loan_approval
```

### Step 2: Install Python Dependencies

```bash
pip install flask flask-cors pandas numpy scikit-learn joblib
```

> **Note:** These are needed for the ML model (inference and training). Flask is only needed if you plan to use the legacy backend.

### Step 3: Install Backend (Node.js/Express) Dependencies

```bash
cd server
npm install
cd ..
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Running the Project

You need **two terminals** running simultaneously:

### Terminal 1 — Start the Backend Server (Node.js/Express)

```bash
cd server
node index.js
```

You should see:
```
🚀  Express server running at http://localhost:3000
📦  SQLite database: .../server/loan_approval.db
🔑  Auth endpoints:  POST /api/auth/register, POST /api/auth/login
🤖  ML endpoints:    POST /api/predict, POST /api/train
📊  Data endpoints:  GET  /api/history, GET /api/stats
```

### Terminal 2 — Start the Frontend (React)

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3 — Open in Browser

Open **http://localhost:5173** in your browser.

---

## 🎬 Features Demonstration

### 1. 🔐 Working Login System

| Feature | Details |
|---------|---------|
| **Register** | Create account with full name, email, and password |
| **Login** | Authenticate with email and password |
| **Password Security** | Passwords hashed with bcrypt (10 rounds) |
| **Session Management** | JWT tokens (7-day expiry) stored in localStorage |
| **Protected Routes** | All pages except login require authentication |
| **Logout** | Clears token and redirects to login |

**How to test:**
1. Open `http://localhost:5173` → you'll be redirected to the login page
2. Click "Register" → create an account
3. You'll be redirected to the home page
4. Click "Logout" → you'll return to login
5. Login again with the same credentials

### 2. 🔗 Proper Frontend–Backend Integration

| Frontend (React) | Backend (Express) | Description |
|---|---|---|
| `LoginPage.jsx` | `POST /api/auth/login` | User authentication |
| `LoginPage.jsx` | `POST /api/auth/register` | User registration |
| `ApplyPage.jsx` | `POST /api/predict` | Submit loan for ML prediction |
| `DashboardPage.jsx` | `GET /api/stats` | Fetch analytics data |
| `HistoryPage.jsx` | `GET /api/history` | Fetch prediction history |

- All API calls use **Axios** with a JWT interceptor that automatically attaches the auth token
- Error messages from the backend are shown in the frontend UI
- Loading states and error boundaries are implemented

### 3. 💾 Database Storage & Retrieval

The application uses **SQLite** with two tables:

**Users Table** — Stores registered users:
```sql
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname    TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
);
```

**Predictions Table** — Stores every loan prediction:
```sql
CREATE TABLE predictions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id               INTEGER NOT NULL,
    input_payload         TEXT NOT NULL,
    prediction            TEXT NOT NULL,
    approved_probability  REAL NOT NULL,
    rejected_probability  REAL NOT NULL,
    confidence            REAL NOT NULL,
    risk_factors          TEXT NOT NULL,
    model_name            TEXT NOT NULL,
    created_at            TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**How to verify:**
- Register a user → check `server/loan_approval.db` has the user
- Submit a loan application → check the prediction is stored
- Visit `/history` → all past predictions are fetched from the database
- Visit `/dashboard` → analytics are computed from stored predictions

### 4. 🤖 Working AI Model Integration

| Aspect | Details |
|--------|---------|
| **Models Trained** | Logistic Regression (91.45%), Decision Tree (97.42%), Random Forest (98.01%) |
| **Best Model** | Random Forest (300 estimators) |
| **Integration Method** | Node.js spawns Python via `child_process` |
| **Bridge Scripts** | `model/predict_bridge.py`, `model/train_bridge.py` |
| **Model Artifact** | `model/loan_model.pkl` (pre-trained, ready to use) |

**How the AI integration works:**
1. User fills the loan form on the frontend
2. Frontend sends the data to `POST /api/predict` (Express)
3. Express spawns `python model/predict_bridge.py`
4. Python loads the trained `.pkl` model and runs inference
5. Python writes JSON result to stdout
6. Express reads the result, saves it to SQLite, returns to frontend
7. Frontend displays: Decision, Confidence, Risk Factors, Feature Importance

**How to test:**
1. Navigate to `/apply`
2. Fill out the loan application form (or use default values)
3. Click "Submit For Prediction"
4. View the result on `/result` — shows Approved/Rejected with confidence
5. Check `/dashboard` — analytics update with the new prediction

---

## 🌐 API Endpoints

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### ML & Data

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/predict` | Run loan prediction | ✅ |
| GET | `/api/history` | Get prediction history | ✅ |
| GET | `/api/stats` | Get dashboard analytics | ✅ |
| POST | `/api/train` | Re-train the ML model | ✅ |

---

## 📊 ML Pipeline

The training flow (implemented in `model/train.py`):

1. **Load** `data/loan_approval_dataset.csv` (4,269 records, 11 features)
2. **Clean** — trim whitespace, normalize categorical values
3. **Remove** `loan_id` column
4. **Handle outliers** — IQR clipping on numeric features
5. **Split** — 80/20 train/test with stratification
6. **Preprocess**:
   - Numeric: median imputation → standard scaling
   - Categorical: most-frequent imputation → one-hot encoding
7. **Train 3 models**:
   - Logistic Regression (max_iter=1500)
   - Decision Tree (max_depth=6)
   - Random Forest (n_estimators=300)
8. **Select best** model by accuracy
9. **Save** pipeline + metadata to `model/loan_model.pkl`

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `no_of_dependents` | Numeric | Number of dependents |
| `education` | Categorical | Graduate / Not Graduate |
| `self_employed` | Categorical | Yes / No |
| `income_annum` | Numeric | Annual income |
| `loan_amount` | Numeric | Requested loan amount |
| `loan_term` | Numeric | Loan term in months |
| `cibil_score` | Numeric | Credit score (300–900) |
| `residential_assets_value` | Numeric | Value of residential assets |
| `commercial_assets_value` | Numeric | Value of commercial assets |
| `luxury_assets_value` | Numeric | Value of luxury assets |
| `bank_asset_value` | Numeric | Value of bank assets |

---

## ✅ Evaluation Criteria

| # | Criteria | Status | Implementation |
|---|----------|:------:|----------------|
| 1 | Working login system | ✅ | JWT auth with bcrypt hashing, register/login/logout |
| 2 | Frontend–backend integration | ✅ | React → Axios → Express.js REST API |
| 3 | Database storage & retrieval | ✅ | SQLite with users + predictions tables |
| 4 | AI model integration | ✅ | Python ML model (Random Forest, 98%) called from Node.js |

---

## 📄 License

This project is developed as a college AI/ML project for educational purposes.
