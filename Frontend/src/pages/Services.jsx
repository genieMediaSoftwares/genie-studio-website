import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  HeartHandshake,
  Layers,
  Lightbulb,
  Mic,
  Package,
  User,
  Zap,
} from "lucide-react";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const SERVICES_LIST = [
  {
    number: "01",
    title: "Podcast Shoots",
    description:
      "End-to-end podcast production with professional audio, video, lighting, and post-production support in Visakhapatnam.",
    Icon: Mic,
    route: "/services/podcast-shoots",
    features: [
      "Podcast recording",
      "Video podcast production",
      "Interview sessions",
      "Professional studio setup",
    ],
  },
  {
    number: "02",
    title: "Product Shoots",
    description:
      "High-impact product photography designed to elevate brand presentation across e-commerce, advertising, and digital platforms.",
    Icon: Package,
    route: "/services/product-shoots",
    features: [
      "Product photography",
      "Commercial product visuals",
      "E-commerce photography",
      "Creative product presentation",
    ],
  },
  {
    number: "03",
    title: "Corporate Shoots",
    description:
      "Strategic corporate photography crafted to showcase your organisation, leadership identity, and workplace culture.",
    Icon: Building2,
    route: "/services/corporate-shoots",
    features: [
      "Corporate photography",
      "Team and employee portraits",
      "Office photography",
      "Corporate events",
    ],
  },
  {
    number: "04",
    title: "Event Shoots",
    description:
      "Professional photo and video coverage for corporate events, business functions, conferences, and special occasions.",
    Icon: CalendarDays,
    route: "/services/event-shoots",
    features: [
      "Corporate event coverage",
      "Business functions",
      "Special occasions",
      "Event photography and videography",
    ],
  },
  {
    number: "05",
    title: "Professional Shoots",
    description:
      "Refined portrait photography for professionals, founders, creators, and executives to strengthen personal branding.",
    Icon: User,
    route: "/services/professional-shoots",
    features: [
      "Professional portraits",
      "Personal branding photography",
      "Executive headshots",
      "Profile photography",
    ],
  },
  {
    number: "06",
    title: "Business Portfolio Shoots",
    description:
      "Coordinated visual storytelling solutions for businesses and brands to present their work, people, and vision.",
    Icon: Layers,
    route: "/services/business-portfolio-shoots",
    features: [
      "Business portfolio photography",
      "Team and workplace visuals",
      "Brand storytelling",
      "Business presentation visuals",
    ],
  },
];

const WHY_WORK_WITH_US = [
  {
    title: "Professional Quality",
    description:
      "Carefully planned photography and production with attention to detail.",
    Icon: Camera,
  },
  {
    title: "Creative Approach",
    description:
      "Visual concepts tailored to your brand, audience and objectives.",
    Icon: Lightbulb,
  },
  {
    title: "Reliable Delivery",
    description:
      "Organised production workflows and clear communication.",
    Icon: Zap,
  },
  {
    title: "Client-Focused Service",
    description:
      "Solutions shaped around your requirements and intended outcomes.",
    Icon: HeartHandshake,
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Understand",
    description:
      "Discuss project requirements, objectives and creative direction.",
  },
  {
    step: "02",
    title: "Plan",
    description:
      "Organise the shoot, production requirements and schedule.",
  },
  {
    step: "03",
    title: "Create",
    description:
      "Our team carries out the photography or production work.",
  },
  {
    step: "04",
    title: "Deliver",
    description:
      "Complete the agreed editing and deliver the final content.",
  },
];

const FAQS = [
  {
    question: "What photography services does GenieStudio offer?",
    answer:
      "GenieStudio offers Podcast Shoots, Product Shoots, Corporate Shoots, Event Shoots, Professional Shoots, and Business Portfolio Shoots, covering both photography and creative video production.",
  },
  {
    question: "Where is GenieStudio located?",
    answer:
      "GenieStudio is located at 5A-2, KP Icon, Yendada, Visakhapatnam (Vizag), Andhra Pradesh 530045.",
  },
  {
    question: "Can I book a professional photoshoot in Vizag?",
    answer:
      "Yes. Individuals, professionals, creators, and businesses can book studio or on-location photoshoots in Visakhapatnam (Vizag) by reaching out through our Contact page or calling +91 9032845433.",
  },
  {
    question: "Does GenieStudio provide corporate and product photography?",
    answer:
      "Yes. We provide corporate photography for teams, offices, and business events, as well as commercial and e-commerce product photography tailored to your brand.",
  },
  {
    question: "How can I book a photography session?",
    answer:
      "You can book a session by visiting our Contact page to share your project details, emailing admin@geniestudio.in, or calling +91 9032845433.",
  },
];

