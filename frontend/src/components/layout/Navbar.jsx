import { BarChart3, Clock3, FileText, Home, Info, Landmark, LogOut, Moon, Sun, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/apply", label: "Apply", icon: FileText },
  { to: "/result", label: "Result", icon: Landmark },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: Clock3 },
  { to: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur transition-colors duration-300 dark:border-dark-border dark:bg-dark-card/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-dark-muted">Loan Intelligence Suite</p>
          <h1 className="text-lg font-bold text-slate-900 dark:text-dark-text">Loan Approval Prediction</h1>
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
                      ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-500"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-dark-muted dark:hover:bg-slate-800 dark:hover:text-dark-text"
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            );
          })}

          {/* Dark mode toggle */}
          <button
            id="theme-toggle"
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-dark-muted dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User & Logout */}
          {user && (
            <>
              <div className="ml-1 hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600 sm:inline-flex dark:bg-slate-800 dark:text-dark-muted">
                <User size={14} />
                <span className="max-w-[120px] truncate">{user.fullname}</span>
              </div>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-danger-500 transition hover:bg-danger-50 dark:hover:bg-danger-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
