# Genie Studio local production-readiness review

Date: 2026-11-20. Branch: `studio-redesign`. Existing HEAD: `50b3223`.

**Decision: local fixes are implemented, but public publication and production deployment are not yet cleared.** The final domain is unconfirmed, the current local JWT secret fails strength validation, historical seed credentials remain in Git, and tracked media still needs publication approval. Live integration and visual browser checks remain outstanding.

No commits, pushes, branch changes, remote changes, deployments, DNS changes, credential changes, production database queries, or deletion of existing media were performed. Tests used isolated local stubs. Dependency updates came from npm's official registry with lifecycle scripts disabled and without forced major upgrades.

## 1. Security fixes

- Removed documented seed passwords, administrator seed accounts, and bcrypt hashes from the current README and handover file. No credential values are reproduced in this report.
- Added backend-only configuration validation before database connections/listening; strong JWT signing keys, explicit production origins, TLS for remote production MySQL, and complete R2 configuration are required.
- Removed plaintext password authentication. JWTs are restricted to HS256, checked for expiration, and checked against the current admin account on each protected request.
- Added bounded per-IP login/contact/upload limits, explicit proxy trust, body/multipart limits, generic internal-error responses, no-store/noindex API headers, nosniff, and frame/referrer protections.
- Image uploads validate extension/MIME agreement and actual decoded content, reject animated/corrupt/oversized images, strip metadata, generate safe filenames, and store only normalized bytes. No unvalidated temporary file enters the public directory. PNG/WebP normalization is lossless; JPEG uses maximum quality.
- Fixed local stream truncation/overwrite risk. Existing different bytes are never overwritten. Storage failures do not silently forward media to a different host.
- Image deletion checks blogs (including draft content and embedded image URLs), gallery, portfolio, assigned slots, and source-bundled media. Unknown legacy storage is retained. Failed physical deletion preserves the registry row and reports an error. Existing historical temporary/orphan copies were not deleted.
- Public blog and share queries require published status. Share templates escape text/attributes and safely serialize JavaScript values; unsafe permalinks are rejected.
- Backfill downloads use approved HTTPS origins/paths, public DNS checks, no redirects, no credential-bearing URLs, bounded download sizes, and pixel limits. Dry-run skips schema changes.
- Gallery/portfolio bulk replacements are transactional and report success only after commit; failed inserts roll back prior rows. No real database replacement was run.
- Database initialization is queued and must complete before the production entry point listens.

Principal files: `backend/server.js`, `backend/lib/config.js`, `security.js`, `imageValidation.js`, `storageProvider.js`, `safeDownload.js`, `transaction.js`, and `backend/test/security.test.js`.

## 2. Environment variables

Examples with empty/private-safe values: `backend/.env.example` and `Frontend/.env.example`. Actual .env files were left unchanged and remain ignored.

| Hosting environment | Configuration |
| --- | --- |
| Backend database | DB_HOST, DB_USER, DB_PASSWORD, DB_NAME; DB_SSL=true for remote production DB; optional DB_SSL_CA |
| Backend authentication | JWT_SECRET (private random value, at least 32 characters), JWT_TTL |
| Backend network | NODE_ENV, PORT, SITE_URL, BASE_URL, CORS_ORIGINS, TRUST_PROXY_HOPS |
| Backend storage | STORAGE_PROVIDER; R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN for R2 |
| Optional legacy uploads | HOSTINGER_UPLOAD_URL, HOSTINGER_UPLOAD_TOKEN; production requires a token and a reviewed handler that verifies it |
| Optional enquiry delivery | CONTACT_WEBHOOK_URL, CONTACT_WEBHOOK_TOKEN |
| Optional backfill | BACKFILL_ALLOWED_ORIGINS |
| Vercel frontend build | VITE_API_URL, VITE_SITE_URL, VITE_SITE_INDEXABLE, VITE_MEDIA_URL |
| Vercel public-content snapshot | SEO_FETCH_PUBLIC_DATA=true for an indexable release |

Never configure DB credentials, signing keys, private API tokens, or storage secrets under a VITE_ name. Frontend variables are public browser configuration. The final production origin was not invented or configured.

## 3. Dummy, duplicate, and obsolete data

Removed stock-photo portfolio/gallery startup seed arrays. No existing database rows were removed. Empty API results remain empty; the gallery has explicit loading, unavailable, and empty states. Public pages retain genuine existing company copy and media rather than fabricated replacement records.

Consolidated the repeated site-section metadata into `backend/data/siteSections.json`. Obsolete controls for four text-only/unused hero/default slots are marked inactive; stored legacy rows are not removed. Current image components consume explicit administrator assignments, with existing approved images retained on API failure.

