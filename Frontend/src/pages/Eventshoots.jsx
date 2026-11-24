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
  Share2,
  Video,
} from "lucide-react";
import { FaCalendarCheck, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SERVICE_SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

/*
 * ACCENT COLOURS (Preserved Event Shoots Purple Identity)
 * #1C1A2E  Dark purple hero & final CTA surface
 * #A064F0  Brand purple decorative rules, icons & highlights
 * #905AD8  Accessible purple for white-text buttons & badges (WCAG AA >= 4.5:1)
 * #F0EAFF  Light lavender tinted card & section surface
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Event Shoots", path: "/services/event-shoots" },
];

const HERO_IMAGE =
  "https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello Genie Studio, I would like to enquire about booking event photography and videography in Visakhapatnam."
  );

const SERVICE_HIGHLIGHTS = [
  "Full event photography coverage",
  "Professional event videography",
  "Candid photography and key moments",
  "Stage, speaker and audience coverage",
  "Edited photos and event highlight videos",
  "Marketing-ready visual content",
];

const DELIVERABLES = [
  {
    icon: ImageIcon,
    title: "Complete Event Photo Coverage",
    subtitle: "Candid, stage & key event moments",
  },
  {
    icon: Video,
    title: "Professional Event Highlight Video",
    subtitle: "Edited recap & event video production",
  },
  {
    icon: Layers,
    title: "High-Resolution Edited Photographs",
    subtitle: "Colour-balanced & curated images",
  },
  {
    icon: Share2,
    title: "Social Media and Marketing-Ready Visual Assets",
    subtitle: "Ready for press, web & social channels",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    icon: MessageSquare,
    description:
      "Understand event type, objectives and coverage requirements.",
  },
  {
    number: "02",
    title: "Planning & Setup",
    icon: Calendar,
    description:
      "Confirm event schedule, locations and photography requirements.",
  },
  {
    number: "03",
    title: "Event Coverage",
    icon: Camera,
    description:
      "Capture important moments, speakers, audience interactions and activities.",
  },
  {
    number: "04",
    title: "Editing & Delivery",
    icon: PlayCircle,
    description:
      "Edit photographs and videos and deliver the agreed final content.",
  },
];

const FAQS = [
  {
    q: "Where can I find professional event photographers in Visakhapatnam?",
    a: "GenieStudio is a photography and videography studio located at 5A-2, KP Icon, Yendada, Visakhapatnam, Andhra Pradesh 530045. We cover events across Visakhapatnam, Vizag and nearby Andhra Pradesh locations.",
  },
  {
    q: "Does GenieStudio provide event photography and videography?",
    a: "Yes. We provide both event photography and event videography, capturing stage moments, speakers, audience interactions, candid scenes and highlight video footage.",
  },
  {
    q: "Do you cover corporate events and conferences in Vizag?",
    a: "Yes. We cover corporate events, conferences, seminars, business meetings, exhibitions, annual days, college events and award ceremonies across Visakhapatnam.",
  },
  {
    q: "Can I book photography for a product launch in Visakhapatnam?",
    a: "Yes. Product launches and brand celebrations are part of our event shoots service, with photo and video coverage tailored for brand promotions and marketing.",
  },
  {
    q: "What is included in an event photography package?",
    a: "Coverage includes full event photography, professional event videography where required, candid moments, stage and speaker coverage, edited photographs, event highlight videos and marketing-ready visual assets.",
  },
  {
    q: "Do you provide edited event photographs and highlight videos?",
    a: "Yes. After coverage, we edit the selected event photographs and produce event highlight videos ready for web, social media and corporate communications.",
  },
  {
    q: "How can I book an event photographer in Vizag?",
    a: "You can book by sharing your event date, venue and coverage requirements through our contact page or by messaging us on WhatsApp.",
  },
  {
    q: "How can I request a quotation for event photography?",
    a: "Reach out through our contact page or WhatsApp with your event details to receive a custom quotation based on your schedule and deliverables.",
  },
];

const EventImageFallback = ({ icon, title }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(160,100,240,0.22) 0%, #1C1A2E 82%)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#C49BF9",
          border: "1px solid rgba(160,100,240,0.3)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#C49BF9" }}
      >
        GenieStudio
      </span>
      <span className="font-semibold text-sm mt-1 text-white/90">{title}</span>
    </div>
  );
};

const Eventshoots = () => {
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SERVICE_SEO.event.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.event}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SERVICE_SEO.event.title,
            description: SERVICE_SEO.event.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Event Photography & Videography in Visakhapatnam",
            description: SERVICE_SEO.event.description,
            path: SERVICE_SEO.event.path,
            serviceType: "Event Photography & Videography",
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
      <section className="bg-[#1C1A2E] text-white pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "rgba(160, 100, 240, 0.18)",
                  color: "#C49BF9",
                  border: "1px solid rgba(160, 100, 240, 0.38)",
                }}
              >
                <FaCalendarCheck aria-hidden="true" />
                <span>Photography &amp; Videography</span>
              </div>

              <h1 className="hero-sans-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.1] tracking-[-0.025em] text-white">
                Event Photography &amp; Videography in{" "}
                <span className="text-[#A064F0]">Visakhapatnam</span>
              </h1>

              <p
                className="text-lg sm:text-xl font-medium italic"
                style={{ color: "#C49BF9" }}
              >
                Every Moment, Preserved in Full Frame.
              </p>

              <p className="text-white/80 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Professional event photography and videography in Visakhapatnam
                for corporate events, conferences, product launches, seminars,
                exhibitions and brand celebrations across Vizag and nearby
                Andhra Pradesh locations.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#905AD8" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book an Event Shoot</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/35 hover:border-[#A064F0] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#141224] border border-white/15 shadow-2xl">
                {heroFailed ? (
                  <EventImageFallback
                    icon={Camera}
                    title="Event Photography & Videography"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="service_hero_event"
                    src={HERO_IMAGE}
                    alt="Event photography and stage video coverage by GenieStudio in Visakhapatnam"
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
                style={{ background: "#A064F0" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1A2E]">
                What&apos;s Included in Our Event Photography Service
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
                From corporate events, conferences and seminars to product
                launches, exhibitions, college annual days and award
                celebrations, GenieStudio provides full event documentation in
                Visakhapatnam. Professional coverage ensures key stage moments,
                speakers and candid audience interactions are preserved for
                marketing, press and internal storytelling.
              </p>
              <p className="text-sm text-slate-600">
                Planning a corporate campaign or launch? Explore our{" "}
                <Link
                  to="/services/corporate-shoots"
                  className="font-semibold text-[#1C1A2E] hover:underline"
                >
                  corporate photography in Visakhapatnam
                </Link>{" "}
                and{" "}
                <Link
                  to="/services/product-shoots"
                  className="font-semibold text-[#1C1A2E] hover:underline"
                >
                  product shoots in Vizag
                </Link>
                .
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#905AD8" }}
                >
                  <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                  <span>Book This Service</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                className="rounded-2xl p-6 sm:p-8 border border-[#A064F0]/20"
                style={{ background: "#F0EAFF" }}
              >
                <h3 className="hero-sans-heading text-lg font-bold text-[#1C1A2E] mb-5">
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
                        style={{ color: "#A064F0" }}
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
        className="py-12 sm:py-16 border-y border-[#A064F0]/15"
        style={{ background: "#F0EAFF" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "#A064F0" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1A2E]">
              What You&apos;ll Receive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-[#A064F0]/15 p-6 shadow-sm space-y-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#F0EAFF", color: "#A064F0" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-[15px] font-bold text-[#1C1A2E] leading-snug">
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

      {/* SECTION 4 — OUR EVENT SHOOTING PROCESS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#A064F0" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1A2E]">
              Our Event Shooting Process
            </h2>
          </div>

          <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-[#A064F0]/25"
            />
            <div
              aria-hidden="true"
              className="md:hidden absolute top-6 bottom-6 left-6 w-px bg-[#A064F0]/25"
            />

            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative pl-16 md:pl-0 md:text-center flex flex-col md:items-center"
                >
                  <div
                    className="absolute left-0 top-0 md:static w-12 h-12 rounded-full flex items-center justify-center border border-[#A064F0]/25 shadow-sm z-10 md:mb-4"
                    style={{ background: "#F0EAFF", color: "#A064F0" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-base font-bold text-[#1C1A2E] mb-2">
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
              style={{ background: "#A064F0" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-[#1C1A2E]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm transition-shadow motion-reduce:transition-none"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-[#1C1A2E]">
                  <h3 className="hero-sans-heading text-[15px] sm:text-base font-semibold">
                    {faq.q}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xl leading-none transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                    style={{ color: "#A064F0" }}
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
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1C1A2E] text-white px-6 py-9 sm:px-10 sm:py-11">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                  Plan Your Next Event in{" "}
                  <span className="text-[#A064F0]">Visakhapatnam</span>
                </h2>
              </div>

              <div className="lg:col-span-7 lg:border-l lg:border-white/15 lg:pl-8 space-y-5">
                <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                  From corporate events and conferences to product launches and
                  brand celebrations, GenieStudio helps capture your important
                  moments with professional photography and videography.
                </p>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                    style={{ background: "#905AD8" }}
                  >
                    <span>Get a Free Quote</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-[#A064F0] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
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

export default Eventshoots;
