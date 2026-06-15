import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  House, Stack, UploadSimple, Star, Folders, Image, GearSix, SignOut, Sparkle, ArrowSquareOut,
  UsersThree, Receipt, ChartLineUp,
} from "@phosphor-icons/react";

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: House, end: true },
  { to: "/admin/portfolio", label: "Portfolio", Icon: Stack },
  { to: "/admin/upload", label: "Upload", Icon: UploadSimple },
  { to: "/admin/featured", label: "Featured", Icon: Star },
  { to: "/admin/categories", label: "Categories", Icon: Folders },
  { to: "/admin/media", label: "Media", Icon: Image },
  { to: "/admin/clients", label: "Clients", Icon: UsersThree },
  { to: "/admin/invoices", label: "Invoices", Icon: Receipt },
  { to: "/admin/analytics", label: "Analytics", Icon: ChartLineUp },
  { to: "/admin/settings", label: "Settings", Icon: GearSix },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const nav = useNavigate();
  const doLogout = async () => { await logout(); nav("/admin/login"); };

  return (
    <div className="min-h-screen bg-stky-bg text-white flex" data-testid="admin-layout">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-stky-card/50 backdrop-blur-md sticky top-0 h-screen">
        <Link to="/admin" className="flex items-center gap-2 p-5 border-b border-white/5">
          <span className="h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-stky-purple to-stky-blue">
            <Sparkle size={16} weight="fill" />
          </span>
          <div>
            <div className="font-display font-bold leading-none">STKY Studio</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">Admin Console</div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`admin-nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-stky-purple/15 text-white border border-stky-purple/30" : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Icon size={18} weight="duotone" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/65 hover:text-white hover:bg-white/5">
            <ArrowSquareOut size={18} /> View site
          </Link>
          <button onClick={doLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/65 hover:text-white hover:bg-white/5">
            <SignOut size={18} /> Sign out
          </button>
          {user?.email && <div className="px-3 pt-2 text-[10px] text-white/35 truncate">{user.email}</div>}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-stky-bg z-40">
          <Link to="/admin" className="font-display font-bold">STKY Admin</Link>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="text-xs text-white/60">View site</Link>
            <button onClick={doLogout} className="text-xs text-white/60">Logout</button>
          </div>
        </div>
        <div className="md:hidden flex overflow-x-auto gap-1 p-3 border-b border-white/5">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs ${isActive ? "bg-stky-purple/20 text-white border border-stky-purple/40" : "border border-white/10 text-white/60"}`}>{label}</NavLink>
          ))}
        </div>
        <div className="p-5 sm:p-8 max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
}
