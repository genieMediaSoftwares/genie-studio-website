# Genie Studio backend

Express 5, MySQL2, bcrypt, JWT, Multer, Sharp, and configurable local/R2/Hostinger media storage.

For local development, keep private values in `backend/.env`; this file stays local and is ignored by Git. On the backend host, configure variables directly in its private environment settings. A local environment file is optional in production, and provider variables take precedence. Required: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a strong random `JWT_SECRET` of at least 32 characters. Configuration is checked before startup. Production also requires HTTPS `SITE_URL`, HTTPS `BASE_URL`, exact `CORS_ORIGINS`, and `DB_SSL=true` for remote MySQL. An optional `DB_SSL_CA` supplies a private CA; certificate verification stays enabled.

Additional backend variables are `NODE_ENV`, `PORT`, `JWT_TTL`, and `TRUST_PROXY_HOPS`. Set `STORAGE_PROVIDER` to `local`, `r2`, or `hostinger`. R2 uses `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_DOMAIN`. Optional Hostinger integration uses `HOSTINGER_UPLOAD_URL` and `HOSTINGER_UPLOAD_TOKEN`; optional contact delivery uses `CONTACT_WEBHOOK_URL` and `CONTACT_WEBHOOK_TOKEN`. The maintenance backfill uses `BACKFILL_ALLOWED_ORIGINS`. Keep all private credentials and tokens in backend variables without a `VITE_` prefix.

`npm start` starts the server. `npm test` runs isolated tests. Importing `createApp` does not open database connections when tests supply an isolated database and disable initialization. No default admin account is provisioned. Administrator passwords must be bcrypt hashes; plaintext records cannot authenticate.

Existing startup table/column initialization is retained. New image rows record storage provider/bucket metadata. Portfolio and gallery demo seeding is disabled. Existing media and database records are never deleted as part of startup. Review schema privileges before first deployment; no schema changes were run during the local review.

Protected endpoints validate an HS256 JWT and verify the administrator still exists. Login has a bounded per-IP rate limit; configure exact proxy trust and add shared/proxy rate limiting when using multiple backend instances. Browser clients use tab-scoped bearer sessions. CORS is a browser policy and does not replace authentication.

Images are buffered up to 5 MB, checked for matching extension and MIME type, fully decoded, bounded to 40 megapixels, and re-encoded with metadata removed before storage. PNG/WebP use lossless encoding; JPEG uses maximum quality. Public filenames are generated. No unvalidated temporary file is written to the public uploads directory. Derivatives retain the existing responsive width ladder.

Local writes never overwrite different existing bytes. R2 failures never silently forward media to Hostinger. Legacy Hostinger is supported only through explicit `STORAGE_PROVIDER=hostinger` and a reviewed `HOSTINGER_UPLOAD_URL`; production requires `HOSTINGER_UPLOAD_TOKEN` and a handler that verifies it. Deletion of unknown/legacy storage is refused. Referenced images, including source-bundled images and drafts, cannot be deleted. A storage error does not remove the registry record or report success.

The native `POST /api/contact` endpoint validates and rate-limits enquiries, then uses optional `CONTACT_WEBHOOK_URL` and `CONTACT_WEBHOOK_TOKEN`. Configure the existing reviewed PHP handler here if retained. Until configured it returns 503 and directs visitors to call/email.

Public blog/detail/share routes only read published rows. Share output is escaped, permalinks are validated, and API/share responses are noindex/no-store. Public portfolio/gallery lists return real stored data or empty results.

The public source copy retains all section definitions with neutral placeholder paths. `scripts/image-urls.txt` is intentionally empty and the frontend source-image manifest contains no original image records. Keep these runtime files present. Only assign, upload, or backfill media approved for your deployment. Reference checks, storage-ownership checks, and authenticated media management remain enabled.

The optional backfill script permits only explicitly allowed HTTPS upload origins, verifies public DNS addresses, rejects redirects and embedded credentials, and limits download size. Its dry-run does not alter the schema. Do not run it against production until an authorized operator reviews the storage and database configuration.

Before production use, verify MySQL connectivity and TLS, hashed-admin login, storage uploads and deletion protection, published/draft articles, media assignments, and contact delivery in a staging environment. Keep database, signing, storage, and webhook credentials in the backend environment only.
