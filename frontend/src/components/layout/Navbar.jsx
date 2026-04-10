import { BarChart3, Clock3, FileText, Home, Landmark } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/apply", label: "Apply", icon: FileText },
  { to: "/result", label: "Result", icon: Landmark },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: Clock3 },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Loan Intelligence Suite</p>
          <h1 className="text-lg font-bold text-slate-900">Loan Approval Prediction</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-100 text-brand-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
