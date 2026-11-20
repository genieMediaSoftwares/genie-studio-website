import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Phone,
  Video,
  Mic,
  Wifi,
  Camera,
  Headphones,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";

const PODCAST_SLIDES = [
  {
    id: 1,
    image:
      "https://geniestudio.in/uploads/1786524726_1786524725461-113127996.JPG",
    title: "Genie Studio Podcast Setup",
    caption:
      "Soundproof podcast studio in Yendada, Visakhapatnam with studio microphones and multi-camera 4K lighting.",
    alt: "Genie Studio podcast recording set in Visakhapatnam with professional studio microphones and lighting",
  },
  {
    id: 2,
    image:
      "https://geniestudio.in/uploads/1786531745_1786531742798-721756481.webp",
    title: "Multi-Camera 4K Production",
    caption:
      "Capture crisp 4K video podcasts ready for YouTube, reels, and branded series.",
    alt: "Genie Studio multi-camera 4K podcast production setup in Visakhapatnam",
  },
  {
    id: 3,
    image:
      "https://geniestudio.in/uploads/1786531738_1786531737915-76485310.webp",
    title: "Crystal Clear Studio Audio",
    caption:
      "Acoustic-treated recording environment with professional audio engineering and mastering.",
    alt: "Genie Studio podcast audio recording and studio sound engineering",
  },
];

const HERO_FEATURES = [
  { label: "4K Video", Icon: Video },
  { label: "Studio Sound", Icon: Mic },
  { label: "High-Speed Wi-Fi", Icon: Wifi },
];

const FLOATING_BADGES = [
  { label: "Sony A7M4 & A7M3", Icon: Camera },
  { label: "Rode PodMics & Interface", Icon: Headphones },
];

const TICKER_ITEMS = Array.from({ length: 6 }, (_, i) => i);

const StudioFallbackBackdrop = ({ title }) => (
  <div
    aria-hidden="true"
    className="absolute inset-0 select-none"
    style={{
      background:
        "radial-gradient(circle at 50% 35%, rgba(255,193,7,0.22) 0%, rgba(0,207,232,0.12) 42%, #101828 80%)",
    }}
  >
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 18px)",
      }}
    />
    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FFC107] text-[11px] sm:text-xs font-semibold tracking-wide">
      <Mic className="w-3.5 h-3.5" />
      <span>Genie Studio • Visakhapatnam</span>
    </div>
    <p className="sr-only">{title}</p>
  </div>
);

