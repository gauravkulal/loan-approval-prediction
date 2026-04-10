import { Link } from "react-router-dom";
import ResultCard from "../components/ResultCard";
import { useAppContext } from "../context/AppContext";

export default function ResultPage() {
  const { result } = useAppContext();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Prediction Result</h2>
          <p className="text-slate-600">Decision confidence, risk indicators, and explainability summary.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/apply" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            New Application
          </Link>
          <Link to="/dashboard" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            Open Dashboard
          </Link>
        </div>
      </div>
      <ResultCard result={result} />
    </div>
  );
}
