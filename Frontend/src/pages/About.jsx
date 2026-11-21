import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Film,
  Handshake,
  Lightbulb,
  Mic,
  Palette,
  Phone,
  Video,
} from "lucide-react";
import OptimizedImage from "../components/OptimizedImage";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const WHAT_WE_DO_ITEMS = [
  {
    id: "podcast-rentals",
    number: "01.",
    icon: Mic,
    title: "Podcast Studio Rentals",
    paragraphs: [
      "A professionally equipped recording environment designed to make podcast production simple and convenient. Our studio comes with Sony A7M4 and Sony A7M3 full-frame cameras, Rode PodMics with a dedicated audio interface, professional Digitek & Godox LC500R lighting, and a ready-to-use setup, allowing you to walk in and start recording.",
      "With production team assistance, Hollyland Lark M2 wireless backup audio, and full studio support, we help make your recording experience comfortable and hassle-free.",
    ],
    image:
      "/media-placeholder.png?asset=27",
    alt: "Professional microphone and podcast recording setup at Genie Studio",
  },
  {
    id: "production-visual-content",
    number: "02.",
    icon: Video,
    title: "Production & Visual Content",
    paragraphs: [
      "We provide production services for businesses, brands, creators and events, covering corporate videos, promotional shoots, model shoots, product photography and other visual content requirements.",
      "From planning and capturing footage to delivering the final output, we focus on quality, clarity and attention to detail.",
    ],
    image:
      "/media-placeholder.png?asset=24",
    alt: "Cinema camera and production setup at Genie Studio",
  },
  {
    id: "video-editing-post-production",
    number: "03.",
    icon: Film,
    title: "Video Editing & Post-Production",
    paragraphs: [
      "Our video editing and post-production services help transform raw footage into polished, engaging content. From basic editing and visual refinement to final video output, we focus on delivering content that communicates your ideas effectively and maintains professional standards.",
    ],
    image:
      "/media-placeholder.png?asset=28",
    alt: "Video editing and post-production workflow at Genie Studio",
  },
];

const APPROACH_ITEMS = [
  {
    icon: Lightbulb,
    title: "Understanding Before Production",
    description:
      "We take time to understand your ideas, recording requirements and creative expectations before getting started.",
  },
  {
    icon: Palette,
    title: "Creativity With Purpose",
    description:
      "We focus on creating content that communicates clearly, captures attention and represents your ideas effectively.",
  },
  {
    icon: Clapperboard,
    title: "Professional Execution",
    description:
      "From studio preparation and recording to editing and final delivery, we value consistency, quality and attention to detail throughout the process.",
  },
  {
    icon: Handshake,
    title: "A Seamless Experience",
    description:
      "We bring essential equipment, production facilities and creative support together to make the production process more convenient for our clients.",
  },
];

const StudioImageFallback = ({ icon, label }) => {
  const IconComponent = icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(255,193,7,0.18) 0%, rgba(0,207,232,0.08) 45%, #101828 85%)",
      }}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FFC107] mb-2">
        <IconComponent className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FFC107]/90">
        Genie Studio
      </span>
      <span className="text-white/90 font-semibold text-xs sm:text-sm mt-1">
        {label}
      </span>
    </div>
  );
};

