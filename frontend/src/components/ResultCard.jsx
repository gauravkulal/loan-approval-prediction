export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="card">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text">Prediction Output</h2>
        <p className="mt-2 text-slate-600 dark:text-dark-muted">Submit an application to view approval decision, confidence, risk factors, and model insights.</p>
      </section>
    );
  }

  const approved = result.prediction === "Approved";
  const approvedPct = Number(result.probability.approved || 0) * 100;
  const rejectedPct = Number(result.probability.rejected || 0) * 100;

  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text">Prediction Output</h2>
        <div
          className={`mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
            approved ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-500" : "bg-danger-100 text-danger-500 dark:bg-danger-500/20"
          }`}
        >
          {result.prediction}
        </div>

        <p className="mt-4 text-slate-700 dark:text-dark-muted">
          Confidence score: <strong className="dark:text-dark-text">{(Number(result.confidence || 0) * 100).toFixed(2)}%</strong>
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-1 text-sm text-slate-600 dark:text-dark-muted">Approval Probability ({approvedPct.toFixed(2)}%)</p>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-brand-500" style={{ width: `${approvedPct}%` }} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm text-slate-600 dark:text-dark-muted">Rejection Probability ({rejectedPct.toFixed(2)}%)</p>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-danger-500" style={{ width: `${rejectedPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Risk Factors</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(result.risk_factors || []).map((factor) => (
            <div key={factor} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              {factor}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Feature Importance</h3>
        <div className="mt-3 space-y-3">
          {(result.top_feature_importance || []).map((item) => {
            const pct = Number(item.importance || 0) * 100;
            return (
              <div key={item.feature}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-600 dark:text-dark-muted">
                  <span>{item.feature}</span>
                  <span>{pct.toFixed(2)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-slate-700 dark:bg-slate-400" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
