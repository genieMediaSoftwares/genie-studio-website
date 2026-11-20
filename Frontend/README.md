# Genie Studio — Frontend Module Documentation

This directory contains the client-side Single Page Application (SPA) for **Genie Studio**, built with React 19, Vite, Tailwind CSS, GSAP, and Three.js.

---

## Architecture Overview

- **Framework**: React `19.2.0` with React Router DOM `7.13.0`.
- **Styling**: Tailwind CSS `3.4.19` with custom studio theme configuration (`tailwind.config.js`).
- **Interactive Visuals**:
  - **3D Dome Gallery** (`src/components/DomeGallery.jsx`): Interactive WebGL sphere using Three.js and OGL to project photographic works into a 3D dome.
  - **Fluid Cursor** (`src/components/SplashCursor.jsx`, `DeferredSplashCursor.jsx`): Interactive pointer particle effect.
  - **Animations**: GSAP `3.14.2` and Framer Motion (`motion` `12.29.2`) for smooth viewport transitions.
- **Image Optimization Engine** (`src/components/OptimizedImage.jsx`):
  - Resolves responsive images using precomputed `src/lib/imageManifest.json`.
  - Emits `<picture>` elements with AVIF and WebP sources across standard screen resolutions (400px - 2000px).
  - Integrates blurred Low-Quality Image Placeholders (LQIP) to eliminate layout shift (CLS).
- **SEO & Social Metadata** (`src/components/Seo.jsx` & `src/lib/seoConfig.js`):
  - React 19 native head element hoisting for per-route `<title>`, `<meta>`, and Schema.org JSON-LD tags.

---

## Directory Structure

```
Frontend/
├── public/                     # Static assets served at web root
│   ├── .htaccess               # Apache SPA rewrite rules & caching headers
│   ├── robots.txt              # Crawler instructions & sitemap link
│   ├── sitemap.xml             # XML sitemap (auto-generated during build)
│   ├── llms.txt                # Contextual AI documentation
│   └── GenieStudio-logo.webp   # Studio logo brand assets
├── scripts/
│   └── generate-sitemap.mjs    # Node.js script generating dynamic XML sitemaps
├── src/
│   ├── api.js                  # Centralized backend URL configuration
│   ├── App.jsx                 # Route definitions and layout wrapper
│   ├── main.jsx                # Application mounting entry point
│   ├── components/             # Reusable UI widgets and layout components
│   │   ├── Header.jsx          # Studio navigation header
│   │   ├── Footer.jsx          # Site footer with contact info
│   │   ├── DomeGallery.jsx     # WebGL 3D spherical dome gallery
│   │   ├── BlogEditor.jsx      # TipTap rich text WYSIWYG editor
│   │   ├── OptimizedImage.jsx  # Multi-format responsive picture component
│   │   └── ProtectedRoute.jsx  # Route guard for /admin routes
│   ├── context/                # Theme and state context providers
│   ├── lib/                    # API clients and utility libraries
│   │   ├── seoConfig.js        # Search metadata for all routes
│   │   ├── imageManifest.json  # Precomputed image variant lookup
│   │   ├── imageApi.js         # Library image API handlers
│   │   ├── portfolioApi.js     # Portfolio API handlers
│   │   └── galleryApi.js       # Dome gallery API handlers
│   └── pages/                  # Page route components (Public & Admin)
├── package.json
└── vite.config.js
```

---

## Environment Variables

Create `.env` in this directory:

```ini
# Backend API service URL (defaults to Render backend if unset)
VITE_API_URL=http://localhost:5000

# Optional: EmailJS credentials if restored for contact form
# VITE_EMAILJS_SERVICE_ID=your_service_id
# VITE_EMAILJS_TEMPLATE_ID=your_template_id
# VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## NPM Scripts

- `npm run dev`: Launch local development server on `http://localhost:5173`.
- `npm run build`: Run sitemap generation script followed by production Vite bundling to `dist/`.
- `npm run sitemap`: Generate `public/sitemap.xml` without triggering a full build.
- `npm run lint`: Run ESLint analysis across all source files.
- `npm run preview`: Preview the compiled production build locally.

---

## Subdomain Migration Notes

When moving from `geniestudio.in` to a subdomain (e.g., `studio.yourdomain.com`):
1. **API Endpoint**: Set `VITE_API_URL` in `.env` to your backend subdomain (e.g. `https://api-studio.yourdomain.com`).
2. **SEO URLs**: In `src/lib/seoConfig.js`, update `SITE_URL` to the new subdomain.
3. **HTML Metadata**: In `index.html`, update canonical URLs and Open Graph meta tags.
4. **Sitemap**: In `scripts/generate-sitemap.mjs`, update `SITE` to the new subdomain.
5. **Contact Form**: In `src/pages/Contact.jsx`, replace the hardcoded `geniestudio.in/contact.php` endpoint with the backend `/api/contact` route.
