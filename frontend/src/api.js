import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const getApiErrorMessage = (err) => {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  if (err?.code === "ERR_NETWORK") {
    return `Cannot connect to backend at ${BASE_URL}. Start backend first: cd backend && python app.py`;
  }

  return err?.message || "Request failed.";
};

export const trainModel = async () => {
  const { data } = await api.post("/train", { test_size: 0.2 });
  return data;
};

export const predictLoan = async (payload) => {
  const { data } = await api.post("/predict", payload);
  return data;
};

export const fetchStats = async () => {
  const { data } = await api.get("/stats");
  return data;
};

export const fetchHistory = async (decision = "") => {
  const params = decision ? { decision } : {};
  const { data } = await api.get("/history", { params });
  return data;
};
