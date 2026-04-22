import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchStats, getApiErrorMessage } from "../api";
import RecentPredictionsTable from "../components/dashboard/RecentPredictionsTable";
import StatCard from "../components/dashboard/StatCard";
import { useTheme } from "../context/ThemeContext";

const pieColors = ["#14a44d", "#dc2626"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="card dark:text-dark-text">Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-danger-500 dark:border-danger-500/30 dark:bg-danger-500/10">{error}</div>;
  }

  const axisColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "#334155" : "#e2e8f0";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Applications" value={stats.total_predictions} icon={Database} />
        <StatCard title="Approvals" value={stats.approval_count} icon={CheckCircle2} />
        <StatCard title="Rejections" value={stats.rejection_count} icon={AlertTriangle} tone="danger" />
        <StatCard
          title="Avg Loan Amount"
          value={Number(stats.average_loan_amount || 0).toLocaleString()}
          subtext="Across saved predictions"
          icon={Wallet}
          tone="neutral"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-[320px]">
          <h3 className="mb-4 text-lg font-semibold dark:text-dark-text">Approval vs Rejection</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={stats.approval_vs_rejection} dataKey="value" nameKey="name" outerRadius={110} label>
                {stats.approval_vs_rejection.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#fff", border: `1px solid ${gridColor}`, borderRadius: 12, color: dark ? "#e2e8f0" : "#1e293b" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[320px]">
          <h3 className="mb-4 text-lg font-semibold dark:text-dark-text">Loan Amount Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.loan_amount_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fill: axisColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#fff", border: `1px solid ${gridColor}`, borderRadius: 12, color: dark ? "#e2e8f0" : "#1e293b" }} />
              <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-[340px]">
          <h3 className="mb-4 text-lg font-semibold dark:text-dark-text">Risk Factor Frequency</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.risk_factor_frequency} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: axisColor }} />
              <YAxis dataKey="factor" type="category" width={160} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#fff", border: `1px solid ${gridColor}`, borderRadius: 12, color: dark ? "#e2e8f0" : "#1e293b" }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[340px]">
          <h3 className="mb-4 text-lg font-semibold dark:text-dark-text">Feature Importance Summary</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.feature_importance_summary.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor }} />
              <YAxis dataKey="feature" type="category" width={180} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? "#1e293b" : "#fff", border: `1px solid ${gridColor}`, borderRadius: 12, color: dark ? "#e2e8f0" : "#1e293b" }} />
              <Bar dataKey="importance" fill={dark ? "#64748b" : "#334155"} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <RecentPredictionsTable rows={stats.recent_predictions} />
    </div>
  );
}
