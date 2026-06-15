import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PencilSimple, Trash, Star, EyeSlash, Eye, MagnifyingGlass } from "@phosphor-icons/react";
import ProjectForm from "@/components/admin/ProjectForm";

const FILTERS = [
  { slug: "all", label: "All" },
  { slug: "cover-art", label: "Cover Art" },
  { slug: "instagram-design", label: "Instagram" },
  { slug: "banner-design", label: "Banner" },
  { slug: "branding", label: "Branding" },
];

export default function PortfolioManager() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  const reload = () => api.get("/projects/admin").then((r) => setItems(r.data.items || []));
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (active !== "all") list = list.filter((p) => p.category === active);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => (p.title || "").toLowerCase().includes(s) || (p.client_name || "").toLowerCase().includes(s));
    }
    return list;
  }, [items, active, q]);

  const toggleField = async (p, field) => {
    try {
      await api.patch(`/projects/${p.id}`, { [field]: !p[field] });
      toast.success("Updated");
      reload();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try { await api.delete(`/projects/${p.id}`); toast.success("Deleted"); reload(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid="admin-portfolio" className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Portfolio Manager</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">All projects.</h1>
        </div>
        <Link to="/admin/upload" className="stky-btn">+ New project</Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input data-testid="pm-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…"
            className="pl-10 w-full px-4 py-2.5 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.slug} onClick={() => setActive(f.slug)} data-testid={`pm-filter-${f.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs border ${active === f.slug ? "bg-stky-purple text-white border-stky-purple" : "border-white/10 text-white/65 hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-white/45">No projects match.</div>}
        {filtered.map((p) => (
          <div key={p.id} data-testid={`pm-item-${p.id}`} className="rounded-2xl border border-white/5 bg-stky-card overflow-hidden group">
            <div className="relative aspect-[4/3] overflow-hidden bg-stky-elevated">
              {p.thumbnail && <img src={mediaUrl(p.thumbnail)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
              <div className="absolute top-2 left-2 flex gap-1">
                {p.featured && <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-stky-purple/30 text-white">Featured</span>}
                <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">{p.category}</span>
              </div>
              {!p.published && <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Draft</span>}
            </div>
            <div className="p-4">
              <div className="font-display text-base font-semibold leading-tight">{p.title}</div>
              <div className="text-xs text-white/45 mt-0.5">{p.client_name || "—"}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => toggleField(p, "featured")} data-testid={`pm-feature-${p.id}`}
                  className={`text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border ${p.featured ? "bg-stky-purple/20 border-stky-purple/40 text-white" : "border-white/10 text-white/65 hover:text-white"}`}>
                  <Star size={10} weight={p.featured ? "fill" : "regular"} /> {p.featured ? "Featured" : "Feature"}
                </button>
                <button onClick={() => toggleField(p, "published")} data-testid={`pm-publish-${p.id}`}
                  className={`text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border ${p.published ? "bg-stky-blue/10 border-stky-blue/40 text-stky-blue" : "border-white/10 text-white/65"}`}>
                  {p.published ? <Eye size={10} /> : <EyeSlash size={10} />} {p.published ? "Published" : "Draft"}
                </button>
                <button onClick={() => setEditing(p)} data-testid={`pm-edit-${p.id}`} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 text-white/70 hover:text-white">
                  <PencilSimple size={10} /> Edit
                </button>
                <button onClick={() => remove(p)} data-testid={`pm-delete-${p.id}`} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <Trash size={10} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="max-w-3xl mx-auto my-10" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-3xl glass-strong p-6 sm:p-8" data-testid="pm-edit-modal">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-2xl font-bold tracking-tight">Edit project</div>
                <button onClick={() => setEditing(null)} className="text-white/60 hover:text-white">✕</button>
              </div>
              <ProjectForm initial={editing} onSaved={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
