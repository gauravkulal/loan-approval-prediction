import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ── JWT Token Interceptor ──────────────────────────────────────────────────────
// Automatically attach Authorization header to every request if a token exists.

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Error helper ───────────────────────────────────────────────────────────────

export const getApiErrorMessage = (err) => {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  if (err?.code === "ERR_NETWORK") {
    return `Cannot connect to backend at ${BASE_URL}. Start the server first: cd server && npm start`;
  }

  return err?.message || "Request failed.";
};

// ── Auth APIs ──────────────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const registerUser = async (fullname, email, password) => {
  const { data } = await api.post("/auth/register", { fullname, email, password });
  return data;
};

export const fetchCurrentUser = async (token) => {
  const { data } = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ── ML / Data APIs ─────────────────────────────────────────────────────────────

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
