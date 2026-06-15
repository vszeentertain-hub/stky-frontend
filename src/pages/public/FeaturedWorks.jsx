import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "@/lib/api";
import { useReveal } from "@/lib/animations";
import {
  ArrowUpRight, SpotifyLogo, YoutubeLogo, TrendUp, Star, MedalMilitary,
  Sparkle, Lightning, ChartLineUp,
} from "@phosphor-icons/react";

function Metric({ Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
      <Icon size={16} weight="fill" className={accent} />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate">{value}</div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/50">{label}</div>
      </div>
    </div>
  );
}

function FeaturedCard({ p, index }) {
  return (
    <Link
      to={`/project/${p.id}`}
      data-testid={`featured-card-${p.id}`}
      className="reveal-up group relative block rounded-3xl overflow-hidden border border-white/[0.06]"
      style={{ transitionDelay: `${Math.min(index * 90, 600)}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">



        {p.thumbnail ? (
          <img
            src={mediaUrl(p.thumbnail)}
            alt={p.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stky-purple/20 to-stky-blue/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_0%,rgba(157,76,221,0.3),transparent_60%)]" />

        {/* Top: badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {p.custom_badges?.map((b) => (
              <span key={b} className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-stky-purple/35 text-white border border-stky-purple/50 backdrop-blur-md">{b}</span>
            ))}
            <span className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-white/8 text-white/80 border border-white/15 backdrop-blur-md">
              {p.category?.replace("-", " ")}
            </span>
          </div>
          <div className="h-10 w-10 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-500">
            <ArrowUpRight size={18} weight="bold" />
          </div>
        </div>

        {/* Bottom: title + metrics */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{p.title}</div>
          {p.client_name && <div className="text-sm text-white/60 mt-1">{p.client_name}</div>}

          <div className="mt-4 flex flex-wrap gap-2">
            {p.spotify_streams && <Metric Icon={SpotifyLogo} value={p.spotify_streams} label="Spotify" accent="text-green-400" />}
            {p.youtube_views && <Metric Icon={YoutubeLogo} value={p.youtube_views} label="YouTube" accent="text-red-400" />}
            {p.achievements?.slice(0, 1).map((a) => <Metric key={a} Icon={MedalMilitary} value={a} label="Achievement" accent="text-stky-blue" />)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedWorks() {
  const root = useReveal();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/projects?featured=true&limit=50").then((r) => setItems(r.data.items || []));
  }, []);

  // Aggregate metrics
  const aggregate = items.reduce(
    (acc, p) => {
      acc.count += 1;
      if (p.spotify_streams) acc.spotify += 1;
      if (p.youtube_views) acc.youtube += 1;
      if (p.achievements?.length) acc.awards += p.achievements.length;
      return acc;
    },
    { count: 0, spotify: 0, youtube: 0, awards: 0 }
  );

  return (
    <div ref={root} data-testid="page-featured" className="relative">
      {/* Header */}
      <section className="relative px-4 sm:px-6 pt-40 pb-16 overflow-hidden">
        <div className="aurora" aria-hidden />
        <div className="grid-overlay" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="reveal-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-reflect text-xs text-white/80 mb-6">
            <Star size={12} weight="fill" className="text-stky-purple" />
            Hall of Fame
          </div>
          <h1 className="reveal-up font-display text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95] max-w-5xl">
            Selected drops that <span className="neon-text">moved culture</span>.
          </h1>
          <p className="reveal-up mt-6 max-w-2xl text-white/65 text-lg leading-relaxed">
            The projects we're most proud of — measured not just by craft, but by streams generated, audiences reached, and brands reshaped.
          </p>

          {/* Aggregate stats */}
          <div className="reveal-up mt-12 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ transitionDelay: "160ms" }}>
            <div className="rounded-2xl glass-reflect p-5">
              <Lightning size={20} weight="fill" className="text-stky-purple" />
              <div className="font-display text-3xl font-bold tracking-tight mt-3">{aggregate.count}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50 mt-1">Featured Drops</div>
            </div>
            <div className="rounded-2xl glass-reflect p-5">
              <SpotifyLogo size={20} weight="fill" className="text-green-400" />
              <div className="font-display text-3xl font-bold tracking-tight mt-3">{aggregate.spotify}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50 mt-1">Charting Releases</div>
            </div>
            <div className="rounded-2xl glass-reflect p-5">
              <YoutubeLogo size={20} weight="fill" className="text-red-400" />
              <div className="font-display text-3xl font-bold tracking-tight mt-3">{aggregate.youtube}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50 mt-1">Viral Visuals</div>
            </div>
            <div className="rounded-2xl glass-reflect p-5">
              <MedalMilitary size={20} weight="fill" className="text-stky-blue" />
              <div className="font-display text-3xl font-bold tracking-tight mt-3">{aggregate.awards}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50 mt-1">Achievements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured grid */}
      <section className="relative px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            <div className="reveal-up text-center py-24 text-white/45">No featured projects yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((p, i) => (
                <FeaturedCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative px-4 sm:px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="reveal-up rounded-3xl glass-reflect p-10 sm:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <ChartLineUp size={26} weight="duotone" className="text-stky-blue" />
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter mt-3 leading-tight">Want your next release on this wall?</h3>
              <p className="text-white/60 mt-2 max-w-xl">We design with the metric in mind. Bring us your release plan — we'll bring the visuals.</p>
            </div>
            <button
              className="stky-btn"
              onClick={() => window.dispatchEvent(new Event("open-contact-modal"))}
            >
              Contact Me
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
