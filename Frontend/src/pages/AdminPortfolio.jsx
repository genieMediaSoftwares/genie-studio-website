import { getToken, clearToken } from "../lib/auth";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

import AdminNav from "../components/AdminNav";
import AdminToast from "../components/AdminToast";
import BulkUrlManager from "../components/BulkUrlManager";
import BASE_URL from "../api";
import {
  PORTFOLIO_CATEGORIES, categoryName, fetchPortfolio, bulkSavePortfolio,
  updatePortfolioImage, deletePortfolioImage, reorderPortfolio,
} from "../lib/portfolioApi";

export default function AdminPortfolio() {
  const navigate = useNavigate();
  const token = getToken();

  const [category, setCategory] = useState("corporate");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async (cat) => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchPortfolio(cat));
    } catch (err) {
      setError(err?.message || "Could not load the portfolio.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(category); }, [category, load]);

  // Nav badge counts only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/blogs`, { headers: { Authorization: token } });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setCounts({
          published: data.filter((b) => b.status === "published").length,
          draft: data.filter((b) => b.status === "draft").length,
        });
      } catch { /* cosmetic */ }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleNav = (tab) => {
    if (tab === "portfolio") return;
    if (tab === "images") return navigate("/admin/images");
    if (tab === "gallery") return navigate("/admin/gallery");
    navigate("/admin/blogs", { state: { tab } });
  };

  return (
    <main className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans">
      <style>{`
        @keyframes slideUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(.92); }       to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .animate-slideUp { animation: slideUp  .35s ease forwards; }
        .animate-scaleIn { animation: scaleIn  .25s ease forwards; }
        .animate-fadeIn  { animation: fadeIn   .2s  ease forwards; }
        .admin-nav {
          position: sticky; top: 0; z-index: 30;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>

      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <header className="relative min-h-[30vh] sm:min-h-[38vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615567250006-de1875d0c61c?q=80&w=1331&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
            Portfolio Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            Paste image URLs by category — the public Portfolio page updates instantly
          </p>
        </div>
      </header>

      <AdminNav
        active="portfolio"
        publishedCount={counts.published}
        draftCount={counts.draft}
        onSelect={handleNav}
        onLogout={() => { clearToken(); navigate("/admin"); }}
      />

      <section className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <BulkUrlManager
          items={items}
          onItemsChange={setItems}
          loading={loading}
          error={error}
          onReload={() => load(category)}
          onToast={showToast}
          onBulkSave={(urls, mode) => bulkSavePortfolio({ category, urls, mode })}
          onEditSave={(item, fields) => updatePortfolioImage(item.id, fields)}
          onDelete={(item) => deletePortfolioImage(item.id)}
          onReorder={reorderPortfolio}
          labelKey="title"
          extraFields={[
            { key: "title", label: "Title", hint: "shown in the lightbox" },
            { key: "description", label: "Description", multiline: true },
          ]}
          labels={{
            cardTitle: "Bulk Image URLs",
            cardSubtitle: "One URL per line — preview, then update",
            updateButton: "Update Portfolio",
            replaceButton: `Replace All in ${categoryName(category)}`,
            replaceTitle: `Replace all ${categoryName(category)} images?`,
            listTitle: `${categoryName(category)} Images`,
            emptyTitle: `No images in ${categoryName(category)}`,
            emptyBody: "Paste URLs above and click Update Portfolio.",
            deleteBody: `This image will disappear from the ${categoryName(category)} category on the public Portfolio page.`,
          }}
        >
          {/* Category picker sits above the paste box */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <LayoutGrid size={14} style={{ color: "#6B4A2D" }} /> Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PORTFOLIO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                    category === cat.id
                      ? "border-[#6B4A2D] bg-[#6B4A2D] text-white shadow-md"
                      : "border-gray-200 text-gray-600 hover:border-[#6B4A2D] hover:text-[#6B4A2D]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </BulkUrlManager>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
          <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2"><span>→</span> <strong>Update Portfolio</strong> adds the pasted URLs after the existing ones · <strong>Replace All</strong> wipes the category first</li>
            <li className="flex items-start gap-2"><span>→</span> Duplicates are detected automatically and skipped — pasting the same list twice is safe</li>
            <li className="flex items-start gap-2"><span>→</span> Use the arrows to reorder, then click <strong>Save Order</strong> — that order is what visitors see</li>
            <li className="flex items-start gap-2"><span>→</span> Title and description are optional and only appear in the lightbox when the image is opened</li>
            <li className="flex items-start gap-2"><span>→</span> Changes go live immediately — the Portfolio page reads this data on every visit</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
