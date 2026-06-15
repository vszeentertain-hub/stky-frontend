import { useState, useEffect, useRef } from "react";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  UploadSimple, X, Star, Eye, SpotifyLogo, YoutubeLogo,
  MedalMilitary, Sparkle, Plus, Link as LinkIcon,
} from "@phosphor-icons/react";

const CATEGORIES = [
  { slug: "cover-art", label: "Cover Art" },
  { slug: "instagram-design", label: "Instagram Design" },
  { slug: "banner-design", label: "Banner Design" },
  { slug: "branding", label: "Branding" },
];

const ARTWORK_TYPES = [
  { value: "cover-art", label: "Cover Art (1:1 square)" },
  { value: "album-art", label: "Album Art (1:1 square)" },
  { value: "instagram-post", label: "Instagram Post (1:1 square)" },
  { value: "instagram-story", label: "Instagram Story (9:16 vertical)" },
  { value: "spotify-canvas", label: "Spotify Canvas (9:16 vertical)" },
  { value: "tiktok", label: "TikTok / Reel (9:16 vertical)" },
  { value: "youtube-banner", label: "YouTube Banner (16:9 wide)" },
  { value: "discord-header", label: "Discord Header (16:9 wide)" },
  { value: "twitch-banner", label: "Twitch Banner (16:9 wide)" },
  { value: "banner", label: "Banner (natural dimensions)" },
  { value: "branding", label: "Branding (natural dimensions)" },
  { value: "custom", label: "Custom (natural dimensions)" },
];

const CATEGORY_TO_DEFAULT_TYPE = {
  "cover-art": "cover-art",
  "instagram-design": "instagram-post",
  "banner-design": "youtube-banner",
  "branding": "branding",
};

const BADGE_PRESETS = ["Trending Release", "Featured Project", "Editor's Pick", "Viral Drop", "Award Winner"];

function ChipInput({ value, onChange, placeholder, testid }) {
  const [draft, setDraft] = useState("");
  const add = (txt) => {
    const t = (txt || "").trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="mt-1 w-full rounded-xl bg-stky-elevated border border-white/10 focus-within:border-stky-purple/60 px-3 py-2 flex flex-wrap gap-1.5">
      {value.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-stky-purple/20 border border-stky-purple/40">
          {v}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="text-white/70 hover:text-white"><X size={10} /></button>
        </span>
      ))}
      <input
        data-testid={testid}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); } }}
        onBlur={() => add(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent outline-none text-sm min-w-[120px] py-0.5"
      />
    </div>
  );
}

