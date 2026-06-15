import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "@/lib/api";
import { Stack, Star, Image as ImgIcon, EnvelopeSimple, ArrowUpRight } from "@phosphor-icons/react";

function Card({ Icon, label, value, accent, testid }) {
  return (
    <div data-testid={testid} className="rounded-2xl bg-stky-card border border-white/5 p-6">
      <div className="flex items-center justify-between">
        <Icon size={22} weight="duotone" className={accent} />
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Total</span>
      </div>
      <div className="font-display text-4xl font-bold tracking-tighter mt-4">{value ?? 0}</div>
      <div className="text-xs text-white/55 mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get("/stats").then((r) => setStats(r.data));
    api.get("/projects/admin").then((r) => setRecent((r.data.items || []).slice(0, 6)));
    api.get("/contact").then((r) => setContacts((r.data.items || []).slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Dashboard</div>
          <h1 className="font-display text-4xl font-bold tracking-tighter mt-2">Studio overview.</h1>
        </div>
        <Link to="/admin/upload" className="stky-btn">+ Upload work</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card Icon={Stack} label="Projects" value={stats?.total_projects} accent="text-stky-purple" testid="stat-projects" />
        <Card Icon={Star} label="Featured" value={stats?.featured} accent="text-stky-blue" testid="stat-featured" />
        <Card Icon={ImgIcon} label="Media files" value={stats?.files} accent="text-stky-purple" testid="stat-files" />
        <Card Icon={EnvelopeSimple} label={`Contacts (${stats?.new_contacts ?? 0} new)`} value={stats?.contacts} accent="text-stky-blue" testid="stat-contacts" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-white/5 bg-stky-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-semibold">Recent projects</div>
            <Link to="/admin/portfolio" className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1">Manage <ArrowUpRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recent.length === 0 && <div className="col-span-3 text-white/45 text-sm py-8 text-center">No projects yet — upload your first one.</div>}
            {recent.map((p) => (
              <Link key={p.id} to={`/admin/portfolio`} className="group rounded-xl overflow-hidden border border-white/10 bg-stky-elevated">
                {p.thumbnail && <img src={mediaUrl(p.thumbnail)} alt="" className="w-full aspect-square object-cover group-hover:scale-105 transition" />}
                <div className="p-2.5">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 mt-1">{p.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-white/5 bg-stky-card p-6">
          <div className="font-display text-lg font-semibold mb-4">Latest enquiries</div>
          <div className="space-y-3">
            {contacts.length === 0 && <div className="text-white/45 text-sm py-6">No messages yet.</div>}
            {contacts.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/5 bg-stky-elevated p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{c.name}</div>
                  <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ${c.status === 'new' ? 'bg-stky-purple/20 text-stky-purple' : 'bg-white/5 text-white/50'}`}>{c.status}</span>
                </div>
                <div className="text-xs text-white/55">{c.email}</div>
                <div className="text-xs text-white/70 mt-1.5 line-clamp-2">{c.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
