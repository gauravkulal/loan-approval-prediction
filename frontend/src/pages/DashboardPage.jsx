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

const pieColors = ["#14a44d", "#dc2626"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    return <div className="card">Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-danger-500">{error}</div>;
  }

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
          <h3 className="mb-4 text-lg font-semibold">Approval vs Rejection</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={stats.approval_vs_rejection} dataKey="value" nameKey="name" outerRadius={110} label>
                {stats.approval_vs_rejection.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[320px]">
          <h3 className="mb-4 text-lg font-semibold">Loan Amount Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.loan_amount_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-[340px]">
          <h3 className="mb-4 text-lg font-semibold">Risk Factor Frequency</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.risk_factor_frequency} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="factor" type="category" width={160} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[340px]">
          <h3 className="mb-4 text-lg font-semibold">Feature Importance Summary</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.feature_importance_summary.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={180} />
              <Tooltip />
              <Bar dataKey="importance" fill="#334155" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <RecentPredictionsTable rows={stats.recent_predictions} />
    </div>
  );
}
