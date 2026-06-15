import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, mediaUrl } from "@/lib/api";
import { ArrowLeft, Tag, User, CalendarBlank, SpotifyLogo, YoutubeLogo, MedalMilitary, Star, ArrowSquareOut } from "@phosphor-icons/react";

export default function ProjectDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    api.get(`/projects/${id}`).then((r) => {
      setP(r.data);
      if (r.data?.category) {
        api.get(`/projects?category=${r.data.category}&limit=8`).then((rr) => {
          setRelated((rr.data.items || []).filter((x) => x.id !== r.data.id).slice(0, 4));
        });
      }
    }).catch(() => setP(false));
  }, [id]);

  if (p === null) return <div className="px-6 py-24 text-white/60">Loading…</div>;
  if (p === false) return <div className="px-6 py-24 text-white/60">Project not found.</div>;

  const images = p.images && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []);
  const hero = images[active];

  return (
    <div data-testid="page-project-detail" className="px-4 sm:px-6 pb-24 pt-32">
      <div className="max-w-7xl mx-auto">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white mb-6"><ArrowLeft size={16} /> Back to portfolio</Link>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-3xl overflow-hidden glass">
              {hero ? (
                <img src={mediaUrl(hero)} alt={p.title} className="w-full h-auto" />
              ) : (
                <div className="aspect-video bg-stky-card" />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((im, i) => (
                  <button key={im.id} onClick={() => setActive(i)} className={`rounded-xl overflow-hidden border transition-all ${active === i ? "border-stky-purple" : "border-white/10"}`}>
                    <img src={mediaUrl(im)} alt="" className="aspect-square object-cover w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded-2xl glass p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-stky-purple">{p.category?.replace("-", " ")}</div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter mt-2">{p.title}</h1>
              {p.description && <p className="mt-3 text-white/65 leading-relaxed text-sm">{p.description}</p>}
              {p.custom_badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {p.custom_badges.map((b) => (
                    <span key={b} className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-stky-purple/25 text-white border border-stky-purple/40">{b}</span>
                  ))}
                </div>
              )}
            </div>

            {(p.spotify_streams || p.youtube_views || p.achievements?.length > 0) && (
              <div className="rounded-2xl glass-reflect p-6 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 flex items-center gap-1.5"><Star size={11} weight="fill" className="text-stky-purple" /> Impact</div>
                {p.spotify_streams && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-green-500/15 border border-green-500/30"><SpotifyLogo size={18} weight="fill" className="text-green-400" /></div>
                    <div><div className="font-display text-xl font-bold tracking-tight">{p.spotify_streams}</div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Spotify streams</div></div>
                  </div>
                )}
                {p.youtube_views && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-red-500/15 border border-red-500/30"><YoutubeLogo size={18} weight="fill" className="text-red-400" /></div>
                    <div><div className="font-display text-xl font-bold tracking-tight">{p.youtube_views}</div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">YouTube views</div></div>
                  </div>
                )}
                {p.achievements?.map((a) => (
                  <div key={a} className="flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-stky-blue/15 border border-stky-blue/30"><MedalMilitary size={18} weight="fill" className="text-stky-blue" /></div>
                    <div><div className="text-sm font-semibold">{a}</div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Achievement</div></div>
                  </div>
                ))}
                {p.external_link && (
                  <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stky-blue hover:text-stky-blue-hi mt-2">
                    Open external link <ArrowSquareOut size={11} />
                  </a>
                )}
              </div>
            )}
            <div className="rounded-2xl glass p-6 space-y-3 text-sm">
              {p.client_name && (
                <div className="flex items-start gap-3">
                  <User size={18} className="text-stky-blue mt-0.5" />
                  <div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Client</div><div className="text-white/85">{p.client_name}</div></div>
                </div>
              )}
              {p.tags?.length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag size={18} className="text-stky-blue mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Tags</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.tags.map((t) => <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">{t}</span>)}
                    </div>
                  </div>
                </div>
              )}
              {p.created_at && (
                <div className="flex items-start gap-3">
                  <CalendarBlank size={18} className="text-stky-blue mt-0.5" />
                  <div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Released</div><div className="text-white/85">{new Date(p.created_at).toLocaleDateString()}</div></div>
                </div>
              )}
            </div>
            <button className="stky-btn">
              Contact Me
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">More from {p.category?.replace("-", " ")}</div>
            <h2 className="font-display text-3xl font-bold tracking-tighter mt-2 mb-6">Related work.</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} to={`/project/${r.id}`} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 bg-stky-card transition-all">
                  {r.thumbnail && <img src={mediaUrl(r.thumbnail)} alt={r.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />}
                  <div className="p-3"><div className="font-display text-sm font-semibold">{r.title}</div></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
