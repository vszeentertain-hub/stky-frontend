import { useEffect, useMemo, useRef, useState } from "react";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { UploadSimple, MagnifyingGlass, Trash, FolderSimple, Plus } from "@phosphor-icons/react";

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState("");
  const [q, setQ] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const reload = async () => {
    const params = new URLSearchParams();
    if (activeFolder) params.set("folder", activeFolder);
    if (q) params.set("q", q);
    const { data } = await api.get(`/media?${params.toString()}`);
    setItems(data.items || []);
    const { data: f } = await api.get("/media/folders");
    setFolders(f.folders || []);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder]);

  useEffect(() => {
    const t = setTimeout(reload, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const uploadFiles = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    for (const f of fileList) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("folder", activeFolder || "uploads");
        await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } catch (e) { toast.error(`${f.name}: ${formatApiError(e)}`); }
    }
    setUploading(false);
    reload();
    toast.success(`Uploaded ${fileList.length} file(s)`);
  };

  const onDrop = (e) => { e.preventDefault(); uploadFiles(Array.from(e.dataTransfer.files || [])); };

  const removeOne = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try { await api.delete(`/media/${id}`); reload(); toast.success("Deleted"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const addFolder = () => {
    if (!newFolder.trim()) return;
    setActiveFolder(newFolder.trim());
    setFolders((f) => Array.from(new Set([...f, newFolder.trim()])).sort());
    setNewFolder("");
  };

  return (
    <div data-testid="admin-media" className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Media Library</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Your assets.</h1>
        </div>
        <button onClick={() => fileRef.current?.click()} className="stky-btn" data-testid="media-upload-btn">
          <UploadSimple size={16} weight="bold" /> Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        data-testid="media-dropzone"
        className="rounded-3xl border-2 border-dashed border-white/10 hover:border-stky-purple/50 bg-stky-card/40 p-10 text-center transition"
      >
        <UploadSimple size={32} weight="duotone" className="text-stky-purple mx-auto" />
        <div className="mt-3 text-sm text-white/70">Drop files anywhere here to upload to <span className="font-mono text-stky-blue">{activeFolder || "uploads"}</span></div>
        {uploading && <div className="text-xs text-stky-blue mt-2">Uploading…</div>}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3 rounded-2xl border border-white/5 bg-stky-card p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Folders</div>
          <button onClick={() => setActiveFolder("")} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!activeFolder ? "bg-stky-purple/15 text-white" : "text-white/65 hover:text-white hover:bg-white/5"}`}>
            <FolderSimple size={16} /> All
          </button>
          {folders.map((f) => (
            <button key={f} onClick={() => setActiveFolder(f)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeFolder === f ? "bg-stky-purple/15 text-white" : "text-white/65 hover:text-white hover:bg-white/5"}`}>
              <FolderSimple size={16} /> {f}
            </button>
          ))}
          <div className="mt-3 flex items-center gap-1">
            <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="New folder" className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-stky-elevated border border-white/10 outline-none focus:border-stky-purple/60" />
            <button onClick={addFolder} className="h-8 w-8 grid place-items-center rounded-lg bg-stky-purple/20 hover:bg-stky-purple/30"><Plus size={14} /></button>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <div className="relative mb-3">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input data-testid="media-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by filename…"
              className="pl-10 w-full px-4 py-2.5 rounded-xl bg-stky-card border border-white/10 focus:border-stky-purple/60 outline-none text-sm" />
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-stky-card p-12 text-center text-white/45">No files yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {items.map((it) => (
                <div key={it.id} data-testid={`media-item-${it.id}`} className="group relative rounded-xl overflow-hidden border border-white/10 bg-stky-card">
                  <img src={mediaUrl(it)} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <div className="text-[10px] text-white/85 truncate flex-1">{it.filename}</div>
                    <button onClick={() => removeOne(it.id)} className="h-7 w-7 grid place-items-center rounded-full bg-red-500/80 hover:bg-red-500"><Trash size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
