import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileVideo,
  Headphones,
  Layers,
  MessageSquare,
  Mic,
  Palette,
  PlayCircle,
  Sliders,
  Sun,
  Video,
} from "lucide-react";
import { FaPodcast, FaWhatsapp } from "react-icons/fa";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SERVICE_SEO, SITE_URL, absolute, serviceSchema } from "../lib/seoConfig";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Podcast Shoots", path: "/services/podcast-shoots" },
];

const HERO_IMAGE =
  "https://geniestudio.in/uploads/1786531745_1786531742798-721756481.webp";

const WHATSAPP_URL =
  "https://wa.me/+919966888428?text=" +
  encodeURIComponent(
    "Hello Genie Studio, I would like to enquire about booking a podcast shoot in Visakhapatnam."
  );

const INCLUSIONS = [
  {
    icon: Video,
    title: "Audio & video podcast recording",
    detail: "Single or multi-camera sessions recorded together in one setup.",
  },
  {
    icon: Sun,
    title: "Professional studio lighting",
    detail: "Pre-configured lighting tailored for solo hosts, interviews or panels.",
  },
  {
    icon: Sliders,
    title: "Sound editing & mastering",
    detail: "Balanced dialogue levels, clean audio mix and video colour finishing.",
  },
  {
    icon: Layers,
    title: "Platform-ready content delivery",
    detail: "Files prepared for YouTube, podcast hosts and short-form channels.",
  },
];

const DELIVERABLES = [
  {
    icon: FileVideo,
    title: "Recorded podcast video",
    detail: "4K multi-camera video podcast footage ready for YouTube and clips.",
  },
  {
    icon: Headphones,
    title: "Edited podcast audio",
    detail: "Mixed and mastered audio episode ready for Spotify and Apple Podcasts.",
  },
  {
    icon: Palette,
    title: "Podcast artwork design",
    detail: "Episode cover artwork available where you need it for publishing.",
  },
  {
    icon: Layers,
    title: "Platform-ready exports",
    detail: "Multiple format exports suited to your podcast host and social feeds.",
  },
];

const DELIVERABLE_IMAGES = [
  {
    src: "https://geniestudio.in/uploads/1786531742_1786531741887-833036636.webp",
    alt: "Multi-camera 4K podcast video recording at Genie Studio in Visakhapatnam",
  },
  {
    src: "https://geniestudio.in/uploads/1786531738_1786531737915-76485310.webp",
    alt: "Studio podcast microphone and audio recording setup at Genie Studio Vizag",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    step: "Consultation",
    icon: MessageSquare,
    body: "We start with a free consultation to understand your show — the format, how many people are on mic, how often you plan to publish, and where the episodes are going.",
  },
  {
    number: "02",
    step: "Studio Setup",
    icon: Sliders,
    body: "We set the studio for your format, whether that is a solo show, a two-person interview or a full panel. Lighting, cameras and microphones are configured before you arrive.",
  },
  {
    number: "03",
    step: "Recording",
    icon: Mic,
    body: "We record audio and video together, so you leave with a video podcast as well as an audio episode rather than having to choose between them.",
  },
  {
    number: "04",
    step: "Editing & Delivery",
    icon: PlayCircle,
    body: "Sound editing and mastering, video colour finishing, podcast artwork where needed, and platform-ready exports for your podcast host and social channels.",
  },
];

const PORTFOLIO_PREVIEWS = [
  {
    title: "Multi-Camera Podcast Conversations",
    format: "Full Episode Video & Audio",
    description:
      "Two-person interviews and founder conversations filmed with studio lighting, clear framing and synchronized multi-track audio in Yendada, Vizag.",
    image:
      "https://geniestudio.in/uploads/1786531741_1786531740123-858872067.webp",
    alt: "Podcast episode framing and artwork presentation at Genie Studio",
  },
  {
    title: "Short-Form Clips & Multi-Platform Exports",
    format: "YouTube, Reels & Audio Feeds",
    description:
      "Recorded sessions edited into full-length YouTube episodes, clean audio feeds and vertical highlight clips prepared for social channels.",
    image:
      "https://geniestudio.in/uploads/1786531739_1786531738826-206533018.webp",
    alt: "Podcast episode exported in multiple formats for YouTube and social channels",
  },
];

