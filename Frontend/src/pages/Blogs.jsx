import { usePublicData } from "../lib/publicData";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, FileText } from "lucide-react";
import BASE_URL from "../api";
import OptimizedImage from "../components/OptimizedImage";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const SectionEyebrow = ({ label, light = false }) => (
  <div className="inline-flex items-center justify-center gap-3 mb-3">
    <span
      aria-hidden="true"
      className={`h-px w-8 sm:w-10 ${light ? "bg-white/35" : "bg-[#D5C6B3]"}`}
    />
    <span
      className={`text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase ${
        light ? "text-[#EBD9C3]" : "text-[#7A5738]"
      }`}
    >
      {label}
    </span>
    <span
      aria-hidden="true"
      className={`h-px w-8 sm:w-10 ${light ? "bg-white/35" : "bg-[#D5C6B3]"}`}
    />
  </div>
);

export default function Blogs() {
  const initialData = usePublicData();
  const [blogs, setBlogs] = useState(initialData.blogs || []);
  const [loading, setLoading] = useState(!initialData.blogs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [failedImages, setFailedImages] = useState({});
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/blogs`);
        const data = await res.json();
        const formatted = Array.isArray(data)
          ? data
              .filter((b) => b.status === "published")
              .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
          : [];
        setBlogs(formatted);
      } catch (err) {
        console.error("Fetch Error:", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = ["All", ...new Set(blogs.map((b) => b.category).filter(Boolean))];

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  const formatDate = (ts) =>
    ts
      ? new Date(Number(ts)).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  const getExcerpt = (blog) => {
    if (blog.metaDescription) return blog.metaDescription;
    if (blog.description) return blog.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (typeof blog.content === "string") {
      return blog.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    return "";
  };

  const openLightbox = (e, src, alt) => {
    e.preventDefault();
    e.stopPropagation();
    setLightbox({ src, alt });
  };

  const gridClassName =
    filteredBlogs.length === 1
      ? "flex justify-center"
      : filteredBlogs.length === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7 max-w-4xl mx-auto"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7";

  return (
    <main className="w-full overflow-x-hidden bg-[#FAF8F5] text-[#1A1512]">
      <Seo
        {...SEO.blogs}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: SEO.blogs.path },
        ]}
      />

      {/* Hero Section */}
      <section className="w-full bg-[#523723] text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#6A4A32]">
        <div className="max-w-4xl mx-auto text-center">
          <SectionEyebrow label="GENIE STUDIO | BLOG" light />

          <h1 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-bold leading-[1.15] tracking-tight text-white mb-5">
            Our Blog
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-[#EFE6DC] max-w-3xl mx-auto leading-relaxed">
            Explore photography insights, creative ideas, production tips and updates from
            GenieStudio. Discover useful information about professional photography, podcast
            production, corporate shoots, product photography and visual storytelling in
            Visakhapatnam.
          </p>
        </div>
      </section>

      {/* Blog Listing Section */}
      <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {categories.length > 1 && (
            <div className="mb-10 sm:mb-12 flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#5B3E28] text-white shadow-sm"
                        : "bg-white text-[#4A4038] border border-[#EAE2D6] hover:border-[#CBBBA6]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div
                className="w-10 h-10 rounded-full border-2 border-[#E5D9C8] border-t-[#5B3E28] animate-spin"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm sm:text-base text-[#5A5149] font-medium">
                Loading articles...
              </p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#EAE2D6] p-8 sm:p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] border border-[#EAE2D6] flex items-center justify-center text-[#6B4A2D] mx-auto mb-4">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1512] mb-2">
                No Published Articles Yet
              </h2>
              <p className="text-sm text-[#5A5149] leading-relaxed mb-6">
                {selectedCategory !== "All"
                  ? "No published articles were found in this category."
                  : "New stories and production insights from GenieStudio will appear here once published."}
              </p>
              {selectedCategory !== "All" ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#5B3E28] text-white text-sm font-semibold hover:bg-[#462F1E] transition-colors"
                >
                  View All Articles
                </button>
              ) : (
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#5B3E28] text-white text-sm font-semibold hover:bg-[#462F1E] transition-colors"
                >
                  Contact Our Studio
                </Link>
              )}
            </div>
          ) : (
            <div className={gridClassName}>
              {filteredBlogs.map((blog) => {
                const key = blog.id || blog._id || blog.permalink || blog.title;
                const hasImage = Boolean(blog.image) && !failedImages[key];
                const excerpt = getExcerpt(blog);
                const detailUrl = blog.permalink ? `/blog/${blog.permalink}` : null;

                return (
                  <article
                    key={key}
                    className={`bg-white rounded-2xl border border-[#EAE2D6] shadow-sm hover:shadow-md hover:border-[#D6C6B2] transition-all duration-300 overflow-hidden flex flex-col ${
                      filteredBlogs.length === 1 ? "w-full max-w-[420px]" : ""
                    }`}
                  >
                    {hasImage && (
                      <div className="relative w-full aspect-[16/10] bg-[#F5EFE6] overflow-hidden border-b border-[#EFE8DE] group">
                        <OptimizedImage
                          src={blog.image}
                          variants={blog.variants}
                          lqip={blog.lqip}
                          alt={blog.title || "GenieStudio blog article"}
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [key]: true }))
                          }
                        />
                        <button
                          type="button"
                          aria-label="View full image"
                          onClick={(e) => openLightbox(e, blog.image, blog.title)}
                          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 text-[#5B3E28] text-xs font-semibold shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-white"
                        >
                          Full image
                        </button>
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {blog.category && (
                        <div className="mb-3.5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#EAE2D6] text-[#6B4A2D] text-xs font-medium">
                            {blog.category}
                          </span>
                        </div>
                      )}

                      <h2 className="text-xl sm:text-2xl font-bold text-[#1A1512] leading-snug mb-2.5">
                        {detailUrl ? (
                          <Link
                            to={detailUrl}
                            className="hover:text-[#5B3E28] transition-colors"
                          >
                            {blog.title}
                          </Link>
                        ) : (
                          blog.title
                        )}
                      </h2>

                      {excerpt && (
                        <p className="text-sm text-[#5A5149] leading-relaxed line-clamp-3 mb-5 flex-1">
                          {excerpt}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-[#EFE8DE] flex items-center justify-between gap-3">
                        {blog.createdAt ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-[#6E6359]">
                            <Calendar className="w-3.5 h-3.5 text-[#7A5738]" aria-hidden="true" />
                            <time dateTime={new Date(Number(blog.createdAt)).toISOString()}>
                              {formatDate(blog.createdAt)}
                            </time>
                          </div>
                        ) : (
                          <span />
                        )}

                        {detailUrl && (
                          <Link
                            to={detailUrl}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B3E28] hover:text-[#3A2515] transition-colors group"
                          >
                            <span>Read More</span>
                            <ArrowRight
                              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="w-full pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#523723] text-white rounded-2xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="lg:max-w-xs shrink-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Have a Story to Share?
              </h2>
            </div>

            <div className="lg:border-l lg:border-white/20 lg:pl-8 lg:max-w-md">
              <p className="text-sm text-[#EFE6DC] leading-relaxed">
                Get in touch with GenieStudio to discuss your photography, production or creative
                project.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#3F2919] text-sm font-semibold hover:bg-[#F5EFE6] transition-colors"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Image Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full image preview"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close image preview"
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#1A1512] shadow-lg hover:bg-[#5B3E28] hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Full image"}
              className="w-full h-auto max-h-[82vh] object-contain rounded-2xl shadow-2xl select-none"
              draggable={false}
            />
            {lightbox.alt && (
              <p className="mt-3 text-center text-white/85 text-xs sm:text-sm font-medium px-4 line-clamp-2">
                {lightbox.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
