import React from "react";
import {
  Users,
  Camera,
  Award,
  ArrowRight,
  CheckCircle,
  Play,
  Aperture,
  Film,
  Lightbulb,
  Mic,
  Sliders,
} from "lucide-react";
import PodcastHero from "../components/PodcastHero";
import ServicesSection from "../components/ServicesSection";
import OptimizedImage from "../components/OptimizedImage";
import { useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";
const Home = () => {
  const navigate = useNavigate();

  const equipment = [
    {
      icon: Camera,
      category: "Cameras",
      title: "Sony A7M4 & Sony A7M3",
      description: "Full-frame Sony A7M4 and Sony A7M3 cameras for ultra-sharp 4K video recording and high-resolution photography",
      image: "/media-placeholder.png?asset=34"
    },
    {
      icon: Mic,
      category: "Microphones",
      title: "Rode PodMics & Audio Interface",
      description: "Broadcast-quality Rode PodMics with dedicated audio interface for rich, noise-free studio sound",
      image: "/media-placeholder.png?asset=35"
    },
    {
      icon: Lightbulb,
      category: "Lighting Setup",
      title: "Digitek & Godox LC500R",
      description: "Professional Digitek studio lighting paired with Godox LC500R handheld light sticks for versatile creative illumination",
      image: "/media-placeholder.png?asset=30"
    },
    {
      icon: Sliders,
      category: "Wireless Audio",
      title: "Hollyland Lark M2 (Backup)",
      description: "Hollyland Lark M2 wireless microphone system ensuring seamless, interference-free backup and mobile audio recording",
      image: "/media-placeholder.png?asset=24"
    }
  ];


  const whyChooseUs = [
    {
      icon: Award,
      title: "Experienced Creative Team",
      description:
        "Skilled photographers and creative professionals delivering quality visual storytelling.",
    },
    {
      icon: Camera,
      title: "Professional Studio Equipment",
      description:
        "Professional cameras, lighting and production equipment for polished results.",
    },
    {
      icon: CheckCircle,
      title: "Reliable Project Delivery",
      description:
        "Organized shoot planning and dependable delivery timelines.",
    },
    {
      icon: Users,
      title: "Personalized Client Support",
      description:
        "Customized photography and production solutions based on your business goals.",
    },
  ];

  /*
   * REMOVED: an IntersectionObserver that watched all 10 [data-animate]
   * sections and, on each one becoming visible, called
   *   setIsVisible(prev => ({ ...prev, [id]: true }))
   *
   * `isVisible` was never read — not in this file, not anywhere else, and no
   * CSS targets [data-animate]. So each of those 10 intersections forced a
   * full re-render of this 1,188-line component to produce a value nothing
   * consumed: up to ten complete re-renders of the largest tree on the site,
   * for nothing. The data-animate attributes are left in place; they are inert
   * markers and removing them would be a content change, not a perf one.
   */

  return (
    // <main>, not <div>: App renders a plain wrapper now, so each route
    // supplies the page's single main landmark.
    <main className="min-h-screen">
      <Seo
        {...SEO.home}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      {/* The one H1 for the homepage. */}
      <h1 className="sr-only">
        Genie Studio — Photography, Podcast Shoots, Product Shoots, Corporate
        Shoots, Event Shoots, Professional Shoots and Business Portfolio
        Photography in Yendada, Visakhapatnam
      </h1>

      <PodcastHero />
      <section
        id="about"
        className="py-10 sm:py-14 md:py-16 bg-white"
      >
        <div className="w-full px-4 sm:px-0 sm:w-[92%] lg:w-[90%] max-w-[1280px] mx-auto text-center">
          <p className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#6B4A2D] mb-3.5">
            GENIE STUDIO | ABOUT OUR CREATIVE STUDIO
          </p>

          <h2 className="text-2xl sm:text-4xl md:text-[46px] font-bold text-slate-900 leading-[1.15] tracking-tight max-w-4xl mx-auto mb-6">
            Your Creative Photography &amp; Production Partner{" "}
            <span className="text-[#B45309]">in Visakhapatnam</span>
          </h2>

          <div
            className="w-full space-y-4 text-slate-600 text-base sm:text-[17px] lg:text-[18px] leading-[1.7] mb-7"
            style={{
              textAlign: "justify",
              textJustify: "inter-word",
              textAlignLast: "center",
            }}
          >
            <p>
              GenieStudio is a creative photography and production studio based
              in Visakhapatnam (Vizag), Andhra Pradesh. We help businesses,
              entrepreneurs, professionals and brands transform their ideas into
              powerful visual stories through professional photography,
              videography and creative content production.
            </p>
            <p>
              Our creative approach combines thoughtful planning, visual
              storytelling and professional production techniques to create
              content that reflects each client&apos;s unique identity. From
              corporate and product photography to event coverage, podcast
              production, professional portraits and business portfolio shoots,
              we focus on delivering visuals that communicate clearly and leave
              a lasting impression.
            </p>
            <p>
              At GenieStudio, we believe every brand has a story worth telling.
              Our goal is to help businesses and individuals build a stronger
              visual presence through creativity, collaboration and attention
              to detail. Discover our approach, learn more about our studio and
              explore the people and ideas behind GenieStudio.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/about"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm sm:text-base bg-[#6B4A2D] hover:bg-[#563B23] text-white rounded-full font-semibold transition-colors duration-200"
            >
              <span>Discover GenieStudio</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm sm:text-base border border-slate-300 hover:border-[#6B4A2D] text-slate-900 hover:text-[#6B4A2D] rounded-full font-semibold transition-colors duration-200"
            >
              <span>Get in Touch</span>
            </Link>
          </div>
        </div>
      </section>

      <ServicesSection />

      <section className="py-8 sm:py-24 bg-white" data-animate id="equipment">
        <div className="page-container">

          {/* HEADER */}
          <div className="text-left sm:text-center mb-12 sm:mb-16">
            <span className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
              Our Equipment
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-5">
              State of the Art Technology
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Equipped with Sony full-frame cameras, Rode PodMics, and professional Digitek &amp; Godox lighting
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {equipment.map((item, i) => {
              const Icon = item.icon;

              return (
                <div key={i} className=" group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500" data-animate id={`equipment-${i}`} >
                  <div className="aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
                    <OptimizedImage sectionKey={`home_equipment_${i + 1}`}
                        src={item.image} alt={item.title}
                      className="w-full h-full"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      imgClassName="transition-transform duration-700 group-hover:scale-110" />
                  </div>

                  <div className=" absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-6 " >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[#FFC107]">
                        {item.category}
                      </span>
                    </div>

                    <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white/95 mb-1.5 sm:mb-2" />

                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 leading-snug">
                      {item.title}
                    </h3>

                    <p className=" text-xs sm:text-sm text-gray-200 opacity-95 sm:opacity-0 sm:max-h-0 sm:group-hover:opacity-100 sm:group-hover:max-h-24 transition-all duration-300 leading-relaxed " >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Studio Gear Spec Highlights */}
          <div className="mt-10 sm:mt-14 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B4A2D]">
                Studio Gear Inventory
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                Equipment Present at GenieStudio
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Professional tools ready for podcast production, corporate headshots, and creative shoots.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6E8] text-[#6B4A2D] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Cameras</h4>
                </div>
                <ul className="text-xs text-gray-700 space-y-1.5">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Sony A7M4
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Sony A7M3
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6E8] text-[#6B4A2D] flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Microphones &amp; Audio</h4>
                </div>
                <ul className="text-xs text-gray-700 space-y-1.5">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Rode PodMics
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Audio Interface
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6E8] text-[#6B4A2D] flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Lighting Setup</h4>
                </div>
                <ul className="text-xs text-gray-700 space-y-1.5">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Lighting – Digitek
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Godox LC500R Light Stick
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6E8] text-[#6B4A2D] flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Backup Microphone</h4>
                </div>
                <ul className="text-xs text-gray-700 space-y-1.5">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                    Hollyland Lark M2
                  </li>
                  <li className="text-[11px] text-gray-500 pl-3.5">
                    Wireless backup microphone
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="py-12 sm:py-16 bg-[#F7F6F3]" data-animate id="why-choose">
        <div className="w-full px-4 sm:px-0 sm:w-[92%] lg:w-[90%] max-w-[1280px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <p className="text-[#6B4A2D] font-semibold text-xs uppercase tracking-[0.18em] mb-3">
              WHY BUSINESSES CHOOSE GENIESTUDIO
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 leading-tight mb-4">
              Creative Excellence.{" "}
              <span className="text-[#B45309]">Professional Results.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From professional photography and podcast production to corporate
              and brand shoots, GenieStudio brings creative expertise,
              professional equipment and reliable service together in
              Visakhapatnam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-[#6B4A2D]/12 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col items-start text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                    style={{
                      background: "#FAF6E8",
                      color: "#6B4A2D",
                      border: "1px solid rgba(107, 74, 45, 0.16)",
                    }}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative w-full py-14 sm:py-20 lg:py-[100px] bg-white text-slate-900 overflow-hidden"
        data-animate
        id="parallax"
      >
        <div className="relative z-10 w-full px-4 sm:px-0 sm:w-[92%] lg:w-[90%] max-w-[1160px] mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span
              aria-hidden="true"
              className="w-6 h-[1px] bg-[#6B4A2D]/50"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B4A2D]">
              LET&apos;S CREATE SOMETHING MEANINGFUL
            </p>
            <span
              aria-hidden="true"
              className="w-6 h-[1px] bg-[#6B4A2D]/50"
            />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-[48px] font-bold text-slate-900 leading-[1.15] tracking-tight max-w-4xl mx-auto mb-5">
            Have a Creative Project in Mind?{" "}
            <span className="text-[#B45309]">
              Let&apos;s Bring It to Life.
            </span>
          </h2>

          <p className="text-base sm:text-[17px] lg:text-[18px] text-slate-600 leading-[1.7] max-w-4xl mx-auto">
            Looking for professional photography or creative production services
            in Visakhapatnam (Vizag)? GenieStudio works with businesses, brands,
            entrepreneurs and individuals to create impactful visual content.
            Whether you need corporate photography, product shoots, event
            coverage, professional portraits, business portfolio photography or
            podcast production, our team is ready to understand your
            requirements and help bring your vision to life.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-[#6B4A2D] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10">
          <div className="max-w-none sm:max-w-4xl mx-auto text-left sm:text-center">

            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Ready to Elevate Your Visual Story?
            </h2>

            <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-10 leading-snug sm:leading-relaxed">
              Let's collaborate to create stunning visuals that capture your brand's essence
              and leave a lasting impression. Get in touch with Genie Studio today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start sm:justify-center">
              <button
                className=" px-6 sm:px-10 py-3 sm:py-5 bg-white text-gray-900 rounded-full text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg sm:shadow-2xl lg:hover:scale-105 group " onClick={() => navigate("/contact")} >
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 lg:group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Was a <button> nested inside the <a>. Two interactive
                  elements one inside the other is invalid HTML and gives
                  assistive tech two overlapping controls for one action; the
                  link now carries the button's styling directly, so it looks
                  and behaves exactly the same. */}
              <a
                href="https://www.youtube.com/@itsgeniemedia_official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch Showreel on YouTube (opens in a new tab)"
                className=" px-6 sm:px-10  py-3 sm:py-5  bg-white/10 backdrop-blur-lg text-white rounded-full text-sm sm:text-base font-bold transition-all duration-300 border border-white/30 flex items-center justify-center gap-2 sm:gap-3  lg:hover:bg-white/20"
              >
                <Play className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" />
                Watch Showreel
              </a>
            </div>

          </div>
        </div>
      </section>


      <style>{`
        /* translate3d/scale3d rather than scale(): both animate transform, but
           the 3d form guarantees the layer is promoted to the compositor, so
           the 20s zoom never touches the main thread. Visually identical.
           (A stray "/@itsgeniemedia_official" fragment used to sit inside the
           0% block — invalid CSS the browser silently discarded.) */
        @keyframes ken-burns {
          0% {
            transform: scale3d(1, 1, 1);
          }
          100% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
          will-change: transform;
        }
      `}</style>
    </main>
  );
};

export default Home;