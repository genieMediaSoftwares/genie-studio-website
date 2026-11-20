import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { FaBriefcase, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

/*
 * ACCENT COLOURS (Preserved Business Portfolio Gold / Yellow Identity)
 * #1A1A14  Dark charcoal hero & final CTA surface
 * #C9A227  Primary gold for decorative rules, icons & dark-surface highlights
 * #8F731C  WCAG AA >= 4.5:1 gold for buttons carrying white text
 * #FAF6E8  Warm cream tinted card & section surface
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  {
    name: "Business Portfolio Shoots",
    path: "/services/business-portfolio-shoots",
  },
];

const HERO_IMAGE =
  "https://geniestudio.in/uploads/1786519476_1786519476246-824255335.jpg";

const CTA_IMAGE =
  "https://geniestudio.in/uploads/1786524726_1786524725461-113127996.JPG";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello GenieStudio, I would like to enquire about booking a business portfolio photoshoot in Visakhapatnam."
  );

const SERVICE_HIGHLIGHTS = [
  "Professional business and executive portraits",
  "Corporate team and employee photography",
  "Office and workplace photography",
  "Founder and leadership headshots",
  "Brand storytelling and business visuals",
  "Website, LinkedIn and marketing-ready images",
];

const DELIVERABLES = [
  {
    icon: Camera,
    title: "Professional Portraits",
    description: "High-quality individual and executive portraits.",
    img: "https://geniestudio.in/uploads/1786608030_1786608028512-709035430.png",
    alt: "Executive portrait photography for business portfolios in Visakhapatnam by GenieStudio",
  },
  {
    icon: Users,
    title: "Team & Culture Photos",
    description: "Professional team photographs and workplace culture images.",
    img: "https://geniestudio.in/uploads/1786601041_1786601041120-705832864.png",
    alt: "Corporate team photography and office workplace session in Vizag by GenieStudio",
  },
  {
    icon: Sparkles,
    title: "Edited Images",
    description: "Carefully selected and professionally retouched photographs.",
    img: "https://geniestudio.in/uploads/1786602496_1786602495549-844717374.jpg",
    alt: "Edited business portfolio photographs and post-production by GenieStudio",
  },
  {
    icon: ImageIcon,
    title: "Digital & Print-Ready Files",
    description:
      "High-resolution images suitable for websites, presentations and marketing.",
    img: "https://geniestudio.in/uploads/1786520942_1786520939441-392375551.webp",
    alt: "Business headshot photography ready for LinkedIn, websites and company profiles",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    icon: MessageSquare,
    description:
      "Understand business goals, brand identity and photography requirements.",
  },
  {
    number: "02",
    title: "Planning & Setup",
    icon: Layers,
    description:
      "Plan locations, shoot style, team requirements and creative direction.",
  },
  {
    number: "03",
    title: "Photography Session",
    icon: Camera,
    description:
      "Capture professional portraits, team photographs and workplace visuals.",
  },
  {
    number: "04",
    title: "Editing & Delivery",
    icon: PlayCircle,
    description: "Select, edit and deliver the final images.",
  },
];

const FAQS = [
  {
    q: "What is included in a business portfolio photoshoot?",
    a: "A business portfolio photoshoot at GenieStudio includes professional business and executive portraits, corporate team and employee photography, office and workplace photography, founder headshots, brand storytelling visuals and edited digital and print-ready files.",
  },
  {
    q: "Where can I book business portfolio photography in Visakhapatnam?",
    a: "You can book business portfolio photography with GenieStudio in Visakhapatnam, Andhra Pradesh. Our studio is located at 5A-2, KP Icon, Yendada, Visakhapatnam 530045, and we cover both studio sessions and on-location office shoots across Vizag.",
  },
  {
    q: "Do you provide corporate team and executive photography?",
    a: "Yes. We photograph founders, leadership teams, executives and employees—both individually and as cohesive group and workplace culture portraits.",
  },
  {
    q: "Can business portfolio photographs be used on LinkedIn and company websites?",
    a: "Yes. All final edited photographs are delivered in high-resolution digital and print-ready formats suited for LinkedIn profiles, company websites, company profiles, pitch decks and marketing materials.",
  },
  {
    q: "How can I book a business portfolio shoot with GenieStudio?",
    a: "You can request a free quote on our contact page or message us directly on WhatsApp to share your team size, preferred location and timeline.",
  },
];

const BusinessImageFallback = ({ icon, title }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(201,162,39,0.22) 0%, #1A1A14 82%)",
      }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#C9A227",
          border: "1px solid rgba(201,162,39,0.35)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#C9A227" }}
      >
        GenieStudio
      </span>
      <span className="font-semibold text-xs sm:text-sm mt-1 text-white/90">
        {title}
      </span>
    </div>
  );
};

const Businessportfolioshoots = () => {
  const [heroFailed, setHeroFailed] = useState(false);
  const [ctaFailed, setCtaFailed] = useState(false);
  const [failedCards, setFailedCards] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SEO.businessPortfolio.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SEO.businessPortfolio}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SEO.businessPortfolio.title,
            description: SEO.businessPortfolio.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Business Portfolio Photography in Visakhapatnam",
            description: SEO.businessPortfolio.description,
            path: SEO.businessPortfolio.path,
            serviceType: "Business Portfolio & Corporate Photography",
          }),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
        breadcrumbs={CRUMBS}
      />

      {/* SECTION 1 — HERO */}
      <section className="relative bg-[#1A1A14] text-white pt-20 md:pt-24 overflow-hidden">
        {/* Background photography layer on desktop right, subtle blend for readability */}
        <div className="absolute inset-0 pointer-events-none">
          {!heroFailed && (
            <OptimizedImage
              src={HERO_IMAGE}
              alt="Business portfolio photography and executive portrait in Visakhapatnam by GenieStudio"
              priority
              sizes="100vw"
              className="w-full h-full"
              imgClassName="w-full h-full object-cover object-center opacity-55 lg:opacity-75 text-transparent"
              onError={(e) => {
                e.currentTarget.style.opacity = "0";
                setHeroFailed(true);
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,26,20,0.96) 0%, rgba(26,26,20,0.88) 45%, rgba(26,26,20,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-14 sm:pb-20">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/75" />

          <div className="max-w-2xl space-y-4 sm:space-y-5">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{
                background: "rgba(201, 162, 39, 0.16)",
                color: "#E8C547",
                border: "1px solid rgba(201, 162, 39, 0.38)",
              }}
            >
              <FaBriefcase aria-hidden="true" />
              <span>Photography &amp; Videography</span>
            </div>

            <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-[52px] font-bold leading-[1.08] tracking-tight text-white">
              Business Portfolio Shoots in{" "}
              <span style={{ color: "#E8C547" }}>Visakhapatnam</span>
            </h1>

            <p
              className="text-lg sm:text-xl font-medium italic"
              style={{ color: "#E8C547" }}
            >
              The Full Story of Your Brand, Told Beautifully.
            </p>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
              Build a strong professional presence with business portfolio
              photography in Visakhapatnam. GenieStudio creates high-quality
              business portraits, executive headshots, team photographs,
              workplace photography and brand visuals that showcase your people,
              workplace and business identity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 motion-reduce:transition-none"
                style={{ background: "#8F731C" }}
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Book a Portfolio Shoot</span>
              </Link>

              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/35 hover:border-[#E8C547] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
              >
                <PlayCircle className="w-4 h-4" aria-hidden="true" />
                <span>View Our Work</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT'S INCLUDED */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "#C9A227" }}
            />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              What&apos;s Included in Our Business Portfolio Photography Service
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Our business portfolio photography service in Visakhapatnam helps
              companies, entrepreneurs, founders and professionals build a
              consistent visual identity. From executive portraits and corporate
              headshots to team photography and workplace images, we capture
              professional visuals suitable for websites, company profiles,
              LinkedIn, presentations and marketing materials.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Explore our{" "}
              <Link
                to="/portfolio"
                className="font-semibold text-slate-900 underline decoration-[#C9A227]/70 underline-offset-4 hover:text-[#8F731C]"
              >
                production portfolio
              </Link>
              , pair with{" "}
              <Link
                to="/services/corporate-shoots"
                className="font-semibold text-slate-900 underline decoration-[#C9A227]/70 underline-offset-4 hover:text-[#8F731C]"
              >
                corporate photography in Visakhapatnam
              </Link>{" "}
              or{" "}
              <Link
                to="/services/professional-shoots"
                className="font-semibold text-slate-900 underline decoration-[#C9A227]/70 underline-offset-4 hover:text-[#8F731C]"
              >
                executive portrait photography
              </Link>
              .
            </p>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 motion-reduce:transition-none"
                style={{ background: "#8F731C" }}
              >
                <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                <span>Book This Service</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div
              className="rounded-2xl p-6 sm:p-8 border"
              style={{
                background: "#FAF6E8",
                borderColor: "rgba(201, 162, 39, 0.25)",
              }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Service Highlights
              </h3>
              <ul className="space-y-3.5">
                {SERVICE_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-700 text-sm sm:text-base"
                  >
                    <CheckCircle2
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: "#C9A227" }}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT YOU'LL RECEIVE */}
      <section className="py-12 sm:py-16" style={{ background: "#FAF6E8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#C9A227" }}
            />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              What You&apos;ll Receive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLES.map((item) => {
              const IconComponent = item.icon;
              const isFailed = Boolean(failedCards[item.title]);
              return (
                <article
                  key={item.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none flex flex-col"
                  style={{ borderColor: "rgba(201, 162, 39, 0.18)" }}
                >
                  <div className="relative w-full h-40 sm:h-44 bg-[#1A1A14] overflow-hidden">
                    {isFailed ? (
                      <BusinessImageFallback
                        icon={IconComponent}
                        title={item.title}
                      />
                    ) : (
                      <OptimizedImage
                        src={item.img}
                        alt={item.alt}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover text-transparent"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0";
                          setFailedCards((prev) => ({
                            ...prev,
                            [item.title]: true,
                          }));
                        }}
                      />
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#FAF6E8",
                          color: "#8F731C",
                        }}
                      >
                        <IconComponent className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug pt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — PROCESS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#C9A227" }}
            />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Our Business Portfolio Shoot Process
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {/* Desktop connecting line */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-[1px]"
              style={{ background: "rgba(201, 162, 39, 0.35)" }}
            />

            {PROCESS_STEPS.map((step) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex flex-col items-start md:items-center md:text-center"
                >
                  <div
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm"
                    style={{ background: "#FAF6E8", color: "#8F731C" }}
                  >
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 — FREQUENTLY ASKED QUESTIONS (AEO) */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#C9A227" }}
            />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border bg-white px-5 py-4 transition-colors open:bg-[#FAF6E8]/60"
                style={{ borderColor: "rgba(201, 162, 39, 0.24)" }}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-sm sm:text-base text-slate-900">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-lg font-bold flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: "#8F731C" }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-6">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
            <span>Explore more at GenieStudio:</span>
            <Link
              to="/about"
              className="font-semibold text-slate-900 hover:text-[#8F731C] underline decoration-[#C9A227]/60 underline-offset-4"
            >
              About GenieStudio
            </Link>
            <Link
              to="/gallery"
              className="font-semibold text-slate-900 hover:text-[#8F731C] underline decoration-[#C9A227]/60 underline-offset-4"
            >
              Studio Gallery
            </Link>
            <Link
              to="/services/corporate-shoots"
              className="font-semibold text-slate-900 hover:text-[#8F731C] underline decoration-[#C9A227]/60 underline-offset-4"
            >
              Corporate Shoots
            </Link>
            <Link
              to="/services/professional-shoots"
              className="font-semibold text-slate-900 hover:text-[#8F731C] underline decoration-[#C9A227]/60 underline-offset-4"
            >
              Professional Shoots
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="pb-14 sm:pb-16 pt-2 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#1A1A14] text-white overflow-hidden">
            {/* Background photography accent */}
            <div className="absolute inset-0 pointer-events-none">
              {!ctaFailed && (
                <OptimizedImage
                  src={CTA_IMAGE}
                  alt="GenieStudio business portfolio photography setup in Visakhapatnam"
                  sizes="100vw"
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover object-right opacity-35 text-transparent"
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0";
                    setCtaFailed(true);
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, #1A1A14 0%, rgba(26,26,20,0.94) 55%, rgba(26,26,20,0.62) 100%)",
                }}
              />
            </div>

            <div className="relative z-10 p-7 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-5 lg:border-r lg:border-white/15 lg:pr-6">
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
                  Ready for a{" "}
                  <span style={{ color: "#E8C547" }}>
                    Business Portfolio Shoot?
                  </span>
                </h2>
              </div>

              <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <p className="text-sm text-white/80 leading-relaxed max-w-md">
                  Build a strong professional brand image with business
                  portfolio photography from GenieStudio in Visakhapatnam.
                </p>

                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 hover:opacity-90 motion-reduce:transition-none"
                    style={{ background: "#8F731C" }}
                  >
                    <span>Get a Free Quote</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/25 hover:border-[#E8C547] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
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

export default Businessportfolioshoots;
