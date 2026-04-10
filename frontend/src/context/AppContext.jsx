import { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

const defaultFormData = {
  no_of_dependents: 1,
  education: "Graduate",
  self_employed: "No",
  income_annum: 9600000,
  loan_amount: 29900000,
  loan_term: 12,
  cibil_score: 778,
  residential_assets_value: 2400000,
  commercial_assets_value: 17600000,
  luxury_assets_value: 22700000,
  bank_asset_value: 8000000,
};

export function AppProvider({ children }) {
  const [formData, setFormData] = useState(defaultFormData);
  const [result, setResult] = useState(null);

  const value = useMemo(
    () => ({
      formData,
      setFormData,
      defaultFormData,
      result,
      setResult,
    }),
    [formData, result]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
