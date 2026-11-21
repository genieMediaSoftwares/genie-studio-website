# Genie Studio

Genie Studio website with a React/Vite frontend and a separately hosted Express/MySQL backend.

This public source copy uses neutral placeholders. Company logos, original photos and videos, embedded previews, and original media URL inventories are excluded. Add only approved media through the existing admin image assignments. Routes, service copy, contact flow, authentication, and media management remain available; original local website files are maintained separately.

- [Frontend setup and Vercel configuration](Frontend/README.md)
- [Backend setup and hosting requirements](backend/README.md)

Install dependencies with `npm ci` in each application directory. Run `npm test` in `backend`; run `npm run lint`, `npm run build`, and `node scripts/check-site.mjs` in `Frontend`.

For local development, keep public frontend settings in `Frontend/.env` and private backend settings in `backend/.env`. Environment files, private credentials, runtime uploads, internal reports, and backups are excluded from this repository. Configure deployment variables directly in Vercel and the backend hosting provider; no local environment file needs to be uploaded. All `VITE_` variables are public browser configuration; backend secrets belong only in the backend environment. The application READMEs document the variable names.

For Vercel, select `Frontend` as the root directory, `npm run build` as the build command, and `dist` as the output directory. The backend requires separate hosting. Production indexing requires confirmed HTTPS frontend/API origins and a successful public-content snapshot; the default preview build remains non-indexable.
