import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Camera,
  Clapperboard,
  Film,
  Mic,
  MonitorPlay,
  Phone,
  Play,
  PlayCircle,
  Scissors,
  Smartphone,
  Users,
  Video,
} from "lucide-react";
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SEO, SITE_URL, absolute } from "../lib/seoConfig";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Portfolio", path: "/portfolio" },
];

const HERO_CAPABILITIES = [
  {
    title: "Podcast Productions",
    targetId: "podcast-videos",
    icon: Mic,
  },
  {
    title: "Interviews & Conversations",
    targetId: "interviews-expert-conversations",
    icon: Video,
  },
  {
    title: "Short-Form Content",
    targetId: "social-media-reels",
    icon: PlayCircle,
  },
  {
    title: "Promotional Videos",
    targetId: "promotional-videos",
    icon: Clapperboard,
  },
  {
    title: "Corporate & Brand Videos",
    targetId: "corporate-brand-videos",
    icon: Building2,
  },
  {
    title: "Video Editing & Post-Production",
    targetId: "video-editing-post-production",
    icon: MonitorPlay,
  },
];

const PRODUCTION_CATEGORIES = [
  {
    id: "podcast-videos",
    icon: Mic,
    title: "Podcast Videos",
    description:
      "We have worked on podcast productions featuring professionals, business owners, entrepreneurs and individuals sharing their knowledge, experiences and perspectives. From recording complete podcast episodes to producing visually engaging multi-camera conversations, we focus on capturing authentic discussions with professional audio and video quality.",
    image:
      "/media-placeholder.png?asset=33",
    alt: "Multi-camera podcast video recording session at Genie Studio in Visakhapatnam",
    servicePath: "/services/podcast-shoots",
    serviceLabel: "Explore Podcast Shoots services",
  },
  {
    id: "podcast-shorts-highlights",
    icon: Scissors,
    title: "Podcast Shorts & Highlights",
    description:
      "A podcast conversation often holds several valuable moments worth sharing independently. We transform selected portions of longer podcast recordings into short-form videos, highlighting important discussions, insights and memorable moments. These videos are prepared for platforms such as Instagram, YouTube Shorts and other digital channels.",
    image:
      "/media-placeholder.png?asset=27",
    alt: "Podcast audio recording and short-form highlight clip production at Genie Studio",
    servicePath: "/services/podcast-shoots",
    serviceLabel: "Learn about Podcast Shoots production",
  },
  {
    id: "interviews-expert-conversations",
    icon: Users,
    title: "Interviews & Expert Conversations",
    description:
      "We have produced interview-style videos featuring professionals, industry experts, business representatives and special guests. Our work focuses on presenting conversations naturally while maintaining clear audio, professional framing and a comfortable recording environment.",
    image:
      "/media-placeholder.png?asset=12",
    alt: "Professional interview and expert conversation framing at Genie Studio",
    servicePath: "/services/professional-shoots",
    serviceLabel: "View Professional Shoots services",
  },
  {
    id: "promotional-videos",
    icon: Clapperboard,
    title: "Promotional Videos",
    description:
      "We work on promotional video productions that help businesses showcase their services, products, facilities and brand identity. From concept-based promotional shoots to business presentations, we focus on communicating the message through compelling visuals and structured storytelling.",
    image:
      "/media-placeholder.png?asset=43",
    alt: "Product and promotional video shoot setup at Genie Studio",
    servicePath: "/services/product-shoots",
    serviceLabel: "Explore Product Shoots services",
  },
  {
    id: "social-media-reels",
    icon: Smartphone,
    title: "Social Media Reels & Short-Form Content",
    description:
      "We create short-form video content for businesses, brands and individual creators. This includes informational reels, talking-head videos, promotional clips, educational content and creative social media videos. Our production approach focuses on presenting ideas clearly while maintaining visual consistency and audience engagement.",
    image:
      "/media-placeholder.png?asset=54",
    alt: "Creator filming social media reels and short-form content at Genie Studio",
    servicePath: "/services/business-portfolio-shoots",
    serviceLabel: "Explore Business Portfolio Shoots",
  },
  {
    id: "corporate-brand-videos",
    icon: Building2,
    title: "Corporate & Brand Videos",
    description:
      "We produce corporate and brand-focused videos that help businesses introduce their organisation, communicate their capabilities and present their work professionally. These productions are designed to give audiences a better understanding of the people, services and ideas behind a business.",
    image:
      "/media-placeholder.png?asset=41",
    alt: "Corporate and brand video production by Genie Studio",
    servicePath: "/services/corporate-shoots",
    serviceLabel: "View Corporate Shoots services",
  },
  {
    id: "video-editing-post-production",
    icon: MonitorPlay,
    title: "Video Editing & Post-Production",
    description:
      "Beyond recording, we also handle video editing and post-production requirements. From assembling raw footage and refining conversations to creating short clips, adding visual elements and preparing final video outputs, we help turn recorded material into polished content ready for publication.",
    image:
      "/media-placeholder.png?asset=47",
    alt: "Video editing and post-production workstation and creative studio work at Genie Studio",
    servicePath: "/services",
    serviceLabel: "Browse all Genie Studio services",
  },
];

