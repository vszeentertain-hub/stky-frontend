
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import MasonryGrid from "@/components/public/MasonryGrid";
import { ArrowRight } from "@phosphor-icons/react";

const META = {
  "cover-art": {
    title: "Cover Art",
    accent: "Album, single & EP artwork.",
    description: "Scroll-stopping cover art for music artists, labels, and indie releases. From minimal to maximal — designed to live as hard as the music.",
  },
  "instagram-design": {
    title: "Instagram Design",
    accent: "Feed grids & story drops.",
    description: "Cohesive social content systems — feed grids, story templates, carousel sets and launch campaigns engineered to convert scrolls into followers.",
  },
  "banner-design": {
    title: "Banner Design",
    accent: "Twitch, YouTube & esports.",
    description: "High-impact banners for streamers, esports orgs and event activations — kinetic, branded, instantly recognizable.",
  },
  "branding": {
    title: "Branding",
    accent: "Identity systems & logos.",
    description: "Full visual identity systems — marks, type, palette, layout — engineered to age well and scale across every surface.",
  },
};

export default function CategoryPage({ slug }) {
  const meta = META[slug] || { title: slug, accent: "", description: "" };
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/projects?category=${slug}&limit=200`).then((r) => setItems(r.data.items || []));
  }, [slug]);

  return (
    <div data-testid={`page-category-${slug}`} className="px-4 sm:px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 items-end pt-6 pb-14">
          <div className="col-span-12 md:col-span-9">
            <div className="text-[10px] uppercase tracking-[0.22em] text-stky-blue">STKY · {meta.accent}</div>
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tighter mt-3">
              <span className="neon-text">{meta.title}</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-white/65 leading-relaxed">{meta.description}</p>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <button className="stky-btn">
              Contact Me
            </button>
          </div>
        </div>
        <MasonryGrid projects={items} />
      </div>
    </div>
  );
}
