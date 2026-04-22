import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Landmark, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser, getApiErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullname: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let data;
      if (isRegister) {
        data = await registerUser(form.fullname, form.email, form.password);
      } else {
        data = await loginUser(form.email, form.password);
      }
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 dark:from-dark-bg dark:via-slate-900 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <Landmark size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">Loan Approval Prediction</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-dark-muted">AI-Powered Credit Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-dark-muted">
            {isRegister
              ? "Register to start using the platform"
              : "Sign in to your account to continue"}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-500 dark:border-danger-500/30 dark:bg-danger-500/10">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-600 dark:text-dark-muted">Full Name</span>
                <input
                  id="fullname"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-dark-border dark:bg-slate-800 dark:text-dark-text dark:placeholder-slate-500"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullname}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600 dark:text-dark-muted">Email Address</span>
              <input
                id="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-dark-border dark:bg-slate-800 dark:text-dark-text dark:placeholder-slate-500"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600 dark:text-dark-muted">Password</span>
              <div className="relative">
                <input
                  id="password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-dark-border dark:bg-slate-800 dark:text-dark-text dark:placeholder-slate-500"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-dark-muted">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              id="toggle-auth-mode"
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="font-semibold text-brand-500 hover:text-brand-600"
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          Loan Approval Prediction System — AI/ML College Project
        </p>
      </div>
    </div>
  );
}
