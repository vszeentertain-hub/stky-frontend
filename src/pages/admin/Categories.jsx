import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Trash, Plus } from "@phosphor-icons/react";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");

  const reload = () => api.get("/categories").then((r) => setItems(r.data.items || []));
  useEffect(() => { reload(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name || !slug) return toast.error("Name and slug required");
    try {
      await api.post("/categories", { name, slug, description: desc });
      setName(""); setSlug(""); setDesc("");
      reload(); toast.success("Category added");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { await api.delete(`/categories/${id}`); reload(); toast.success("Deleted"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid="admin-categories" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Categories</div>
        <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Organize your work.</h1>
      </div>

      <form onSubmit={add} className="rounded-2xl border border-white/5 bg-stky-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} placeholder="Name" data-testid="cat-name" className="px-3 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none focus:border-stky-purple/60" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-example" data-testid="cat-slug" className="px-3 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none focus:border-stky-purple/60" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" data-testid="cat-desc" className="px-3 py-2.5 rounded-xl bg-stky-elevated border border-white/10 outline-none focus:border-stky-purple/60" />
        <button data-testid="cat-add" className="stky-btn justify-center"><Plus size={16} weight="bold" /> Add</button>
      </form>

      <div className="rounded-2xl border border-white/5 bg-stky-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.22em] text-white/45 border-b border-white/5">
            <tr><th className="text-left p-4">Name</th><th className="text-left p-4">Slug</th><th className="text-left p-4">Description</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-white/45">No categories.</td></tr>}
            {items.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 font-mono text-xs text-white/65">{c.slug}</td>
                <td className="p-4 text-white/65">{c.description || "—"}</td>
                <td className="p-4 text-right">
                  <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"><Trash size={12} /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
