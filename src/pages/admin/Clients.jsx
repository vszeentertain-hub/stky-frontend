import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  UserPlus, MagnifyingGlass, WhatsappLogo, EnvelopeSimple, InstagramLogo,
  CurrencyDollar, FileText, NotePencil, Trash, X, PencilSimple,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const EMPTY = { name: "", email: "", whatsapp: "", instagram: "", company: "", notes: "", status: "active" };

function ClientForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const ch = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      if (initial?.id) await api.patch(`/clients/${initial.id}`, payload);
      else await api.post("/clients", payload);
      toast.success(initial ? "Client updated" : "Client added");
      onSaved && onSaved();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="client-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Name</span>
          <input data-testid="cf-name" value={form.name} onChange={ch("name")} required className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Company</span>
          <input data-testid="cf-company" value={form.company} onChange={ch("company")} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Email</span>
          <input data-testid="cf-email" type="email" value={form.email} onChange={ch("email")} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">WhatsApp</span>
          <input data-testid="cf-whatsapp" value={form.whatsapp} onChange={ch("whatsapp")} placeholder="+15551234567" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Instagram</span>
          <input data-testid="cf-instagram" value={form.instagram} onChange={ch("instagram")} placeholder="@handle" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Status</span>
          <select data-testid="cf-status" value={form.status} onChange={ch("status")} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Lead</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Notes</span>
        <textarea data-testid="cf-notes" rows={4} value={form.notes} onChange={ch("notes")} className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
      </label>
      <div className="flex items-center gap-2 pt-2">
        <button data-testid="cf-submit" disabled={saving} className="stky-btn">{saving ? "Saving…" : initial ? "Save changes" : "Add client"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="stky-btn stky-btn-ghost">Cancel</button>}
      </div>
    </form>
  );
}

export default function Clients() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => api.get(`/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((r) => setItems(r.data.items || []));
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(reload, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const remove = async (c) => {
    if (!window.confirm(`Delete client "${c.name}"? Their invoices remain.`)) return;
    try { await api.delete(`/clients/${c.id}`); reload(); toast.success("Deleted"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div data-testid="admin-clients" className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Client Management</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Your client roster.</h1>
          <p className="text-sm text-white/55 mt-2">{items.length} client{items.length === 1 ? "" : "s"} · Track contacts, notes, and revenue.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="stky-btn" data-testid="client-add"><UserPlus size={16} weight="bold" /> New client</button>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input data-testid="client-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…"
          className="pl-10 w-full px-4 py-2.5 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
          <div className="col-span-3 rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/45">
            No clients yet. Add your first one.
          </div>
        )}
        {items.map((c) => (
          <div key={c.id} data-testid={`client-card-${c.id}`} className="rounded-2xl border border-white/5 bg-stky-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-display text-lg font-semibold truncate">{c.name}</div>
                <div className="text-xs text-white/45 truncate">{c.company || "—"}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-stky-purple/20 text-stky-purple' : 'bg-white/5 text-white/50'}`}>{c.status}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {c.email && <div className="flex items-center gap-2 text-white/70"><EnvelopeSimple size={12} className="text-stky-blue" /> <span className="truncate">{c.email}</span></div>}
              {c.whatsapp && <div className="flex items-center gap-2 text-white/70"><WhatsappLogo size={12} className="text-green-400" /> {c.whatsapp}</div>}
              {c.instagram && <div className="flex items-center gap-2 text-white/70"><InstagramLogo size={12} className="text-pink-400" /> {c.instagram}</div>}
            </div>

            {c.notes && <div className="text-xs text-white/55 line-clamp-2 italic">"{c.notes}"</div>}

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Paid</div>
                <div className="font-display text-sm font-semibold text-green-400">{fmt(c.revenue?.paid)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Outstanding</div>
                <div className="font-display text-sm font-semibold text-stky-purple">{fmt(c.revenue?.outstanding)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Invoices</div>
                <div className="font-display text-sm font-semibold">{c.revenue?.invoice_count ?? 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-2 flex-wrap">
              <Link to={`/admin/invoices/new?client=${c.id}`} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-stky-purple/40 text-white hover:bg-stky-purple/15">
                <FileText size={10} /> New invoice
              </Link>
              <button onClick={() => { setEditing(c); setShowForm(true); }} data-testid={`client-edit-${c.id}`} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 text-white/70 hover:text-white">
                <PencilSimple size={10} /> Edit
              </button>
              <button onClick={() => remove(c)} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Trash size={10} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="max-w-2xl mx-auto my-10" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-3xl glass-strong p-6 sm:p-8" data-testid="client-modal">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-2xl font-bold tracking-tight">{editing ? "Edit client" : "Add client"}</div>
                <button onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>
              <ClientForm initial={editing} onSaved={() => { setShowForm(false); reload(); }} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
