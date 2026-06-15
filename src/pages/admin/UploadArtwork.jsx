import { useNavigate } from "react-router-dom";
import ProjectForm from "@/components/admin/ProjectForm";

export default function UploadArtwork() {
  const nav = useNavigate();
  return (
    <div data-testid="admin-upload" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Upload Artwork</div>
        <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Add a new project.</h1>
        <p className="text-sm text-white/55 mt-2 max-w-xl">Drop your images, fill the details, mark featured if applicable, then publish.</p>
      </div>
      <div className="rounded-3xl border border-white/5 bg-stky-card p-6 sm:p-8">
        <ProjectForm onSaved={() => nav("/admin/portfolio")} />
      </div>
    </div>
  );
}
