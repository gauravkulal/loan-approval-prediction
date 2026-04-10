const fieldConfig = [
  {
    section: "Personal Details",
    fields: [
      { name: "no_of_dependents", label: "Dependents", type: "number", min: 0 },
      {
        name: "education",
        label: "Education",
        type: "select",
        options: ["Graduate", "Not Graduate"],
      },
      {
        name: "self_employed",
        label: "Self Employed",
        type: "select",
        options: ["Yes", "No"],
      },
    ],
  },
  {
    section: "Financial Details",
    fields: [
      { name: "income_annum", label: "Annual Income", type: "number", min: 0 },
      { name: "cibil_score", label: "CIBIL Score", type: "number", min: 300, max: 900 },
      {
        name: "residential_assets_value",
        label: "Residential Assets Value",
        type: "number",
        min: 0,
      },
      {
        name: "commercial_assets_value",
        label: "Commercial Assets Value",
        type: "number",
        min: 0,
      },
      { name: "luxury_assets_value", label: "Luxury Assets Value", type: "number", min: 0 },
      { name: "bank_asset_value", label: "Bank Asset Value", type: "number", min: 0 },
    ],
  },
  {
    section: "Loan Details",
    fields: [
      { name: "loan_amount", label: "Loan Amount", type: "number", min: 0 },
      { name: "loan_term", label: "Loan Term (months)", type: "number", min: 1 },
    ],
  },
];

export default function LoanForm({ formData, setFormData, onSubmit, loading }) {
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {fieldConfig.map((section) => (
        <section key={section.section} className="card">
          <h3 className="mb-4 text-xl font-semibold text-slate-900">{section.section}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <label key={field.name} className="space-y-2">
                <span className="text-sm font-medium text-slate-600">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm outline-none transition focus:border-brand-500"
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm outline-none transition focus:border-brand-500"
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    required
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end">
        <button
          className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Analyzing Application..." : "Submit For Prediction"}
        </button>
      </div>
    </form>
  );
}