Removed 11 unused frontend dependency declarations after checking active imports: @emailjs/browser, axios, class-variance-authority, emailjs, face-api.js, firebase, motion, ogl, postprocessing, swiper, and three. The Firebase source was already commented out; no active Firebase or EmailJS integration was removed. The contact form now uses the configured native backend relay.

No confirmed fake testimonials, fabricated reviews, numerical business claims, or aggregate-rating markup were found in the current public page components. Existing project/production descriptions and media authenticity still require owner review; they were preserved.

## 4. Items requiring owner approval

The six existing tracked files in `backend/public/uploads/` remain untouched:

- 1775737735457-471184621.jpeg
- 1775738223404-460939522.jpeg
- 1775738252542-128934890.jpeg
- 1775738343510-92447669.jpeg
- 1775801287500-737384959.png
- 1775802337015-220179066.png

The first three are byte-identical copies. They and the other assets appear to be marketing images/screenshots, but their publication rights/confidentiality were not established. No GPS metadata was found. Binary assets have no line numbers. Keep, untrack, or remove them only after an owner decides what belongs in the public repository. Adding .gitignore rules does not untrack existing files.

Also review internal handover/status documents, the 239-entry backend variants manifest, existing portfolio claims, podcast preview imagery, and image URL inventories before public export. No genuine content or equipment was removed because of uncertainty.

## 5. Page-specific SEO

All 13 public routes have unique titles/descriptions, canonical URLs, robots directives, Open Graph, Twitter cards, one primary H1, image alt attributes, and internal links in prerendered HTML. Existing public business details were reused; no new address, review, rating, award, or contact identity was invented.

| Route | SEO identity and additional schema |
| --- | --- |
| / | Photography/podcast studio in Visakhapatnam; existing Organization, LocalBusiness, WebSite, WebPage |
| /about | Company/studio introduction; AboutPage |
| /services | Photography/video service overview; WebPage |
| /services/podcast-shoots | Podcast studio in Visakhapatnam; Service, visible FAQ/breadcrumb markup |
| /services/product-shoots | Product photography in Visakhapatnam; Service/breadcrumbs |
| /services/corporate-shoots | Corporate photography/video in Vizag; Service/breadcrumbs |
| /services/event-shoots | Event photography in Visakhapatnam; Service, visible FAQs/breadcrumbs |
| /services/professional-shoots | Professional portraits/headshots; Service, visible FAQs/breadcrumbs |
| /services/business-portfolio-shoots | Business portfolio photography in Vizag; Service, visible FAQs/breadcrumbs |
| /portfolio | Podcast/video production portfolio; CollectionPage |
| /gallery | Studio photography gallery; WebPage |
| /blogs | Photography/podcast production blog; Blog |
| /contact | Studio booking/contact; ContactPage |
| /blog/<published-permalink> | Real post title, description, image, dates, canonical; BlogPosting and breadcrumbs |

Admin, authentication, error, and missing-article pages are noindex. Meta-keywords behavior was removed from blog routes. The inconsistent business provider ID was corrected to #business.

## 6. Crawlers and structured data

The build renders the actual React application to HTML and hydrates it in the browser. Search/social crawlers do not need JavaScript to see static page metadata or content. Published article text is escaped during server rendering, then sanitized rich HTML is rendered after browser hydration. The build test checks a dynamic article and attempted script injection in memory.

An indexable build requires SEO_FETCH_PUBLIC_DATA=true and a reachable configured HTTPS API. It reads only published blogs plus public gallery/image assignments. A failed snapshot stops the build. New/changed/unpublished posts and changed media require rebuilding and invalidating the previous deployment/cache. This is a static snapshot architecture, not live SSR; no deployment webhook was created.

## 7. Sitemap, robots, and discovery

Until a final domain is configured, builds emit noindex metadata, robots.txt with Disallow: /, and an empty sitemap. Canonicals use the local preview fallback rather than an invented production domain.

For an explicitly indexable release, the generator uses the confirmed origin and lists only public canonical routes and published blog URLs. Admin/draft/private/error URLs are excluded. Build output also generates llms.txt and neutralizes stale source sitemap/feed copies referring to the old domain. Running the generator repeatedly is supported without duplicating metadata.

## 8. Frontend/backend compatibility and performance

Existing layout classes, colors, typography, animation behavior, equipment specifications, and genuine public content were retained. Small fixes cover header route/menu reset, toast lifecycle/accessibility, proper React component naming, image dimensions, related-content/error behavior, and authenticated admin list loading. Browser sessions are tab-scoped rather than persistent localStorage tokens.