const FAQS = [
  {
    q: "Where is your podcast studio in Vizag located?",
    a: "Our studio is at 5A-2, KP Icon, Yendada, Visakhapatnam, Andhra Pradesh 530045. Get in touch through the contact page to arrange a visit or a session.",
  },
  {
    q: "Can you record a video podcast, not just audio?",
    a: "Yes. We record audio and video in the same session, so you get a 4K video podcast alongside the audio episode. Video podcasts are what most creators use for YouTube and for short clips on social platforms.",
  },
  {
    q: "What equipment is used for podcast shoots?",
    a: "Our studio is equipped with Sony A7M4 and Sony A7M3 full-frame cameras for multi-camera 4K recording, studio Rode PodMics paired with a dedicated audio interface, Hollyland Lark M2 wireless backup microphones, and Digitek studio lighting with Godox LC500R light sticks.",
  },
  {
    q: "What does a podcast shoot include?",
    a: "A shoot covers audio and video recording with our Sony A7M4 & A7M3 cameras and Rode PodMics, professional Digitek and Godox lighting, sound editing and mastering, and delivery in platform-ready formats.",
  },
  {
    q: "Do you record interviews and panel discussions?",
    a: "Yes. We handle solo shows, two-person interviews and panel discussions. Tell us the format during the consultation and we set the studio up for it.",
  },
  {
    q: "Who are podcast shoots for?",
    a: "Creators launching or running a show, and businesses using podcasts for brand and content marketing. The production process is the same for both.",
  },
  {
    q: "How do I book a podcast shoot in Visakhapatnam?",
    a: "Reach out through our contact page for a free consultation and a custom quote based on your format and episode count.",
  },
];

const RELATED_LINKS = [
  { to: "/services/professional-shoots", label: "Professional photography in Vizag" },
  { to: "/services/corporate-shoots", label: "Corporate photography & team portraits" },
  { to: "/services/product-shoots", label: "Product photography for e-commerce" },
  { to: "/services/event-shoots", label: "Event photography in Visakhapatnam" },
  { to: "/portfolio", label: "Explore full production portfolio" },
  { to: "/blogs", label: "Read podcast & video production guides" },
];

const PodcastImageFallback = ({ icon, title, dark = false }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background: dark
          ? "radial-gradient(circle at 50% 35%, rgba(232,96,10,0.22) 0%, #1F1A18 80%)"
          : "radial-gradient(circle at 50% 35%, rgba(232,96,10,0.12) 0%, #FFF0E8 85%)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5"
        style={{
          background: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          color: "#E8600A",
          border: dark
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(232,96,10,0.2)",
        }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "#E8600A" }}
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

