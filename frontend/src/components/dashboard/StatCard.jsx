export default function StatCard({ title, value, subtext, icon: Icon, tone = "brand" }) {
  const colorClass =
    tone === "danger"
      ? "bg-danger-50 text-danger-500"
      : tone === "neutral"
        ? "bg-slate-100 text-slate-600"
        : "bg-brand-50 text-brand-600";

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
          {subtext ? <p className="mt-2 text-sm text-slate-500">{subtext}</p> : null}
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
