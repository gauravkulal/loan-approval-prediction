import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoanForm from "../components/LoanForm";
import { getApiErrorMessage, predictLoan } from "../api";
import { useAppContext } from "../context/AppContext";

export default function ApplyPage() {
  const navigate = useNavigate();
  const { formData, setFormData, setResult } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await predictLoan(formData);
      setResult(data);
      navigate("/result");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-semibold text-slate-900">Loan Application Form</h2>
        <p className="mt-2 text-slate-600">Complete all sections and submit to generate prediction and risk insights.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</div>
      ) : null}

      <LoanForm formData={formData} setFormData={setFormData} onSubmit={handlePredict} loading={loading} />
    </div>
  );
}
