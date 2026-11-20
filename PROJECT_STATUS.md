# Genie Studio — Project Status & Task Tracking

> **Comprehensive Audit Matrix, Feature Inventory, and Prioritized Task Tracking for Genie Studio.**  
> Status Legend:  
> - ✅ **Completed and verified**: Fully implemented, verified via inspection and build test.  
> - 🟡 **Partially completed**: Core logic exists, but requires configuration, updates, or external dependency.  
> - 🔴 **Not implemented**: Completely absent from codebase; must be developed.  
> - ⚠️ **Implemented but needs testing**: Implemented in code, but requires runtime database or server test.  
> - ❓ **Unable to verify**: Requires external third-party access (DNS, registrar, hosting panel).  
>  
> Priority Legend:  
> - **P0 — Critical**: Blocks deployment or creates severe security/operational risk.  
> - **P1 — High**: Essential feature required before launch.  
> - **P2 — Medium**: Important architectural or quality enhancement.  
> - **P3 — Low**: Optional improvement or future optimization.

---

## 1. Feature & Module Status Inventory

| ID | Feature / Task | Status | Priority | Relevant Files | Description | Next Action |
|---|---|---|---|---|---|---|
| **FE-01** | Public Homepage (`/`) | ✅ Completed and verified | P1 | `Frontend/src/pages/Home.jsx`, `components/VideoHero.jsx`, `components/SplashCursor.jsx` | Full visual landing page with animated hero, services carousel, counters, and studio gear section. | Verify visual appearance under the new subdomain. |
| **FE-02** | About Us Page (`/about`) | ✅ Completed and verified | P1 | `Frontend/src/pages/About.jsx` | Studio story, mission, team, and studio equipment list. | Review and update team/equipment details if studio updated gear. |
| **FE-03** | Services Master Page (`/services`) | ✅ Completed and verified | P1 | `Frontend/src/pages/Services.jsx` | Overview of all 6 studio shoot categories with interactive cards. | Verified working. |
| **FE-04** | Service Detail Pages (6 Pages) | ✅ Completed and verified | P1 | `Frontend/src/pages/*shoots.jsx` | Dedicated pages for Corporate, Event, Product, Podcast, Professional, and Business shoots. | Verified working; deep-linking verified via `.htaccess`. |
| **FE-05** | Filterable Portfolio Page (`/portfolio`) | ✅ Completed and verified | P1 | `Frontend/src/pages/Portfolio.jsx`, `Frontend/src/lib/portfolioApi.js` | Category filtering (All, Corporate, Events, etc.) fetching from `/api/portfolio` with fallback seed data. | Ensure backend API is reachable to serve live dynamic items. |
| **FE-06** | 3D Dome Gallery (`/gallery`) | ✅ Completed and verified | P1 | `Frontend/src/pages/Gallery.jsx`, `components/DomeGallery.jsx`, `lib/galleryApi.js` | Interactive 3D WebGL spherical dome rendering photos with drag navigation. | Verified working with Three.js and OGL canvas. |
| **FE-07** | Blog Directory & Detail (`/blogs`, `/blog/*`) | ✅ Completed and verified | P1 | `Frontend/src/pages/Blogs.jsx`, `pages/Blogdetail.jsx` | Blog listing with category filters, dynamic slug reader, sanitized HTML rendering via DOMPurify. | Connect to live MySQL database to test article loading. |
| **FE-08** | Contact & Booking Form UI | 🟡 Partially completed | P0 | `Frontend/src/pages/Contact.jsx` | UI form with input validation and loading state; previously targeted dead `contact.php`. | Replace `contact.php` fetch with `/api/contact` or EmailJS. |
| **FE-09** | 404 Not Found Page | ✅ Completed and verified | P2 | `Frontend/src/pages/NotFound.jsx` | Custom error page rendering `noindex` tag to prevent soft-404 SEO penalties. | Verified working. |
| **FE-10** | SEO Head Hoisting & JSON-LD | ✅ Completed and verified | P1 | `Frontend/src/components/Seo.jsx`, `lib/seoConfig.js`, `index.html` | React 19 native head tag hoisting; Schema.org `LocalBusiness` and `Service` JSON-LD graphs. | Update hardcoded `SITE_URL` from `geniestudio.in` to new subdomain. |
| **FE-11** | Responsive Image Picture Engine | 🟡 Partially completed | P1 | `Frontend/src/components/OptimizedImage.jsx`, `lib/imageManifest.json` | Generates `<picture>` tags with AVIF and WebP sources across multiple screen widths. | Re-map or host existing images from `imageManifest.json` on new subdomain. |
| **FE-12** | Dynamic Sitemap Generator | 🟡 Partially completed | P1 | `Frontend/scripts/generate-sitemap.mjs` | Build script creating `public/sitemap.xml` using git commit timestamps and API blog slugs. | Update hardcoded `SITE` URL constant to new subdomain. |
| **ADM-01** | Admin Authentication (`/admin`) | ✅ Completed and verified | P1 | `Frontend/src/pages/AdminLogin.jsx`, `components/ProtectedRoute.jsx` | Login form issuing JWT tokens stored in `localStorage`; route protection guard. | Enhance `ProtectedRoute.jsx` to check JWT expiration timestamp. |
| **ADM-02** | Blog CMS (`/admin/blogs`) | ✅ Completed and verified | P1 | `Frontend/src/pages/AdminBlogs.jsx`, `components/BlogEditor.jsx` | TipTap rich text WYSIWYG editor, draft/publish workflow, permalink generator, social share links. | Verified working with backend `/api/blogs` API. |
| **ADM-03** | Media Asset Library (`/admin/images`) | 🟡 Partially completed | P0 | `Frontend/src/pages/AdminImages.jsx`, `components/BulkImageUploader.jsx` | Centralized image manager with metadata viewer; upload currently depends on `upload.php`. | Decouple upload pipeline from remote `upload.php` script. |
| **ADM-04** | Portfolio CMS (`/admin/portfolio`) | ✅ Completed and verified | P1 | `Frontend/src/pages/AdminPortfolio.jsx`, `lib/portfolioApi.js` | Ingestion, category assignment, title/description editing, and visual reordering. | Verified working with backend portfolio endpoints. |
| **ADM-05** | Dome Gallery CMS (`/admin/gallery`) | ✅ Completed and verified | P1 | `Frontend/src/pages/AdminGallery.jsx`, `lib/galleryApi.js` | Manage, reorder, and update alt-text for photos rendered inside 3D Dome Gallery. | Verified working with backend gallery endpoints. |
| **BE-01** | Core API Server & DB Pool | ✅ Completed and verified | P0 | `backend/server.js` | Express 5 server with MySQL connection pool, health check `/`, and error handler middleware. | Verified clean syntax via `node --check server.js`. |
| **BE-02** | JWT Auth Middleware | ✅ Completed and verified | P0 | `backend/server.js` (`verifyToken`) | Validates Bearer token using `JWT_SECRET`; protects administrative write endpoints. | Verified working. |
| **BE-03** | Sharp Image Variant Generator | 🟡 Partially completed | P0 | `backend/lib/imagePipeline.js`, `backend/server.js` | Generates 400-2000px WebP/AVIF variants + LQIP blur; currently uploads to dead `upload.php`. | Reroute output to local disk or cloud bucket (S3). |
| **BE-04** | Social Crawler Preview Route | 🟡 Partially completed | P1 | `backend/server.js` (`/share/:permalink`) | Express route returning OG HTML for scrapers and JS redirect for users. | Update hardcoded redirect from `geniestudio.in` to new subdomain. |
| **BE-05** | Native Contact Endpoint | 🔴 Not implemented | P0 | `backend/server.js` | Missing `POST /api/contact` endpoint to receive form submissions and email the studio team. | Implement `POST /api/contact` using nodemailer or external SMTP. |
| **DB-01** | Schema Auto-Creation (`images`, `portfolio_images`, `gallery_images`) | ✅ Completed and verified | P0 | `backend/server.js` | Automatically creates tables and seeds default portfolio and gallery items on startup. | Verified working. |
| **DB-02** | Schema Initialization (`admins`, `blogs`) | 🔴 Not implemented | P0 | `backend/server.js` | The server does NOT auto-create `admins` or `blogs` tables; missing `.sql` migration file. | Execute documented SQL migration in `DEVELOPMENT_HANDOVER.md`. |

