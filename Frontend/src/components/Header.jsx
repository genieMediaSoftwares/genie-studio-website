import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, ChevronDown } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // passive: without it the browser must wait to see whether the handler
    // calls preventDefault before it can scroll, which shows up as scroll jank
    // on touch devices. This handler never prevents anything.
    //
    // The boolean means React bails out of re-rendering on every scroll tick
    // and only commits when the header actually crosses the 30px threshold.
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Services", path: "/services" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
    { name: "Blog", path: "/blogs" }

  ];
  const serviceItems = [
    { name: "Podcast Shoots", path: "/services/podcast-shoots" },
    { name: "Product Shoots", path: "/services/product-shoots" },
    { name: "Corporate Shoots", path: "/services/corporate-shoots" },
    { name: "Event Shoots", path: "/services/event-shoots" },
    { name: "Professional Shoots", path: "/services/professional-shoots" },
    { name: "Business Portfolio", path: "/services/business-portfolio-shoots" },
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`} >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-base min-[360px]:text-lg md:text-2xl lg:text-3xl font-semibold text-white whitespace-nowrap">
              Genie<span className="text-[var(--accent-color)]">Studio</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              if (item.name === "Services") {
                return (
                  <div
                    key={item.path}
                    className="relative group"
                    onMouseEnter={() => setServiceOpen(true)}
                    onMouseLeave={() => setServiceOpen(false)}
                    /* focus/blur bubble in React, so tabbing into any child
                       opens the panel and tabbing past the last one closes it.
                       Without this the six service links were reachable by
                       mouse only — the panel is visibility:hidden when shut, so
                       a keyboard user could never get to them. */
                    onFocus={() => setServiceOpen(true)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) setServiceOpen(false);
                    }}
                  >
                    <Link
                      to="/services"
                      aria-expanded={serviceOpen}
                      aria-controls="services-submenu"
                      className="flex items-center gap-1 cursor-pointer text-sm lg:text-base xl:text-lg font-medium tracking-wide text-white"
                    >
                      Services
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 transition-transform duration-300 ${serviceOpen ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </Link>

                    <div
                      id="services-submenu"
                      className={`absolute top-full left-0 mt-3 w-56 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
          ${serviceOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>

                      {serviceItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-sm lg:text-base xl:text-lg font-medium tracking-wide text-white"
                >
                  {item.name}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[var(--accent-color)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              className="mx-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--accent-color)] hover:bg-[#eab308] text-black text-sm lg:text-base font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              <Calendar size={16} aria-hidden="true" />
              <span>Book Now</span>
            </Link>
          </div>

          {/* p-2 with a matching -mr-2 grows the tap area from the icon's bare
              24px to 40px without moving the icon a pixel. */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="lg:hidden text-white p-2 -mr-2"
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>

        {/* `inert` while collapsed: the panel is only clipped by max-h-0, so
            every link inside it stayed in the tab order and a keyboard user
            fell into a menu they could not see. */}
        <div
          id="mobile-menu"
          inert={!menuOpen}
          className={`lg:hidden transition-all duration-300 ${menuOpen ? "max-h-[85vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`} >
          <div className="bg-black border-t border-white/10 py-4">
            {navItems.map((item) => {
              if (item.name === "Services") {
                return (
                  <div key={item.path} className="flex flex-col">

                    <div className="flex items-center justify-between px-6 py-3">

                      <Link
                        to="/services"
                        onClick={() => setMenuOpen(false)}
                        className="text-white text-sm"
                      >
                        Services
                      </Link>

                      {/* "+" / "-" is not a name a screen reader can act on.
                          w-8 h-8 with -my-1.5 gives a 32px tap target while
                          keeping the row exactly as tall as before. */}
                      <button
                        type="button"
                        onClick={() => setServiceOpen(!serviceOpen)}
                        aria-label={serviceOpen ? "Collapse services submenu" : "Expand services submenu"}
                        aria-expanded={serviceOpen}
                        aria-controls="mobile-services-submenu"
                        className="text-white text-sm w-8 h-8 -my-1.5 flex items-center justify-center"
                      >
                        <span aria-hidden="true">{serviceOpen ? "-" : "+"}</span>
                      </button>

                    </div>

                    <div
                      id="mobile-services-submenu"
                      inert={!serviceOpen}
                      className={`transition-all duration-300 ${serviceOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
                      {serviceItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setMenuOpen(false)}
                          className="block px-10 py-2 text-sm text-gray-300"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-white text-sm"
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="px-6 pt-3 pb-1">
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-[var(--accent-color)] hover:bg-[#eab308] text-black text-sm font-semibold transition-colors"
              >
                <Calendar size={16} aria-hidden="true" />
                <span>Book Now</span>
              </Link>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
