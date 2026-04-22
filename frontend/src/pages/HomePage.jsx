import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Smart Decision Engine",
    text: "Predict loan outcomes with a trained machine learning pipeline based on real financial attributes.",
    icon: Sparkles,
  },
  {
    title: "Risk Analysis",
    text: "Understand key rejection drivers and feature-level influence for transparent lending decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Portfolio Analytics",
    text: "Track approvals, rejections, and application trends in a dedicated dashboard.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="relative">
          <div className="absolute -right-14 -top-12 h-36 w-36 rounded-full bg-brand-100 blur-2xl dark:bg-brand-500/20" />
          <div className="absolute -bottom-8 -left-10 h-28 w-28 rounded-full bg-danger-100 blur-2xl dark:bg-danger-500/20" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-dark-muted">Fintech Credit Intelligence</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-900 dark:text-dark-text">
              Loan Approval Prediction and Risk Analysis Platform
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-dark-muted">
              Evaluate applications in seconds, explain approval confidence, and monitor lending trends across your portfolio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                Start Loan Application
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-slate-700"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card">
              <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-dark-muted">
                <Icon size={18} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-dark-muted">{item.text}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
