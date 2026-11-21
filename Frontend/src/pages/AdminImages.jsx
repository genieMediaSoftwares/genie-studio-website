import { getToken, clearToken } from "../lib/auth";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Copy,
  X,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  AlertCircle,
  Filter,
  Sparkles,
  Layers,
  FolderOpen,
  CheckCircle2,
  Home,
  Info,
  Briefcase,
  Mic,
  Camera,
  Building2,
  Calendar,
  User,
  ShoppingBag,
  BookOpen,
  Compass,
} from "lucide-react";

import BASE_URL from "../api";
import AdminNav from "../components/AdminNav";
import AdminToast from "../components/AdminToast";
import ImageUploader from "../components/ImageUploader";
import BulkImageUploader from "../components/BulkImageUploader";
import ImageLibrarySection from "../components/ImageLibrarySection";
import useImageLibrary from "../lib/useImageLibrary";
import { copyToClipboard } from "../lib/imageApi";
import { bestVariantUrl } from "../lib/imageManifest";
import {
  SECTION_CATEGORIES,
  fetchSiteSections,
  assignSectionImage,
  clearSectionImage,
} from "../lib/sectionsApi";

// Canonical display order for pages
const PAGE_ORDER = [
  "Home Page",
  "About Page",
  "Portfolio Page",
  "Main Services Page",
  "Podcast Shoots",
  "Product Shoots",
  "Corporate Shoots",
  "Event Shoots",
  "Professional Shoots",
  "Business Portfolio Shoots",
  "Blog Page",
];

// Context icons for each page
const PAGE_ICONS = {
  "Home Page": Home,
  "About Page": Info,
  "Portfolio Page": Briefcase,
  "Main Services Page": Compass,
  "Podcast Shoots": Mic,
  "Product Shoots": ShoppingBag,
  "Corporate Shoots": Building2,
  "Event Shoots": Calendar,
  "Professional Shoots": User,
  "Business Portfolio Shoots": Camera,
  "Blog Page": BookOpen,
};

