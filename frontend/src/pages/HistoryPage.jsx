import { useEffect, useState } from "react";
import { fetchHistory, getApiErrorMessage } from "../api";

const filters = ["All", "Approved", "Rejected"];

export default function HistoryPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const decision = selectedFilter === "All" ? "" : selectedFilter;
        const data = await fetchHistory(decision);
        setRows(data.items || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    load();
  }, [selectedFilter]);

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-semibold">Prediction History</h2>
        <p className="mt-2 text-slate-600">Review all previous applications and filter by decision status.</p>
      </div>

      <div className="flex gap-2">
        {filters.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedFilter(label)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedFilter === label
                ? "bg-brand-100 text-brand-600"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</div>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Decision</th>
              <th className="px-3 py-2">Loan Amount</th>
              <th className="px-3 py-2">Annual Income</th>
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
                <td className="px-3 py-2">{Number(row.input_payload?.loan_amount || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{Number(row.input_payload?.income_annum || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{(Number(row.confidence || 0) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