const COLLECTION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: SEO.portfolio.title,
  description: SEO.portfolio.description,
  url: absolute(SEO.portfolio.path),
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: SEO.portfolio.image,
  },
  about: PRODUCTION_CATEGORIES.map((category) => ({
    "@type": "Thing",
    name: category.title,
    description: category.description,
  })),
  provider: {
    "@id": `${SITE_URL}/#business`,
  },
};

const PortfolioImageFallback = ({ icon, title }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(255,193,7,0.18) 0%, rgba(0,207,232,0.08) 45%, #101828 85%)",
      }}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FFC107] mb-2.5">
        <IconComponent className="w-6 h-6" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFC107]/90">
        Genie Studio
      </span>
      <span className="text-white/90 font-semibold text-sm mt-1">{title}</span>
    </div>
  );
};

const Portfolio = () => {
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (key) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const scrollToSection = (targetId) => (e) => {
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SEO.portfolio}
        schema={COLLECTION_SCHEMA}
        breadcrumbs={CRUMBS}
      />

      {/* SECTION 1 – HERO */}
      <section className="relative bg-[#090B10] text-white pt-16 md:pt-20 overflow-hidden">
        {/* Ambient background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -left-24 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-55 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(168,28,158,0.42) 0%, rgba(34,211,238,0.12) 48%, rgba(9,11,16,0) 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute top-[54%] -left-10 -translate-y-1/2 w-[210px] h-[210px] rounded-full border border-fuchsia-400/20 opacity-45"
          style={{
            background:
              "radial-gradient(circle at 35% 40%, rgba(192,38,211,0.35) 0%, rgba(88,28,135,0.16) 55%, rgba(9,11,16,0) 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-8 w-[460px] h-[340px] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,193,7,0.34) 0%, rgba(255,193,7,0) 70%)",
          }}
        />

        {/* Subtle dot matrices */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute bottom-6 left-4 w-28 h-24 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,193,7,0.55) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute top-1/2 right-4 -translate-y-1/2 w-24 h-36 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,193,7,0.6) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />

        {/* Faint decorative clapperboard outline (top-right) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 180 180"
          fill="none"
          className="pointer-events-none hidden md:block absolute top-20 right-8 lg:right-14 w-36 h-36 lg:w-44 lg:h-44 opacity-[0.07] text-white -rotate-6"
        >
          <path
            d="M24 58L148 28L154 48L30 78L24 58Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M44 53L56 71M74 46L86 64M104 39L116 57M134 32L142 50"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <rect
            x="28"
            y="78"
            width="128"
            height="74"
            rx="6"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M48 78L60 94M78 78L90 94M108 78L120 94M138 78L150 94"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>

        {/* Flowing yellow SVG waveforms behind capability grid */}
        <svg
          aria-hidden="true"
          viewBox="0 0 900 520"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[66%] h-full opacity-75"
        >
          <defs>
            <linearGradient
              id="portfolio-wave-grad-1"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFC107" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#FFE082" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient
              id="portfolio-wave-grad-2"
              x1="0%"
              y1="80%"
              x2="100%"
              y2="20%"
            >
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0" />
              <stop offset="45%" stopColor="#FFC107" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#FFD54F" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <path
              key={`top-wave-${idx}`}
              d={`M ${120 + idx * 12} ${190 - idx * 5} C ${280 + idx * 14} ${
                95 + idx * 10
              }, ${470 - idx * 8} ${245 - idx * 9}, ${900} ${75 + idx * 14}`}
              stroke="url(#portfolio-wave-grad-1)"
              strokeWidth={1.15 - idx * 0.06}
              strokeOpacity={0.62 - idx * 0.05}
            />
          ))}

          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
            <path
              key={`bottom-wave-${idx}`}
              d={`M ${80 + idx * 14} ${505 - idx * 6} C ${310 + idx * 12} ${
                445 - idx * 8
              }, ${540 - idx * 6} ${495 - idx * 9}, ${900} ${315 + idx * 13}`}
              stroke="url(#portfolio-wave-grad-2)"
              strokeWidth={1.25 - idx * 0.06}
              strokeOpacity={0.7 - idx * 0.05}
            />
          ))}
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_1fr] gap-10 lg:gap-12 items-center">
            {/* Left Side */}
            <div className="space-y-4 sm:space-y-5">
              <Breadcrumbs items={CRUMBS} className="text-white/70" />

              <h1 className="hero-sans-heading text-[26px] min-[360px]:text-[32px] sm:text-[44px] lg:text-[54px] font-extrabold leading-[1.06] tracking-[-0.025em] text-white">
                Our <span className="text-[#FFC107] italic">Portfolio</span>
              </h1>

              <p className="hero-sans-heading border-l-[3px] border-[#FFC107] pl-3.5 text-lg sm:text-[21px] font-bold text-white leading-snug">
                Bringing Ideas to Life Through Professional Production.
              </p>

              <p className="text-slate-300 text-[15px] sm:text-[16px] leading-[1.68] max-w-xl">
                At Genie Studio, our work spans different forms of video and
                audio production. We have worked with businesses, professionals,
                creators and brands to produce content that communicates their
                ideas, shares their stories and presents their work effectively.
              </p>

              <p className="text-slate-300 text-[15px] sm:text-[16px] leading-[1.68] max-w-xl">
                From in-depth podcast conversations to engaging short-form
                videos and promotional productions, every project gives us an
                opportunity to bring together creative thinking, technical
                expertise and professional execution.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href="#production-experience"
                  onClick={scrollToSection("production-experience")}
                  className="inline-flex items-center gap-2.5 bg-[#FFC107] hover:bg-[#ffca2c] text-[#090B10] font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-[#FFC107]/20 transition-all hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Explore Our Work
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 bg-[#090B10]/60 hover:bg-white/10 text-white border border-white/55 hover:border-[#FFC107] font-semibold text-sm px-6 py-3 rounded-full transition-all"
                >
                  Book Your Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Side – 6 Capability Icon Grid */}
            <nav aria-label="Portfolio production categories">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                {HERO_CAPABILITIES.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <a
                      key={capability.targetId}
                      href={`#${capability.targetId}`}
                      onClick={scrollToSection(capability.targetId)}
                      className="group relative rounded-xl bg-[#12151C]/80 backdrop-blur-md border border-white/12 hover:border-[#FFC107]/60 hover:bg-[#171B24]/90 px-3 py-5 sm:py-6 flex flex-col items-center justify-center text-center gap-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Icon
                        className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFC107] transition-transform duration-200 group-hover:scale-110"
                        strokeWidth={1.7}
                      />
                      <span className="hero-sans-heading text-[12.5px] sm:text-[13px] font-medium text-white/95 leading-snug">
                        {capability.title}
                      </span>
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* SECTION 2 – OUR PRODUCTION EXPERIENCE */}
      <section
        id="production-experience"
        className="py-12 sm:py-16 lg:py-20 bg-white scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-[#101828] tracking-[-0.02em] text-center">
              Our Production <span className="text-[#FFC107]">Experience</span>
            </h2>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
            />
          </div>

          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {PRODUCTION_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              const imageFirstOnDesktop = index % 2 === 0;

              return (
                <article
                  key={category.id}
                  id={category.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center scroll-mt-24"
                >
                  {/* Image Column */}
                  <div
                    className={`lg:col-span-6 ${
                      imageFirstOnDesktop ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] bg-[#101828] border border-slate-200/80 shadow-md hover:shadow-xl transition-shadow duration-300">
                      {failedImages[category.id] ? (
                        <PortfolioImageFallback
                          icon={Icon}
                          title={category.title}
                        />
                      ) : (
                        <OptimizedImage
                          sectionKey={["portfolio_cat_podcast", "portfolio_cat_shorts", "portfolio_cat_interviews", "portfolio_cat_promotional", "portfolio_cat_reels", "portfolio_cat_corporate", "portfolio_cat_editing"][index]}
                          src={category.image}
                          alt={category.alt}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover text-transparent transition-transform duration-500 ease-out group-hover:scale-105"
                          onError={handleImageError(category.id)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Text Column */}
                  <div
                    className={`lg:col-span-6 space-y-4 ${
                      imageFirstOnDesktop ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        aria-hidden="true"
                        className="w-11 h-11 rounded-xl bg-[#FFC107]/15 border border-[#FFC107]/35 flex items-center justify-center shrink-0"
                      >
                        <Icon className="w-5 h-5 text-[#d99b00]" />
                      </div>
                      <h3 className="hero-sans-heading text-2xl sm:text-[26px] font-bold text-[#101828] leading-snug">
                        {category.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 text-[15px] sm:text-[16px] leading-[1.7]">
                      {category.description}
                    </p>

                    <div className="pt-1">
                      <Link
                        to={category.servicePath}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#101828] hover:text-[#087BFF] transition-colors"
                      >
                        <span>{category.serviceLabel}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 – EVERY PROJECT HAS A STORY */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div
                    aria-hidden="true"
                    className="w-11 h-11 rounded-xl bg-[#FFC107]/15 border border-[#FFC107]/35 flex items-center justify-center shrink-0"
                  >
                    <Video className="w-5 h-5 text-[#d99b00]" />
                  </div>
                  <h2 className="hero-sans-heading text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#101828] leading-tight">
                    <span className="text-[#FFC107] italic">Every Project</span>{" "}
                    Has a Story.
                  </h2>
                </div>

                <p className="text-slate-600 text-[15px] sm:text-[16.5px] leading-[1.7]">
                  The work we have undertaken reflects our experience across
                  different production formats, creative requirements and client
                  expectations. We value every collaboration and the opportunity
                  to help individuals and businesses present their ideas through
                  quality content.
                </p>
              </div>

              <div className="lg:col-span-5 h-full">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[260px] bg-[#101828] overflow-hidden">
                  {failedImages.story ? (
                    <PortfolioImageFallback
                      icon={Film}
                      title="Creative Studio Production"
                    />
                  ) : (
                    <OptimizedImage
                      sectionKey="portfolio_story_callout"
                    src="/media-placeholder.png?asset=44"
                      alt="Genie Studio creative production environment in Visakhapatnam"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover text-transparent"
                      onError={handleImageError("story")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 – FINAL CALL TO ACTION */}
      <section className="relative bg-[#0B0D12] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-4">
              <h2 className="hero-sans-heading text-3xl sm:text-4xl font-extrabold leading-[1.12] tracking-[-0.02em]">
                Have a Story to Tell?{" "}
                <span className="block text-[#FFC107] italic mt-1">
                  Let&apos;s Create It Together.
                </span>
              </h2>
            </div>

            <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-white/15 lg:pl-8">
              <p className="text-slate-300 text-[15px] sm:text-[16.5px] leading-[1.7]">
                At Genie Studio, we bring the space, equipment and production
                support to help turn your next idea into something worth
                sharing.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-full bg-[#FFC107] hover:bg-[#eab000] text-[#101828] font-semibold text-sm sm:text-[15px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Book Your Studio</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-full bg-transparent hover:bg-white/10 border border-white/35 hover:border-white text-white font-semibold text-sm sm:text-[15px] transition-all duration-200"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#101828] border border-white/10 shadow-xl">
                {failedImages.cta ? (
                  <PortfolioImageFallback
                    icon={Camera}
                    title="Book Your Studio"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="portfolio_cta_banner"
                    src="/media-placeholder.png?asset=35"
                    alt="Professional cinema camera lens at Genie Studio"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={handleImageError("cta")}
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/60 via-transparent to-transparent pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Portfolio;

