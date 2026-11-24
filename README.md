# Genie Studio

React/Vite frontend and a separately hosted Express/MySQL backend for Genie Studio photography, video, podcast, gallery, blog, and admin image management.

Read [PRODUCTION_REVIEW.md](PRODUCTION_REVIEW.md) before public publication or deployment. The final domain is unconfirmed. No deployment, push, credential change, history rewrite, or production database operation was performed during this review.

## Local setup

Use a supported Node.js release compatible with Vite 7 (Node 20.19+ or 22.12+), and MySQL. Install from each lockfile with `npm ci` in `Frontend` and `backend`.

Keep local frontend settings in `Frontend/.env` and private backend settings in `backend/.env`. These files stay local and are ignored by Git. For deployment, set the variables directly in Vercel and the backend hosting provider; no local environment file needs to be uploaded. The backend validates configuration before creating a database connection or listening.

The JWT signing key must be a privately generated random value of at least 32 characters. Provision administrator accounts privately using bcrypt hashes; there is no shared default account. Existing plaintext administrator passwords must be migrated through an authorized private operation before those accounts can log in.

Run `npm start` in `backend` and `npm run dev` in `Frontend`. The backend development port is 5000 and the frontend development port is 5173. Configure `CORS_ORIGINS` explicitly if those origins change.

## Checks

- `backend`: `npm test` runs isolated security/API/storage tests with database and remote storage stubs. It never connects to the production database.
- `Frontend`: `npm run lint` checks application sources; the vendored image-compression worker is excluded from source linting.
- `Frontend`: `npm run build` builds client assets and prerenders public/private/error HTML into `dist`.
- `Frontend`: `node scripts/check-site.mjs` validates built metadata, structured data, internal links, image alt attributes, article rendering, and image assignments.
- `Frontend`: `npm run preview -- --host 127.0.0.1 --port 54123` serves a local preview.
- Run `npm audit --package-lock-only --ignore-scripts` in both package directories before release.

## Environment configuration

Backend-only configuration includes `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, optional `DB_SSL_CA`, `JWT_SECRET`, `JWT_TTL`, `SITE_URL`, `BASE_URL`, `CORS_ORIGINS`, and `TRUST_PROXY_HOPS`. See the application READMEs for the remaining storage and deployment variable names. Hosting-provider variables take precedence over a local environment file.

Select `STORAGE_PROVIDER=local`, `r2`, or `hostinger`. Existing R2 configuration is detected when no provider is explicitly specified. Local uploads require a persistent disk. R2 requires its account ID, access key, secret access key, bucket, and public domain. Hostinger requires an explicitly configured, reviewed upload URL; it is never a silent fallback after another provider fails. Unknown or legacy storage cannot be physically deleted through the image library.

`CONTACT_WEBHOOK_URL` optionally connects the contact API to the existing reviewed contact delivery service. `CONTACT_WEBHOOK_TOKEN` stays on the backend. Unconfigured or failed delivery returns an error and never displays a success confirmation.

Public frontend variables are `VITE_API_URL`, `VITE_SITE_URL`, `VITE_SITE_INDEXABLE`, and `VITE_MEDIA_URL`. Never put database, storage, signing, or private API credentials in `VITE_` variables.

## Release configuration

In Vercel, set root directory **Frontend**, build command **npm run build**, and output directory **dist**. The frontend uses static prerendered files and clean URLs, with a custom 404 page. The Express server and MySQL database require separate hosting.

Leave `VITE_SITE_INDEXABLE=false` until the final production domain is confirmed. Preview builds have noindex metadata, a blocking robots.txt, and an empty sitemap. For an indexable release, configure the confirmed HTTPS `VITE_SITE_URL`, HTTPS `VITE_API_URL`, `VITE_SITE_INDEXABLE=true`, and `SEO_FETCH_PUBLIC_DATA=true`. The latter performs read-only requests for current published blogs, gallery entries, and image assignments; failures stop an indexable build rather than silently omitting current content.

Rebuild after publishing, editing, unpublishing, or deleting blog content or changing public images. Existing static HTML remains available until replaced, so unpublishing requires rebuilding and invalidating the prior deployment/cache. There is no deployment automation configured by this change.

Production backend configuration requires the matching HTTPS `SITE_URL`, HTTPS `BASE_URL`, exact `CORS_ORIGINS`, and a correctly configured trusted proxy count. Remote production MySQL requires certificate-verified TLS. Use a database user with only the privileges needed by this app and its reviewed schema setup.

## Content and media

Existing business copy, images, blog records, and equipment were preserved. The verified inventory supplied for this work remains Sony A7M4, Sony A7M3, Rode PodMics, Audio Interface, Digitek lighting, Godox LC500R Light Stick, and Hollyland Lark M2.

Stock-photo portfolio/gallery startup seeding was removed from code; existing stored records were not deleted. Section-image metadata is centralized in `backend/data/siteSections.json`. Explicit admin image assignments reach the existing public image components while retaining genuine fallback images on network failure.

Runtime media, dependencies, build outputs, local audit caches, and environment files are ignored. Previously tracked uploads remain tracked until you approve a publication decision; adding .gitignore entries does not untrack them or remove historical copies.
