import { useEffect, useState } from "react";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Star } from "@phosphor-icons/react";

export default function FeaturedWorks() {
  const [items, setItems] = useState([]);

  const reload = () => api.get("/projects/admin").then((r) => setItems(r.data.items || []));
  useEffect(() => { reload(); }, []);

  const toggle = async (p) => {
    try { await api.patch(`/projects/${p.id}`, { featured: !p.featured }); reload(); toast.success(!p.featured ? "Added to featured" : "Removed from featured"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const featured = items.filter((p) => p.featured);
  const others = items.filter((p) => !p.featured);

  return (
    <div data-testid="admin-featured" className="space-y-8">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Featured Works</div>
        <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Curate the homepage.</h1>
        <p className="text-sm text-white/55 mt-2 max-w-xl">Star projects below to feature them on the public homepage.</p>
      </div>

      <section>
        <div className="font-display text-lg font-semibold mb-3">Currently featured ({featured.length})</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featured.length === 0 && <div className="col-span-4 text-white/45 text-sm py-6">Nothing featured yet.</div>}
          {featured.map((p) => (
            <button key={p.id} onClick={() => toggle(p)} data-testid={`featured-toggle-${p.id}`}
              className="group relative rounded-xl overflow-hidden border border-stky-purple/50 bg-stky-card">
              {p.thumbnail && <img src={mediaUrl(p.thumbnail)} alt="" className="w-full aspect-square object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Star size={18} weight="fill" className="absolute top-2 right-2 text-stky-purple" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{p.category}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="font-display text-lg font-semibold mb-3">Other projects</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {others.length === 0 && <div className="col-span-4 text-white/45 text-sm py-6">No other projects.</div>}
          {others.map((p) => (
            <button key={p.id} onClick={() => toggle(p)}
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-stky-card hover:border-stky-purple/40 transition-colors">
              {p.thumbnail && <img src={mediaUrl(p.thumbnail)} alt="" className="w-full aspect-square object-cover opacity-70 group-hover:opacity-100" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Star size={18} className="absolute top-2 right-2 text-white/50 group-hover:text-stky-purple" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{p.category}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
