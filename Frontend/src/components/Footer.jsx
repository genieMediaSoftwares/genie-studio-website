import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
  { label: "Blog", to: "/blogs" },
];

const SERVICE_LINKS = [
  { label: "Corporate Shoots", to: "/services/corporate-shoots" },
  { label: "Event Shoots", to: "/services/event-shoots" },
  { label: "Product Shoots", to: "/services/product-shoots" },
  { label: "Podcast Shoots", to: "/services/podcast-shoots" },
  { label: "Professional Shoots", to: "/services/professional-shoots" },
  {
    label: "Business Portfolio Shoots",
    to: "/services/business-portfolio-shoots",
  },
];

const SOCIAL_LINKS = [
  {
    Icon: Instagram,
    href: "https://www.instagram.com/itsgeniestudio_official/",
    label: "Follow GenieStudio on Instagram",
  },
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/in/yourprofile",
    label: "Follow GenieStudio on LinkedIn",
  },
  {
    Icon: Youtube,
    href: "https://www.youtube.com/@itsgeniemedia_official",
    label: "Watch GenieStudio on YouTube",
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#FAF8F5] text-[#1A1512] border-t border-[#EAE2D6]">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 sm:pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Company Branding */}
          <div className="space-y-4 min-w-0">
            {/* Text brand */}
            <Link
              to="/"
              className="inline-flex items-center gap-3 sm:gap-3.5 group"
              aria-label="GenieStudio Home"
            >
              <span className="text-xl min-[360px]:text-2xl sm:text-[1.75rem] font-bold tracking-tight text-[#1A1512] leading-none">
                Genie
                <span className="text-[var(--accent-color-on-light)]">
                  Studio
                </span>
              </span>
            </Link>

            {/* Company Description */}
            <p className="text-sm text-[#5A5149] leading-relaxed max-w-sm">
              GenieStudio offers professional photography, podcast production and video services in Visakhapatnam.
            </p>

            {/* Social Media Icons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map((item) => {
                const SocialIcon = item.Icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-9 h-9 rounded-full border border-[#D6CBBF] bg-white flex items-center justify-center text-[#1A1512] transition-colors duration-200 hover:bg-[#6B4A2D] hover:border-[#6B4A2D] hover:text-white"
                  >
                    <SocialIcon className="w-4 h-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A1512] tracking-wide">
              Quick Links
            </h2>
            <div
              aria-hidden="true"
              className="w-8 h-0.5 rounded-full bg-[#6B4A2D] mt-2 mb-4"
            />
            <nav aria-label="Footer Quick Links">
              <ul className="space-y-2 text-sm text-[#5A5149]">
                {QUICK_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-block hover:text-[#6B4A2D] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Our Services */}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A1512] tracking-wide">
              Our Services
            </h2>
            <div
              aria-hidden="true"
              className="w-8 h-0.5 rounded-full bg-[#6B4A2D] mt-2 mb-4"
            />
            <nav aria-label="Footer Services">
              <ul className="space-y-2 text-sm text-[#5A5149]">
                {SERVICE_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-block hover:text-[#6B4A2D] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 4: Contact Information */}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A1512] tracking-wide">
              Contact Information
            </h2>
            <div
              aria-hidden="true"
              className="w-8 h-0.5 rounded-full bg-[#6B4A2D] mt-2 mb-4"
            />
            <address className="not-italic space-y-3 text-sm text-[#5A5149]">
              <div className="flex items-start gap-2.5">
                <Phone
                  className="w-4 h-4 mt-1 flex-shrink-0 text-[#6B4A2D]"
                  aria-hidden="true"
                />
                <a
                  href="tel:+919032845433"
                  className="hover:text-[#1A1512] transition-colors duration-150"
                >
                  +91 9032845433
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail
                  className="w-4 h-4 mt-1 flex-shrink-0 text-[#6B4A2D]"
                  aria-hidden="true"
                />
                <a
                  href="mailto:admin@geniestudio.in"
                  className="break-all hover:text-[#1A1512] transition-colors duration-150"
                >
                  admin@geniestudio.in
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin
                  className="w-4 h-4 mt-1 flex-shrink-0 text-[#6B4A2D]"
                  aria-hidden="true"
                />
                <p className="leading-relaxed">
                  5A-2, KP Icon, Yendada,
                  <br />
                  Visakhapatnam,
                  <br />
                  Andhra Pradesh – 530045
                </p>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-[#EAE2D6] mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-[#5A5149]">
          <p className="text-center sm:text-left">
            © 2026 GenieStudio. All Rights Reserved.
          </p>
          <p className="text-center sm:text-right">
            Visakhapatnam, Andhra Pradesh
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
