import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_BASE, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  FileText, Plus, MagnifyingGlass, ArrowUpRight, CheckCircle, Clock, Warning, FileDashed,
} from "@phosphor-icons/react";

const STATUS_COLORS = {
  draft: { ring: "border-white/10 text-white/55", bg: "bg-white/5" },
  sent: { ring: "border-stky-purple/40 text-stky-purple", bg: "bg-stky-purple/15" },
  paid: { ring: "border-green-500/40 text-green-400", bg: "bg-green-500/15" },
  overdue: { ring: "border-red-500/40 text-red-400", bg: "bg-red-500/15" },
};

const FILTERS = [
  { slug: "all", label: "All" },
  { slug: "draft", label: "Draft" },
  { slug: "sent", label: "Sent" },
  { slug: "paid", label: "Paid" },
  { slug: "overdue", label: "Overdue" },
];

function StatusPill({ status, testid }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const Icon = { paid: CheckCircle, sent: Clock, overdue: Warning, draft: FileDashed }[status] || FileDashed;
  return (
    <span data-testid={testid} className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border ${s.ring} ${s.bg}`}>
      <Icon size={10} weight="fill" /> {status}
    </span>
  );
}

export default function Invoices() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("all");
  const [q, setQ] = useState("");

  const reload = () => api.get("/invoices").then((r) => setItems(r.data.items || []));
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (active !== "all") list = list.filter((i) => i.status === active);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((i) =>
        (i.invoice_number || "").toLowerCase().includes(s) ||
        (i.client_snapshot?.name || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [items, active, q]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        const t = Number(i.total) || 0;
        acc.total += t;
        if (i.status === "paid") acc.paid += t;
        if (i.status === "sent" || i.status === "overdue") acc.outstanding += t;
        return acc;
      },
      { total: 0, paid: 0, outstanding: 0 }
    );
  }, [items]);

  const fmt = (n, cur = "USD") => `${cur} ${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const handleDelete = async (id) => {
  if (!window.confirm("Delete this invoice?")) return;

  try {
    await api.delete(`/invoices/${id}`);
    reload();
  } catch (err) {
    console.error(err);
    alert("Failed to delete invoice");
  }
};

  const newInvoice = () => nav("/admin/invoices/new");

  return (
    <div data-testid="admin-invoices" className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Invoices</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Professional invoicing.</h1>
        </div>
        <button onClick={newInvoice} className="stky-btn" data-testid="invoice-new"><Plus size={16} weight="bold" /> New invoice</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-stky-card p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Total billed</div>
          <div className="font-display text-3xl font-bold tracking-tight mt-2">{fmt(totals.total)}</div>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-green-400">Paid</div>
          <div className="font-display text-3xl font-bold tracking-tight mt-2 text-green-400">{fmt(totals.paid)}</div>
        </div>
        <div className="rounded-2xl border border-stky-purple/20 bg-stky-purple/[0.05] p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-stky-purple">Outstanding</div>
          <div className="font-display text-3xl font-bold tracking-tight mt-2 text-stky-purple">{fmt(totals.outstanding)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input data-testid="invoice-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice # or client…"
            className="pl-10 w-full px-4 py-2.5 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.slug} onClick={() => setActive(f.slug)} data-testid={`invoice-filter-${f.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs border ${active === f.slug ? "bg-stky-purple text-white border-stky-purple" : "border-white/10 text-white/65 hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-stky-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.22em] text-white/45 border-b border-white/5">
            <tr><th className="text-left p-4">Invoice</th><th className="text-left p-4">Client</th><th className="text-left p-4">Issued</th><th className="text-left p-4">Due</th><th className="text-right p-4">Total</th><th className="text-center p-4">Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-white/45">No invoices.</td></tr>}
            {filtered.map((i) => (
              <tr key={i.id} data-testid={`invoice-row-${i.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4 font-mono text-xs text-white/85">{i.invoice_number}</td>
                <td className="p-4">{i.client_snapshot?.name || "—"}</td>
                <td className="p-4 text-white/65">{i.issued_date || "—"}</td>
                <td className="p-4 text-white/65">{i.due_date || "—"}</td>
                <td className="p-4 text-right font-medium">{fmt(i.total, i.currency)}</td>
                <td className="p-4 text-center"><StatusPill status={i.status} /></td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Link to={`/admin/invoices/${i.id}`} data-testid={`invoice-open-${i.id}`} className="inline-flex items-center gap-1 text-xs text-stky-blue hover:text-stky-blue-hi">Open <ArrowUpRight size={11} weight="bold" /></Link>
                  <a href={`${API_BASE}/invoices/${i.id}/pdf?token=${i.share_token}`} target="_blank" rel="noopener noreferrer" className="ml-3 inline-flex items-center gap-1 text-xs text-white/55 hover:text-white"><FileText size={11} /> PDF</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