export default function ProjectForm({ initial = null, onSaved, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "cover-art");
  const [artworkType, setArtworkType] = useState(initial?.artwork_type || "cover-art");
  const [tags, setTags] = useState(initial?.tags || []);
  const [client, setClient] = useState(initial?.client_name || "");
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [published, setPublished] = useState(initial?.published !== undefined ? initial.published : true);
  const [images, setImages] = useState(initial?.images || []);
  const [thumbnailId, setThumbnailId] = useState(initial?.thumbnail?.id || initial?.images?.[0]?.id || null);
  const [spotifyStreams, setSpotifyStreams] = useState(initial?.spotify_streams || "");
  const [youtubeViews, setYoutubeViews] = useState(initial?.youtube_views || "");
  const [achievements, setAchievements] = useState(initial?.achievements || []);
  const [customBadges, setCustomBadges] = useState(initial?.custom_badges || []);
  const [externalLink, setExternalLink] = useState(initial?.external_link || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { if (!thumbnailId && images[0]) setThumbnailId(images[0].id); }, [images, thumbnailId]);

  const uploadFiles = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    const newOnes = [];
    for (const f of fileList) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("folder", "projects");
        const { data } = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        newOnes.push(data);
      } catch (e) { toast.error(`${f.name}: ${formatApiError(e)}`); }
    }
    setUploading(false);
    setImages((prev) => [...prev, ...newOnes]);
    if (!thumbnailId && newOnes[0]) setThumbnailId(newOnes[0].id);
    if (newOnes.length) toast.success(`Uploaded ${newOnes.length} image(s)`);
  };

  const onDrop = (e) => { e.preventDefault(); uploadFiles(Array.from(e.dataTransfer.files || [])); };
  const removeImage = (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    if (thumbnailId === id) setThumbnailId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");
    setSaving(true);
    const payload = {
      title, description, category,
      artwork_type: artworkType,
      tags,
      thumbnail_id: thumbnailId,
      image_ids: images.map((i) => i.id),
      client_name: client,
      featured, published,
      spotify_streams: spotifyStreams,
      youtube_views: youtubeViews,
      achievements, custom_badges: customBadges,
      external_link: externalLink,
    };
    try {
      if (initial?.id) await api.patch(`/projects/${initial.id}`, payload);
      else await api.post("/projects", payload);
      toast.success(initial ? "Project updated" : "Project created");
      onSaved && onSaved();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-6" data-testid="project-form">
      {/* Core */}
      <div className="space-y-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Project details</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Title</span>
            <input data-testid="pf-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Client</span>
            <input data-testid="pf-client" value={client} onChange={(e) => setClient(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Category</span>
            <select
              data-testid="pf-category"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                // Auto-suggest artwork type when admin changes category and hasn't customized type yet
                if (CATEGORY_TO_DEFAULT_TYPE[newCat] && (!initial || artworkType === CATEGORY_TO_DEFAULT_TYPE[category])) {
                  setArtworkType(CATEGORY_TO_DEFAULT_TYPE[newCat]);
                }
              }}
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none"
            >
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Tags</span>
            <ChipInput value={tags} onChange={setTags} placeholder="Press Enter to add tag" testid="pf-tags" />
          </label>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5">
            Artwork Type
            <span className="text-[10px] normal-case tracking-normal text-white/40">— controls aspect ratio on the portfolio</span>
          </span>
          <select
            data-testid="pf-artwork-type"
            value={artworkType}
            onChange={(e) => setArtworkType(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none"
          >
            {ARTWORK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55">Description</span>
          <textarea data-testid="pf-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none resize-none" />
        </label>
      </div>

      {/* Images */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Images</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          data-testid="pf-dropzone"
          className="rounded-2xl border-2 border-dashed border-white/10 hover:border-stky-purple/50 bg-stky-elevated/40 p-8 text-center cursor-pointer transition"
        >
          <UploadSimple size={28} className="text-stky-purple mx-auto" />
          <div className="mt-3 text-sm text-white/70">Drop images here or click to browse</div>
          <div className="text-xs text-white/40 mt-1">PNG, JPG, WEBP — multiple files supported</div>
          {uploading && <div className="text-xs text-stky-blue mt-3">Uploading…</div>}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
            {images.map((img) => (
              <div key={img.id} className={`relative rounded-lg overflow-hidden border ${thumbnailId === img.id ? "border-stky-purple" : "border-white/10"}`}>
                <img src={mediaUrl(img)} alt="" className="aspect-square object-cover w-full" />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button type="button" onClick={() => setThumbnailId(img.id)} title="Set as cover" className="h-7 w-7 grid place-items-center rounded-full bg-stky-purple/80 hover:bg-stky-purple">
                    <Star size={12} weight={thumbnailId === img.id ? "fill" : "regular"} />
                  </button>
                  <button type="button" onClick={() => removeImage(img.id)} className="h-7 w-7 grid place-items-center rounded-full bg-red-500/80 hover:bg-red-500"><X size={12} /></button>
                </div>
                {thumbnailId === img.id && <span className="absolute top-1 left-1 text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-stky-purple">Cover</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics + Badges */}
      <div className="space-y-4 rounded-2xl border border-stky-purple/20 bg-stky-purple/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Sparkle size={16} weight="fill" className="text-stky-purple" />
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/65 font-semibold">Featured metrics &amp; achievements</div>
        </div>
        <p className="text-xs text-white/45 -mt-2">Shown on Featured Works page and project hover cards. Free-text, e.g. "1.2M", "500K".</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5"><SpotifyLogo size={12} weight="fill" className="text-green-400" /> Spotify streams</span>
            <input data-testid="pf-spotify" value={spotifyStreams} onChange={(e) => setSpotifyStreams(e.target.value)} placeholder="e.g. 1.2M" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5"><YoutubeLogo size={12} weight="fill" className="text-red-400" /> YouTube views</span>
            <input data-testid="pf-youtube" value={youtubeViews} onChange={(e) => setYoutubeViews(e.target.value)} placeholder="e.g. 500K" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
          </label>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5"><MedalMilitary size={12} weight="fill" className="text-stky-blue" /> Achievements</span>
          <ChipInput value={achievements} onChange={setAchievements} placeholder="Press Enter — e.g. #3 Spotify Electronic" testid="pf-achievements" />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5"><Star size={12} weight="fill" className="text-stky-purple" /> Custom badges</span>
          <ChipInput value={customBadges} onChange={setCustomBadges} placeholder="Press Enter — e.g. Trending Release" testid="pf-badges" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {BADGE_PRESETS.filter((b) => !customBadges.includes(b)).map((b) => (
              <button key={b} type="button" onClick={() => setCustomBadges([...customBadges, b])} className="text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 text-white/55 hover:text-white hover:border-stky-purple/40">
                <Plus size={10} /> {b}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 inline-flex items-center gap-1.5"><LinkIcon size={12} className="text-stky-blue" /> External link (optional)</span>
          <input data-testid="pf-link" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://open.spotify.com/…" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-stky-elevated border border-white/10 focus:border-stky-purple/60 outline-none" />
        </label>
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-4 pt-2">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input data-testid="pf-featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-stky-purple" />
          <span className="text-sm inline-flex items-center gap-1.5"><Star size={14} weight={featured ? "fill" : "regular"} className="text-stky-purple" /> Featured on homepage &amp; Featured Works page</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input data-testid="pf-published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-stky-blue" />
          <span className="text-sm inline-flex items-center gap-1.5"><Eye size={14} className="text-stky-blue" /> Published (visible to public)</span>
        </label>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button data-testid="pf-submit" disabled={saving || uploading} className="stky-btn">
          {saving ? "Saving…" : initial ? "Save changes" : "Create project"}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="stky-btn stky-btn-ghost">Cancel</button>}
      </div>
    </form>
  );
}
