import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import MasonryGrid from "@/components/public/MasonryGrid";
import { useReveal } from "@/lib/animations";
import { MagnifyingGlass } from "@phosphor-icons/react";

const FILTERS = [
  { slug: "all", label: "All" },
  { slug: "cover-art", label: "Cover Art" },
  { slug: "instagram-design", label: "Instagram Design" },
  { slug: "banner-design", label: "Banner Design" },
  { slug: "branding", label: "Branding" },
];

export default function Portfolio() {
  const root = useReveal();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(params.get("category") || "all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/projects?limit=200").then((r) => setItems(r.data.items || []));
  }, []);

  useEffect(() => {
    const cat = params.get("category");
    if (cat && cat !== active) setActive(cat);
    // eslint-disable-next-line
  }, [params]);

  const onFilter = (slug) => {
    setActive(slug);
    if (slug === "all") setParams({});
    else setParams({ category: slug });
  };

  const filtered = useMemo(() => {
    let list = items;
    if (active !== "all") list = list.filter((p) => p.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.client_name || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, active, search]);

  const count = filtered.length;

  return (
    <div ref={root} data-testid="page-portfolio" className="relative px-4 sm:px-6 pb-24">
      <div className="aurora opacity-40" aria-hidden />
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-12 gap-6 items-end pt-40 pb-14">
          <div className="col-span-12 md:col-span-8">
            <div className="reveal-up text-[10px] uppercase tracking-[0.22em] text-white/45">Portfolio</div>
            <h1 className="reveal-up font-display text-6xl sm:text-7xl font-bold tracking-[-0.04em] mt-3 leading-[0.95]">
              The full <span className="neon-text">vault</span>.
            </h1>
            <p className="reveal-up mt-5 text-white/65 max-w-xl leading-relaxed">Every project STKY has shipped — covers, banners, identities, drops.</p>
          </div>
          <div className="col-span-12 md:col-span-4 reveal-up">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                data-testid="portfolio-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, client, tag…"
                className="pl-10 w-full px-4 py-3 rounded-xl glass-reflect focus:border-stky-purple/60 outline-none placeholder:text-white/30 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10 reveal-up" data-testid="portfolio-filters">
          {FILTERS.map((f) => (
            <button
              key={f.slug}
              onClick={() => onFilter(f.slug)}
              data-testid={`filter-${f.slug}`}
              className={`px-4 py-2 rounded-full text-sm border transition-all duration-300 ${
                active === f.slug
                  ? "bg-stky-purple text-white border-stky-purple glow-purple"
                  : "border-white/10 text-white/65 hover:text-white hover:border-white/30 hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto text-xs text-white/45 self-center px-2">{count} project{count === 1 ? "" : "s"}</div>
        </div>

        <MasonryGrid projects={filtered} />
      </div>
    </div>
  );
}
