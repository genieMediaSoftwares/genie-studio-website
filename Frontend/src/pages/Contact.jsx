import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const SectionEyebrow = ({ label, light = false }) => (
  <div className="inline-flex items-center justify-center gap-3 mb-3">
    <span
      aria-hidden="true"
      className={`h-px w-8 sm:w-10 ${light ? "bg-white/35" : "bg-[#D5C6B3]"}`}
    />
    <span
      className={`text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase ${
        light ? "text-[#EBD9C3]" : "text-[#7A5738]"
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

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    bookingDate: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, service, bookingDate } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !service || !bookingDate) {
      setStatus("error");
      console.warn("Contact form: please fill in all required fields.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://geniestudio.in/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          bookingDate: formData.bookingDate,
          message: formData.message,
        }),
        signal: controller.signal,
      });

      const rawBody = await response.text();

      let result = null;
      if (rawBody) {
        try {
          result = JSON.parse(rawBody);
        } catch {
          console.error(
            "Contact form: server returned non-JSON response",
            response.status,
            rawBody.slice(0, 500)
          );
        }
      }

      if (response.ok && result?.success) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          bookingDate: "",
          message: "",
        });
      } else {
        setStatus("error");
        console.error("Contact form failed:", {
          status: response.status,
          message: result?.message ?? "Server did not return a valid JSON response.",
        });
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Contact form: request timed out after 30s.");
      } else {
        console.error("Contact form error:", error);
      }
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "+91 9032845433",
      link: "tel:+919032845433",
      external: false,
    },
    {
      icon: Mail,
      title: "Email",
      details: "admin@geniestudio.in",
      link: "mailto:admin@geniestudio.in",
      external: false,
    },
    {
      icon: MapPin,
      title: "Address",
      details: "5A-2, KP Icon, Yendada, Visakhapatnam, Andhra Pradesh – 530045",
      link: "https://maps.google.com/?q=Genie+Media+and+Studio,+Visakhapatnam",
      external: true,
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: "Mon–Fri: 9AM–6PM, Sat: 10AM–4PM",
      link: null,
      external: false,
    },
  ];

  const inputBaseClass =
    "w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-[#E2D8CA] rounded-xl bg-white text-[#1A1512] placeholder:text-[#9A8E83] focus:border-[#5B3E28] focus:ring-2 focus:ring-[#5B3E28]/15 outline-none transition-colors";

  return (
    <main className="w-full overflow-x-hidden bg-[#FAF8F5] text-[#1A1512]">
      <Seo
        {...SEO.contact}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: SEO.contact.path },
        ]}
      />

      {/* Compact Hero Section */}
      <section className="w-full bg-[#523723] text-white py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#6A4A32]">
        <div className="max-w-4xl mx-auto text-center">
          <SectionEyebrow label="GET IN TOUCH" light />

          <h1 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] tracking-tight text-white mb-4">
            Contact Us
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-[#EFE6DC] max-w-2xl mx-auto leading-relaxed">
            Let&apos;s discuss how we can bring your vision to life through professional
            photography and videography.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EAE2D6] shadow-sm p-6 sm:p-8 lg:p-10">
              <div className="mb-6 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1512] mb-1.5">
                  Send Us a Message
                </h2>
                <p className="text-sm sm:text-base text-[#5A5149]">
                  Fill out the form below and we&apos;ll get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                    >
                      Full Name <span className="text-[#9E3A2B]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className={inputBaseClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                    >
                      Email Address <span className="text-[#9E3A2B]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className={inputBaseClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                    >
                      Phone Number <span className="text-[#9E3A2B]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={inputBaseClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-service"
                      className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                    >
                      Service <span className="text-[#9E3A2B]">*</span>
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className={`${inputBaseClass} cursor-pointer`}
                    >
                      <option value="">Select a service</option>
                      <option value="Podcast Shoots">Podcast Shoots</option>
                      <option value="Corporate Shoots">Corporate Shoots</option>
                      <option value="Event Shoots">Event Shoots</option>
                      <option value="Professional Shoots">Professional Shoots</option>
                      <option value="Business Portfolio">Business Portfolio</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Animation 2D or 3D">Animation 2D or 3D</option>
                      <option value="Video Editing">Video Editing</option>
                      <option value="Figma">Figma</option>
                      <option value="Event Coverage">Event Coverage</option>
                      <option value="Commercial Shoot">Commercial Shoot</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-booking-date"
                    className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                  >
                    Booking Date <span className="text-[#9E3A2B]">*</span>
                  </label>
                  <input
                    id="contact-booking-date"
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className={`${inputBaseClass} cursor-pointer`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-semibold mb-1.5 text-[#2C241E]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    placeholder="Enter your message"
                    onChange={handleChange}
                    rows={4}
                    className={inputBaseClass}
                  />
                </div>

                {status === "success" && (
                  <div
                    role="status"
                    className="p-3.5 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Message sent successfully!</span>
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div
                    role="alert"
                    className="p-3.5 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-sm text-red-800 font-semibold flex items-center gap-2">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Failed to send message. Please try again.</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 text-sm sm:text-base bg-[#5B3E28] hover:bg-[#462F1E] text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Contact Information + Quick Response */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-sm p-6 sm:p-7">
                <h2 className="text-2xl font-bold text-[#1A1512] mb-5">
                  Contact Information
                </h2>

                <div className="space-y-4">
                  {contactInfo.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] border border-[#EAE2D6] flex items-center justify-center text-[#6B4A2D] shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#1A1512] mb-0.5 font-sans">
                            {item.title}
                          </h3>
                          {item.link ? (
                            <a
                              href={item.link}
                              {...(item.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="text-sm text-[#5A5149] hover:text-[#5B3E28] transition-colors break-words block leading-relaxed"
                            >
                              {item.details}
                            </a>
                          ) : (
                            <p className="text-sm text-[#5A5149] break-words leading-relaxed">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#523723] text-white rounded-2xl p-6 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F5C542] mb-4">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Quick Response
                </h3>
                <p className="text-sm text-[#EFE6DC] leading-relaxed">
                  We typically respond within 24 hours. For urgent inquiries, please call us
                  directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Location Map */}
      <section className="w-full pb-14 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden shadow-sm border border-[#EAE2D6] bg-white">
            <iframe
              title="GenieStudio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.3097152730043!2d83.35916647863445!3d17.777135439803757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b852ac6e3ff%3A0x5dc73dbf634423d7!2sGenie%20Media%20and%20Studio!5e0!3m2!1sen!2sin!4v1768910647816!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-[#EAE2D6] shadow-sm">
              <p className="text-xs sm:text-sm font-semibold text-[#1A1512]">
                Genie Media &amp; Studio
              </p>
              <p className="text-[11px] sm:text-xs text-[#5A5149]">
                5A-2, KP Icon, Yendada, Visakhapatnam
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