const SectionEyebrow = ({ label, light = false }) => (
  <div className="inline-flex items-center justify-center gap-3 mb-3">
    <span
      aria-hidden="true"
      className={`h-px w-8 sm:w-10 ${light ? "bg-white/35" : "bg-[#D5C6B3]"}`}
    />
    <span
      className={`text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase ${light ? "text-[#EBD9C3]" : "text-[#7A5738]"
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

const Services = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToServices = () => {
    const el = document.getElementById("services-list");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="w-full overflow-x-hidden bg-white text-[#1A1512]">
      <Seo
        {...SEO.services}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: SEO.services.path },
        ]}
      />

      {/* Hero Section */}
      <section className="w-full bg-[#523723] text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#6A4A32]">
        <div className="max-w-4xl mx-auto text-center">
          <SectionEyebrow label="GENIE STUDIO | OUR SERVICES" light />

          <h1 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-bold leading-[1.15] tracking-tight text-white mb-5">
            Professional Photography &amp; Creative Production Services in Visakhapatnam
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-[#EFE6DC] max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-9">
            GenieStudio provides professional photography, videography and creative production
            services in Visakhapatnam (Vizag), Andhra Pradesh. We work with businesses, brands,
            professionals and individuals to create high-quality visual content that communicates
            ideas, strengthens brand identity and captures important moments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={scrollToServices}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#3F2919] text-sm font-semibold hover:bg-[#F5EFE6] transition-colors shadow-sm"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/55 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Our Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services-list"
        className="w-full bg-[#FAF8F5] py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
            <SectionEyebrow label="WHAT WE DO" />
            <h2 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-bold text-[#1A1512] leading-tight mb-3.5">
              Creative Services That Bring Your Vision to Life
            </h2>
            <p className="text-sm sm:text-base text-[#5A5149] leading-relaxed">
              Explore our photography and production services in Visakhapatnam. Whether you are
              building a brand, promoting a product, documenting an event or creating digital
              content, GenieStudio helps turn your ideas into professional visual experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {SERVICES_LIST.map((service) => {
              const Icon = service.Icon;
              return (
                <article
                  key={service.route}
                  className="bg-white rounded-2xl border border-[#EAE2D6] shadow-sm hover:shadow-md hover:border-[#D6C6B2] transition-all duration-300 p-6 sm:p-7 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#F5EFE6] border border-[#EAE2D6] flex items-center justify-center text-[#6B4A2D] shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-[#A39282] tabular-nums">
                      {service.number}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1A1512] mb-2.5">
                    {service.title}
                  </h3>

                  <p className="text-sm text-[#5A5149] leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-[#3F3731]"
                      >
                        <Check
                          className="w-4 h-4 text-[#6B4A2D] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-[#EFE8DE]">
                    <Link
                      to={service.route}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B3E28] hover:text-[#3A2515] transition-colors group"
                    >
                      <span>Explore {service.title}</span>
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Work With Us Section */}
      <section className="w-full bg-white py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-y border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <SectionEyebrow label="WHY WORK WITH US" />
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1512] leading-tight">
              Creative Thinking. Professional Execution.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#EAE2D6]">
            {WHY_WORK_WITH_US.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="flex items-start gap-3.5 p-4 sm:p-5 lg:px-6 lg:py-2 rounded-xl lg:rounded-none border border-[#EFE8DE] lg:border-0 bg-[#FAF8F5]/60 lg:bg-transparent"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F5EFE6] border border-[#EAE2D6] flex items-center justify-center text-[#6B4A2D] shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1512] mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-[#5A5149] leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="w-full bg-[#FAF8F5] py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <SectionEyebrow label="OUR PROCESS" />
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1512] leading-tight">
              From First Discussion to Final Delivery
            </h2>
          </div>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:block relative">
            <div
              aria-hidden="true"
              className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-[#DCCFBF]"
            />
            <div className="grid grid-cols-4 gap-6 lg:gap-8 relative">
              {PROCESS_STEPS.map(({ step, title, description }) => (
                <div key={step} className="text-center px-2">
                  <div className="w-10 h-10 rounded-full bg-[#5B3E28] text-white text-sm font-semibold flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-[#FAF8F5]">
                    {step}
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1512] mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-[#5A5149] leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden relative pl-4">
            <div
              aria-hidden="true"
              className="absolute top-5 bottom-5 left-[1.75rem] w-px bg-[#DCCFBF]"
            />
            <div className="space-y-6 relative">
              {PROCESS_STEPS.map(({ step, title, description }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#5B3E28] text-white text-xs font-semibold flex items-center justify-center shrink-0 ring-4 ring-[#FAF8F5] z-10">
                    {step}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-lg font-bold text-[#1A1512] mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-[#5A5149] leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-white py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 lg:border-r lg:border-[#EAE2D6] lg:pr-8">
              <span className="block text-[11px] font-semibold tracking-[0.22em] uppercase text-[#7A5738] mb-2">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1512] leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-[#EAE2D6] bg-white overflow-hidden transition-colors hover:border-[#D6C6B2]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#1A1512]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6B4A2D] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                          }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 pt-0.5 text-sm text-[#5A5149] leading-relaxed border-t border-[#F4EFE8]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-white pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#523723] text-white rounded-2xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="lg:max-w-xs shrink-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Have a Creative Project in Mind?
              </h2>
            </div>

            <div className="lg:border-l lg:border-white/20 lg:pl-8 lg:max-w-md">
              <p className="text-sm text-[#EFE6DC] leading-relaxed">
                Tell us what you are planning. Let&apos;s discuss your photography or production
                requirements and find the right creative solution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#3F2919] text-sm font-semibold hover:bg-[#F5EFE6] transition-colors"
              >
                <span>Discuss Your Project</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/55 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Contact GenieStudio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
