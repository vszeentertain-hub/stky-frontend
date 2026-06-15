import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { InstagramLogo, DiscordLogo, WhatsappLogo, EnvelopeSimple, X, Sparkle, ArrowUpRight } from "@phosphor-icons/react";

const FALLBACK = {
  instagram: "https://instagram.com/stky.studio",
  discord: "https://discord.com",
  whatsapp: "https://wa.me/15551234567",
  email: "hello@stky.studio",
};

function buildLinks(settings) {
  const s = settings || {};
  const ig = s.instagram || FALLBACK.instagram;
  const dc = s.discord || FALLBACK.discord;
  const wa = s.whatsapp || FALLBACK.whatsapp;
  const em = s.email || FALLBACK.email;
  const instagram = ig.startsWith("http") ? ig : `https://instagram.com/${ig.replace(/^@/, "")}`;
  const discord = dc.startsWith("http") ? dc : `https://discord.com/users/${dc}`;
  const whatsapp = wa.startsWith("http") ? wa : `https://wa.me/${wa.replace(/[^0-9]/g, "")}`;
  const email = em.includes("@") ? `mailto:${em}` : `mailto:${FALLBACK.email}`;
  return { instagram, discord, whatsapp, email, display: { instagram: ig, discord: dc, whatsapp: wa, email: em } };
}

export default function ContactModal({ open, onClose }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!open) return;
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => setSettings({}));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  const links = buildLinks(settings);

  const CHANNELS = [
    {
      key: "instagram",
      label: "Instagram",
      handle: links.display.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, ""),
      sub: "DM us for quick quotes & WIPs",
      href: links.instagram,
      Icon: InstagramLogo,
      gradient: "from-pink-500/30 via-fuchsia-500/20 to-purple-500/20",
      ring: "hover:border-pink-400/40",
    },
    {
      key: "discord",
      label: "Discord",
      handle: links.display.discord || "stky.studio",
      sub: "Hop into the studio server",
      href: links.discord,
      Icon: DiscordLogo,
      gradient: "from-indigo-500/30 via-blue-500/20 to-purple-500/20",
      ring: "hover:border-indigo-400/40",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      handle: links.display.whatsapp || "Tap to chat",
      sub: "Fastest for active projects",
      href: links.whatsapp,
      Icon: WhatsappLogo,
      gradient: "from-emerald-500/30 via-green-500/20 to-teal-500/20",
      ring: "hover:border-emerald-400/40",
    },
    {
      key: "email",
      label: "Email",
      handle: links.display.email || "hello@stky.studio",
      sub: "Briefs, deals, deck reviews",
      href: links.email,
      Icon: EnvelopeSimple,
      gradient: "from-stky-purple/30 via-violet-500/20 to-stky-blue/15",
      ring: "hover:border-stky-purple/50",
    },
  ];

  return (
    <div
      data-testid="contact-modal"
      className="fixed inset-0 z-[80] overflow-y-auto flex items-start justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong tracing-border animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-stky-purple/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-stky-blue/15 blur-3xl pointer-events-none" />

        <button
  data-testid="contact-modal-close"
  onClick={() => {
    onClose();
  }}
>
          <X size={16} />
        </button>

        <div className="relative p-7 sm:p-9">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-[0.22em] uppercase text-white/65">
            <Sparkle size={11} weight="fill" className="text-stky-purple" />
            Direct Channels
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter mt-4 leading-[1]">
            Let's <span className="neon-text">talk</span>.
          </h2>
          <p className="mt-3 text-white/65 max-w-md">
            Pick the channel that suits you — we read every message and reply fast.
          </p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHANNELS.map(({ key, label, handle, sub, href, Icon, gradient, ring }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`contact-${key}`}
                className={`group relative rounded-2xl border border-white/10 ${ring} bg-stky-card p-5 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(157,76,221,0.35)]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="relative flex items-start justify-between">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <Icon size={20} weight="fill" className="text-white" />
                  </div>
                  <ArrowUpRight size={16} weight="bold" className="text-white/40 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="relative mt-5">
                  <div className="font-display text-lg font-semibold tracking-tight">{label}</div>
                  <div className="text-sm text-white/80 truncate">{handle}</div>
                  <div className="text-[11px] text-white/45 mt-1">{sub}</div>
                </div>
              </a>
            ))}
          </div>

          <p className="text-[11px] text-white/35 mt-7">Or use the full contact form — <a href="/contact" className="text-stky-blue hover:underline">stky.studio/contact</a></p>
        </div>
      </div>
    </div>
  );
}
