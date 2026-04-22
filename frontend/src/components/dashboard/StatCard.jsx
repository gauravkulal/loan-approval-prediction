export default function StatCard({ title, value, subtext, icon: Icon, tone = "brand" }) {
  const colorClass =
    tone === "danger"
      ? "bg-danger-50 text-danger-500 dark:bg-danger-500/15"
      : tone === "neutral"
        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-dark-muted"
        : "bg-brand-50 text-brand-600 dark:bg-brand-500/15";

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-dark-muted">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-dark-text">{value}</p>
          {subtext ? <p className="mt-2 text-sm text-slate-500 dark:text-dark-muted">{subtext}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-xl p-2 ${colorClass}`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
