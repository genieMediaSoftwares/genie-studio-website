import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  FileImage,
  Image as ImageIcon,
  Layers,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { FaBoxOpen, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SERVICE_SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

/*
 * ACCENT COLOURS (Preserved Product Shoots Green Identity)
 * #0F1F0F  Deep forest green hero & final CTA surface
 * #4CAF50  Brand green decorative rules, icons & highlights
 * #3A853D  Accessible green for white-text buttons & step badges (WCAG AA >= 4.5:1)
 * #EAF5EA  Soft pale green section & panel surface
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Product Shoots", path: "/services/product-shoots" },
];

const HERO_IMAGE =
  "https://geniestudio.in/uploads/1786531726_1786531724729-939039825.webp";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello Genie Studio, I would like to enquire about booking a product shoot in Visakhapatnam."
  );

const INCLUDED_HIGHLIGHTS = [
  {
    icon: Camera,
    label: "Studio & lifestyle product photography",
  },
  {
    icon: Sparkles,
    label: "Detail & angle-focused photography",
  },
  {
    icon: FileImage,
    label: "E-commerce product images",
  },
  {
    icon: Layers,
    label: "Consistent visual styling & presentation",
  },
];

const DELIVERABLES = [
  {
    icon: ImageIcon,
    title: "High-quality product photographs",
    subtitle: "Clean studio lighting & retouching",
  },
  {
    icon: Layers,
    title: "Multiple product angles",
    subtitle: "Hero, detail & context perspectives",
  },
  {
    icon: Sparkles,
    title: "Consistent visual presentation",
    subtitle: "Cohesive styling across catalogues",
  },
  {
    icon: FileImage,
    title: "Platform-ready image files",
    subtitle: "E-commerce, ads & social formats",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    description:
      "Understand the product, brand identity, intended audience and photography requirements.",
  },
  {
    number: "02",
    title: "Studio Setup",
    description:
      "Prepare the lighting, background, camera and product arrangement.",
  },
  {
    number: "03",
    title: "Product Shooting",
    description:
      "Capture the product from appropriate angles with attention to detail and presentation.",
  },
  {
    number: "04",
    title: "Editing & Delivery",
    description:
      "Refine the selected photographs and deliver the final files in agreed formats.",
  },
];

const RECENT_PRODUCT_SHOOTS = [
  {
    id: "angles",
    src: "https://geniestudio.in/uploads/1786533208_1786533208088-576412932.webp",
    alt: "Studio product photography showing multiple angles and lighting detail at Genie Studio in Visakhapatnam",
    caption: "Multi-Angle Studio Framing",
  },
  {
    id: "lifestyle",
    src: "https://geniestudio.in/uploads/1786533193_1786533192518-337638744.webp",
    alt: "Lifestyle and context product photography created by Genie Studio in Vizag",
    caption: "Lifestyle & Context Styling",
  },
  {
    id: "background",
    src: "https://geniestudio.in/uploads/1786519473_1786519471789-580284373.jpg",
    alt: "Commercial product photography with clean background variations at Genie Studio",
    caption: "Commercial & E-Commerce Presentation",
  },
];

const ProductImageFallback = ({ icon, title, dark = false }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background: dark
          ? "radial-gradient(circle at 50% 35%, rgba(76,175,80,0.22) 0%, #0F1F0F 82%)"
          : "radial-gradient(circle at 50% 35%, rgba(76,175,80,0.14) 0%, #EAF5EA 85%)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5"
        style={{
          background: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          color: "#4CAF50",
          border: dark
            ? "1px solid rgba(255,255,255,0.14)"
            : "1px solid rgba(76,175,80,0.25)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#4CAF50" }}
      >
        Genie Studio
      </span>
      <span
        className={`font-semibold text-sm mt-1 ${
          dark ? "text-white/90" : "text-slate-800"
        }`}
      >
        {title}
      </span>
    </div>
  );
};

const Productshoots = () => {
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (key) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SERVICE_SEO.product.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.product}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SERVICE_SEO.product.title,
            description: SERVICE_SEO.product.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Product Photography & Product Shoots in Visakhapatnam",
            description: SERVICE_SEO.product.description,
            path: SERVICE_SEO.product.path,
            serviceType: "Commercial Product Photography",
          }),
        ]}
        breadcrumbs={CRUMBS}
      />

      {/* SECTION 1 — HERO */}
      <section className="bg-[#0F1F0F] text-white pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "rgba(76, 175, 80, 0.16)",
                  color: "#7CE080",
                  border: "1px solid rgba(76, 175, 80, 0.36)",
                }}
              >
                <FaBoxOpen aria-hidden="true" />
                <span>Photography &amp; Videography</span>
              </div>

              <h1 className="hero-sans-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.1] tracking-[-0.025em] text-white">
                Product Photography &amp;{" "}
                <span className="text-[#4CAF50]">Product Shoots</span> in
                Visakhapatnam
              </h1>

              <p
                className="text-lg sm:text-xl font-medium italic"
                style={{ color: "#7CE080" }}
              >
                Visuals that sell before words can.
              </p>

              <p className="text-white/80 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Showcase your products in their best light with commercial and
                e-commerce product photography at Genie Studio in Visakhapatnam.
                From clean studio lighting to lifestyle framing, we highlight
                every detail for catalogues, advertising and brand promotions.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#3A853D" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book a Product Shoot</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/35 hover:border-[#4CAF50] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#0B170B] border border-white/15 shadow-2xl">
                {failedImages.hero ? (
                  <ProductImageFallback
                    icon={Camera}
                    title="Product Photography Studio"
                    dark
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="service_hero_product"
                    src={HERO_IMAGE}
                    alt="Studio product photography shoot setup at Genie Studio in Visakhapatnam"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={handleImageError("hero")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT'S INCLUDED */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#4CAF50" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                What&apos;s Included
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
                A complete product shoot service in Vizag covering studio
                lighting, creative styling and angle-focused photography. We
                work on studio product photography and lifestyle shoots designed
                to highlight your product&apos;s texture, features and visual
                appeal across e-commerce stores and marketing campaigns.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div
                className="rounded-2xl p-6 sm:p-8 border border-[#4CAF50]/15"
                style={{ background: "#EAF5EA" }}
              >
                <ul className="space-y-4">
                  {INCLUDED_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.label}
                        className="flex items-center gap-3.5 text-slate-800"
                      >
                        <div
                          className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                          style={{ color: "#4CAF50" }}
                          aria-hidden="true"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm sm:text-[15px] font-semibold">
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT YOU'LL RECEIVE */}
      <section
        className="py-12 sm:py-16 border-y border-[#4CAF50]/10"
        style={{ background: "#EAF5EA" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#4CAF50" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              What You&apos;ll Receive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#4CAF50]/20">
            {DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="px-4 py-5 sm:py-4 flex flex-col items-center text-center space-y-2"
                >
                  <div
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-1"
                    style={{ color: "#4CAF50" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-[15px] font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    {item.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — OUR PRODUCT SHOOTING PROCESS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#4CAF50" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Product Shooting Process
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.number}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold"
                    style={{ background: "#3A853D" }}
                  >
                    {step.number}
                  </span>
                  {index < PROCESS_STEPS.length - 1 && (
                    <ChevronRight
                      className="hidden lg:block w-4 h-4 text-[#4CAF50]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="hero-sans-heading text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTION 5 — RECENT PRODUCT SHOOTS */}
      <section
        className="py-12 sm:py-16 border-y border-[#4CAF50]/10"
        style={{ background: "#EAF5EA" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div
                className="w-10 h-1 rounded-full mb-4"
                style={{ background: "#4CAF50" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Recent Product Shoots
              </h2>
            </div>

            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: "#3A853D" }}
            >
              <span>View All Work</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RECENT_PRODUCT_SHOOTS.map((item, index) => (
              <figure
                key={item.id}
                className="rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  {failedImages[item.id] ? (
                    <ProductImageFallback icon={Camera} title={item.caption} />
                  ) : (
                    <OptimizedImage
                      sectionKey={`product_recent_${index + 1}`}
                      src={item.src}
                      alt={item.alt}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover text-transparent"
                      onError={handleImageError(item.id)}
                    />
                  )}
                </div>
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — LOCAL SEO CONTENT */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-6">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#4CAF50" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Professional Product Photography Studio in Visakhapatnam
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-600 text-[15px] sm:text-base leading-relaxed">
            <div className="space-y-4">
              <p>
                Product photography is the practice of photographing physical
                goods with controlled studio lighting, clean framing and
                accurate colour so customers can evaluate a product clearly
                before buying. Businesses use professional product images to
                present consistent brand quality across online storefronts,
                digital catalogues and print promotions.
              </p>
              <p>
                For e-commerce listings and brand marketing, multi-angle and
                lifestyle product shots help communicate material texture, scale
                and everyday use far more effectively than casual snapshots.
              </p>
            </div>

            <div className="space-y-4">
              <p>
                At Genie Studio in Yendada, Visakhapatnam, clients work directly
                with our creative team to plan styling, set up studio lighting
                and backgrounds, and receive refined, platform-ready files. To
                enquire about a product shoot in Vizag, reach out through our{" "}
                <Link
                  to="/contact"
                  className="font-semibold underline decoration-[#4CAF50]/60 hover:text-slate-900"
                >
                  contact page
                </Link>{" "}
                or WhatsApp for a free consultation.
              </p>
              <p className="text-sm text-slate-600">
                Looking for broader brand coverage? Explore our{" "}
                <Link
                  to="/services/business-portfolio-shoots"
                  className="font-semibold text-slate-800 hover:underline"
                >
                  business portfolio shoots
                </Link>{" "}
                and{" "}
                <Link
                  to="/services/corporate-shoots"
                  className="font-semibold text-slate-800 hover:underline"
                >
                  corporate photography in Vizag
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL BOOKING CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0F1F0F] text-white px-6 py-9 sm:px-10 sm:py-11">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex items-start gap-4 sm:gap-5">
                <div
                  className="hidden sm:flex w-12 h-12 rounded-xl items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(76, 175, 80, 0.16)",
                    color: "#7CE080",
                  }}
                  aria-hidden="true"
                >
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                    Ready to Showcase{" "}
                    <span className="text-[#4CAF50]">Your Products?</span>
                  </h2>
                  <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                    Get commercial and e-commerce product photography at Genie
                    Studio in Visakhapatnam. Reach out to discuss your products
                    and receive a custom quote.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#3A853D" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Get a Free Quote</span>
                </Link>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-[#4CAF50] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Productshoots;
