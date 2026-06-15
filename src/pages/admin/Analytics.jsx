import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  CurrencyDollar, TrendUp, Users, Stack, FileText, CheckCircle, Clock, Warning, FileDashed,
} from "@phosphor-icons/react";

function Stat({ Icon, label, value, sub, accent = "text-stky-purple", testid }) {
  return (
    <div data-testid={testid} className="rounded-2xl border border-white/5 bg-stky-card p-6">
      <div className="flex items-center justify-between">
        <Icon size={22} weight="duotone" className={accent} />
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">{sub}</span>
      </div>
      <div className="font-display text-3xl font-bold tracking-tight mt-3">{value}</div>
      <div className="text-xs text-white/55 mt-1">{label}</div>
    </div>
  );
}

function RevenueChart({ series }) {
  const max = Math.max(1, ...series.map((d) => d.revenue));
  const W = 800, H = 220, pad = { l: 40, r: 20, t: 20, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const step = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const points = series.map((d, i) => ({
    x: pad.l + i * step,
    y: pad.t + innerH - (d.revenue / max) * innerH,
    ...d,
  }));
  const pathD = points.length
    ? "M " + points.map((p) => `${p.x},${p.y}`).join(" L ")
    : "";
  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x},${pad.t + innerH} L ${points[0].x},${pad.t + innerH} Z`
    : "";

  return (
    <div className="rounded-2xl border border-white/5 bg-stky-card p-6" data-testid="analytics-chart">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Revenue · last 12 months</div>
          <div className="font-display text-xl font-semibold tracking-tight mt-1">Paid invoices over time</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="rev-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9D4CDD" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9D4CDD" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rev-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#9D4CDD" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH - innerH * f} y2={pad.t + innerH - innerH * f} stroke="rgba(255,255,255,0.05)" />
        ))}
        {areaD && <path d={areaD} fill="url(#rev-area)" />}
        {pathD && <path d={pathD} stroke="url(#rev-line)" strokeWidth="2.5" fill="none" />}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#9D4CDD" />
            <text x={p.x} y={H - 12} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/analytics/overview").then((r) => setData(r.data)); }, []);

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  if (!data) return <div className="text-white/60" data-testid="analytics-loading">Loading…</div>;

  const { revenue, clients, projects, invoices, revenue_series, top_clients } = data;
  const growth = revenue.growth_pct;

  return (
    <div data-testid="admin-analytics" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Analytics</div>
        <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Studio metrics.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat Icon={CurrencyDollar} label="Total revenue (paid)" value={fmt(revenue.paid)} sub="Paid" accent="text-green-400" testid="kpi-revenue" />
        <Stat Icon={TrendUp} label="This month" value={fmt(revenue.current_month)} sub={growth == null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`} accent="text-stky-purple" testid="kpi-month" />
        <Stat Icon={Users} label="Active clients" value={clients.active} sub={`of ${clients.total}`} accent="text-stky-blue" testid="kpi-clients" />
        <Stat Icon={Stack} label="Projects" value={projects.published} sub={`${projects.total} total`} accent="text-stky-purple" testid="kpi-projects" />
      </div>

      <RevenueChart series={revenue_series || []} />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-white/5 bg-stky-card p-6">
          <div className="font-display text-lg font-semibold mb-4">Invoice pipeline</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "draft", label: "Draft", Icon: FileDashed, accent: "text-white/65" },
              { key: "sent", label: "Sent", Icon: Clock, accent: "text-stky-purple" },
              { key: "paid", label: "Paid", Icon: CheckCircle, accent: "text-green-400" },
              { key: "overdue", label: "Overdue", Icon: Warning, accent: "text-red-400" },
            ].map(({ key, label, Icon, accent }) => (
              <div key={key} className="rounded-xl border border-white/5 bg-stky-elevated p-4">
                <Icon size={16} weight="fill" className={accent} />
                <div className="font-display text-2xl font-bold tracking-tight mt-2">{invoices.by_status[key] || 0}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-stky-elevated p-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Outstanding balance</div>
              <div className="font-display text-2xl font-bold tracking-tight mt-1 text-stky-purple">{fmt(revenue.outstanding)}</div>
            </div>
            <FileText size={28} weight="duotone" className="text-stky-purple/70" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-white/5 bg-stky-card p-6">
          <div className="font-display text-lg font-semibold mb-4">Top clients by revenue</div>
          {(!top_clients || top_clients.length === 0) ? (
            <div className="text-sm text-white/45 py-6 text-center">No paid invoices yet.</div>
          ) : (
            <ul className="space-y-2">
              {top_clients.map((c, i) => (
                <li key={c.client_id} className="flex items-center justify-between rounded-xl bg-stky-elevated px-4 py-3" data-testid={`top-client-${i}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-7 w-7 grid place-items-center rounded-full bg-stky-purple/20 text-xs font-bold">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">{c.count} invoice{c.count === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <div className="font-display text-base font-semibold text-green-400">{fmt(c.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
