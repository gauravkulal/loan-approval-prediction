import {
  Brain,
  Database,
  BarChart3,
  ShieldCheck,
  Server,
  Layout,
  TreeDeciduous,
  GitBranch,
} from "lucide-react";

const models = [
  {
    name: "Logistic Regression",
    accuracy: "91.45%",
    desc: "Linear model for baseline binary classification.",
    icon: GitBranch,
  },
  {
    name: "Decision Tree",
    accuracy: "97.42%",
    desc: "Tree-based model with max depth of 6 for non-linear patterns.",
    icon: TreeDeciduous,
  },
  {
    name: "Random Forest",
    accuracy: "98.01%",
    desc: "Ensemble of 300 decision trees — selected as the best model.",
    icon: Brain,
    best: true,
  },
];

const techStack = [
  { layer: "Frontend", tech: "React.js (Vite) + Tailwind CSS + Recharts + Lucide React", icon: Layout },
  { layer: "Backend", tech: "Node.js + Express.js", icon: Server },
  { layer: "Database", tech: "SQLite (better-sqlite3) — users & predictions", icon: Database },
  { layer: "AI / ML", tech: "Python + scikit-learn + pandas + joblib", icon: Brain },
];

const features = [
  "User authentication (register / login) with JWT tokens",
  "Loan application form with 11 financial and personal attributes",
  "Real-time AI prediction (Approved / Rejected) with confidence score",
  "Risk factor analysis and feature importance explainability",
  "Dashboard with analytics charts (approvals, rejections, loan distribution)",
  "Prediction history with filtering and storage in SQLite",
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="card overflow-hidden">
        <div className="relative">
          <div className="absolute -right-14 -top-12 h-36 w-36 rounded-full bg-brand-100 blur-2xl dark:bg-brand-500/20" />
          <div className="absolute -bottom-8 -left-10 h-28 w-28 rounded-full bg-danger-100 blur-2xl dark:bg-danger-500/20" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-dark-muted">
              About This Project
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-dark-text">
              Loan Approval Prediction &amp; Risk Analysis System
            </h2>
            <p className="mt-4 max-w-3xl text-slate-600 leading-relaxed dark:text-dark-muted">
              This web application uses machine learning to predict whether a loan application will be
              <strong className="dark:text-dark-text"> Approved</strong> or <strong className="dark:text-dark-text">Rejected</strong> based on financial and personal attributes
              of the applicant. The system trains and compares three classification models and selects the one
              with the highest accuracy (<strong className="dark:text-dark-text">Random Forest — 98.01%</strong>) for real-time predictions.
            </p>
          </div>
        </div>
      </section>

      {/* ML Pipeline */}
      <section className="card">
        <h3 className="mb-1 text-xl font-semibold text-slate-900 dark:text-dark-text">Machine Learning Pipeline</h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-dark-muted">
          Three models are trained and compared. The best-performing model is saved and used for predictions.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {models.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className={`rounded-2xl border p-5 transition ${
                  m.best
                    ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10 dark:bg-brand-500/10"
                    : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`inline-flex rounded-xl p-2 ${
                      m.best ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-dark-muted"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  {m.best && (
                    <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                      Best Model
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-dark-text">{m.name}</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-dark-muted">{m.desc}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-dark-text">{m.accuracy}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Test Accuracy</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ML Processing Steps */}
      <section className="card">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-dark-text">Data Processing Steps</h3>
        <div className="space-y-3">
          {[
            { step: "1", title: "Data Cleaning", desc: "Trim column names, normalize categorical values, drop loan_id." },
            { step: "2", title: "Outlier Handling", desc: "IQR-based clipping on all numeric features to reduce extreme values." },
            { step: "3", title: "Train/Test Split", desc: "80/20 stratified split to preserve class distribution." },
            { step: "4", title: "Preprocessing", desc: "Numeric: median imputation + standard scaling. Categorical: most-frequent imputation + one-hot encoding." },
            { step: "5", title: "Model Training", desc: "Train Logistic Regression, Decision Tree, and Random Forest classifiers." },
            { step: "6", title: "Evaluation & Selection", desc: "Compare accuracy scores, select the best model (Random Forest at 98%), save pipeline." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-slate-800/50">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-dark-text">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-dark-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="card">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-dark-text">Technology Stack</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {techStack.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.layer} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-slate-800/50">
                <div className="rounded-xl bg-white p-2 text-slate-600 shadow-sm dark:bg-dark-card dark:text-dark-muted">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-dark-text">{t.layer}</p>
                  <p className="text-sm text-slate-500 dark:text-dark-muted">{t.tech}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="card">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-dark-text">Key Features</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-2">
              <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-brand-500" />
              <p className="text-sm text-slate-700 dark:text-dark-muted">{f}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dataset */}
      <section className="card">
        <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-dark-text">Dataset</h3>
        <p className="text-sm text-slate-600 leading-relaxed dark:text-dark-muted">
          The model is trained on the <strong className="dark:text-dark-text">Loan Approval Dataset</strong> containing 4,269 records with
          11 input features including income, CIBIL score, loan amount, loan term, education, employment status,
          and various asset values. The target variable is <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800 dark:text-dark-text">loan_status</code> (Approved / Rejected).
        </p>
      </section>

      {/* Evaluation Criteria */}
      <section className="card">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-dark-text">
          <BarChart3 size={20} className="mr-2 inline text-brand-500" />
          Evaluation Criteria
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { criteria: "Working Login System", desc: "JWT-based register/login with SQLite user storage." },
            { criteria: "Frontend–Backend Integration", desc: "React frontend communicates with Express.js backend via REST APIs." },
            { criteria: "Database Storage & Retrieval", desc: "SQLite stores users and predictions. Supports querying history and analytics." },
            { criteria: "AI Model Integration", desc: "Python ML model (Random Forest, 98% accuracy) called from Node.js at runtime." },
          ].map((item) => (
            <div key={item.criteria} className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
              <p className="font-semibold text-brand-600 dark:text-brand-500">{item.criteria}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-dark-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
