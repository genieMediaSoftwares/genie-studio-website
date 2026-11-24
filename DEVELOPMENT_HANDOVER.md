> Updated 2026-11-20: This historical document predates the security and prerendering changes. Use README.md and PRODUCTION_REVIEW.md for current setup, verification, and release blockers.

# Genie Studio — Developer Handover Guide

> **Target Audience:** Incoming Software Engineers, Full-Stack Developers, and DevOps Engineers.  
> **Objective:** Enable a complete, autonomous takeover of the Genie Studio project without reliance on the original development team.

---

## Table of Contents
1. [A. Project Summary](#a-project-summary)
2. [B. Current State of the Codebase](#b-current-state-of-the-codebase)
3. [C. How the Project Works](#c-how-the-project-works)
4. [D. Important Files and Directories](#d-important-files-and-directories)
5. [E. How to Start Working (Step-by-Step Developer Setup)](#e-how-to-start-working)
6. [F. Remaining Work & Technical Tasks (Prioritized)](#f-remaining-work--technical-tasks)
7. [G. Subdomain Deployment Handover](#g-subdomain-deployment-handover)
8. [H. Confirmed Bugs, Gotchas & Known Technical Debt](#h-confirmed-bugs-gotchas--known-technical-debt)
9. [I. Recommended Work Order](#i-recommended-work-order)
10. [J. Final Pre-Launch Verification Checklist](#j-final-pre-launch-verification-checklist)

---

## A. Project Summary

**Genie Studio** is a commercial creative media production studio in Visakhapatnam (Vizag), India. The studio offers photography, 4K videography, podcast studio production, corporate headshots, and product shoots.

The repository contains:
- A high-aesthetic, animated **React 19 Single Page Application (SPA)** that serves as the public face of the studio.
- An **Administrative CMS** (`/admin`) for publishing blogs, managing studio image assets, and curating portfolios.
- A **Node.js/Express REST API** with MySQL persistence, JWT authentication, and an automated Sharp-based responsive image processing ladder.

The original production domain (`geniestudio.in`) **has expired**. The primary directive for the incoming engineering team is to stabilize the system, decouple it from unversioned external PHP scripts, configure it for deployment on an active **subdomain**, and complete the remaining functional gaps.

---

## B. Current State of the Codebase

### Status Classification
- ✅ **Completed & Verified**: Code exists, builds cleanly, and is structurally complete.
- 🟡 **Partially Completed**: Core implementation exists, but requires configuration or is missing an external dependency.
- 🔴 **Not Implemented**: Necessary functionality is absent from the repository.
- ⚠️ **Implemented but Needs Testing**: Code is written but requires runtime validation with active credentials/services.

### Summary Matrix
| Component / Module | Status | Description |
|---|---|---|
| **Public Website Pages** | ✅ Completed & Verified | All 13 public routes render, code-split cleanly, and build without error. |
| **3D Dome Gallery** | ✅ Completed & Verified | WebGL Three.js interactive dome runs on `/gallery` with API integration. |
| **SEO & Schema Integration** | ✅ Completed & Verified | React 19 native head hoisting with JSON-LD `LocalBusiness` and `Service` graphs. |
| **Admin Blog CMS** | ✅ Completed & Verified | TipTap WYSIWYG editor with draft/publish workflow, slug, and tag management. |
| **Admin Media Library** | ✅ Completed & Verified | Centralized image management dashboard with metadata inspection. |
| **Admin Portfolio & Gallery** | ✅ Completed & Verified | Dynamic reordering and categorization tools for showcase items. |
| **Frontend Production Build** | ✅ Completed & Verified | Compiles successfully via `npm run build` in ~52 seconds. |
| **Frontend Code Quality** | 🟡 Partially Completed | `npm run lint` flags 49 issues (46 errors, 3 warnings), mostly unused variables and hook rules. |
| **Database Schema** | ⚠️ Needs Initialization | `images`, `portfolio_images`, `gallery_images` auto-create. `admins` and `blogs` **must be created manually**. |
| **Contact Form** | 🟡 Partially Completed | Form UI is complete, but target endpoint (`contact.php` on expired domain) is dead. |
| **Image Upload Ladder** | 🟡 Partially Completed | Sharp variant generation is implemented, but pipes to unversioned remote `upload.php`. |
| **Subdomain Configuration** | 🔴 Not Implemented | Repository still has `geniestudio.in` hardcoded across HTML, scripts, CORS, and configs. |
| **Automated Tests** | 🔴 Not Implemented | No test runners (Vitest, Jest, Cypress) configured in either module. |

---

## C. How the Project Works

### 1. Data Flow & Communication
```
[ Browser / Visitor ] ─── HTTP GET ───► [ React 19 Frontend SPA ]
                                               │
                                  Axios / Fetch with Bearer JWT
                                               │
                                               ▼
                                    [ Express 5 REST API ]
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     ▼                         ▼                         ▼
             [ MySQL Database ]         [ Sharp Engine ]       [ Media Storage ]
           (Blogs, Portfolio, Admin)  (WebP/AVIF Variants)   (Hostinger / S3 / Local)
```

### 2. Responsive Image Pipeline
1. Camera originals are uploaded through `/admin/images` or the blog featured image input.
2. In `backend/server.js`, `multer` buffers the file temporarily to `backend/public/uploads`.
3. `lib/imagePipeline.js` uses `sharp` to inspect dimensions, correct EXIF orientation, and generate:
   - WebP derivatives at 400, 800, 1200, 1600, 2000px widths (Quality: 82).
   - AVIF derivatives at 400, 800, 1200, 1600, 2000px widths (Quality: 58).
   - A ~24px blurred WebP string formatted as a base64 Data URI for Low-Quality Image Placeholder (LQIP).
4. The frontend component `OptimizedImage.jsx` resolves the best format using `<picture>` and `<source type="image/avif">`.

### 3. SEO & Metadata Lifecycle
- **Static HTML** (`Frontend/index.html`): Declares base fallback meta tags and the Schema.org `Organization` + `LocalBusiness` JSON-LD graph read by non-JS crawlers.
- **Client Head Hoisting** (`Frontend/src/components/Seo.jsx`): Under React 19, `<title>`, `<meta>`, and `<link>` elements rendered anywhere in the component tree are automatically hoisted to `<head>` and removed when navigating away.
- **Dynamic Sitemap** (`Frontend/scripts/generate-sitemap.mjs`): Reads static route files and executes git log commands to determine real `lastmod` dates, then attempts to fetch published blog slugs from the API.

---

## D. Important Files and Directories

| Path | Purpose |
|---|---|
| `Frontend/src/api.js` | Single source of truth for the API base URL (`VITE_API_URL`). |
| `Frontend/src/lib/seoConfig.js` | Central repository of route titles, descriptions, and canonical URLs. |
| `Frontend/src/lib/imageManifest.json` | Generated lookup table mapping original images to responsive variants. |
| `Frontend/src/pages/Contact.jsx` | Contact and shoot booking form. Contains hardcoded `contact.php` URL. |
| `Frontend/src/components/DomeGallery.jsx` | WebGL 3D interactive spherical dome gallery. |
| `Frontend/public/.htaccess` | Apache configuration: SPA route rewrite, AVIF/WebP MIME types, cache headers. |
| `backend/server.js` | Core server file: Express router, MySQL connection pool, auth middleware, and endpoints. |
| `backend/lib/imagePipeline.js` | Sharp image processing ladder and variant generator. |
| `backend/scripts/backfill-image-variants.js` | Resumable CLI utility to backfill responsive variants for existing studio assets. |

---

## E. How to Start Working

### Prerequisites
- Node.js LTS (v18.x or v20.x)
- MySQL Server (v8.0+)
- Git

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd GieneStudio2

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Step 2: Configure Environment Variables
In `backend/.env`:
```ini
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=geniestudio_db
JWT_SECRET=
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
```

In `Frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000
```

### Step 3: Initialize Database
Open your MySQL terminal or GUI (MySQL Workbench, TablePlus, DBeaver) and run:
```sql
CREATE DATABASE IF NOT EXISTS geniestudio_db CHARACTER SET utf8mb4;
USE geniestudio_db;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt BIGINT DEFAULT NULL,
  updatedAt BIGINT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- Create an admin using a unique password hashed with bcrypt; do not publish account credentials.
-- Provision administrator credentials privately with a unique bcrypt hash; no shared account is supplied.
```

### Step 4: Run Locally
Open two terminal windows:
- **Terminal 1**: `cd backend && npm start`
- **Terminal 2**: `cd Frontend && npm run dev`
- Visit `http://localhost:5173` to view the website.
- Visit `http://localhost:5173/admin` to log into the CMS dashboard.

---

## F. Remaining Work & Technical Tasks

### 🔴 P0 — Critical (Must Fix Before Subdomain Launch)

#### Task 1: Replace Hardcoded Expired Domain (`geniestudio.in`)
- **Problem**: The domain `geniestudio.in` has expired. Hundreds of occurrences exist across the frontend and backend, causing CORS failures, broken canonical SEO links, broken sitemaps, and failed API calls.
- **Action**:
  1. In `Frontend/src/lib/seoConfig.js`, set `SITE_URL` to `import.meta.env.VITE_SITE_URL || "https://studio.yourdomain.com"`.
  2. In `Frontend/index.html`, replace canonical, Open Graph, and JSON-LD URLs with the new subdomain.
  3. In `Frontend/scripts/generate-sitemap.mjs`, update `const SITE` to read the new subdomain.
  4. In `backend/server.js`, add the new frontend subdomain to `allowedOrigins`.
  5. In `backend/server.js`, update `/share/:permalink` redirect targets.

#### Task 2: Implement Native Image Storage & Decouple from `upload.php`
- **Problem**: Image uploads currently attempt an HTTP POST to `https://geniestudio.in/upload.php`. Because this script is not in the repository and the domain is expired, image uploads fail with network errors.
- **Action**:
  1. Option A (Simple): Store uploads directly on the backend server under `backend/public/uploads` and serve them via Express static middleware (`app.use("/uploads", express.static(...))`).
  2. Option B (Cloud/Production): Implement an AWS S3 / Cloudinary / Supabase Storage adapter in `backend/lib/imagePipeline.js`.
  3. Ensure Sharp-generated variants are saved locally or in cloud storage rather than posted to `upload.php`.

#### Task 3: Implement Native Contact Submission Route (`/api/contact`)
- **Problem**: The contact form in `Frontend/src/pages/Contact.jsx` tries to submit to `https://geniestudio.in/contact.php`. Submissions fail completely.
- **Action**:
  1. Add a `POST /api/contact` endpoint in `backend/server.js` using `nodemailer` or an SMTP provider (SendGrid, Mailgun, or Hostinger SMTP) to email new inquiries to the studio team.
  2. Alternatively, restore and configure `@emailjs/browser` in `Contact.jsx` using `VITE_EMAILJS_*` environment variables.
  3. Update `Contact.jsx` to dispatch to the chosen handler.

---

### 🟡 P1 — High Priority (Stability & Core Experience)

#### Task 4: Fix 49 ESLint Errors in Frontend
- **Problem**: `npm run lint` fails with 46 errors and 3 warnings.
- **Action**:
  1. `ImageCarousel.jsx`: Rename component function from `imageCarousel` to uppercase `ImageCarousel` to satisfy React Hook rules.
  2. `SplitText.jsx` and `Header.jsx`: Move synchronous `setState` inside effects to proper callbacks or event listeners.
  3. `vite.config.js` and `tailwind.config.js`: Add Node globals to ESLint config for `__dirname` and `require`.
  4. Remove or prefix unused variables (`err`, `_`, `stats`, `Icon`).

#### Task 5: Enhance JWT Expiration Check on Frontend Navigation
- **Problem**: `ProtectedRoute.jsx` only checks `localStorage.getItem("token") !== null`. If a token expires (24h lifespan), the user remains on the admin screen until an API request fails.
- **Action**: Add a lightweight JWT decoder helper (or check expiration claim) in `ProtectedRoute.jsx` and auto-redirect to `/admin` if the token has expired.

---

### 🟢 P2 — Medium Priority (Optimization & Technical Debt)

#### Task 6: Prune Unused Frontend Dependencies
- **Problem**: `Frontend/package.json` contains unused heavy libraries:
  - `face-api.js` (`^0.22.2`) — Never imported in `src/`.
  - `firebase` (`^12.11.0`) — Only present in commented-out `src/lib/firebase.js`.
  - `composer.json` / `composer.lock` inside `Frontend/` — Stale PHP artifacts.
- **Action**: Remove these packages using `npm uninstall` to reduce node_modules footprint and supply chain risk.

#### Task 7: Database Migration Tooling
- **Problem**: Database tables currently rely on ad-hoc `CREATE TABLE IF NOT EXISTS` scattered across `server.js`.
- **Action**: Introduce Knex.js, Sequelize, or Prisma migrations for predictable schema management.

---

### 🔵 P3 — Low Priority (Future Enhancements)

#### Task 8: Automated Test Coverage
- Add Vitest for component testing.
- Add Supertest for Express API integration testing.

---

## G. Subdomain Deployment Handover

### 1. DNS Record Configuration
When assigning a subdomain (e.g., `studio.example.com`):
| Type | Host / Name | Target / Value | Purpose |
|---|---|---|---|
| `CNAME` | `studio` | `<hosting-platform-cname>` | Public Frontend Website |
| `CNAME` | `api.studio` (or `api-studio`) | `<render-or-vps-cname>` | Backend REST API Service |

### 2. Hostinger Apache Subdomain Deployment (Frontend)
1. In hPanel, navigate to **Domains** → **Subdomains** → Create `studio.example.com`.
2. Document root will be created at `public_html/studio/`.
3. In local terminal:
   ```bash
   cd Frontend
   npm run build
   ```
4. Upload all files from `Frontend/dist/` into `public_html/studio/`.
5. Verify that `.htaccess` is present in `public_html/studio/` so deep links (`/services/podcast-shoots`) rewrite properly to `index.html`.

### 3. Backend Deployment (Render / VPS)
1. Provision a Web Service on Render or a VPS with Node.js 18+.
2. Connect Git repository, set root directory to `backend`.
3. Environment variables:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (MySQL connection)
   - `JWT_SECRET` (Secure random string)
   - `PORT=5000`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://studio.example.com`
4. Update `server.js` CORS allowed origins with `https://studio.example.com`.

---

## H. Confirmed Bugs, Gotchas & Known Technical Debt

1. **Unversioned PHP Dependencies**:
   - `contact.php`, `upload.php`, and `og.php` were placed directly onto Hostinger via FTP/File Manager by the previous developer and never committed to Git.
2. **Hardcoded Image Manifest URLs**:
   - `Frontend/src/lib/imageManifest.json` contains over 230 image paths hardcoded to `https://geniestudio.in/uploads/...`.
   - *Impact*: If the old Hostinger account or domain is dead, these images will fail to load.
   - *Fix*: If files still exist in Hostinger storage, map the new subdomain's `/uploads` path to that directory or execute a global find-and-replace in `imageManifest.json`.
3. **Render Instance Sleep & 503 Errors**:
   - The fallback URL in `Frontend/src/api.js` points to `https://geinestudio-czl3.onrender.com`. During testing, this returned HTTP 503. Free-tier Render instances spin down after inactivity; ensure production uses a paid or self-hosted instance.

---

## I. Recommended Work Order

1. **Day 1: Local Full-Stack Baseline**
   - Run the provided SQL migration on a local MySQL server.
   - Seed an admin account.
   - Run frontend and backend locally; confirm login and CMS navigation work.
2. **Day 2: Decouple External PHP Scripts**
   - Implement `POST /api/contact` in Express with email dispatch.
   - Implement native local or S3 image upload in `backend/server.js`.
3. **Day 3: Subdomain & CORS Migration**
   - Replace all `geniestudio.in` URLs with environment-driven variables.
   - Update CORS configuration in backend.
4. **Day 4: Code Quality & Build Verification**
   - Resolve ESLint warnings in `Frontend`.
   - Remove unused packages (`firebase`, `face-api.js`, `composer.json`).
   - Run `npm run build` and verify that the sitemap generates with the new subdomain.
5. **Day 5: Staging & Production Deployment**
   - Point DNS CNAMEs for the subdomain.
   - Deploy backend to Render/VPS.
   - Upload frontend build to Hostinger/Vercel.
   - Execute the Pre-Launch Verification Checklist.

---

## J. Final Pre-Launch Verification Checklist

- [ ] MySQL database initialized with `admins`, `blogs`, `images`, `portfolio_images`, and `gallery_images`.
- [ ] Admin password hashed using bcrypt.
- [ ] `VITE_API_URL` points to live backend subdomain via HTTPS.
- [ ] Backend CORS `allowedOrigins` permits requests from the frontend subdomain.
- [ ] Contact form successfully sends inquiries to the studio email.
- [ ] Image upload in `/admin/images` successfully uploads and generates variants without `upload.php`.
- [ ] Visiting `/services/corporate-shoots` directly on the server does NOT return 404 (verifying `.htaccess` SPA rewrite).
- [ ] `sitemap.xml` lists URLs under the new subdomain.
- [ ] `robots.txt` points to the sitemap under the new subdomain.
- [ ] Google Search Console and analytics property IDs updated for the new subdomain.
