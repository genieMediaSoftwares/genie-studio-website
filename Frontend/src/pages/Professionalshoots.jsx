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
  Shirt,
  Sparkles,
} from "lucide-react";
import { FaUserTie, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SERVICE_SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

/*
 * ACCENT COLOURS (Preserved Professional Shoots Red / Coral Identity)
 * #1C1414  Dark charcoal hero & final CTA surface
 * #C0392B  Primary red for buttons, decorative rules & icons (WCAG AA >= 4.5:1 with white text)
 * #E05A4E  Coral highlight for dark-surface headings, taglines & badges
 * #FAEAEA  Light blush/pink tinted card & section surface
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Professional Shoots", path: "/services/professional-shoots" },
];

const HERO_IMAGE =
  "/media-placeholder.png?asset=54";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello GenieStudio, I would like to enquire about booking a professional portrait photoshoot in Visakhapatnam."
  );

const SERVICE_HIGHLIGHTS = [
  "Personal branding portraits",
  "Professional headshots",
  "Studio & on-location portrait photography",
  "Professional retouching",
  "Digital-ready photographs",
  "Business and LinkedIn profile images",
];

const DELIVERABLES = [
  {
    icon: Camera,
    title: "Professional Edited Portraits",
    subtitle: "Curated personal branding portraits",
  },
  {
    icon: Shirt,
    title: "Multiple Looks and Outfit Options",
    subtitle: "Varied styling during your session",
  },
  {
    icon: Sparkles,
    title: "Professional Retouching",
    subtitle: "Natural colour & skin finishing",
  },
  {
    icon: ImageIcon,
    title: "Digital and Print-Ready Images",
    subtitle: "Web, LinkedIn & editorial formats",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    icon: MessageSquare,
    description:
      "Understand the customer's purpose, preferences and photography requirements.",
  },
  {
    number: "02",
    title: "Planning & Setup",
    icon: Layers,
    description:
      "Plan the shoot style, background, lighting and location.",
  },
  {
    number: "03",
    title: "Photoshoot",
    icon: Camera,
    description:
      "Capture professional portraits with suitable posing and guidance.",
  },
  {
    number: "04",
    title: "Editing & Delivery",
    icon: PlayCircle,
    description:
      "Retouch and prepare the agreed final photographs.",
  },
];

const FAQS = [
  {
    q: "Where can I get professional photography in Visakhapatnam?",
    a: "GenieStudio is a photography and videography studio located at 5A-2, KP Icon, Yendada, Visakhapatnam, Andhra Pradesh 530045, offering studio and on-location portrait photoshoots across Vizag.",
  },
  {
    q: "What is included in a professional photoshoot?",
    a: "A professional photoshoot includes personal branding portraits, professional headshots, studio or on-location portrait photography, posing guidance, professional retouching and digital-ready photographs.",
  },
  {
    q: "Does GenieStudio offer professional headshot photography in Vizag?",
    a: "Yes. We provide business and executive headshot photography in Visakhapatnam for LinkedIn profiles, company websites, speaker bios and press kits.",
  },
  {
    q: "What is personal branding photography?",
    a: "Personal branding photography creates cohesive portraits and lifestyle images that reflect your personality, profession and visual identity across websites, social platforms and marketing materials.",
  },
  {
    q: "Who should book a professional portrait photoshoot?",
    a: "Entrepreneurs, business owners, company founders, corporate executives, working professionals, consultants, content creators, freelancers and anyone building a personal brand.",
  },
  {
    q: "Can I use professional photographs for LinkedIn and business websites?",
    a: "Yes. All delivered photographs are prepared as digital-ready and print-ready files suited for LinkedIn, company websites, press features and marketing collateral.",
  },
  {
    q: "Do you provide edited and retouched photographs?",
    a: "Yes. Selected portraits from your session undergo professional colour grading and natural retouching before final delivery.",
  },
  {
    q: "How can I book a professional photoshoot in Visakhapatnam?",
    a: "You can book by contacting GenieStudio through our contact page or messaging us on WhatsApp to discuss your goals and schedule a session.",
  },
];

const ProfessionalImageFallback = ({ icon, title }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(224,90,78,0.22) 0%, #1C1414 82%)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#E05A4E",
          border: "1px solid rgba(224,90,78,0.3)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#E05A4E" }}
      >
        GenieStudio
      </span>
      <span className="font-semibold text-sm mt-1 text-white/90">{title}</span>
    </div>
  );
};

const Professionalshoots = () => {
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SERVICE_SEO.professional.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.professional}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SERVICE_SEO.professional.title,
            description: SERVICE_SEO.professional.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Professional Portrait & Headshot Photography in Visakhapatnam",
            description: SERVICE_SEO.professional.description,
            path: SERVICE_SEO.professional.path,
            serviceType: "Portrait & Headshot Photography",
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
      <section className="bg-[#1C1414] text-white pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "rgba(192, 57, 43, 0.22)",
                  color: "#F28B82",
                  border: "1px solid rgba(224, 90, 78, 0.38)",
                }}
              >
                <FaUserTie aria-hidden="true" />
                <span>Photography &amp; Videography</span>
              </div>

              <h1 className="hero-sans-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.1] tracking-[-0.025em] text-white">
                Professional Photography in{" "}
                <span className="text-[#E05A4E]">Visakhapatnam</span>
              </h1>

              <p
                className="text-lg sm:text-xl font-medium italic"
                style={{ color: "#E05A4E" }}
              >
                Your Brand Starts With Your Face.
              </p>

              <p className="text-white/80 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Present yourself with confidence through professional portrait
                photography in Visakhapatnam. GenieStudio creates polished
                personal branding portraits, professional headshots and
                business profile photographs for entrepreneurs, executives,
                creators and professionals.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#C0392B" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book a Professional Shoot</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/35 hover:border-[#E05A4E] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#140E0E] border border-white/15 shadow-2xl">
                {heroFailed ? (
                  <ProfessionalImageFallback
                    icon={Camera}
                    title="Portrait & Headshot Photography"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="service_hero_professional"
                    src={HERO_IMAGE}
                    alt="Professional portrait and personal branding photoshoot at GenieStudio in Visakhapatnam"
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
            <div className="lg:col-span-6 space-y-4">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#C0392B" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1414]">
                What&apos;s Included in Our Professional Photography Service
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
                GenieStudio offers professional portrait photography, personal
                branding photography and business or executive headshots in
                Yendada, Visakhapatnam. Available as studio or on-location
                sessions, every shoot includes posing guidance and professional
                retouching so founders, consultants, freelancers and working
                professionals have cohesive visuals for LinkedIn, websites and
                brand profiles.
              </p>
              <p className="text-sm text-slate-600">
                <Link
                  to="/portfolio"
                  className="font-semibold text-[#1C1414] hover:underline"
                >
                  View our professional photography portfolio
                </Link>
                ,{" "}
                <Link
                  to="/services/corporate-shoots"
                  className="font-semibold text-[#1C1414] hover:underline"
                >
                  explore our corporate photography services
                </Link>
                , or{" "}
                <Link
                  to="/contact"
                  className="font-semibold text-[#1C1414] hover:underline"
                >
                  contact GenieStudio for a professional photoshoot
                </Link>
                .
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#C0392B" }}
                >
                  <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                  <span>Book This Service</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                className="rounded-2xl p-6 sm:p-8 border border-[#C0392B]/15"
                style={{ background: "#FAEAEA" }}
              >
                <h3 className="hero-sans-heading text-lg font-bold text-[#1C1414] mb-5">
                  Service Highlights
                </h3>
                <ul className="space-y-3.5">
                  {SERVICE_HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-800"
                    >
                      <CheckCircle2
                        className="w-5 h-5 shrink-0 mt-0.5"
                        style={{ color: "#C0392B" }}
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
        className="py-12 sm:py-16 border-y border-[#C0392B]/10"
        style={{ background: "#FAEAEA" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#C0392B" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1414]">
              What You&apos;ll Receive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-[#C0392B]/15 p-6 shadow-sm space-y-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#FAEAEA", color: "#C0392B" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-[15px] font-bold text-[#1C1414] leading-snug">
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

      {/* SECTION 4 — OUR PROFESSIONAL SHOOT PROCESS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#C0392B" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1414]">
              Our Professional Shoot Process
            </h2>
          </div>

          <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-[#C0392B]/20"
            />
            <div
              aria-hidden="true"
              className="md:hidden absolute top-6 bottom-6 left-6 w-px bg-[#C0392B]/20"
            />

            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative pl-16 md:pl-0 md:text-center flex flex-col md:items-center"
                >
                  <div
                    className="absolute left-0 top-0 md:static w-12 h-12 rounded-full flex items-center justify-center border border-[#C0392B]/20 shadow-sm z-10 md:mb-4"
                    style={{ background: "#FAEAEA", color: "#C0392B" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-base font-bold text-[#1C1414] mb-2">
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

      {/* SECTION 5 — FREQUENTLY ASKED QUESTIONS */}
      <section className="py-12 sm:py-16 bg-[#FAFAFA] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#C0392B" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1414]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm transition-shadow motion-reduce:transition-none"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-[#1C1414]">
                  <h3 className="hero-sans-heading text-[15px] sm:text-base font-semibold">
                    {faq.q}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xl leading-none transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                    style={{ color: "#C0392B" }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="text-slate-600 leading-relaxed mt-3 text-sm sm:text-[15px]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span>Explore more at GenieStudio:</span>
            <Link to="/about" className="font-semibold text-[#1C1414] hover:underline">
              About GenieStudio
            </Link>
            <Link to="/gallery" className="font-semibold text-[#1C1414] hover:underline">
              Studio Gallery
            </Link>
            <Link
              to="/services/business-portfolio-shoots"
              className="font-semibold text-[#1C1414] hover:underline"
            >
              Business Portfolio Shoots
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1C1414] text-white px-6 py-9 sm:px-10 sm:py-11">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                  Ready for a{" "}
                  <span className="text-[#E05A4E]">Professional Shoot?</span>
                </h2>
              </div>

              <div className="lg:col-span-7 lg:border-l lg:border-white/15 lg:pl-8 space-y-5">
                <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Build a confident professional image with portrait and
                  personal branding photography from GenieStudio in
                  Visakhapatnam.
                </p>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                    style={{ background: "#C0392B" }}
                  >
                    <span>Get a Free Quote</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-[#E05A4E] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
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

export default Professionalshoots;
