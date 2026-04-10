export default function RecentPredictionsTable({ rows = [] }) {
  return (
    <div className="card overflow-x-auto">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Predictions</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Decision</th>
            <th className="px-3 py-2">Loan Amount</th>
            <th className="px-3 py-2">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 text-slate-600">{row.created_at}</td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    row.prediction === "Approved"
                      ? "bg-brand-100 text-brand-600"
                      : "bg-danger-100 text-danger-500"
                  }`}
                >
                  {row.prediction}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-700">
                {Number(row.input_payload?.loan_amount || 0).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-slate-700">{(Number(row.confidence || 0) * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
