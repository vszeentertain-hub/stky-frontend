import Masonry from "react-masonry-css";
import { Link } from "react-router-dom";
import { mediaUrl } from "@/lib/api";
import { ArrowUpRight, SpotifyLogo, YoutubeLogo, TrendUp, Star } from "@phosphor-icons/react";

const BREAKPOINTS = {
  default: 4,
  1280: 3,
  900: 2,
  600: 2,
  420: 1,
};

// Aspect-ratio map for explicit artwork types.
// Returns a Tailwind class. Empty string = use the image's natural aspect ratio (no enforcement).
export const ARTWORK_RATIO = {
  "cover-art": "aspect-square",
  "album-art": "aspect-square",
  "instagram-post": "aspect-square",
  "instagram-story": "aspect-[9/16]",
  "spotify-canvas": "aspect-[9/16]",
  "tiktok": "aspect-[9/16]",
  "youtube-banner": "aspect-[16/9]",
  "discord-header": "aspect-[16/9]",
  "twitch-banner": "aspect-[16/9]",
  "banner": "",        // natural — keep uploaded dimensions
  "branding": "",      // natural
  "custom": "",        // natural
};

export function artworkRatioClass(p) {
  if (!p) return "";
  const t = (p.artwork_type || "custom").toLowerCase();
  return ARTWORK_RATIO[t] !== undefined ? ARTWORK_RATIO[t] : "";
}

function MetricChip({ Icon, value, accent = "text-white", testid }) {
  return (
    <span data-testid={testid} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium">
      <Icon size={11} weight="fill" className={accent} />
      <span className="text-white/95">{value}</span>
    </span>
  );
}

export default function MasonryGrid({ projects, compact = false, showMetrics = false }) {
  if (!projects || projects.length === 0) {
    return <div data-testid="masonry-empty" className="text-center py-24 text-white/45">No projects yet. Check back soon.</div>;
  }
  return (
    <Masonry
      breakpointCols={compact ? { default: 3, 1024: 2, 640: 1 } : BREAKPOINTS}
      className="masonry-grid"
      columnClassName="masonry-col"
    >
      {projects.map((p, i) => {
        const src = p.thumbnail ? mediaUrl(p.thumbnail) : null;
        const ratio = artworkRatioClass(p);
        const isWide = ratio.startsWith("aspect-[16");
        return (
          <Link
            key={p.id}
            to={`/project/${p.id}`}
            data-testid={`project-card-${p.id}`}
            className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-stky-card hover:border-white/20 transition-all duration-700 animate-fade-up shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-12px_rgba(157,76,221,0.35)]"
            style={{ animationDelay: `${Math.min(i * 50, 600)}ms` }}
          >
            <div className={`relative overflow-hidden bg-stky-elevated ${ratio}`}>
              {src ? (
                <img
                  src={src}
                  alt={p.title}
                  loading="lazy"
                  className={`block group-hover:scale-[1.05] transition-transform duration-[1400ms] ease-out ${
                    ratio ? "w-full h-full object-cover" : "w-full h-auto"
                  }`}
                />
              ) : (
                <div className={`bg-gradient-to-br from-stky-purple/20 to-stky-blue/10 ${ratio || "aspect-square"}`} />
              )}

              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-55 group-hover:opacity-95 transition-opacity duration-500" />
              {/* Spotlight */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_0%,rgba(157,76,221,0.25),transparent_60%)]" />

              {/* Top tags */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {p.featured && (
                    <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-stky-purple/35 text-white border border-stky-purple/45 backdrop-blur-md">Featured</span>
                  )}
                  <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-black/55 text-white/80 border border-white/10 backdrop-blur-md">
                    {(p.category || "").replace("-", " ")}
                  </span>
                </div>
                <div className="h-9 w-9 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-1 group-hover:translate-y-0">
                  <ArrowUpRight size={16} weight="bold" />
                </div>
              </div>

              {/* Title overlay for wide artworks (banners) — overlay because card is short */}
              {isWide && (
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold leading-tight tracking-tight truncate text-white drop-shadow">{p.title}</div>
                    {p.client_name && <div className="text-[11px] text-white/70 truncate">{p.client_name}</div>}
                  </div>
                </div>
              )}

              {/* Metrics overlay */}
              {(p.spotify_streams || p.youtube_views || (p.custom_badges?.length > 0)) && (
                <div className={`absolute ${isWide ? "top-3 right-12" : "bottom-3 left-3 right-3"} flex flex-wrap gap-1.5 ${isWide ? "" : (showMetrics ? "opacity-100" : "opacity-0 group-hover:opacity-100")} translate-y-2 group-hover:translate-y-0 transition-all duration-500`}>
                  {p.spotify_streams && <MetricChip Icon={SpotifyLogo} value={p.spotify_streams} accent="text-green-400" testid={`metric-spotify-${p.id}`} />}
                  {p.youtube_views && <MetricChip Icon={YoutubeLogo} value={p.youtube_views} accent="text-red-400" testid={`metric-youtube-${p.id}`} />}
                  {!isWide && p.custom_badges?.slice(0, 1).map((b) => (
                    <MetricChip key={b} Icon={TrendUp} value={b} accent="text-stky-blue" />
                  ))}
                </div>
              )}
            </div>

            {/* Footer caption (skip for wide where title is overlaid) */}
            {!isWide && (
              <div className="p-4 pt-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold leading-tight tracking-tight truncate">{p.title}</div>
                  {p.client_name && <div className="text-xs text-white/45 mt-0.5 truncate">{p.client_name}</div>}
                </div>
                {p.achievements?.length > 0 && (
                  <Star size={14} weight="fill" className="text-stky-purple shrink-0 mt-1" />
                )}
              </div>
            )}
            {isWide && (
              <div className="p-4 pt-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold leading-tight tracking-tight truncate">{p.title}</div>
                  {p.client_name && <div className="text-xs text-white/45 mt-0.5 truncate">{p.client_name}</div>}
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{p.artwork_type?.replace(/-/g, " ")}</span>
              </div>
            )}
          </Link>
        );
      })}
    </Masonry>
  );
}