const Podcastshoots = () => {
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (key) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageUrl = absolute(SERVICE_SEO.podcast.path);

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.podcast}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: SERVICE_SEO.podcast.title,
            description: SERVICE_SEO.podcast.description,
            url: pageUrl,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#localbusiness` },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: HERO_IMAGE,
            },
          },
          serviceSchema({
            name: "Podcast Studio & Podcast Production in Visakhapatnam",
            description: SERVICE_SEO.podcast.description,
            path: SERVICE_SEO.podcast.path,
            serviceType: "Podcast Recording Studio",
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

      {/* SECTION 1 – HERO */}
      <section className="bg-[#1F1A18] text-white pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: "rgba(232, 96, 10, 0.16)",
                  color: "#FF8A3D",
                  border: "1px solid rgba(232, 96, 10, 0.38)",
                }}
              >
                <FaPodcast aria-hidden="true" />
                <span>Podcast Shoots</span>
              </div>

              <h1 className="hero-sans-heading text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
                Podcast Studio in{" "}
                <span className="text-[#E8600A]">Visakhapatnam</span>
              </h1>

              <p className="hero-sans-heading text-lg sm:text-xl font-bold text-white/95">
                Sound great. Look even better.
              </p>

              <p className="text-white/80 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Produce professional-quality podcast episodes with our complete
                production service in Yendada, Vizag. From audio and video
                podcast recording in our studio to sound editing and
                platform-ready delivery, we handle every aspect of your podcast
                shoot.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                  style={{ background: "#C55209" }}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book a Podcast Shoot</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/35 hover:border-[#E8600A] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
                >
                  <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#141110] border border-white/15 shadow-2xl">
                {failedImages.hero ? (
                  <PodcastImageFallback
                    icon={Mic}
                    title="Podcast Studio in Visakhapatnam"
                    dark
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="service_hero_podcast"
                    src={HERO_IMAGE}
                    alt="Genie Studio podcast recording studio in Yendada, Visakhapatnam with microphones, studio seating and lighting"
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

      {/* SECTION 2 – WHAT'S INCLUDED */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#FAFAFA] border border-slate-200/80 p-7 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: "#E8600A" }}
                  aria-hidden="true"
                />
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  What&apos;s Included
                </h2>
                <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
                  A complete podcast studio rental and production setup in
                  Visakhapatnam for solo shows, two-person interviews and panel
                  discussions — recording audio and 4K video together in one
                  seamless session.
                </p>
              </div>

              <div className="lg:col-span-7 lg:border-l lg:border-slate-200 lg:pl-10">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {INCLUSIONS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="flex items-start gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "#FFF0E8", color: "#E8600A" }}
                          aria-hidden="true"
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="hero-sans-heading text-[15px] font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed mt-1">
                            {item.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 – WHAT YOU'LL RECEIVE */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div
                  className="w-10 h-1 rounded-full mb-4"
                  style={{ background: "#E8600A" }}
                  aria-hidden="true"
                />
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  What You&apos;ll Receive
                </h2>
                <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed mt-2">
                  Every podcast shoot in Vizag is delivered in formats ready for
                  your podcast host, YouTube channel and social platforms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DELIVERABLES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200/80 bg-[#FAFAFA] p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#FFF0E8", color: "#E8600A" }}
                          aria-hidden="true"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="hero-sans-heading text-sm font-bold text-slate-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DELIVERABLE_IMAGES.map((img, idx) => (
                <div
                  key={img.src}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200/80 shadow-sm"
                >
                  {failedImages[`deliverable-${idx}`] ? (
                    <PodcastImageFallback
                      icon={idx === 0 ? Video : Headphones}
                      title={idx === 0 ? "4K Podcast Video" : "Studio Audio Mix"}
                    />
                  ) : (
                    <OptimizedImage
                      sectionKey={`podcast_deliv_${idx + 1}`}
                      src={img.src}
                      alt={img.alt}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover text-transparent"
                      onError={handleImageError(`deliverable-${idx}`)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 – OUR PODCAST SHOOTING PROCESS */}
      <section className="py-12 sm:py-16 bg-[#FAFAFA] border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#E8600A" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Podcast Shooting Process
            </h2>
          </div>

          <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {/* Horizontal timeline line on desktop */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-slate-200"
            />
            {/* Vertical timeline line on mobile */}
            <div
              aria-hidden="true"
              className="md:hidden absolute top-6 bottom-6 left-6 w-px bg-slate-200"
            />

            {PROCESS_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.number}
                  className="relative pl-16 md:pl-0 md:text-center flex flex-col md:items-center"
                >
                  <div
                    className="absolute left-0 top-0 md:static w-12 h-12 rounded-full flex items-center justify-center border border-[#E8600A]/25 shadow-sm z-10 md:mb-4"
                    style={{ background: "#FFF0E8", color: "#E8600A" }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="hero-sans-heading text-base font-bold text-slate-900 mb-2">
                    {item.number}. {item.step}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* SECTION 5 – PORTFOLIO PREVIEW */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div
                className="w-10 h-1 rounded-full mb-4"
                style={{ background: "#E8600A" }}
                aria-hidden="true"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Podcast Production Highlights
              </h2>
            </div>

            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: "#C55209" }}
            >
              <span>View All Work</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PORTFOLIO_PREVIEWS.map((item, index) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-[#FAFAFA] overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  {failedImages[`preview-${item.title}`] ? (
                    <PodcastImageFallback icon={FileVideo} title={item.format} />
                  ) : (
                    <OptimizedImage
                      sectionKey={`podcast_preview_${index + 1}`}
                      src={item.image}
                      alt={item.alt}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover text-transparent"
                      onError={handleImageError(`preview-${item.title}`)}
                    />
                  )}
                </div>
                <div className="p-6 space-y-2">
                  <span
                    className="inline-block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#C55209" }}
                  >
                    {item.format}
                  </span>
                  <h3 className="hero-sans-heading text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 – FREQUENTLY ASKED QUESTIONS & RELATED SERVICES */}
      <section className="py-12 sm:py-16 bg-[#FAFAFA] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <div
              className="w-10 h-1 rounded-full mb-4"
              style={{ background: "#E8600A" }}
              aria-hidden="true"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm transition-shadow motion-reduce:transition-none"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-slate-900">
                  <h3 className="hero-sans-heading text-[15px] sm:text-base font-semibold">
                    {faq.q}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xl leading-none transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                    style={{ color: "#E8600A" }}
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

          <div className="mt-10 pt-8 border-t border-slate-200">
            <h2 className="hero-sans-heading text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <CheckCircle2
                className="w-4 h-4"
                style={{ color: "#E8600A" }}
                aria-hidden="true"
              />
              <span>Related Services at Genie Studio</span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {RELATED_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#E8600A] hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 – FINAL CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#1F1A18] text-white overflow-hidden px-6 py-9 sm:px-10 sm:py-11">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="hero-sans-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                  Book Your Podcast Shoot in{" "}
                  <span className="text-[#E8600A]">Visakhapatnam</span>
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                  At Genie Studio in Yendada, Vizag, we bring the studio space,
                  equipment and production support to record and deliver your
                  next podcast episode.
                </p>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none hover:opacity-95 hover:-translate-y-0.5"
                    style={{ background: "#C55209" }}
                  >
                    <span>Book a Podcast Shoot</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-[#E8600A] text-white hover:bg-white/10 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
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

export default Podcastshoots;