Lazy route loading, image variants, above-fold priorities, below-fold lazy loading, reduced-motion behavior, and existing caching/font strategy remain. Removing unused dependencies reduced the installed frontend dependency tree; compatible security patches refreshed both lockfiles. No live Core Web Vitals improvement or visual/browser compatibility claim is made.

The current public portfolio is an editorial production-category page; legacy portfolio CRUD remains available for existing consumers. Use the central image manager for the mapped editorial images. No production records were transformed to fit that page.

## 9. Automated results

- Backend: 21 isolated tests passed, covering startup readiness/failure, config, authentication, rate limits, draft restrictions, share escaping, image validation/storage/deletion/references, section assignment, SSRF filters, CORS, contact unavailability, and transactional gallery rollback/commit.
- Frontend production build: passed, including prerendering of all 13 public routes and private/error pages.
- Frontend lint: passed with no errors or warnings.
- Built HTML checks: passed unique metadata, one H1, canonical, JSON-LD parsing, alt attributes, internal links, admin indexing, dynamic article safety, and image assignment.
- Local HTTP checks: all 13 public routes returned 200; no broken internal page links or missing img alt attributes were found.
- npm audit after compatible updates: zero reported vulnerabilities in both projects (initially 34 frontend and 9 backend). This is advisory coverage, not a proof of security.
- History scan: 43 commits and 395 historical text blobs checked with credential patterns. The documented seed password/hash examples remain in history. No historical tracked .env/key/database dump filenames or recognizable provider-token candidates were found by that scan. Unknown/encoded secrets remain outside what a pattern scan can prove.

## 10. Manual testing still required

The browser-control host was unavailable. Mobile/tablet/laptop/desktop visual layouts, keyboard interactions, focus/modal behavior, animation appearance, actual runtime hydration/console messages, and cross-browser behavior were not visually verified.

After configuring a staging environment, verify real hashed-admin login, MySQL schema/TLS, storage upload/variants/deletion, public/private post behavior, media assignments, contact delivery, external media availability, Vercel clean URLs/404 status, and social cards. Run concurrency/recovery checks before enabling physical deletion across multiple backend instances. Rate limits are process-local; multi-instance hosting needs shared/proxy throttling. Tab-scoped bearer tokens remain accessible to same-origin scripts; the changes do not claim HttpOnly-cookie session protection.

## 11. Credential and publication actions

1. Replace the existing weak local/deployed JWT signing secret through an authorized private configuration change. It was not changed here. Rotating it invalidates existing tokens.
2. If any live administrator used a documented seed password, rotate that account and provision a unique bcrypt hash privately. Whether the historical examples were used in production was not verified. Existing plaintext database records must be migrated by an authorized operator.
3. Review historical credential exposure and choose a clean, sanitized export/history for the new company repository. No existing history or remotes were rewritten. Do not assume a normal push of this branch omits historical examples.
4. Approve media/internal-document publication and decide which already tracked uploads should be untracked. Keep real .env files, audit caches, node_modules, and dist excluded.
5. Confirm website/API/media hosting origins, configure allowed CORS origins and exact trusted proxy hops, and configure certificate-verified remote MySQL.
6. Configure and review the actual contact delivery endpoint. Unconfigured delivery intentionally fails visibly rather than pretending to send an enquiry.

## 12. Public GitHub readiness

Current-source credential examples were sanitized and ignore rules improved. Public publication is still pending history/media/internal-document decisions. A clean export of approved source into genieMediaSoftwares/genie-studio-website is safer than carrying the existing history unchanged. Existing origin/company remote connections were not changed and no files were staged or pushed.

## 13. Vercel readiness

Frontend root: Frontend. Build: npm run build. Output: dist. Configuration uses clean URLs and generated static HTML; a custom 404 page is included. No deployment was performed.

Final release settings must include confirmed HTTPS VITE_SITE_URL and VITE_API_URL, VITE_SITE_INDEXABLE=true, SEO_FETCH_PUBLIC_DATA=true, and the intended VITE_MEDIA_URL. Keep preview environments noindex. Review the build output and current public content snapshot before releasing.

## 14. Backend hosting requirements

Host Express separately from the static frontend, with a compatible Node runtime, native Sharp/bcrypt support, persistent MySQL, verified TLS for remote DB connections, private environment variables, an appropriate trusted proxy configuration, and either persistent local media storage or complete R2 configuration. Review startup schema privileges/migrations before deploying; none were executed against a real database here. Legacy PHP upload/contact handlers are outside this repository and require their own review if retained.

## References

- [OWASP file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Vite SSR documentation](https://vite.dev/guide/ssr.html)
- [Express proxy configuration](https://expressjs.com/en/guide/behind-proxies/)
- [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json)
