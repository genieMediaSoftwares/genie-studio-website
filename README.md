# Genie Studio — Technical Project Documentation & System Audit

> **Comprehensive Technical Specification, System Audit, and Architecture Documentation for Genie Studio Website and Administration Platform.**  
> Prepared for incoming engineering and DevOps teams taking over maintenance, subdomain migration, and feature completion.

---

## 1. Project Overview

**Genie Studio** (operating as *Genie Media and Studio*) is a commercial creative media studio based in Visakhapatnam (Vizag), Andhra Pradesh, India. The studio specializes in professional photography, commercial videography, podcast studio production, corporate and event coverage, product photography, and executive personal branding.

The web application is a full-stack media platform consisting of:
1. **Public-Facing Web Application**: High-performance, animated Single Page Application (SPA) built with React 19, Tailwind CSS, GSAP, Swiper, and Three.js/WebGL for visual showcase and client inquiries.
2. **Administrative Content Management System (CMS)**: Authenticated administration dashboard (`/admin`) allowing staff to manage blogs (TipTap WYSIWYG editor), organize media assets into a centralized library, configure the interactive 3D Dome Gallery, and categorize portfolio items.
3. **Backend API Service**: Node.js and Express RESTful service managing MySQL persistence, JWT-based administrative authentication, dynamic responsive image generation via Sharp, and social media Open Graph crawler previews.

---

## 2. Project Objectives

- **Brand & Commercial Showcase**: Present the studio's portfolio, studio infrastructure, equipment, client reviews, and service packages to prospective clients.
- **Lead Generation**: Capture client booking requests through an interactive contact and shoot-booking form with date, service category, and inquiry details.
- **Dynamic Content & SEO Authority**: Rank for local creative studio keywords in Visakhapatnam via per-route Schema.org JSON-LD structured data, dynamic XML sitemaps, semantic headings, and high-frequency blog publishing.
- **High-Performance Responsive Media**: Deliver high-resolution photography without compromising mobile page speed through automated AVIF/WebP ladder resizing, lazy loading, and blurred Low-Quality Image Placeholders (LQIP).
- **Subdomain Deployment (Immediate Mandate)**: Transition the entire web platform, asset pipeline, and API services from the expired primary domain (`geniestudio.in`) to a dedicated subdomain infrastructure.

---

## 3. Current Project Status

| Area | Audit Verdict | Status Summary |
|---|---|---|
| **Frontend Codebase** | 🟡 Functional / Needs Config Update | Builds successfully (`npm run build`). Production bundle compiles in ~52s. ESLint reports 49 style/lint issues. Contains hardcoded references to expired domain. |
| **Backend Service** | 🟡 Functional / Configuration Debt | Syntax verified clean (`node --check server.js`). Auto-creates 3 of 5 MySQL tables. Lacks automated schema migration for `admins` and `blogs`. Upload and CORS hardcoded to expired domain. |
| **Database Layer** | ⚠️ Needs Initialization Script | Relies on MySQL. Missing SQL seed/schema file for admin users and blog posts. Auto-seeds default portfolio and gallery items on empty start. |
| **Media Pipeline** | 🟡 Architecture Ready / Blocked by Domain | Client-side manifest and Sharp resizing pipeline built; currently points to remote PHP script on expired domain (`https://geniestudio.in/upload.php`). |
| **Deployment / Domain** | 🔴 Deployment Blocker | Original domain (`geniestudio.in`) is **expired**. Backend Render deployment (`geinestudio-czl3.onrender.com`) is returning HTTP 503. Entire site must be reconfigured for the new target subdomain. |

---

## 4. Technology Stack

### Frontend Architecture
- **Core Library**: React `19.2.0` (using React Hooks, React Compiler readiness, Suspense, and lazy code-splitting)
- **Routing**: `react-router-dom` `7.13.0` (Client-side browser history, protected admin routes, wildcard 404 handling)
- **Styling & CSS**: Tailwind CSS `3.4.19`, PostCSS `8.5.6`, `tailwindcss-animate`, `clsx`, `tailwind-merge`
- **Animations & Effects**:
  - GSAP (GreenSock) `3.14.2` & `@gsap/react` `2.1.2`
  - Motion (Framer Motion engine) `12.29.2`
  - AOS (Animate On Scroll) `2.3.4`
  - Three.js `0.167.1`, OGL `1.0.11`, `postprocessing` `6.38.2` (used for interactive WebGL 3D Dome Gallery and fluid cursor)
