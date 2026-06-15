import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Envelope, MapPin, ClockClockwise, PaperPlaneTilt } from "@phosphor-icons/react";

const SERVICES = [
  "Cover Art",
  "Instagram Design",
  "Banner Design",
  "Branding / Identity",
  "Full Visual Package",
  "Other",
];

const BUDGETS = ["< $500", "$500 - $1.5k", "$1.5k - $5k", "$5k - $15k", "$15k+"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", budget: "", service: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill name, email and message.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success("Message sent. We'll be in touch.");
      setForm({ name: "", email: "", subject: "", message: "", budget: "", service: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="page-contact" className="px-4 sm:px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="pt-40 pb-14">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Contact</div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tighter mt-3 leading-[0.95]">
            Let's build <span className="neon-text">something loud</span>.
          </h1>
          <p className="mt-5 max-w-xl text-white/65 leading-relaxed">
            Tell us about your project. Releases, drops, identities — we read every brief and reply within 48 hours.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <form onSubmit={submit} data-testid="contact-form" className="col-span-12 lg:col-span-8 rounded-3xl glass p-6 sm:p-10 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Name</span>
                <input data-testid="contact-name" value={form.name} onChange={onChange("name")} required className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none" />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Email</span>
                <input data-testid="contact-email" type="email" value={form.email} onChange={onChange("email")} required className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Service</span>
                <select data-testid="contact-service" value={form.service} onChange={onChange("service")} className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none">
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Budget</span>
                <select data-testid="contact-budget" value={form.budget} onChange={onChange("budget")} className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none">
                  <option value="">Select budget range</option>
                  {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Subject</span>
              <input data-testid="contact-subject" value={form.subject} onChange={onChange("subject")} className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Message</span>
              <textarea data-testid="contact-message" rows={6} value={form.message} onChange={onChange("message")} required className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
            </label>
            <button data-testid="contact-submit" disabled={loading} className="stky-btn">
              <PaperPlaneTilt size={18} weight="fill" />
              {loading ? "Sending…" : sent ? "Sent — send another" : "Send message"}
            </button>
          </form>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded-2xl glass p-6">
              <Envelope size={22} weight="duotone" className="text-stky-purple" />
              <div className="font-display text-lg font-semibold mt-3">Email</div>
              <a href="mailto:hello@stky.studio" className="text-white/70 text-sm hover:text-white">hello@stky.studio</a>
            </div>
            <div className="rounded-2xl glass p-6">
              <MapPin size={22} weight="duotone" className="text-stky-blue" />
              <div className="font-display text-lg font-semibold mt-3">Studio</div>
              <div className="text-white/70 text-sm">Remote · Worldwide</div>
            </div>
            <div className="rounded-2xl glass p-6">
              <ClockClockwise size={22} weight="duotone" className="text-stky-purple" />
              <div className="font-display text-lg font-semibold mt-3">Response time</div>
              <div className="text-white/70 text-sm">Within 48 hours, Mon — Sat.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