const About = () => {
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (key) => (e) => {
    e.currentTarget.style.opacity = "0";
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SEO.about}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: SEO.about.path },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0B0D12] text-white pt-16 md:pt-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,193,7,0.35) 0%, rgba(255,193,7,0) 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Side */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold tracking-[0.12em] text-white/85">
                  About Genie Studio
                </span>
                <span
                  aria-hidden="true"
                  className="h-[2px] w-10 bg-[#FFC107] rounded-full"
                />
              </div>

              <h1 className="hero-sans-heading text-[26px] min-[360px]:text-[32px] sm:text-[42px] lg:text-[46px] xl:text-[50px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
                Creative Thinking.{" "}
                <span className="block">Meaningful Stories.</span>{" "}
                <span className="block text-[#FFC107] italic">
                  Professional Production.
                </span>
              </h1>

              <p className="text-slate-300 text-[15px] sm:text-[17px] leading-[1.65] max-w-xl">
                At <strong className="text-white font-semibold">Genie Studio</strong>,
                we bring ideas to life through creativity, technology and
                professional production. We provide businesses, creators and
                individuals with the facilities, equipment and creative support
                needed to produce quality content.
              </p>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] bg-[#101828] border border-white/10 shadow-2xl">
                {failedImages.hero ? (
                  <StudioImageFallback
                    icon={Mic}
                    label="Podcast Recording Studio"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="about_hero"
                    src="/media-placeholder.png?asset=21"
                    alt="Professional podcast recording studio at Genie Studio with cameras, microphones and studio lighting"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={handleImageError("hero")}
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-tr from-[#0B0D12]/65 via-[#0B0D12]/15 to-transparent pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDIO INTRODUCTION */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] bg-[#101828] border border-slate-200/80 shadow-lg">
                {failedImages.intro ? (
                  <StudioImageFallback
                    icon={Video}
                    label="Dedicated Production Studio"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="about_intro"
                    src="/media-placeholder.png?asset=33"
                    alt="Genie Studio podcast and creative production studio setup"
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={handleImageError("intro")}
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <p className="text-[#101828]/85 text-[15px] sm:text-[16px] leading-[1.7]">
                We are a dedicated podcast and creative production studio,
                offering professionally equipped recording spaces and
                end-to-end production support. From setting up your recording
                environment to capturing high-quality footage and delivering
                professionally edited videos, we bring the essential production
                capabilities together under one roof.
              </p>

              <p className="text-[#101828]/85 text-[15px] sm:text-[16px] leading-[1.7]">
                Whether you are starting a podcast, creating corporate videos,
                producing promotional content or developing visual stories for
                your brand, we aim to make the entire production experience
                convenient, seamless and professional.
              </p>

              <p className="text-[#101828]/85 text-[15px] sm:text-[16px] leading-[1.7]">
                We believe every good piece of content begins with a good idea.
                Our approach focuses on understanding your vision, supporting
                your creative process and delivering results that reflect the
                quality and purpose of your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-10 sm:mb-12">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
            />
            <h2 className="hero-sans-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-[#101828] tracking-[-0.02em] text-center">
              What We <span className="text-[#FFC107]">Do</span>
            </h2>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {WHAT_WE_DO_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#101828] shrink-0">
                    {failedImages[item.id] ? (
                      <StudioImageFallback icon={Icon} label={item.title} />
                    ) : (
                      <OptimizedImage
                        sectionKey={`about_story_${index + 1}`}
                        src={item.image}
                        alt={item.alt}
                        loading="eager"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover text-transparent transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={handleImageError(item.id)}
                      />
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="inline-flex items-center justify-center w-9 h-7 rounded-md bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#101828] text-xs font-extrabold mb-3">
                      {item.number}
                    </div>

                    <h3 className="hero-sans-heading text-xl font-bold text-[#101828] mb-3 leading-snug">
                      {item.title}
                    </h3>

                    <div className="space-y-3 text-slate-600 text-[14.5px] leading-[1.65]">
                      {item.paragraphs.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. OUR APPROACH */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span
                aria-hidden="true"
                className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
              />
              <h2 className="hero-sans-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-[#101828] tracking-[-0.02em]">
                Our <span className="text-[#FFC107]">Approach</span>
              </h2>
              <span
                aria-hidden="true"
                className="hidden sm:block h-[2px] w-12 bg-[#FFC107] rounded-full"
              />
            </div>

            <p className="text-slate-600 text-[15px] sm:text-[16.5px] leading-relaxed">
              We believe quality production comes from understanding the vision,
              having the right setup and paying attention to every detail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-200">
            {APPROACH_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="text-center px-4 sm:px-6 py-2 flex flex-col items-center"
                >
                  <div
                    aria-hidden="true"
                    className="w-14 h-14 rounded-2xl bg-[#FFC107]/15 border border-[#FFC107]/35 flex items-center justify-center mb-4"
                  >
                    <Icon className="w-6 h-6 text-[#d99b00]" />
                  </div>

                  <h3 className="hero-sans-heading text-lg font-bold text-[#101828] leading-snug mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-[14px] sm:text-[14.5px] leading-[1.65]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. OUR COMMITMENT */}
      <section className="relative bg-[#0B0D12] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="hero-sans-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-[-0.02em] mb-4">
                Our <span className="text-[#FFC107]">Commitment</span>
              </h2>

              <div className="space-y-4 border-l-2 border-[#FFC107]/60 pl-5 sm:pl-6">
                <p className="text-slate-200 text-[15px] sm:text-[16px] leading-[1.7]">
                  At Genie Studio, we understand that every recording, shoot and
                  creative project represents an idea worth bringing to life.
                </p>

                <p className="text-slate-300 text-[15px] sm:text-[16px] leading-[1.7]">
                  We approach every project with care, professionalism and
                  respect for the creative vision behind it. Our commitment is
                  to provide a dependable production environment, quality-driven
                  services and a comfortable experience from the beginning of
                  the project to its final delivery.
                </p>

                <p className="text-slate-300 text-[15px] sm:text-[16px] leading-[1.7]">
                  Our aim is not simply to provide studio facilities, but to
                  become a reliable creative production partner for individuals,
                  creators and businesses.
                </p>

                <p className="text-slate-300 text-[15px] sm:text-[16px] leading-[1.7]">
                  Whether you are planning your first podcast, recording your
                  next episode, producing a corporate video or looking for
                  professional video production and editing support, Genie
                  Studio is ready to help bring your ideas to life.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#101828] border border-white/10 shadow-xl">
                {failedImages.commitment ? (
                  <StudioImageFallback
                    icon={Camera}
                    label="Quality-Driven Production"
                  />
                ) : (
                  <OptimizedImage
                    sectionKey="about_equipment"
                    src="/media-placeholder.png?asset=35"
                    alt="Professional camera lens and studio production equipment at Genie Studio"
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover text-transparent"
                    onError={handleImageError("commitment")}
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

      {/* 6. FINAL CTA SECTION */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-white via-[#F8FAFC] to-[#FEF9C3]/35 border border-slate-200/80 shadow-sm p-7 sm:p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="w-1 h-16 sm:h-20 bg-[#FFC107] rounded-full shrink-0 mt-1"
                />
                <h2 className="hero-sans-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-[#101828] leading-[1.12] tracking-[-0.02em]">
                  Let&apos;s Create Something{" "}
                  <span className="text-[#FFC107] italic">Meaningful.</span>
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <p className="hero-sans-heading text-[#101828] font-bold text-base sm:text-lg">
                  Genie Studio — Your Space. Your Story. Our Creative Support.
                </p>

                <p className="text-slate-600 text-[15px] sm:text-[16px] leading-[1.65]">
                  Whether you are planning your first podcast, recording your
                  next episode, producing a corporate video or looking for
                  professional video production and editing support, Genie
                  Studio is ready to help bring your ideas to life.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-full bg-[#FFC107] hover:bg-[#eab000] text-[#101828] font-semibold text-sm sm:text-[15px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Book Your Slot</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#101828]/25 hover:border-[#101828] text-[#101828] font-semibold text-sm sm:text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Phone
                      className="w-4 h-4 text-[#101828]"
                      aria-hidden="true"
                    />
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