- **Icons & UI Components**: `lucide-react` `0.563.0`, `react-icons` `5.5.0`, Swiper `12.1.0`
- **Rich Text Editing**: `@tiptap/react` `3.22.0`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-text-align`, `dompurify` `3.3.3`
- **Build Tooling**: Vite `7.2.4` / `7.3.1`, `@vitejs/plugin-react` `5.1.1`, ESLint `9.39.1`

### Backend Architecture
- **Runtime & Framework**: Node.js (ES module scripts + CommonJS server), Express `5.2.1`
- **Database Engine**: MySQL (relational) via `mysql2` `3.20.0` connection pool
- **Authentication**: `jsonwebtoken` `9.0.3` (1-day JWT expiration), `bcrypt` `6.0.0` (salted password hashing)
- **Image Processing**: `sharp` `0.35.3` (ladder variants at 400, 800, 1200, 1600, 2000px in AVIF & WebP + base64 LQIP)
- **File Upload & Multipart**: `multer` `2.1.1` (temporary disk buffer), `form-data` `4.0.5`, `axios` `1.15.0`
- **CORS & Environment**: `cors` `2.8.6`, `dotenv` `17.4.1`

---

## 5. Features Implemented

### Public Web Application (✅ Verified via Code Inspection & Build Verification)
- [x] **Home Page (`/`)**: Multi-slide hero with video backgrounds, interactive fluid cursor effect, dynamic animated counters, animated service carousels, testimonials, and studio gear highlights.
- [x] **About Studio (`/about`)**: Detailed story, philosophy, team profiles, studio equipment specifications, and client trust metrics.
- [x] **Service Showcase (`/services`)**: Master services overview with deep links to specialized service pages.
- [x] **Specialized Service Pages**:
  - `/services/corporate-shoots`: Executive portraits, office culture, conference coverage.
  - `/services/event-shoots`: Brand launches, ceremonies, cultural celebrations.
  - `/services/product-shoots`: E-commerce catalog, macro, and stylized creative product photography.
  - `/services/podcast-shoots`: Multi-camera podcast studio setup, audio recording, and editing highlights.
  - `/services/professional-shoots`: Personal branding, model portfolios, and studio sessions.
  - `/services/business-portfolio-shoots`: Commercial brand identity, company profiles, and collateral photography.
- [x] **Filterable Portfolio (`/portfolio`)**: Category tabs with responsive image cards loaded dynamically from `/api/portfolio` with fallback seed data.
- [x] **Interactive 3D Dome Gallery (`/gallery`)**: 3D WebGL spherical dome rendering photographic assets in interactive 3D space with mouse/touch drag manipulation.
- [x] **Blog Directory (`/blogs`)**: Categorized list of published studio articles, tag filtering, search bar, and pagination.
- [x] **Article Detail (`/blog/*`)**: Dynamic slug-based blog reader with sanitized HTML rendering via DOMPurify, author attribution, publication date, and related articles.
- [x] **404 Not Found Page (`*`)**: Custom error page rendering a `noindex, follow` directive to prevent soft-404 search penalties.
- [x] **SEO & Structured Data**: Per-route `<title>`, `<meta name="description">`, Open Graph tags, canonical URLs hoisted by React 19, and full Schema.org `LocalBusiness` + `Service` JSON-LD graphs.
- [x] **Automated Sitemap Generator**: Node.js script (`Frontend/scripts/generate-sitemap.mjs`) pulling git commit dates for static routes and live API blogs.

### Administrative Panel (✅ Verified via Code Inspection)
- [x] **Admin Authentication (`/admin`)**: JWT login modal with token storage in `localStorage`.
- [x] **Route Protection (`ProtectedRoute.jsx`)**: Enforces authentication guard on all `/admin/*` routes.
- [x] **Blog Management CMS (`/admin/blogs`)**:
  - Article listing with search, category filtering, and status badges (Draft / Published).
  - Modal-driven creation and editing powered by TipTap WYSIWYG editor.
  - Slug generation, featured image selector (via upload or library selection), and SEO metadata inputs.
  - Immediate Social Share Link generator with Open Graph redirect cards.
- [x] **Media Asset Library (`/admin/images`)**: Centralized dashboard for uploading, viewing, renaming display labels, and deleting studio photos.
- [x] **Portfolio Manager (`/admin/portfolio`)**: Visual ordering, category assignment, title/description management, and bulk URL ingestion.
- [x] **Gallery Manager (`/admin/gallery`)**: Reordering, alt-text assignment, and bulk ingestion for the 3D Dome Gallery.

---

## 6. Features Partially Implemented

- 🟡 **Contact Form Submission (`Frontend/src/pages/Contact.jsx`)**: The UI form is complete with validation and loading states, but previously sent requests via EmailJS (now commented out). Currently attempts a `fetch()` to `https://geniestudio.in/contact.php`, which fails because the domain is expired and the PHP script is absent from this repository.
- 🟡 **Image Upload Pipeline (`backend/server.js` & `backend/lib/imagePipeline.js`)**: Backend logic generates WebP/AVIF variants via Sharp, but attempts to forward them via HTTP POST to `https://geniestudio.in/upload.php`. Lacks native local disk persistence or S3 cloud storage fallback in the repository.
- 🟡 **Social Crawler Share Previews (`backend/server.js` `/share/:permalink`)**: Express route exists to render raw HTML OG meta tags for WhatsApp/Facebook bots, but hardcodes redirects to `https://geniestudio.in`.
- 🟡 **Client-side Route Protection (`ProtectedRoute.jsx`)**: Only checks if `token` string exists in `localStorage`; does not decode JWT expiration on navigation before API calls are made.

---

## 7. Features Not Yet Implemented

- 🔴 **Database Schema Migrations & Seeding Script**: No `.sql` file or CLI migration command exists for creating `admins` and `blogs` tables in a clean MySQL instance.
- 🔴 **Contact Form Backend Endpoint**: Express API has no `/api/contact` endpoint; contact requests were handled entirely by an unversioned PHP script.
- 🔴 **Admin Password Reset / Management**: No password reset or user invitation mechanism; passwords must be inserted directly into MySQL using bcrypt.
- 🔴 **Automated Test Suite**: No unit tests, integration tests, or end-to-end tests exist in either `Frontend` or `backend`.

---

## 8. Project Folder Structure

```
GieneStudio2/
├── .git/                                 # Git version control
├── IMAGE-PIPELINE.md                     # Technical notes on Sharp/CDN image ladder
├── SEO.md                                # Technical documentation on Hostinger SPA SEO
├── DEVELOPMENT_HANDOVER.md               # [NEW] Developer handover guide
├── PROJECT_STATUS.md                     # [NEW] Prioritized task and feature tracking
├── README.md                             # [NEW] Main project technical documentation
│
├── Frontend/                             # Client-side React 19 SPA
│   ├── .env                              # Frontend environment config (VITE_API_URL)
│   ├── index.html                        # Base HTML, GA4 analytics, JSON-LD schemas
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── vite.config.js                    # Vite bundler configuration & manual chunking
│   ├── tailwind.config.js                # Tailwind theme tokens & color palette
│   ├── vercel.json                       # Static SPA rewrites & caching headers (Vercel)
│   ├── public/
│   │   ├── .htaccess                     # Apache SPA rewrite, MIME types, Cache-Control
│   │   ├── robots.txt                    # Search crawler rules & sitemap declaration
│   │   ├── sitemap.xml                   # Static and dynamic XML sitemap
│   │   ├── llms.txt                      # AI & LLM contextual documentation
│   │   └── GenieStudio-logo.webp         # Brand vector/webp assets
│   ├── scripts/
│   │   └── generate-sitemap.mjs          # Build-time sitemap generator script
│   └── src/
│       ├── main.jsx                      # React 19 application root entry point
│       ├── App.jsx                       # Routing switch, lazy page imports, layout
│       ├── api.js                        # Centralized Axios/fetch BASE_URL definition
│       ├── components/                   # 28 reusable components (DomeGallery, Seo, etc.)
│       ├── context/                      # React Theme and global context providers
│       ├── lib/                          # API clients, SEO configs, and image manifest
│       │   ├── imageManifest.json        # Precomputed responsive image variant map
│       │   ├── seoConfig.js              # Per-route metadata definitions
│       │   ├── imageApi.js               # Media library API abstraction
│       │   ├── portfolioApi.js           # Portfolio API abstraction
│       │   └── galleryApi.js             # Dome gallery API abstraction
│       └── pages/                        # 20 page views (Public routes + Admin screens)
│
└── backend/                              # Express & Node.js API Service
    ├── .env                              # Backend credentials (DB, JWT, PORT)
    ├── package.json                      # Backend dependencies & startup scripts
    ├── server.js                         # Core Express server, routes, DB pool, auth
    ├── lib/
    │   └── imagePipeline.js              # Sharp variant generator & LQIP creator
    └── scripts/
        ├── backfill-image-variants.js    # Resumable variant generation script
        ├── image-urls.txt                # Extracted image URLs for backfill
        └── variants-manifest.json        # Backend variant generation state cache
```

---

## 9. System Architecture

```
                                 [ User Web Browser ]
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
      Public Routes (/)                             Admin Routes (/admin)
                   │                                             │
      ┌────────────▼────────────┐                   ┌────────────▼────────────┐
      │  React 19 SPA (Vite)   │                   │ Authenticated Dashboard │
      │  Tailwind + Three.js    │                   │ TipTap + Image Library  │
      └────────────┬────────────┘                   └────────────┬────────────┘
                   │                                             │
                   │ Requests API Data (GET)                     │ Mutations (POST/PUT/DELETE)
                   │ (Portfolio, Gallery, Blogs)                 │ (Bearer JWT Authorization)
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          │
                                 [ HTTPS / CORS ]
                                          │
                               ┌──────────▼──────────┐
                               │  Express 5 API Hub  │
                               │  (Node.js Service)  │
                               └──────────┬──────────┘
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   │                      │                      │
         [ MySQL Database ]        [ Sharp Engine ]       [ Media Storage ]
         - images                  - 400px - 2000px       - Remote PHP or
         - portfolio_images        - WebP & AVIF          - Local / S3 CDN
         - gallery_images          - Base64 LQIP
         - blogs
         - admins
```

---

## 10. Prerequisites

Before setting up the project locally or in staging:
- **Node.js**: `v18.x` or `v20.x` LTS recommended (tested with npm `10.x`).
- **MySQL Database Server**: MySQL `8.0+` or MariaDB `10.5+`.
- **Git**: Installed and available in PATH.
- **Web Browser**: Chrome, Edge, Firefox, or Safari with WebGL enabled (required for 3D Dome Gallery).

---

## 11. Local Development Setup

Clone the repository to your local machine:
```bash
git clone <repository-url>
cd GieneStudio2
```

The repository is structured into two independent packages: `Frontend` and `backend`.

---

## 12. Environment Variable Configuration

### Backend Environment Configuration
Create `backend/.env` (do NOT commit secrets to git):
```ini
# Database Connection Details
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_mysql_password
DB_NAME=geniestudio_db

# Security & Tokens
JWT_SECRET=generate_a_minimum_32_character_random_string_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Target Host & CORS (Update when deploying to subdomain)
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Configuration
Create `Frontend/.env`:
```ini
# Points to local Express backend in development
VITE_API_URL=http://localhost:5000

# Optional: EmailJS credentials if restoring client-side contact dispatch
# VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
# VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
# VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

---

## 13. Installation Instructions

Install dependencies for both frontend and backend modules:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../Frontend
npm install
```

---

## 14. How to Run the Application

Run both services concurrently in separate terminal windows:

### Terminal 1: Backend Service
```bash
cd backend
npm start
# Output:
# ✅ DB Connected Stable
# ✅ images table ready
# ✅ portfolio_images table ready
# ✅ gallery_images table ready
# 🚀 Server running on port 5000
# 👉 Open: http://localhost:5000
```

### Terminal 2: Frontend Dev Server
```bash
cd Frontend
npm run dev
# Output:
# VITE v7.2.4  ready in 450 ms
# ➜  Local:   http://localhost:5173/
```

---

## 15. How to Build the Application

### Frontend Production Build
The frontend build script automatically regenerates `sitemap.xml` using git commit timestamps and API blog data, followed by Vite rollup optimization:

```bash
cd Frontend
npm run build
```
Build output artifacts will be emitted to `Frontend/dist/`.

### Frontend Linting
To check code compliance against ESLint rules:
```bash
cd Frontend
npm run lint
```

---

## 16. Database Setup & Required Schemas

The backend uses a MySQL connection pool. When connected, `server.js` automatically creates:
- `images`
- `portfolio_images` (and seeds default Pexels images if empty)
- `gallery_images` (and seeds default Unsplash images if empty)

**CRITICAL NOTICE**: The backend **DOES NOT** automatically create the `admins` or `blogs` tables. You must execute the following SQL migration on your MySQL database before logging in or creating blogs:

```sql
CREATE DATABASE IF NOT EXISTS geniestudio_db 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE geniestudio_db;

-- 1. Administrators Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt BIGINT DEFAULT NULL,
  updatedAt BIGINT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  permalink VARCHAR(255) NOT NULL UNIQUE,
  metaDescription TEXT DEFAULT NULL,
  description LONGTEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  keywords VARCHAR(500) DEFAULT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  createdAt BIGINT DEFAULT NULL,
  updatedAt BIGINT DEFAULT NULL,
  KEY idx_status_created (status, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Initial Admin User Seed (Replace with your bcrypt hash)
-- Password for hash below is: Admin@12345
INSERT INTO admins (email, password, createdAt, updatedAt)
VALUES (
  'admin@geniestudio.in', 
  '$2b$10$w0fQ6E7yq9m6a5tP/UvhxOH3f5gZc6TqXU9E2O8aX7QW1jZ6a8O0W', 
  UNIX_TIMESTAMP() * 1000, 
  UNIX_TIMESTAMP() * 1000
) ON DUPLICATE KEY UPDATE id=id;
```

---

## 17. API Documentation

All administrative endpoints require the `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/login`
  - **Access**: Public
  - **Body**: `{ "email": "admin@geniestudio.in", "password": "yourpassword" }`
  - **Response 200**: `{ "success": true, "token": "<jwt-token>" }`

### Public Media & Content
- `GET /api/portfolio?category=<name>`: Fetch portfolio images filtered by category (`corporate`, `events`, `product`, `podcast`, `professional`, `business`).
- `GET /api/gallery`: Fetch all active 3D Dome Gallery images.
- `GET /api/blogs`: Fetch published blogs sorted by creation date descending.
- `GET /share/:permalink`: Returns crawler-specific HTML page with Open Graph meta tags, redirecting humans to the frontend article.

### Image Management (Admin)
- `POST /api/images`: Upload image file (`multipart/form-data`, key: `image`). Generates WebP/AVIF variants.
- `GET /api/images`: List all images in library.
- `PUT /api/images/:id`: Rename display label (`{ "original_name": "New Name" }`).
- `DELETE /api/images/:id`: Remove image metadata from library.

### Portfolio Management (Admin)
- `POST /api/portfolio/bulk`: Add multiple image URLs to a category.
- `PUT /api/portfolio/reorder`: Update display sequence (`{ "items": [{ "id": 1, "sort_order": 0 }] }`).
- `PUT /api/portfolio/:id`: Update item title, description, or category.
- `DELETE /api/portfolio/:id`: Remove item from portfolio.

### Gallery Management (Admin)
- `POST /api/gallery/bulk`: Add multiple URLs to 3D Dome Gallery.
- `PUT /api/gallery/reorder`: Update dome image sequence.
- `PUT /api/gallery/:id`: Update image alt text.
- `DELETE /api/gallery/:id`: Remove image from dome.

### Blog Management (Admin)
- `GET /api/admin/blogs`: Fetch all blogs including drafts.
- `POST /api/blogs`: Create blog post (supports multipart image file or `existingImage` URL).
- `PUT /api/blogs/:id`: Update blog content, status, permalink, or featured image.
- `DELETE /api/blogs/:id`: Permanently delete blog entry.

---

## 18. Testing Instructions

### Automated Verification
1. **Frontend Compilation**: Execute `npm run build` in `Frontend/`. Verify clean output with no module resolution failures.
2. **Backend Syntax Check**: Execute `node --check server.js` in `backend/`. Verify exit code 0.
3. **Lint Evaluation**: Execute `npm run lint` in `Frontend/`. (Note: Currently displays 46 style errors requiring cleanup).

### Manual Feature Verification Checklist
- [ ] **Home Page**: Verify Three.js fluid cursor and Swiper carousel render smoothly.
- [ ] **Gallery Page**: Drag the 3D spherical dome; verify images load without WebGL errors.
- [ ] **Contact Form**: Test submitting the form; verify error handling when network is offline.
- [ ] **Admin Authentication**: Attempt login at `/admin` with valid and invalid credentials.
- [ ] **Blog Editor**: Create a draft blog using the TipTap editor, publish it, and verify appearance on `/blogs`.

---

## 19. Deployment Instructions

### Option A: Static Web Hosting (Hostinger / Apache)
1. Build frontend: `cd Frontend && npm run build`.
2. Upload contents of `Frontend/dist/` to your server's `public_html/` or subdomain docroot.
3. Ensure `.htaccess` (copied automatically by Vite from `public/.htaccess`) is active to enable SPA rewrites and browser caching.

### Option B: Cloud Hosting (Vercel / Netlify)
1. Root directory: `Frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. The included `Frontend/vercel.json` will enforce SPA rewrite rules and immutable asset caching.

### Backend Node.js Service Deployment (Render / Railway / VPS)
1. Set Environment Variables in dashboard: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`, `NODE_ENV=production`.
2. Startup command: `node server.js`.
3. Health check endpoint: `GET /`.

---

## 20. Subdomain Configuration Requirements

Because the original domain `geniestudio.in` has expired, the site must be migrated to a subdomain (e.g., `studio.parentbrand.com` or `genie.parentbrand.com`). Follow these mandatory steps:

### 1. DNS Records
Configure in your domain registrar's DNS management console:
- **Frontend Subdomain**:
  - `CNAME` | `studio` | `<hosting-cname-or-vps-ip>` (TTL: 3600)
- **Backend API Subdomain** (if hosted separately, e.g. `api-studio`):
  - `CNAME` | `api-studio` | `<render-or-railway-url>` (TTL: 3600)

### 2. SSL/HTTPS Certificate
- Issue Let's Encrypt or Cloudflare SSL certificate covering both `studio.parentbrand.com` and `api-studio.parentbrand.com`.

### 3. Repository Configuration Adjustments
Before building for production on the new subdomain, update:
1. `Frontend/.env`:
   `VITE_API_URL=https://api-studio.parentbrand.com`
2. `Frontend/src/lib/seoConfig.js`:
   `export const SITE_URL = "https://studio.parentbrand.com";`
3. `Frontend/index.html`:
   Update canonical tag, Open Graph URL, and JSON-LD schema IDs from `https://geniestudio.in/` to `https://studio.parentbrand.com/`.
4. `Frontend/scripts/generate-sitemap.mjs`:
   Change `const SITE = "https://studio.parentbrand.com";`.
5. `backend/server.js`:
   Add `https://studio.parentbrand.com` to `allowedOrigins` array in CORS configuration.
6. `backend/lib/imagePipeline.js` & `server.js`:
   Update `HOSTINGER_UPLOAD_URL` or replace with native storage endpoint.

---

## 21. Known Issues and Limitations

1. **Domain Expiration**: All absolute URLs hardcoded to `https://geniestudio.in/uploads/...` in `imageManifest.json` and database seed records will fail to resolve until updated or proxied.
2. **Missing PHP Endpoints**: `upload.php` and `contact.php` are referenced in the codebase but missing from version control.
3. **ESLint 9 Warnings**: 49 lint issues exist across frontend files, primarily unused parameters, unhandled variables, and Hook dependency warnings.
4. **Non-JS Crawler Previews**: Since the frontend is a client-rendered SPA, non-JavaScript social sharing bots (WhatsApp, LinkedIn) rely on backend `/share/:permalink` or server-side meta injection.
5. **Render Backend Inactivity**: The existing Render API instance (`geinestudio-czl3.onrender.com`) is returning HTTP 503 and is inaccessible.

---

## 22. Security Considerations

- **Secrets Handling**: Never commit `.env` files. Ensure `.gitignore` continues to exclude `.env` in both folders.
- **Admin Password Hashes**: Ensure all administrator records use bcrypt hashes (`$2b$10$...`) rather than plain text.
- **JWT Protection**: Store strong, high-entropy string in `JWT_SECRET`. Rotate if suspected compromised.
- **HTML Sanitization**: Blog articles render HTML via `DOMPurify.sanitize()` in `Blogdetail.jsx` to prevent Cross-Site Scripting (XSS).
- **CORS Restrictions**: Lock down `allowedOrigins` in `backend/server.js` strictly to the production subdomain and local dev environment.

---

## 23. Pending Tasks and Priorities

| Priority | Task | Description |
|---|---|---|
| **P0 — Critical** | Implement Subdomain URLs & CORS | Replace expired domain with active subdomain across frontend and backend. |
| **P0 — Critical** | Resolve Image Upload & Asset Hosting | Replace missing `upload.php` with native Express upload handler or S3 storage. |
| **P0 — Critical** | Provision MySQL Database | Create `admins` and `blogs` tables using provided SQL schema. |
| **P1 — High** | Implement Native Contact Endpoint | Create `/api/contact` in Express or restore EmailJS integration in `Contact.jsx`. |
| **P1 — High** | Revive / Deploy Backend Service | Deploy backend service to stable host and verify DB connectivity. |
| **P2 — Medium** | Resolve ESLint Issues | Fix 49 lint warnings/errors in `Frontend/src`. |
| **P2 — Medium** | Enhance Protected Routes | Validate JWT expiration timestamp on frontend route transitions. |
| **P3 — Low** | Implement Automated Tests | Add Vitest for component rendering and Supertest for API integration testing. |

---

## 24. Troubleshooting Guide

### Issue: Backend connects to database but returns 500 on Login or Blog fetch
- **Cause**: The `admins` or `blogs` table has not been created.
- **Solution**: Run the SQL schema script provided in [Section 16](#16-database-setup--required-schemas).

### Issue: Frontend displays CORS error when communicating with Backend
- **Cause**: The frontend origin is not registered in `backend/server.js` `allowedOrigins`.
- **Solution**: Add your exact frontend subdomain (including protocol, e.g. `https://studio.domain.com`) to `allowedOrigins` in `backend/server.js`.

### Issue: Vite build warns about blog fetch failure during sitemap generation
- **Cause**: `generate-sitemap.mjs` could not reach the backend API to fetch published blog slugs.
- **Behavior**: The script gracefully falls back to generating sitemaps for the 13 static pages without failing the build.

---

## 25. Next Steps for the Developer Taking Over

1. **Review Handover Documents**: Read `DEVELOPMENT_HANDOVER.md` for workflow details and `PROJECT_STATUS.md` for task tracking.
2. **Deploy Local Database**: Start local MySQL, run the schema in Section 16, and seed an admin user.
3. **Verify Local Full-Stack Flow**: Run `backend` on port 5000 and `Frontend` on port 5173. Test admin login and portfolio browsing.
4. **Implement Missing Native Handlers**: Create `/api/contact` and replace `upload.php` with local disk storage in `backend/public/uploads`.
5. **Configure Subdomain & Deploy**: Set environment variables for the new subdomain and deploy frontend and backend.
