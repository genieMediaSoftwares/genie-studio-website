import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Mic,
  Package,
  Briefcase,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";

const SERVICES = [
  {
    id: "podcast-shoots",
    icon: Mic,
    title: "Podcast Shoots",
    link: "/services/podcast-shoots",
    image:
      "/media-placeholder.png?asset=21",
    imageAlt:
      "Genie Studio soundproof podcast studio setup with cameras and studio microphones",
    description:
      "Studio-grade multi-camera podcast video and audio recording with professional lighting, editing, and platform-ready delivery.",
    features: [
      "Soundproof Studio Setup",
      "Multi-Camera Recording",
      "Professional Audio",
      "Podcast Video Production",
    ],
    footerLabel: "Explore this service",
  },
  {
    id: "product-shoots",
    icon: Package,
    title: "Product Shoots",
    link: "/services/product-shoots",
    image:
      "/media-placeholder.png?asset=43",
    imageAlt:
      "Commercial and e-commerce product photography at Genie Studio",
    description:
      "Studio and lifestyle product photography crafted to highlight details, quality, and appeal for e-commerce and campaigns.",
    features: [
      "E-commerce Photography",
      "Catalogue Photography",
      "Lifestyle Product Shoots",
      "Creative Product Videos",
    ],
    footerLabel: "Explore this service",
  },
  {
    id: "corporate-shoots",
    icon: Briefcase,
    title: "Corporate Shoots",
    link: "/services/corporate-shoots",
    image:
      "/media-placeholder.png?asset=41",
    imageAlt:
      "Executive portraits and corporate workspace photography by Genie Studio",
    description:
      "Comprehensive visual documentation of your workplace, leadership portraits, and company culture for brand authority.",
    features: [
      "Executive Headshots",
      "Team Photography",
      "Corporate Events",
      "Office Culture Photography",
    ],
    footerLabel: "Custom quote available",
  },
  {
    id: "event-shoots",
    icon: Calendar,
    title: "Event Shoots",
    link: "/services/event-shoots",
    image:
      "/media-placeholder.png?asset=42",
    imageAlt:
      "Corporate event, conference, and launch photography by Genie Studio",
    description:
      "Complete photo and video coverage for conferences, product launches, and corporate celebrations with fast turnaround.",
    features: [
      "Conferences",
      "Corporate Events",
      "Product Launches",
      "Awards and Celebrations",
    ],
    footerLabel: "Explore this service",
  },
  {
    id: "professional-shoots",
    icon: User,
    title: "Professional Shoots",
    link: "/services/professional-shoots",
    image:
      "/media-placeholder.png?asset=54",
    imageAlt:
      "Personal branding portrait session at Genie Studio Visakhapatnam",
    description:
      "Personal branding portraits and headshots tailored for founders, executives, and creators across web and print.",
    features: [
      "Personal Branding",
      "Professional Portraits",
      "LinkedIn Headshots",
      "Speaker Photography",
    ],
    footerLabel: "Explore this service",
  },
  {
    id: "business-portfolio",
    icon: TrendingUp,
    title: "Business Portfolio",
    link: "/services/business-portfolio-shoots",
    image:
      "/media-placeholder.png?asset=47",
    imageAlt:
      "Business portfolio and brand storytelling photography by Genie Studio",
    description:
      "Cohesive visual storytelling combining team portraits, workspace culture, workflows, and product imagery.",
    features: [
      "Brand Photography",
      "Business Storytelling",
      "Team and Product Photography",
      "Promotional Content",
    ],
    footerLabel: "Custom quote available",
  },
];

const ServiceImageFallback = ({ service }) => {
  const Icon = service.icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(0,207,232,0.18) 0%, rgba(255,193,7,0.12) 45%, #101828 85%)",
      }}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FFC107] mb-2.5">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-[#00CFE8]">
        Genie Studio
      </span>
      <span className="text-white font-semibold text-sm mt-1">
        {service.title}
      </span>
    </div>
  );
};

const ServicesSection = () => {
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (id) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  return (
    <section
      className="py-14 sm:py-16 lg:py-20 bg-[#F8FAFC]"
      data-animate
      id="services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#087BFF]">
            OUR SERVICES
          </span>
          <h2 className="hero-sans-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#101828] tracking-[-0.02em] leading-[1.15] mt-3 mb-4">
            Professional Photography &amp; Video Production Services
          </h2>
          <p className="text-slate-600 text-[15px] sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Explore our creative production services, designed to help
            individuals and businesses capture, create and showcase their
            stories.
          </p>
        </div>

        {/* 3x2 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* Top 16:9 Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#101828] shrink-0">
                {failedImages[service.id] ? (
                  <ServiceImageFallback service={service} />
                ) : (
                  <OptimizedImage
                    sectionKey={`home_service_${service.id.replace("-shoots", "").replace("business-portfolio", "business")}`}
                    src={service.image}
                    alt={service.imageAlt}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={handleImageError(service.id)}
                  />
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-7 flex flex-col flex-1">
                <h3 className="hero-sans-heading text-xl sm:text-[22px] font-bold text-[#101828] leading-snug mb-2.5">
                  {service.title}
                </h3>

                <p className="text-[14.5px] sm:text-[15px] text-slate-600 leading-[1.6] mb-5">
                  {service.description}
                </p>

                {/* Key Features */}
                <ul className="space-y-2.5 mb-6">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[14px] text-[#101828]/85 leading-snug"
                    >
                      <span
                        aria-hidden="true"
                        className="w-[18px] h-[18px] rounded-full bg-[#FFC107] flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <Check className="w-3 h-3 text-[#101828] stroke-[2.75]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600">
                    {service.footerLabel}
                  </span>

                  <Link
                    to={service.link}
                    className="group/btn inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#FFC107] hover:bg-[#eab000] text-[#101828] text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 shrink-0"
                  >
                    <span>View Details</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
