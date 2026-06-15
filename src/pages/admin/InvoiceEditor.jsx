
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { api, API_BASE, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus, Trash, FileText, PaperPlaneTilt, CheckCircle, Eye, FloppyDisk,
  Sparkle, UploadSimple, ArrowLeft, Clipboard, Package,
} from "@phosphor-icons/react";

const EMPTY_ITEM = () => ({ description: "", quantity: 1, unit_price: 0 });

export default function InvoiceEditor() {
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const [params] = useSearchParams();
  const nav = useNavigate();

  const [clients, setClients] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState(params.get("client") || "");
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [taxRate, setTaxRate] = useState(0);
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState("draft");
  const [shareToken, setShareToken] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [deliveryFileIds, setDeliveryFileIds] = useState([]);

  // Deliver-files dialog state
  const [showDeliver, setShowDeliver] = useState(false);
  const [deliverFiles, setDeliverFiles] = useState([]);  // {id, filename}
  const [deliverMsg, setDeliverMsg] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    api.get("/clients").then((r) => setClients(r.data.items || []));
    api.get("/media").then((r) => setMedia(r.data.items || [])).catch(() => { });

    api.get("/settings").then((r) => {
      setNotes(r.data.notes || "");
      setPaymentInstructions(r.data.payment_instructions || "");
    }).catch(() => { });
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    api.get(`/invoices/${id}`).then((r) => {
      const d = r.data;
      setClientId(d.client_id || "");
      setItems(d.items?.length ? d.items : [EMPTY_ITEM()]);
      setTaxRate(d.tax_rate || 0);
      setIssuedDate(d.issued_date || "");
      setDueDate(d.due_date || "");
      setNotes(d.notes || "");
      setPaymentInstructions(d.payment_instructions || "");
      api.get("/settings").then((r) => {
        console.log("SETTINGS", r.data);
        setPaymentInstructions(r.data.payment_instructions || "");
      }).catch(() => { });
      setCurrency(d.currency || "USD");
      setStatus(d.status || "draft");
      setShareToken(d.share_token || "");
      setInvoiceNumber(d.invoice_number || "");
      setPaidDate(d.paid_date || "");
      setDeliveryFileIds(d.delivery_file_ids || []);
      setLoading(false);
    }).catch(() => { toast.error("Invoice not found"); nav("/admin/invoices"); });
  }, [id, isNew, nav]);

  const totals = useMemo(() => {
    const sub = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const tax = sub * (Number(taxRate) || 0) / 100;
    return { subtotal: sub, tax, total: sub + tax };
  }, [items, taxRate]);

  const updItem = (idx, key, val) => setItems(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const addItem = () => setItems([...items, EMPTY_ITEM()]);
  const rmItem = (idx) => setItems(items.length > 1 ? items.filter((_, i) => i !== idx) : items);

  const save = async () => {
    if (!clientId) return toast.error("Select a client");
    setSaving(true);
    try {
      const payload = {
        client_id: clientId,
        items: items.map((it) => ({ description: it.description, quantity: Number(it.quantity) || 0, unit_price: Number(it.unit_price) || 0 })),
        tax_rate: Number(taxRate) || 0,
        issued_date: issuedDate || undefined,
        due_date: dueDate || undefined,
        notes, payment_instructions: paymentInstructions, currency,
      };
      if (isNew) {
        const { data } = await api.post("/invoices", payload);
        toast.success(`Invoice ${data.invoice_number} created`);
        nav(`/admin/invoices/${data.id}`);
      } else {
        const updPayload = { items: payload.items, tax_rate: payload.tax_rate, issued_date: payload.issued_date, due_date: payload.due_date, notes, payment_instructions: paymentInstructions, currency };
        await api.patch(`/invoices/${id}`, updPayload);
        toast.success("Saved");
      }
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setSaving(false); }
  };

  const sendEmail = async () => {
    if (isNew) return toast.error("Save first");
    if (!window.confirm("Send invoice email to the client?")) return;
    try {
      const { data } = await api.post(`/invoices/${id}/send`, {});
      if (data.sent) toast.success("Invoice email sent");
      else toast.info("Invoice marked as sent (no email key — RESEND_API_KEY not configured)");
      setStatus("sent");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const markPaid = async () => {
    if (isNew) return toast.error("Save first");
    if (!window.confirm("Mark this invoice as PAID and send confirmation email?")) return;
    try {
      const { data } = await api.post(`/invoices/${id}/mark-paid`, { send_email: true });
      toast.success(data.email_id ? "Marked paid · confirmation sent" : "Marked paid");
      setStatus("paid"); setPaidDate(data.invoice?.paid_date || "");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const uploadDeliveryFile = async (fileList) => {
    if (!fileList?.length) return;
    const uploaded = [];
    for (const f of fileList) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("folder", "deliveries");
        const { data } = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push(data);
      } catch (e) { toast.error(`${f.name}: ${formatApiError(e)}`); }
    }
    setDeliverFiles((prev) => [...prev, ...uploaded]);
    if (uploaded.length) toast.success(`Uploaded ${uploaded.length} file(s)`);
  };

  const submitDelivery = async () => {
    if (deliverFiles.length === 0) return toast.error("Add at least one file");
    try {
      const { data } = await api.post(`/invoices/${id}/deliver`, {
        file_ids: deliverFiles.map((f) => f.id),
        message: deliverMsg,
      });
      setDeliveryFileIds(data.links.map((_, i) => deliverFiles[i]?.id).filter(Boolean));
      if (data.email_id) toast.success("Delivery email sent");
      else toast.info(`Delivery prepared (${data.links.length} links) — no email key configured`);
      setShowDeliver(false);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/#/invoice/${shareToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Public invoice link copied");
  };

  const fmt = (n) => `${currency} ${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return <div className="text-white/60">Loading…</div>;

  return (
    <div data-testid="admin-invoice-editor" className="space-y-6">
      <Link to="/admin/invoices" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft size={14} /> All invoices</Link>

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{isNew ? "New Invoice" : "Edit Invoice"}</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2 flex items-center gap-3">
            {invoiceNumber || "Draft invoice"}
            {!isNew && <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full ${status === 'paid' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : status === 'sent' ? 'bg-stky-purple/15 text-stky-purple border border-stky-purple/40' : 'bg-white/5 text-white/55 border border-white/10'}`}>{status}</span>}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={save} disabled={saving} className="stky-btn stky-btn-ghost" data-testid="inv-save"><FloppyDisk size={16} /> {saving ? "Saving…" : "Save"}</button>
          {!isNew && shareToken && (
            <>
              <a href={`${API_BASE}/invoices/${id}/pdf?token=${shareToken}`} target="_blank" rel="noopener noreferrer" className="stky-btn stky-btn-ghost"><FileText size={16} /> PDF</a>
              <button onClick={copyLink} className="stky-btn stky-btn-ghost"><Clipboard size={16} /> Copy link</button>
              <a href={`/#/invoice/${shareToken}`} target="_blank" rel="noopener noreferrer" className="stky-btn stky-btn-ghost"><Eye size={16} /> Preview</a>
              <button onClick={sendEmail} className="stky-btn" data-testid="inv-send"><PaperPlaneTilt size={16} /> Send invoice</button>
              {status !== "paid" && <button onClick={markPaid} className="stky-btn !bg-green-500/90 hover:!bg-green-500" data-testid="inv-mark-paid"><CheckCircle size={16} weight="fill" /> Mark paid</button>}
              <button onClick={() => setShowDeliver(true)} className="stky-btn stky-btn-ghost" data-testid="inv-deliver"><Package size={16} /> Deliver files</button>
<button
  onClick={async () => {
    if (!window.confirm("Delete this invoice permanently?")) return;

    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted");
      nav("/admin/invoices");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  }}
  className="stky-btn bg-red-600 hover:bg-red-700 text-white"
>
  Delete Invoice
</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-8 rounded-3xl border border-white/5 bg-stky-card p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Client</span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} data-testid="inv-client" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none">
                <option value="">Select a client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} {c.company ? `· ${c.company}` : ""}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Currency</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none">
                  {["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Tax %</span>
                <input type="number" min="0" step="0.5" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} data-testid="inv-tax" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none" />
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Issued</span>
              <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Due</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none" />
            </label>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Line items</div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input value={it.description} onChange={(e) => updItem(idx, "description", e.target.value)} placeholder="Item description"
                    data-testid={`inv-item-desc-${idx}`} className="col-span-12 md:col-span-6 px-3 py-2 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none text-sm" />
                  <input type="number" min="0" step="0.5" value={it.quantity} onChange={(e) => updItem(idx, "quantity", e.target.value)} placeholder="Qty"
                    data-testid={`inv-item-qty-${idx}`} className="col-span-4 md:col-span-2 px-3 py-2 rounded-xl bg-stky-elevated border border-white/10 outline-none text-sm" />
                  <input type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => updItem(idx, "unit_price", e.target.value)} placeholder="Price"
                    data-testid={`inv-item-price-${idx}`} className="col-span-5 md:col-span-3 px-3 py-2 rounded-xl bg-stky-elevated border border-white/10 outline-none text-sm" />
                  <button onClick={() => rmItem(idx)} className="col-span-3 md:col-span-1 h-9 grid place-items-center rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition"><Trash size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-2 inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5"><Plus size={12} /> Add line item</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Notes</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thanks for the trust…"
                className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Payment instructions</span>
              <textarea rows={3} value={paymentInstructions} onChange={(e) => setPaymentInstructions(e.target.value)} placeholder="Bank transfer / PayPal / Wise details…"
                className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
            </label>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-stky-card p-6">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Summary</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/55">Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-white/55">Tax ({taxRate}%)</span><span>{fmt(totals.tax)}</span></div>
              <div className="flex justify-between font-display text-xl font-bold tracking-tight pt-3 border-t border-white/5">
                <span>Total</span>
                <span className="neon-text" data-testid="inv-total">{fmt(totals.total)}</span>
              </div>
            </div>
            {status === "paid" && paidDate && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-xs">
                <CheckCircle size={12} weight="fill" className="text-green-400 inline mr-1" />
                Paid on <span className="font-medium text-green-400">{paidDate}</span>
              </div>
            )}
          </div>

          {!isNew && deliveryFileIds.length > 0 && (
            <div className="rounded-2xl border border-stky-blue/20 bg-stky-blue/[0.04] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-stky-blue inline-flex items-center gap-1"><Package size={11} weight="fill" /> Delivered files</div>
              <div className="text-xs text-white/55 mt-2">{deliveryFileIds.length} file(s) prepared for client.</div>
            </div>
          )}
        </aside>
      </div>

      {showDeliver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowDeliver(false)}>
          <div className="max-w-xl mx-auto my-10" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-3xl glass-strong p-6 sm:p-8" data-testid="deliver-modal">
              <div className="font-display text-2xl font-bold tracking-tight mb-2 inline-flex items-center gap-2"><Sparkle size={20} weight="fill" className="text-stky-purple" /> Send final files</div>
              <p className="text-sm text-white/55">Upload final deliverables — we'll email the client secure download links.</p>

              <div className="mt-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-stky-purple/50 bg-stky-elevated/40 p-6 text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
                <UploadSimple size={26} className="text-stky-purple mx-auto" />
                <div className="text-sm text-white/70 mt-2">Click to upload final files</div>
                <input ref={fileRef} type="file" multiple hidden onChange={(e) => uploadDeliveryFile(Array.from(e.target.files || []))} />
              </div>

              {deliverFiles.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {deliverFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between text-sm rounded-lg bg-stky-elevated px-3 py-2">
                      <span className="truncate">{f.filename}</span>
                      <button onClick={() => setDeliverFiles(deliverFiles.filter((x) => x.id !== f.id))} className="text-white/45 hover:text-red-400"><Trash size={12} /></button>
                    </li>
                  ))}
                </ul>
              )}

              <label className="block mt-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Optional message to client</span>
                <textarea rows={3} value={deliverMsg} onChange={(e) => setDeliverMsg(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
              </label>

              <div className="flex items-center gap-2 mt-5">
                <button onClick={submitDelivery} className="stky-btn" data-testid="deliver-submit"><PaperPlaneTilt size={16} /> Send delivery</button>
                <button onClick={() => setShowDeliver(false)} className="stky-btn stky-btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
