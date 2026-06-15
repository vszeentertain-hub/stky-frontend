import "@/App.css";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import PublicLayout from "@/components/public/PublicLayout";
import Home from "@/pages/public/Home";
import Portfolio from "@/pages/public/Portfolio";
import FeaturedWorksPublic from "@/pages/public/FeaturedWorks";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import ProjectDetail from "@/pages/public/ProjectDetail";

import Login from "@/pages/auth/Login";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import PortfolioManager from "@/pages/admin/PortfolioManager";
import UploadArtwork from "@/pages/admin/UploadArtwork";
import FeaturedWorks from "@/pages/admin/FeaturedWorks";
import Categories from "@/pages/admin/Categories";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import Settings from "@/pages/admin/Settings";
import Clients from "@/pages/admin/Clients";
import Invoices from "@/pages/admin/Invoices";
import InvoiceEditor from "@/pages/admin/InvoiceEditor";
import Analytics from "@/pages/admin/Analytics";
import InvoiceShare from "@/pages/public/InvoiceShare";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stky-bg text-white">
        <div className="text-sm text-white/60">Authenticating…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}

// Redirect old category URLs to portfolio with filter pre-selected
function CategoryRedirect({ slug }) {
  return <Navigate to={`/portfolio?category=${slug}`} replace />;
}

function App() {
  return (
    <div className="App min-h-screen bg-stky-bg text-white">
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/featured" element={<FeaturedWorksPublic />} />
              <Route path="/cover-art" element={<CategoryRedirect slug="cover-art" />} />
              <Route path="/instagram-design" element={<CategoryRedirect slug="instagram-design" />} />
              <Route path="/banner-design" element={<CategoryRedirect slug="banner-design" />} />
              <Route path="/branding" element={<CategoryRedirect slug="branding" />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />
            <Route path="/invoice/:token" element={<InvoiceShare />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/portfolio" replace />} />
              <Route path="portfolio" element={<PortfolioManager />} />
              <Route path="upload" element={<UploadArtwork />} />
              <Route path="featured" element={<FeaturedWorks />} />
              <Route path="categories" element={<Categories />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="clients" element={<Clients />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<InvoiceEditor />} />
              <Route path="invoices/:id" element={<InvoiceEditor />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        <Toaster position="top-right" theme="dark" />
      </AuthProvider>
    </div>
  );
}

export default App;
