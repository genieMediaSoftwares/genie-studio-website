import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Layers,
  MessageSquare,
  PlayCircle,
  Sliders,
  Users,
  Video,
} from "lucide-react";
import { FaBuilding, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SERVICE_SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

/*
 * ACCENT COLOURS (Preserved Corporate Shoots Blue Identity)
 * #0D1B2A  Dark navy hero & final CTA surface
 * #4A9FD9  Brand blue decorative rules, icons & highlights
 * #3A7CA9  Accessible blue for white-text buttons & badges (WCAG AA >= 4.5:1)
 * #EAF4FC  Light blue tinted card & section surface
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Corporate Shoots", path: "/services/corporate-shoots" },
];

const HERO_IMAGE =
  "https://geniestudio.in/uploads/1786601041_1786601041120-705832864.png";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello Genie Studio, I would like to enquire about booking a corporate shoot in Visakhapatnam."
  );

const SERVICE_HIGHLIGHTS = [
  "Office & workspace coverage",
  "Leadership & executive portraits",
  "Team & company culture photography",
  "Company profile videos & brand visuals",
];

const DELIVERABLES = [
  {
    icon: Camera,
    title: "Professional Corporate Photos",
    subtitle: "Office, workplace & brand imagery",
  },
  {
    icon: Video,
    title: "Corporate Videos (if required)",
    subtitle: "Company profile & leadership reels",
  },
  {
    icon: Users,
    title: "Team and Leadership Portraits",
    subtitle: "Executive headshots & team frames",
  },
  {
    icon: Layers,
    title: "Brand-Ready Visual Assets",
    subtitle: "Web, LinkedIn & marketing formats",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    icon: MessageSquare,
    description:
      "Understand the business, brand, objectives and shoot requirements.",
  },
  {
    number: "02",
    title: "Planning & Setup",
    icon: Sliders,
    description:
      "Plan the shoot, locations, lighting and production requirements.",
  },
  {
    number: "03",
    title: "Shooting",
    icon: Camera,
    description:
      "Capture professional corporate photographs and videos.",
  },
  {
    number: "04",
    title: "Editing & Delivery",
    icon: PlayCircle,
    description:
      "Refine and deliver the final approved content.",
  },
];

const CorporateImageFallback = ({ icon, title }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(74,159,217,0.22) 0%, #0D1B2A 82%)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#4A9FD9",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#4A9FD9" }}
      >
        Genie Studio
      </span>
      <span className="font-semibold text-sm mt-1 text-white/90">{title}</span>
    </div>
  );
};

const Corporateshoots = () => {
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SERVICE_SEO.corporate.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.corporate}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SERVICE_SEO.corporate.title,
            description: SERVICE_SEO.corporate.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Corporate Photography & Video Production in Visakhapatnam",
            description: SERVICE_SEO.corporate.description,
            path: SERVICE_SEO.corporate.path,
            serviceType: "Corporate Photography & Video Production",
          }),
        ]}
        breadcrumbs={CRUMBS}
      />

      {/* SECTION 1 — HERO */}
      <section className="bg-[#0D1B2A] text-white pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "rgba(30, 111, 165, 0.24)",
                  color: "#7EC4F2",
                  border: "1px solid rgba(74, 159, 217, 0.36)",
                }}
              >
                <FaBuilding aria-hidden="true" />
                <span>Photography &amp; Videography</span>
              </div>

              <h1 className="hero-sans-heading text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
                Corporate <span className="text-[#4A9FD9]">Shoots</span>
              </h1>

              <p
                className="text-lg sm:text-xl font-medium italic"
                style={{ color: "#7EC4F2" }}
              >
                Visual Authority for the Modern Enterprise.
              </p>

              <p className="text-white/80 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Corporate photography and video production in Visakhapatnam
                designed to showcase your workplace, leadership team, company
                culture and brand with clarity and professionalism.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#3A7CA9" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book a Corporate Shoot</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/35 hover:border-[#4A9FD9] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#091420] border border-white/15 shadow-2xl">
                {heroFailed ? (
                  <CorporateImageFallback
                    icon={Building2}
                    title="Corporate Photography & Video Production"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="service_hero_corporate"
                    src={HERO_IMAGE}
                    alt="Corporate photography and company profile video production by Genie Studio in Visakhapatnam"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0";
                      setHeroFailed(true);
                    }}
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
            <div className="lg:col-span-5 space-y-4">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#4A9FD9" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#0D1B2A]">
                What&apos;s Included
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
                Genie Studio provides corporate photography and video production
                in Vizag for organisations introducing their team, workspace and
                capabilities. Every corporate photoshoot is planned around your
                brand guidelines for websites, LinkedIn profiles and corporate
                communications.
              </p>
              <p className="text-sm text-slate-600">
                Also need individual portraits or company portfolios? Explore{" "}
                <Link
                  to="/services/professional-shoots"
                  className="font-semibold text-[#0D1B2A] hover:underline"
                >
                  executive portrait photography
                </Link>{" "}
                or{" "}
                <Link
                  to="/services/business-portfolio-shoots"
                  className="font-semibold text-[#0D1B2A] hover:underline"
                >
                  business portfolio shoots
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className="rounded-2xl p-6 sm:p-8 border border-[#4A9FD9]/20"
                style={{ background: "#EAF4FC" }}
              >
                <h3 className="hero-sans-heading text-lg font-bold text-[#0D1B2A] mb-5">
                  Service Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICE_HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-800"
                    >
                      <CheckCircle2
                        className="w-5 h-5 shrink-0 mt-0.5"
                        style={{ color: "#4A9FD9" }}
                        aria-hidden="true"
                      />
                      <span className="text-sm sm:text-[15px] font-medium leading-snug">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT YOU'LL RECEIVE */}
      <section
        className="py-12 sm:py-16 border-y border-[#4A9FD9]/15"
        style={{ background: "#EAF4FC" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#4A9FD9" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#0D1B2A]">
              What You&apos;ll Receive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-[#4A9FD9]/15 p-6 shadow-sm space-y-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#EAF4FC", color: "#4A9FD9" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-[15px] font-bold text-[#0D1B2A] leading-snug">
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

      {/* SECTION 4 — OUR CORPORATE SHOOTING PROCESS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#4A9FD9" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#0D1B2A]">
              Our Corporate Shooting Process
            </h2>
          </div>

          <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {/* Horizontal connector on desktop */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-[#4A9FD9]/25"
            />
            {/* Vertical connector on mobile */}
            <div
              aria-hidden="true"
              className="md:hidden absolute top-6 bottom-6 left-6 w-px bg-[#4A9FD9]/25"
            />

            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative pl-16 md:pl-0 md:text-center flex flex-col md:items-center"
                >
                  <div
                    className="absolute left-0 top-0 md:static w-12 h-12 rounded-full flex items-center justify-center border border-[#4A9FD9]/25 shadow-sm z-10 md:mb-4"
                    style={{ background: "#EAF4FC", color: "#4A9FD9" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-base font-bold text-[#0D1B2A] mb-2">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* SECTION 5 — FINAL CALL TO ACTION */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0D1B2A] text-white px-6 py-9 sm:px-10 sm:py-11">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                  Plan Your Corporate Shoot in{" "}
                  <span className="text-[#4A9FD9]">Visakhapatnam</span>
                </h2>
              </div>

              <div className="lg:col-span-7 lg:border-l lg:border-white/15 lg:pl-8 space-y-5">
                <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Let&apos;s create professional visuals that strengthen your
                  brand and business presence.
                </p>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                    style={{ background: "#3A7CA9" }}
                  >
                    <span>Get a Free Quote</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-[#4A9FD9] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                  >
                    <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Corporateshoots;
