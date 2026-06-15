import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { List, X, Sparkle } from "@phosphor-icons/react";
import ContactModal from "@/components/public/ContactModal";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
];

function Navbar({ onContactClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <header
      data-testid="public-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 py-3 transition-all duration-500 ${scrolled ? "glass-strong" : "glass"}`}>
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stky-purple to-stky-blue overflow-hidden">
              <Sparkle size={18} weight="fill" className="text-white relative z-10" />
              <span className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
              <span className="absolute -inset-2 rounded-2xl bg-stky-purple/40 blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">STKY<span className="text-stky-purple">.</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm transition-colors ${isActive ? "text-white bg-white/5" : "text-white/65 hover:text-white"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onContactClick} data-testid="nav-cta" className="hidden sm:inline-flex stky-btn !py-2 !px-4 text-sm">Contact Me</button>
            <button onClick={() => setOpen(!open)} className="md:hidden h-10 w-10 grid place-items-center rounded-full glass" data-testid="nav-mobile-toggle" aria-label="Menu">
              {open ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl glass-strong p-3 grid grid-cols-1 gap-1" data-testid="nav-mobile-menu">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `px-3 py-2.5 rounded-xl text-sm ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
                {n.label}
              </NavLink>
            ))}
            <button onClick={() => { setOpen(false); onContactClick(); }} data-testid="nav-mobile-cta" className="stky-btn justify-center mt-1">Contact Me</button>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer data-testid="public-footer" className="relative mt-32 border-t border-white/5 pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-gradient-to-br from-stky-purple to-stky-blue">
              <Sparkle size={18} weight="fill" />
            </span>
            <span className="font-display text-lg font-bold">STKY<span className="text-stky-purple">.</span></span>
          </div>
          <p className="text-white/55 text-sm max-w-md leading-relaxed">
            Music Designer and Producer who creates visual identities, cover artwork, and immersive creative experiences for artists, creators, and Label.
          </p>
          <p className="mt-6 font-display text-2xl tracking-tight max-w-md">Designer
            GFX artist <span className="neon-text">Music Producer</span>.</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-3">Studio</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-3">Connect</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>yoow@stky.com</li>
            <li>Worldwide · Remote</li>
            <li><Link to="/admin/login" className="hover:text-white">
              Studio Login
            </Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
        <div>© {new Date().getFullYear()} STKY . All rights reserved.</div>
        <div>Crafted in the void with intent.</div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const loc = useLocation();
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    const openModal = () => setContactOpen(true);

    window.addEventListener("open-contact-modal", openModal);

    return () => {
      window.removeEventListener("open-contact-modal", openModal);
    };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [loc.pathname]);
  return (
    <div className="relative min-h-screen bg-stky-bg overflow-hidden">
      <Navbar onContactClick={() => setContactOpen(true)} />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
