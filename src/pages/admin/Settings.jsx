import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const FIELDS = [
  { key: "site_title", label: "Site title" },
  { key: "tagline", label: "Tagline" },
  { key: "about", label: "About" },
  { key: "email", label: "Contact email" },
  { key: "whatsapp", label: "WhatsApp (e.g. +15551234567 or wa.me link)" },
  { key: "discord", label: "Discord (username or invite URL)" },
  { key: "instagram", label: "Instagram (handle or URL)" },
  { key: "twitter", label: "Twitter/X URL" },
  { key: "behance", label: "Behance URL" },
  { key: "studio_address", label: "Studio address (for invoices)" },
  { key: "studio_phone", label: "Studio phone (for invoices)" },
  { key: "default_tax_rate", label: "Default tax rate %" },
  { key: "currency", label: "Default currency (USD/EUR/…)" },
  { key: "payment_instructions", label: "Default payment instructions" },
  { key: "notes", label: "Default invoice notes" },
];

export default function Settings() {
  const [s, setS] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/settings").then((r) => setS(r.data || {})); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/settings", s);
      setS(data);
      toast.success("Settings saved");
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <div data-testid="admin-settings" className="space-y-6 max-w-3xl">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Settings</div>
        <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Studio configuration.</h1>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-white/5 bg-stky-card p-6 sm:p-8 space-y-4">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">{label}</span>
            {key === "about" ||
              key === "payment_instructions" ||
              key === "notes" ? (
              <textarea data-testid={`settings-${key}`} rows={4} value={s[key] || ""} onChange={(e) => setS({ ...s, [key]: e.target.value })}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
            ) : (
              <input data-testid={`settings-${key}`} value={s[key] ?? ""} onChange={(e) => setS({ ...s, [key]: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
            )}
          </label>
        ))}
        <button data-testid="settings-save" disabled={saving} className="stky-btn">{saving ? "Saving…" : "Save settings"}</button>
      </form>
    </div>
  );
}