export default function AdminImages() {
  const navigate = useNavigate();
  const token = getToken();

  const library = useImageLibrary();

  const [activeTab, setActiveTab] = useState("sections"); // "sections" | "library"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState("");

  const [uploadMode, setUploadMode] = useState("bulk");
  const [copiedKey, setCopiedKey] = useState(null);
  const [toast, setToast] = useState(null);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });

  // Modal for assigning / replacing an image
  const [assigningSlot, setAssigningSlot] = useState(null); // section object or null
  const [modalMode, setModalMode] = useState("library"); // "library" | "upload"
  const [assigningLoading, setAssigningLoading] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Load site sections
  const loadSections = useCallback(async (cat = "all") => {
    setSectionsLoading(true);
    setSectionsError("");
    try {
      const data = await fetchSiteSections(cat);
      setSections(data);
    } catch (err) {
      console.error("Error loading sections:", err);
      setSectionsError(err.message || "Failed to load sections.");
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections(selectedCategory);
  }, [selectedCategory, loadSections]);

  // Nav badge counts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/blogs`, {
          headers: { Authorization: token },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setCounts({
          published: data.filter((b) => b.status === "published").length,
          draft: data.filter((b) => b.status === "draft").length,
        });
      } catch {
        /* cosmetic */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleUploaded = (image) => {
    library.addImage(image);
    showToast("🎉 Upload successful — image saved persistently!");

    // If modal was open for a slot, automatically assign it
    if (assigningSlot) {
      handleAssignImageToSlot(assigningSlot.section_key, image.url || image.file_url);
    }
  };

  const handleCopy = async (url, key) => {
    const ok = await copyToClipboard(url);
    if (!ok) return showToast("Could not copy the URL.", "error");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    showToast("URL copied to clipboard.");
  };

  const handleAssignImageToSlot = async (sectionKey, imageUrl, altText = "") => {
    setAssigningLoading(true);
    try {
      const updated = await assignSectionImage(sectionKey, imageUrl, altText);
      setSections((prev) =>
        prev.map((s) => (s.section_key === sectionKey ? { ...s, ...updated } : s))
      );
      showToast("✅ Image successfully assigned to section!");
      setAssigningSlot(null);
    } catch (err) {
      showToast(err.message || "Could not assign image.", "error");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleClearSlot = async (sectionKey, sectionName) => {
    if (!window.confirm(`Reset "${sectionName}"? This will remove the assigned image from this section.`)) {
      return;
    }
    try {
      await clearSectionImage(sectionKey);
      setSections((prev) =>
        prev.map((s) => (s.section_key === sectionKey ? { ...s, image_url: null } : s))
      );
      showToast(`Reset ${sectionName}`);
    } catch (err) {
      showToast(err.message || "Could not reset section.", "error");
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/admin");
  };

  const handleNav = (tab) => {
    if (tab === "images") return;
    if (tab === "portfolio") return navigate("/admin/portfolio");
    if (tab === "gallery") return navigate("/admin/gallery");
    navigate("/admin/blogs", { state: { tab } });
  };

  // Group sections strictly by PAGE NAME -> SECTION HEADING -> SLOTS
  const groupedSections = useMemo(() => {
    const map = new Map();
    sections.forEach((sec) => {
      const page = sec.page_name || "General Pages";
      const heading = sec.section_heading || "General";
      if (!map.has(page)) {
        map.set(page, new Map());
      }
      const pageMap = map.get(page);
      if (!pageMap.has(heading)) {
        pageMap.set(heading, []);
      }
      pageMap.get(heading).push(sec);
    });

    // Sort pages according to canonical PAGE_ORDER
    const pageKeys = Array.from(map.keys()).sort((a, b) => {
      const idxA = PAGE_ORDER.indexOf(a);
      const idxB = PAGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return pageKeys.map((pageName) => {
      const headingsMap = map.get(pageName);
      const headingsList = [];
      headingsMap.forEach((items, headingName) => {
        // Sort items inside each section heading by sort_order
        items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        headingsList.push({ headingName, items });
      });
      return { pageName, headingsList };
    });
  }, [sections]);

  return (
    <main className="w-full min-h-screen bg-[#FAF8F5] overflow-x-hidden font-sans text-[#1A1512]">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <header className="relative min-h-[26vh] sm:min-h-[30vh] flex items-center justify-center overflow-hidden bg-[#523723] text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-8">
          <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#EBD9C3] uppercase mb-2">
            GenieStudio Admin
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            Website-Wide Image Management
          </h1>
          <p className="text-xs sm:text-sm text-[#EFE6DC] max-w-2xl mx-auto">
            Manage every image placeholder across your entire website organized by Page &rarr; Section &rarr; Image.
          </p>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{sections.length}</p>
              <p className="text-[10px] sm:text-xs text-[#D5C6B3]">Active Slots</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{library.images.length}</p>
              <p className="text-[10px] sm:text-xs text-[#D5C6B3]">Media Library Assets</p>
            </div>
          </div>
        </div>
      </header>

      <AdminNav
        active="images"
        publishedCount={counts.published}
        draftCount={counts.draft}
        onSelect={handleNav}
        onLogout={handleLogout}
      />

      {/* Top View Mode Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "sections"
                  ? "bg-[#5B3E28] text-white shadow-sm"
                  : "bg-white text-[#4A4038] border border-[#EAE2D6] hover:bg-[#F5EFE6]"
              }`}
            >
              <Sparkles size={15} />
              <span>Page &amp; Section Hierarchy</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
                {sections.length} slots
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "library"
                  ? "bg-[#5B3E28] text-white shadow-sm"
                  : "bg-white text-[#4A4038] border border-[#EAE2D6] hover:bg-[#F5EFE6]"
              }`}
            >
              <ImageIcon size={15} />
              <span>Full Media Library &amp; Upload</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
                {library.images.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              loadSections(selectedCategory);
              library.reload();
              showToast("Refreshed all image data from server.");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#5A5149] hover:text-[#1A1512] hover:bg-white border border-[#EAE2D6]"
            title="Refresh from server"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* ================= SECTION ASSIGNMENTS TAB ================= */}
        {activeTab === "sections" && (
          <div className="space-y-8">
            {/* Page Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-[#5A5149] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <Filter size={13} /> Jump to Page:
              </span>
              {SECTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-[#5B3E28] text-white shadow-xs"
                      : "bg-white text-[#5A5149] border border-[#EAE2D6] hover:border-[#5B3E28]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {sectionsLoading ? (
              <div className="bg-white rounded-2xl border border-[#EAE2D6] p-12 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#D5C6B3] border-t-[#5B3E28] animate-spin mx-auto mb-3" />
                <p className="text-sm text-[#5A5149]">Loading website image slots...</p>
              </div>
            ) : sectionsError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-2">
                <AlertCircle className="w-7 h-7 mx-auto text-red-600" />
                <h4 className="text-base font-bold">Unable to Connect to Backend API</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  {sectionsError.includes("Failed to fetch")
                    ? "The backend server on port 5000 was unreachable (ERR_CONNECTION_REFUSED). The backend process has now been restarted. Click 'Retry Connection' below to connect."
                    : sectionsError}
                </p>
                <button
                  type="button"
                  onClick={() => loadSections(selectedCategory)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-[#5B3E28] hover:bg-[#462F1E] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <RefreshCw size={13} />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : sections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAE2D6] p-12 text-center">
                <p className="text-sm text-[#5A5149]">No image placeholders found in this category.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {groupedSections.map(({ pageName, headingsList }) => {
                  const PageIcon = PAGE_ICONS[pageName] || Layers;
                  const totalSlotsInPage = headingsList.reduce((acc, h) => acc + h.items.length, 0);

                  return (
                    /* ══════════════════════════════════════════════════════════
                       LEVEL 1: PAGE CONTAINER
                       ══════════════════════════════════════════════════════════ */
                    <section
                      key={pageName}
                      className="bg-white rounded-3xl border-2 border-[#E5DACD] shadow-sm overflow-hidden"
                    >
                      {/* PAGE HEADER BANNER */}
                      <div className="px-6 py-5 bg-[#FAF6F0] border-b border-[#E5DACD] flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#5B3E28] text-white flex items-center justify-center shadow-xs">
                            <PageIcon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded bg-[#EFE6DC] text-[#6B4A2D]">
                                Website Page
                              </span>
                              <span className="text-xs font-semibold text-[#8C7E72]">
                                {totalSlotsInPage} {totalSlotsInPage === 1 ? "Image Placeholder" : "Image Placeholders"}
                              </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#1A1512] mt-0.5">
                              {pageName}
                            </h2>
                          </div>
                        </div>

                        <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white text-[#5B3E28] border border-[#D5C6B3] shadow-xs">
                          {headingsList.length} {headingsList.length === 1 ? "Section" : "Sections"}
                        </span>
                      </div>

                      {/* PAGE CONTENT: LIST OF SECTIONS */}
                      <div className="p-6 sm:p-8 space-y-12">
                        {headingsList.map(({ headingName, items }) => (
                          /* ══════════════════════════════════════════════════════════
                             LEVEL 2: SECTION HEADING BLOCK
                             ══════════════════════════════════════════════════════════ */
                          <div key={headingName} className="space-y-4">
                            {/* SECTION SUBHEADER */}
                            <div className="flex items-center justify-between border-b-2 border-[#F0EAE1] pb-3 flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full bg-[#B45309]" />
                                <h3 className="text-base sm:text-lg font-bold text-[#3B2C21] uppercase tracking-wide">
                                  {headingName}
                                </h3>
                              </div>
                              <span className="text-xs font-semibold text-[#7A6E63] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EAE2D6]">
                                {items.length} {items.length === 1 ? "image slot" : "image slots"}
                              </span>
                            </div>

                            {/* ══════════════════════════════════════════════════════════
                               LEVEL 3: INDIVIDUAL IMAGE PLACEHOLDER CARDS
                               ══════════════════════════════════════════════════════════ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                              {items.map((section) => {
                                const hasImage = Boolean(section.image_url);
                                const isCopied = copiedKey === section.section_key;

                                return (
                                  <div
                                    key={section.section_key}
                                    className="bg-[#FAF8F5] rounded-2xl border border-[#EAE2D6] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group/card"
                                  >
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-[#EAE2D6] bg-white">
                                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5EFE6] text-[#6B4A2D]">
                                          {section.section_heading || section.page_name}
                                        </span>
                                        <span className="text-[10px] font-semibold text-[#6B4A2D] bg-[#FFF8E7] border border-[#F3E2B8] px-2 py-0.5 rounded">
                                          Ratio: {section.aspect_ratio || "16:9"}
                                        </span>
                                      </div>
                                      <h4
                                        className="text-sm font-bold text-[#1A1512] leading-snug line-clamp-2"
                                        title={section.section_name}
                                      >
                                        {section.section_name}
                                      </h4>
                                      <p className="text-[10px] font-mono text-[#8C7E72] mt-1 truncate" title={section.section_key}>
                                        Slot Key: {section.section_key}
                                      </p>
                                    </div>

                                    {/* Image Preview Container (Large & Clear) */}
                                    <div className="relative w-full aspect-[16/10] bg-[#EFE7DC] overflow-hidden group">
                                      {hasImage ? (
                                        <>
                                          <img
                                            src={bestVariantUrl(section.image_url, 800)}
                                            alt={section.alt_text || section.section_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src =
                                                "/media-placeholder.png";
                                            }}
                                          />
                                          {/* Hover Overlay with Quick Preview & Copy */}
                                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                            <a
                                              href={section.image_url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="px-2.5 py-1.5 rounded-lg bg-white/95 text-[#1A1512] hover:bg-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                                              title="View full resolution image in new tab"
                                            >
                                              <ExternalLink size={13} />
                                              <span>View</span>
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() => handleCopy(section.image_url, section.section_key)}
                                              className="px-2.5 py-1.5 rounded-lg bg-white/95 text-[#1A1512] hover:bg-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                                              title="Copy image URL"
                                            >
                                              {isCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                              <span>{isCopied ? "Copied" : "Copy URL"}</span>
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7E72] p-4 text-center">
                                          <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-2 text-[#8C7E72]">
                                            <ImageIcon size={24} />
                                          </div>
                                          <p className="text-xs font-bold text-[#5A5149]">No Image Assigned</p>
                                          <p className="text-[10px] text-[#8C7E72] mt-0.5">
                                            Recommended: {section.aspect_ratio || "16:9"}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="p-3.5 bg-white mt-auto border-t border-[#EAE2D6] space-y-2">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAssigningSlot(section);
                                            setModalMode("upload");
                                          }}
                                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#5B3E28] hover:bg-[#462F1E] text-white text-xs font-semibold transition-colors shadow-xs"
                                          title="Upload an image directly from your computer"
                                        >
                                          <Upload size={13} />
                                          <span>{hasImage ? "Replace Image" : "Upload Image"}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAssigningSlot(section);
                                            setModalMode("library");
                                          }}
                                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#EAE2D6] bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#4A3B2F] text-xs font-semibold transition-colors"
                                          title="Pick an existing image from your Media Library"
                                        >
                                          <FolderOpen size={13} />
                                          <span>Library</span>
                                        </button>
                                      </div>

                                      {hasImage && (
                                        <div className="flex items-center justify-between pt-1 border-t border-[#F5EFE6]">
                                          <button
                                            type="button"
                                            onClick={() => handleCopy(section.image_url, section.section_key)}
                                            className="inline-flex items-center gap-1 text-[11px] text-[#7A6E63] hover:text-[#1A1512] transition-colors"
                                          >
                                            <Copy size={11} />
                                            <span>Copy URL</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleClearSlot(section.section_key, section.section_name)}
                                            className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 transition-colors"
                                            title="Reset this image placeholder"
                                          >
                                            <Trash2 size={11} />
                                            <span>Reset</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= FULL MEDIA LIBRARY & UPLOAD TAB ================= */}
        {activeTab === "library" && (
          <div className="space-y-8">
            {/* Upload Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EAE2D6] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EAE2D6] flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] border border-[#EAE2D6] flex items-center justify-center text-[#6B4A2D] shrink-0">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1512]">Upload to Media Library</h2>
                    <p className="text-xs text-[#5A5149]">
                      Images are stored persistently and can be assigned to any page section.
                    </p>
                  </div>
                </div>

                {/* Upload Mode Switcher */}
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE2D6]">
                  <button
                    type="button"
                    onClick={() => setUploadMode("bulk")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      uploadMode === "bulk"
                        ? "bg-[#5B3E28] text-white shadow-xs"
                        : "text-[#5A5149] hover:text-[#1A1512]"
                    }`}
                  >
                    Bulk Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("single")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      uploadMode === "single"
                        ? "bg-[#5B3E28] text-white shadow-xs"
                        : "text-[#5A5149] hover:text-[#1A1512]"
                    }`}
                  >
                    Single Upload
                  </button>
                </div>
              </div>

              <div className="p-6">
                {uploadMode === "bulk" ? (
                  <BulkImageUploader
                    onUploaded={handleUploaded}
                    onToast={showToast}
                  />
                ) : (
                  <ImageUploader
                    autoUpload
                    showPreview={false}
                    inputId="admin-single-upload"
                    onUpload={handleUploaded}
                    onError={(msg) => showToast(msg, "error")}
                  />
                )}
              </div>
            </div>

            {/* Media Library Grid */}
            <ImageLibrarySection
              library={library}
              onToast={showToast}
              subtitle="Browse all stored assets, copy URLs, rename display labels, or remove unused images."
            />
          </div>
        )}
      </div>

      {/* ================= ASSIGN / REPLACE IMAGE MODAL ================= */}
      {assigningSlot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setAssigningSlot(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#EAE2D6] overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EAE2D6] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5738]">
                  Assign Section Image
                </span>
                <h3 className="text-lg font-bold text-[#1A1512]">
                  {assigningSlot.section_name}
                </h3>
                <p className="text-xs text-[#5A5149]">
                  {assigningSlot.page_name} &bull; {assigningSlot.section_heading || "General"} &bull; Recommended ratio: {assigningSlot.aspect_ratio || "16:9"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAssigningSlot(null)}
                className="w-8 h-8 rounded-full bg-white text-[#5A5149] hover:bg-[#F0EAE1] flex items-center justify-center border border-[#EAE2D6]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#EAE2D6] bg-[#FAF8F5] px-5 pt-2">
              <button
                type="button"
                onClick={() => setModalMode("library")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                  modalMode === "library"
                    ? "border-[#5B3E28] text-[#5B3E28]"
                    : "border-transparent text-[#7A6E63] hover:text-[#1A1512]"
                }`}
              >
                Choose from Library ({library.images.length})
              </button>
              <button
                type="button"
                onClick={() => setModalMode("upload")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                  modalMode === "upload"
                    ? "border-[#5B3E28] text-[#5B3E28]"
                    : "border-transparent text-[#7A6E63] hover:text-[#1A1512]"
                }`}
              >
                Upload from Computer
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 relative">
              {assigningLoading && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#5B3E28]">
                    <div className="w-5 h-5 rounded-full border-2 border-[#D5C6B3] border-t-[#5B3E28] animate-spin" />
                    <span>Assigning image...</span>
                  </div>
                </div>
              )}
              {modalMode === "library" ? (
                <div>
                  {library.images.length === 0 ? (
                    <div className="text-center py-10">
                      <ImageIcon className="w-10 h-10 text-[#CBBBA6] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#1A1512]">No images in library yet</p>
                      <p className="text-xs text-[#7A6E63] mt-1 mb-4">
                        Switch to "Upload from Computer" to add an image directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalMode("upload")}
                        className="px-4 py-2 rounded-xl bg-[#5B3E28] text-white text-xs font-semibold"
                      >
                        Upload Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {library.images.map((img) => {
                        const imgUrl = img.url || img.file_url;
                        const isCurrent = assigningSlot.image_url === imgUrl;

                        return (
                          <div
                            key={img.id || imgUrl}
                            onClick={() => handleAssignImageToSlot(assigningSlot.section_key, imgUrl, img.original_name)}
                            className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isCurrent
                                ? "border-[#5B3E28] ring-2 ring-[#5B3E28]/20"
                                : "border-[#EAE2D6] hover:border-[#5B3E28]"
                            }`}
                          >
                            <img
                              src={bestVariantUrl(imgUrl, 400)}
                              alt={img.original_name || "Library image"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                              <span className="px-3 py-1.5 rounded-lg bg-white text-[#1A1512] text-xs font-bold shadow">
                                Select This
                              </span>
                            </div>
                            {isCurrent && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5B3E28] text-white flex items-center justify-center text-[10px]">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4">
                  <ImageUploader
                    autoUpload
                    showPreview={true}
                    inputId="slot-modal-upload"
                    onUpload={handleUploaded}
                    onError={(msg) => showToast(msg, "error")}
                  />
                  <p className="text-xs text-[#7A6E63] text-center mt-3">
                    Supported formats: JPG, PNG, WebP (max 5MB). Once uploaded, it will be automatically assigned to{" "}
                    <strong>{assigningSlot.section_name}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
