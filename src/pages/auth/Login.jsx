import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";

export default function Login() {
  const { login, error } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);

    if (ok) nav("/admin");
  };

  return (
    <div data-testid="page-login" className="relative min-h-screen flex items-center justify-center bg-stky-bg px-4">
      <div aria-hidden className="absolute inset-0 hero-glow opacity-80 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="h-10 w-10 grid place-items-center rounded-lg bg-gradient-to-br from-stky-purple to-stky-blue">
            <Sparkle size={20} weight="fill" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">STKY<span className="text-stky-purple">.</span></span>
        </Link>
        <div className="rounded-3xl glass-strong p-8 tracing-border">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Studio Access</div>
          <h1 className="font-display text-3xl font-bold tracking-tighter mt-2">Welcome back.</h1>
          <p className="text-sm text-white/55 mt-1">Sign in to manage your portfolio.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Email</span>
              <input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Password</span>
              <input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none" />
            </label>
            {error && <div data-testid="login-error" className="text-sm text-red-400">{error}</div>}
            <button data-testid="login-submit" disabled={loading} className="stky-btn w-full justify-center">
              {loading ? "Signing in…" : (<>Sign in <ArrowRight size={16} weight="bold" /></>)}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
