import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { CheckCircle, Sparkle, Printer, ArrowSquareOut, Envelope, Phone } from "@phosphor-icons/react";

const STATUS_COLORS = {
  draft: "text-white/55 border-white/15 bg-white/5",
  sent: "text-stky-purple border-stky-purple/40 bg-stky-purple/15",
  paid: "text-green-400 border-green-500/40 bg-green-500/15",
  overdue: "text-red-400 border-red-500/40 bg-red-500/15",
};

export default function InvoiceShare() {
  const { token } = useParams();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/invoices/share/${token}`)
      .then((r) => setInv(r.data))
      .catch((e) => setErr(e?.response?.data?.detail || "Invoice not found"));
  }, [token]);

  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-stky-bg text-white p-6">
      <div className="text-center">
        <div className="font-display text-3xl font-bold tracking-tight">Not found</div>
        <div className="text-white/55 mt-2">{err}</div>
      </div>
    </div>
  );
  if (!inv) return <div className="min-h-screen flex items-center justify-center bg-stky-bg text-white/60">Loading…</div>;

  const fmt = (n) => `${inv.currency || "USD"} ${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const stcls = STATUS_COLORS[inv.status] || STATUS_COLORS.draft;
  const pdfHref = `${API_BASE}/invoices/${inv.id}/pdf?token=${token}`;

  return (
    <div className="relative min-h-screen bg-stky-bg text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(800px 400px at 12% 8%, rgba(157,76,221,0.18), transparent 60%), radial-gradient(700px 500px at 92% 20%, rgba(0,229,255,0.08), transparent 60%)" }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 group">
            <span className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-stky-purple to-stky-blue">
              <Sparkle size={20} weight="fill" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">STKY<span className="text-stky-purple">.</span></span>
          </a>
          <div className="flex items-center gap-2">
            <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="stky-btn stky-btn-ghost !py-2 !px-4 text-sm"><ArrowSquareOut size={14} /> PDF</a>
            <button onClick={() => window.print()} className="stky-btn !py-2 !px-4 text-sm"><Printer size={14} /> Print</button>
          </div>
        </div>

        {/* Invoice paper */}
        <div className="relative rounded-3xl glass-strong p-8 sm:p-10 overflow-hidden" data-testid="invoice-paper">
          {/* PAID watermark */}
          {inv.status === "paid" && (
            <div aria-hidden className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="font-display text-[10rem] sm:text-[14rem] font-black text-green-500/[0.08] rotate-[-18deg] tracking-tighter whitespace-nowrap select-none">
                STKY PAID
              </div>
            </div>
          )}

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Invoice</div>
              <div className="font-display text-3xl font-bold tracking-tight mt-1">{inv.invoice_number}</div>
              {inv.studio?.tagline && <div className="text-xs text-white/45 mt-1">{inv.studio.tagline}</div>}
            </div>
            <span className={`text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border ${stcls}`}>
              {inv.status === "paid" && <CheckCircle size={11} weight="fill" className="inline mr-1" />}
              {inv.status}
            </span>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-1">From</div>
              <div className="font-display text-lg font-semibold">{inv.studio?.name || "STKY Studio"}</div>
              {inv.studio?.email && <div className="text-white/65 inline-flex items-center gap-1.5 mt-0.5"><Envelope size={11} /> {inv.studio.email}</div>}
              {inv.studio?.phone && <div className="text-white/65 inline-flex items-center gap-1.5 mt-0.5"><Phone size={11} /> {inv.studio.phone}</div>}
              {inv.studio?.address && <div className="text-white/65 mt-0.5">{inv.studio.address}</div>}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-1">Billed to</div>
              <div className="font-display text-lg font-semibold">{inv.client_snapshot?.name || "Client"}</div>
              {inv.client_snapshot?.company && <div className="text-white/65">{inv.client_snapshot.company}</div>}
              {inv.client_snapshot?.email && <div className="text-white/65">{inv.client_snapshot.email}</div>}
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-black/30 border border-white/10 p-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Issued</div>
              <div className="font-display text-base font-semibold mt-1">{inv.issued_date || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Due</div>
              <div className="font-display text-base font-semibold mt-1">{inv.due_date || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Amount due</div>
              <div className="font-display text-base font-semibold mt-1 neon-text">{fmt(inv.total)}</div>
            </div>
          </div>

          {/* Items */}
          <div className="relative mt-8">
            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 px-2 pb-2 border-b border-white/10">
              <div className="col-span-7">Description</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {(inv.items || []).map((it, i) => {
              const q = Number(it.quantity) || 0;
              const p = Number(it.unit_price) || 0;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 py-3 text-sm border-b border-white/5">
                  <div className="col-span-7">{it.description}</div>
                  <div className="col-span-1 text-right text-white/70">{q}</div>
                  <div className="col-span-2 text-right text-white/70">{fmt(p)}</div>
                  <div className="col-span-2 text-right font-medium">{fmt(q * p)}</div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="relative mt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{fmt(inv.subtotal)}</span></div>
              <div className="flex justify-between text-white/70"><span>Tax ({inv.tax_rate || 0}%)</span><span>{fmt(inv.tax_amount)}</span></div>
              <div className="flex justify-between font-display text-2xl font-bold tracking-tight pt-3 border-t border-white/15">
                <span>Total</span>
                <span className="neon-text">{fmt(inv.total)}</span>
              </div>
              {inv.status === "paid" && inv.paid_date && (
                <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs inline-flex items-center gap-1.5">
                  <CheckCircle size={12} weight="fill" className="text-green-400" />
                  Paid on <span className="font-medium text-green-400">{inv.paid_date}</span>
                </div>
              )}
            </div>
          </div>

          {(inv.notes || inv.payment_instructions) && (
            <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {inv.notes && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Notes</div>
                  <p className="text-white/75 leading-relaxed">{inv.notes}</p>
                </div>
              )}
              {inv.payment_instructions && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Payment instructions</div>
                  <p className="text-white/75 leading-relaxed whitespace-pre-wrap">{inv.payment_instructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-white/40 mt-6">© {new Date().getFullYear()} STKY  · Designer
          GFX artist
          Music Producer.</div>
      </div>
    </div>
  );
}
