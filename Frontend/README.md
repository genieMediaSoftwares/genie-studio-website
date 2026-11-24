# Genie Studio frontend

React 19 + Vite, preserving the existing studio design, animations, equipment, and genuine company content.

For local development, keep public settings in `Frontend/.env`; this file stays local and is ignored by Git. On Vercel, configure the variables in the project's environment settings before building; uploading a local environment file is not required. Provider variables take precedence over local files. `VITE_API_URL` points to the separately hosted backend. `VITE_SITE_URL` is the confirmed public website origin; leave it blank while the final domain is unconfirmed. `VITE_SITE_INDEXABLE` enables indexing only for a confirmed release. `VITE_MEDIA_URL` preserves the existing media origin independently of the future site domain. Every `VITE_` value is public in the browser. `SEO_FETCH_PUBLIC_DATA` controls the read-only build snapshot and does not carry credentials. Never put database, JWT, storage, or private API secrets in frontend variables.

Commands: `npm run dev`, `npm run lint`, `npm run build`, `node scripts/check-site.mjs`, and `npm run preview`. Native config loading avoids bundling the Vite config and supports this ESM project. Node must satisfy Vite 7 requirements.

Build output is `dist`. The prerenderer renders the actual React routes to static HTML, including lazy public routes, and emits unique metadata, canonical URLs, Open Graph, Twitter cards, and structured data. React hydrates the generated markup. Existing page layouts and CSS are retained. Admin and error pages are noindex. There are no meta-keywords tags.

Preview builds are noindex with a blocking robots.txt and empty sitemap. Enable public indexing only with `VITE_SITE_INDEXABLE=true`, the confirmed HTTPS `VITE_SITE_URL`, HTTPS `VITE_API_URL`, and `SEO_FETCH_PUBLIC_DATA=true`. This explicitly snapshots only published blog data and public gallery/image assignments from the backend at build time. The release must be rebuilt whenever published content/status changes. No deployment hook is configured.

For Vercel: root directory `Frontend`, build command `npm run build`, output directory `dist`. `vercel.json` uses clean URLs and static routing; unknown paths use the custom 404 document. It does not deploy the Express backend. Set the documented frontend/build variables in the appropriate Vercel environment. Do not set backend secrets in Vercel frontend build variables.

Image assignments load through the shared public image provider. Existing approved images remain the fallback when the backend is unavailable. Gallery/blog empty states do not invent replacement records. Tokens are stored per browser tab and expire; the backend verifies every protected operation.

Browser/mobile visual verification is still required before release because the browser-control host was unavailable during the local review. See `../PRODUCTION_REVIEW.md`.