const PodcastHero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [failedSlides, setFailedSlides] = useState({});

  const handleImageError = (slideId) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedSlides((prev) => (prev[slideId] ? prev : { ...prev, [slideId]: true }));
  };

  const prevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? PODCAST_SLIDES.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % PODCAST_SLIDES.length);
  };

  useEffect(() => {
    if (previewOpen) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PODCAST_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [previewOpen]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen]);

  const currentSlide = PODCAST_SLIDES[activeSlide];

  return (
    <div className="relative">
      {/* Dark backdrop strip matching Header height so the fixed white-text Header
          stays legible over the light hero at scrollY <= 30 without editing Header.jsx */}
      <div
        className="sticky top-0 z-40 h-16 md:h-20 w-full bg-[#101828]"
        aria-hidden="true"
      />

      {/* Hero + Ticker wrapper sized for desktop first-screen framing without fixed heights */}
      <div className="lg:min-h-[min(calc(100svh-5rem),660px)] flex flex-col">
        {/* Hero Section */}
        <section
          aria-label="Podcast Studio Hero"
          className="relative flex-1 flex items-center overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-white"
        >
          {/* Subtle ambient brand glow matching reference */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,193,7,0.55) 0%, rgba(255,193,7,0) 70%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,207,232,0.3) 0%, rgba(0,207,232,0) 70%)",
            }}
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6 xl:py-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 lg:gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
                {/* Main heading */}
                <h2 className="hero-sans-heading max-w-[490px] text-[24px] min-[360px]:text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[46px] font-extrabold text-[#101828] leading-[1.12] tracking-[-0.025em]">
                  Record a Professional{" "}
                  <span className="whitespace-nowrap">Podcast in</span>{" "}
                  <span className="inline-block text-[#FFC107]">
                    Visakhapatnam
                  </span>
                </h2>

                {/* Description */}
                <p className="text-[#101828]/85 text-[15px] sm:text-[17px] xl:text-[18px] leading-[1.55] max-w-[540px]">
                  Book a premium podcast studio equipped with professional
                  cameras, studio microphones, a soundproof recording room,
                  professional lighting, and a fully air-conditioned environment
                  – everything creators need for a polished production.
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {HERO_FEATURES.map((feature) => (
                    <span
                      key={feature.label}
                      className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#00CFE8]/10 border border-[#00CFE8]/25 text-[#101828] text-xs sm:text-[13px] font-medium"
                    >
                      <feature.Icon
                        className="w-4 h-4 text-[#087BFF] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{feature.label}</span>
                    </span>
                  ))}
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[54px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full border border-transparent bg-[#FFC107] hover:bg-[#eab000] text-[#101828] font-semibold text-[15px] sm:text-[16px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Calendar
                      className="w-[18px] h-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span>Book Your Slot</span>
                  </Link>

                  <a
                    href="tel:+919032845433"
                    className="inline-flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[54px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full border border-[#087BFF]/55 hover:border-[#087BFF] bg-white hover:bg-[#F8FAFC] text-[#101828] font-semibold text-[15px] sm:text-[16px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Phone
                      className="w-[18px] h-[18px] text-[#087BFF] shrink-0"
                      aria-hidden="true"
                    />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Podcast Video/Image Carousel */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#101828] aspect-[16/9] border border-slate-200/70 group">
                  {PODCAST_SLIDES.map((slide, index) => (
                    <div
                      key={slide.id}
                      aria-hidden={activeSlide !== index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        activeSlide === index
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      {failedSlides[slide.id] ? (
                        <StudioFallbackBackdrop title={slide.title} />
                      ) : (
                        <OptimizedImage
                          src={slide.image}
                          alt={slide.alt}
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover text-transparent"
                          onError={handleImageError(slide.id)}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
                    </div>
                  ))}

                  {/* Center Play Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    aria-label={`Preview ${currentSlide.title}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-12 sm:w-20 sm:h-14 rounded-2xl bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xl transition-transform duration-200 hover:scale-105"
                  >
                    <Play
                      className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white ml-0.5"
                      aria-hidden="true"
                    />
                  </button>

                  {/* Previous Arrow */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous podcast slide"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#101828] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>

                  {/* Next Arrow */}
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next podcast slide"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#101828] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
                    {PODCAST_SLIDES.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-current={activeSlide === index ? "true" : undefined}
                        aria-label={`Show slide ${index + 1} of ${PODCAST_SLIDES.length}: ${slide.title}`}
                        className="h-6 min-w-[24px] px-0.5 flex items-center justify-center"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2 rounded-full transition-all duration-300 ${
                            activeSlide === index
                              ? "w-6 bg-white"
                              : "w-2 bg-white/60 hover:bg-white/85"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Two Floating Feature Labels Underneath */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  {FLOATING_BADGES.map((badge) => (
                    <div
                      key={badge.label}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-md text-[#101828] text-xs sm:text-[13px] font-medium"
                    >
                      <badge.Icon
                        className="w-4 h-4 text-[#087BFF] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continuously Moving Horizontal Ticker */}
        <div
          aria-label="Podcast Rental in Visakhapatnam marquee"
          className="w-full shrink-0 bg-white border-y border-slate-200 overflow-hidden py-4 sm:py-5 select-none"
        >
          <div className="hero-ticker-track">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                aria-hidden={groupIndex === 1 ? "true" : undefined}
                className="flex shrink-0 items-center"
              >
                {TICKER_ITEMS.map((itemIndex) => (
                  <div
                    key={itemIndex}
                    className="inline-flex items-center whitespace-nowrap"
                  >
                    <span className="hero-sans-heading inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-8 text-[23px] sm:text-[30px] lg:text-[38px] xl:text-[40px] 2xl:text-[42px] font-bold tracking-[-0.015em] text-[#101828] leading-[1.3]">
                      <span className="text-[#FFC107]" aria-hidden="true">
                        ★
                      </span>
                      <span>Podcast Rental in Visakhapatnam</span>
                    </span>
                    <span
                      className="h-6 sm:h-8 w-[2.5px] bg-[#00CFE8] shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Studio Preview Modal triggered by Carousel Play Button */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="podcast-preview-title"
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close studio preview"
              className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/65 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="relative aspect-[16/10] w-full bg-[#101828]">
              {failedSlides[currentSlide.id] ? (
                <StudioFallbackBackdrop title={currentSlide.title} />
              ) : (
                <OptimizedImage
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover text-transparent"
                  onError={handleImageError(currentSlide.id)}
                />
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3
                  id="podcast-preview-title"
                  className="hero-sans-heading text-lg sm:text-xl font-bold text-[#101828]"
                >
                  {currentSlide.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {currentSlide.caption}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/services/podcast-shoots"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFC107] hover:bg-[#eab000] text-[#101828] text-sm font-semibold transition-colors"
                >
                  <span>Podcast Packages</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href="https://www.youtube.com/@itsgeniemedia_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#087BFF]/45 hover:border-[#087BFF] text-[#101828] text-sm font-semibold transition-colors"
                >
                  <span>YouTube</span>
                  <ExternalLink
                    className="w-4 h-4 text-[#087BFF]"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastHero;