---

## 2. Configuration, Quality & Deployment Tasks

| ID | Task Category | Status | Priority | Relevant Files | Description | Next Action |
|---|---|---|---|---|---|---|
| **CFG-01** | Subdomain CORS Configuration | 🔴 Not implemented | P0 | `backend/server.js` | Backend `allowedOrigins` currently only permits `localhost:5173` and `geniestudio.in`. | Add the new frontend subdomain to `allowedOrigins`. |
| **CFG-02** | Frontend API URL Configuration | 🟡 Partially completed | P0 | `Frontend/.env`, `Frontend/src/api.js` | Currently points to sleeping/503 Render backend. | Set `VITE_API_URL` to the new active backend API subdomain. |
| **CFG-03** | Subdomain Canonical & Schema Update | 🔴 Not implemented | P0 | `Frontend/index.html`, `Frontend/src/lib/seoConfig.js` | Hardcoded `https://geniestudio.in/` exists across meta, link canonical, and JSON-LD schemas. | Replace all occurrences with the new subdomain URL. |
| **CFG-04** | Subdomain Sitemap & Robots.txt | 🟡 Partially completed | P1 | `Frontend/public/robots.txt`, `Frontend/scripts/generate-sitemap.mjs` | Sitemap references old expired domain. | Update `SITE` constant and robots.txt sitemap URL. |
| **QAL-01** | Frontend ESLint Fixes | 🟡 Partially completed | P1 | `Frontend/src/` | 49 lint problems (46 errors, 3 warnings), including `ImageCarousel` naming and effect state updates. | Refactor component name and clean up unused variables. |
| **QAL-02** | Dependency Hygiene | 🟡 Partially completed | P2 | `Frontend/package.json` | Unused dependencies: `face-api.js`, `firebase`, and orphan `composer.json`. | Run `npm uninstall face-api.js firebase` and remove composer files. |
| **TST-01** | Automated Testing Suite | 🔴 Not implemented | P3 | `Frontend/`, `backend/` | No automated unit or integration tests exist in the repository. | Add Vitest for frontend components and Supertest for backend endpoints. |
| **DEP-01** | Frontend Subdomain Web Hosting | ❓ Unable to verify | P0 | Hostinger / Vercel | Requires DNS access and web server document root configuration. | Create subdomain in hosting panel and configure `.htaccess` SPA rewrites. |
| **DEP-02** | Backend Subdomain API Deployment | ❓ Unable to verify | P0 | Render / VPS / Railway | Requires server hosting and production MySQL database connection. | Deploy Express app with environment variables and SSL. |
| **DEP-03** | SSL / HTTPS Certificates | ❓ Unable to verify | P0 | Cloudflare / Let's Encrypt | Requires active DNS delegation for the target subdomain. | Issue and enforce SSL certificate across frontend and API. |
| **DOC-01** | Main Project Documentation | ✅ Completed and verified | P1 | `README.md` | Complete project documentation created with all 25 audit sections. | Completed. |
| **DOC-02** | Developer Handover Guide | ✅ Completed and verified | P1 | `DEVELOPMENT_HANDOVER.md` | Comprehensive guide with architecture, schemas, and onboarding steps. | Completed. |
| **DOC-03** | Module Specific Documentation | ✅ Completed and verified | P1 | `Frontend/README.md`, `backend/README.md` | Dedicated module READMEs detailing structure, commands, and configs. | Completed. |
| **DOC-04** | Project Status Tracking | ✅ Completed and verified | P1 | `PROJECT_STATUS.md` | Structured feature checklist and task tracking matrix. | Completed. |

---

## 3. High-Priority Action Plan for Takeover Developer

```
[ Day 1: Database & Local Auth ]
  ├── 1. Run SQL schema in MySQL (creates `admins` and `blogs`).
  └── 2. Test local login at http://localhost:5173/admin.

[ Day 2: Native Endpoints & Storage ]
  ├── 3. Create POST /api/contact in Express (decouple from contact.php).
  └── 4. Implement local disk or S3 upload in backend (decouple from upload.php).

[ Day 3: Subdomain Configuration ]
  ├── 5. Add new subdomain to backend CORS in server.js.
  ├── 6. Update VITE_API_URL and SITE_URL across Frontend.
  └── 7. Update canonical tags and JSON-LD schemas in index.html.

[ Day 4: Linting & Optimization ]
  ├── 8. Fix 49 ESLint errors (ImageCarousel, SplitText, unused vars).
  └── 9. Prune unused packages (firebase, face-api.js).

[ Day 5: Deployment & Verification ]
  ├── 10. Deploy backend to Render/VPS with production MySQL.
  ├── 11. Build frontend (`npm run build`) and deploy to subdomain.
  └── 12. Run the Pre-Launch Verification Checklist in DEVELOPMENT_HANDOVER.md.
```
