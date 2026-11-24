# Genie Studio backend

Express 5, MySQL2, bcrypt, JWT, Multer, Sharp, and configurable local/R2/Hostinger media storage.

For local development, keep private values in `backend/.env`; this file stays local and is ignored by Git. On the backend host, configure variables directly in its private environment settings. A local environment file is optional in production, and provider variables take precedence. Required: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a strong random `JWT_SECRET` of at least 32 characters. Configuration is checked before startup. Production also requires HTTPS `SITE_URL`, HTTPS `BASE_URL`, exact `CORS_ORIGINS`, and `DB_SSL=true` for remote MySQL. An optional `DB_SSL_CA` supplies a private CA; certificate verification stays enabled.

Additional backend variables are `NODE_ENV`, `PORT`, `JWT_TTL`, and `TRUST_PROXY_HOPS`. Set `STORAGE_PROVIDER` to `local`, `r2`, or `hostinger`. R2 uses `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_DOMAIN`. Optional Hostinger integration uses `HOSTINGER_UPLOAD_URL` and `HOSTINGER_UPLOAD_TOKEN`; optional contact delivery uses `CONTACT_WEBHOOK_URL` and `CONTACT_WEBHOOK_TOKEN`. The maintenance backfill uses `BACKFILL_ALLOWED_ORIGINS`. Keep all private credentials and tokens in backend variables without a `VITE_` prefix.

`npm start` starts the server. `npm test` runs isolated tests. Importing `createApp` does not open database connections when tests supply an isolated database and disable initialization. No default admin account is provisioned. Administrator passwords must be bcrypt hashes; plaintext records cannot authenticate.

## Reset an existing administrator password

A plaintext value in `admins.password` intentionally returns 401 at `/api/login`. Use the privileged terminal command below to replace only that existing account's password with a salted bcrypt hash (cost 12). No public reset endpoint or plaintext-login fallback is provided.

From the backend directory, on a trusted machine or the backend host with the intended database environment configured, run:

```sh
npm run admin:reset-password -- --email existing-admin@example.com
```

Replace the example email with the existing account email. Enter the new password and its confirmation at the hidden prompts. Use at least 12 characters and at most 72 UTF-8 bytes. Do not put the password in the command, shell history, environment variables, logs, or chat. The command reads backend database variables from the host environment or optional local `backend/.env`; it does not require or change a JWT secret.

The reset checks for an InnoDB `admins` table and a text password column that holds at least 60 characters. It requires exactly one matching account, locks that row, changes only `password` with bound parameters, verifies the stored hash, and commits. Missing/duplicate accounts, truncation, and update failures abort; no account, blog, gallery, or other record is inserted or deleted. No schema migration is run automatically.

After deploying the reset files and running the command once against the intended database, sign in at the frontend `/admin` page with the existing email and new password. There is no frontend change. Existing JWTs remain valid until expiry; immediate global session invalidation requires a separately authorized private JWT-secret rotation. Database records, local environment values, and credentials are not changed by installing this code alone.

## Create a separate administrator (approval required)

The existing reset command changes an existing password. The new `scripts/create-admin.js` creates a separate account and leaves all existing administrators intact. It is a privileged, manually run CLI command, never an API endpoint or startup task. No frontend changes are needed. Use it once for the approved account; do not schedule it or add it to deployment hooks.

The local authentication code in `server.js` looks up `admins` by email, requires a valid bcrypt password, and issues an HS256 JWT. Each protected API request also checks that the token's admin ID and email still exist. All rows in `admins` have administrator access; there is no role or `disabled` column check. The documented schema is `id INT AUTO_INCREMENT PRIMARY KEY`, `email VARCHAR(255) NOT NULL UNIQUE`, `password VARCHAR(255) NOT NULL`, and nullable `createdAt`/`updatedAt` BIGINT columns using InnoDB. This documentation is not evidence of the actual production schema or deployed code version.

### 1. Identify the actual backend host first

Hostinger hosting the MySQL database does not establish where `api-studio.geniemedia.in` runs. Check your hosting accounts for the app serving that custom domain. The project handover mentions Render or a VPS as possibilities, not a confirmed deployment. Inspect existing DNS records read-only if necessary; do not edit them.

If the Node.js backend is hosted on Hostinger, open its website dashboard, then Files → File Manager → Terminal, or use SSH with the details from hPanel's SSH Access screen. The terminal requires a supported plan and SSH access. Follow [Hostinger's terminal instructions](https://www.hostinger.com/support/how-to-use-the-terminal-in-hostinger-file-manager/). If the backend is on another provider, use that provider's app shell or the VPS terminal. Run the command from the actual backend directory containing `server.js` and `package.json`, with Node.js 18+ and the existing backend dependencies available. Do not assume the frontend's `public_html` directory is the Node.js backend.

No upload, push, deployment, restart, DNS edit or production database write has been authorized by preparing these files. Obtain owner approval before transferring the maintenance files to production. Only the following files are needed if their dependencies already exist on the host:

- `scripts/create-admin.js` and `lib/adminCreation.js` (new).
- `lib/config.js`, `scripts/reset-admin-password.js`, and `lib/adminPasswordReset.js` (existing shared configuration and hidden-prompt code; review the host versions first).

The direct `node` commands below do not need the new npm aliases in `package.json`. Do not upload your local `.env`, replace the server, redeploy unrelated local changes, or install this script under a publicly served directory. No backend restart is needed just to insert an administrator.

### 2. Verify the intended production database with read-only checks

In the live backend hosting dashboard, inspect its private `DB_HOST`, `DB_NAME` and `DB_USER` settings and compare them with the existing Hostinger database under Websites → Manage site → Databases → Management. Include the full database/user prefixes shown by Hostinger. Never copy `DB_PASSWORD`, `JWT_SECRET`, passwords, hashes or full environment dumps into chat or logs.

Ensure the app shell receives the same database settings as the running backend. Dashboard app variables may not automatically be inherited by an SSH session. The CLI loads optional `backend/.env` and gives existing environment values precedence, just like this backend. A matching local `.env` alone does not prove the deployed process uses it. Do not change production settings as part of this check.

From that backend directory, run:

```sh
node scripts/create-admin.js --check
```

With no arguments the command also defaults to this read-only mode. It reports configured host/database/user, the selected database (`DATABASE()`), MySQL server hostname and account (`CURRENT_USER()`), table engine, column metadata and safety checks. It never selects stored passwords or content records. Match this output to both the running app configuration and Hostinger's intended database; successful connectivity alone does not prove it is the intended database. If needed, compare these safe identifiers in phpMyAdmin's SQL tab using `SELECT DATABASE(), @@hostname, CURRENT_USER();` (the phpMyAdmin account may differ from the app account).

Remote database connections require `DB_SSL=true` and a trusted server certificate, regardless of local `NODE_ENV`. A private `DB_SSL_CA` can provide the trusted CA. Do not disable certificate verification. For an app actually running on the same Hostinger hosting environment as MySQL, Hostinger documents `127.0.0.1`; an external backend uses its remote database hostname. Never substitute localhost on a different host. See [Hostinger's Node.js/MySQL connection guide](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/). If secure connectivity is unavailable, stop and resolve it with the host before proceeding; configuration changes require separate approval.

The command blocks creation if the table is not InnoDB, ID is not an auto-increment integer primary key, password cannot hold a bcrypt hash, email lacks a full-column unique index, additional required columns need values, or triggers could affect other records. It requires direct TRIGGER metadata visibility (global, database or table privilege); role-only permissions or hidden trigger metadata need DBA review. It never changes schema or grants permissions. Any schema discrepancy must be reviewed separately rather than automatically repaired.

### 3. Obtain approval, then create one new account

Before the write, show the owner the checked target database identity and proposed new admin email, and obtain explicit approval to insert exactly one new administrator. Do not send the new password in chat. Keep any existing backups private because old admin records may contain plaintext passwords; do not export the admin table to chat or logs.

Only after that approval, run interactively:

```sh
node scripts/create-admin.js --create
```

Enter a new email, new password and password confirmation at hidden prompts. None of the keystrokes are echoed. Use a password manager to generate a unique password, preferably 16+ characters. The command enforces at least 12 characters, at most 72 UTF-8 bytes (bcrypt's limit), and at least three of lowercase, uppercase, numbers and symbols. It accepts no password/email command-line arguments, password environment variables, piped credentials or unattended `--yes` bypass.

Review the displayed target and proposed email. Type the exact `CREATE <email> IN <database>` confirmation printed by the command. Entering anything else or cancelling before creation makes no account change. This terminal confirmation is an additional guard; it does not replace obtaining the owner's approval first.

The command rechecks the database identity and schema, rejects existing emails (including database-collation matches), and uses a parameterized INSERT with a salted bcrypt hash at cost 12. The unique index also prevents concurrent duplicates. It verifies the inserted row/hash privately before committing. Ordinary insert/verification failures roll back; if a network failure makes a commit outcome uncertain, inspect only the new account's ID/email before retrying. There are no UPDATE/DELETE statements, content writes, schema changes or public registration endpoints. The old admin is retained.

### 4. Verify live login after creation

After the account is committed, the command offers a `VERIFY` prompt. This sends the new credentials only to `https://api-studio.geniemedia.in/api/login`, refuses redirects, checks for a successful token response, and uses the token for a read-only request to `/api/admin/blogs`. No passwords, hashes, JWTs, or blog content are printed. Database success and live login success are reported separately. A verification failure leaves the created account intact and exits unsuccessfully; do not run creation again or remove the old account to fix a login problem.

To retry verification independently, run:

```sh
node scripts/create-admin.js --verify-login
```

Enter the new email and password at hidden prompts. This mode does not connect directly to MySQL. Then open `https://studio.geniemedia.in/admin` in a private/incognito window, sign in with the new credentials, and confirm the existing dashboard loads without editing any records. This browser check additionally verifies the deployed frontend/CORS path. If the database insert succeeds but live login returns 401, recheck which database the live backend uses and its deployed authentication code. Never add a plaintext login fallback.

### 5. Retire the old account only after confirmation and separate approval

The reviewed local backend already rejects a plaintext password during login, but an existing JWT for that account can remain valid while its ID and email still exist. The current authentication code does not support disabling a row with an `active` flag; adding such a field alone would have no effect.

After both live API and browser login are confirmed, recommend a separately approved transaction deleting just the old admin row matched by its verified ID and email, with the expected affected-row count of one. Do not delete by password format or bulk-delete administrators. With this reviewed backend, protected requests for that deleted ID/email are rejected immediately; confirm the deployed middleware matches before relying on this. Another option requiring separate approval is adding and enforcing account disablement in login and JWT middleware. Merely changing the old password does not revoke its existing tokens. No retirement SQL is executed by the creation command.

After successful provisioning, remove the temporary maintenance files from the production host through a separately approved cleanup, or keep them private and executable only by trusted operators. Never remove shared files that the application needs.

Existing startup table/column initialization is retained. New image rows record storage provider/bucket metadata. Portfolio and gallery demo seeding is disabled. Existing media and database records are never deleted as part of startup. Review schema privileges before first deployment; no schema changes were run during the local review.

Protected endpoints validate an HS256 JWT and verify the administrator still exists. Login has a bounded per-IP rate limit; configure exact proxy trust and add shared/proxy rate limiting when using multiple backend instances. Browser clients use tab-scoped bearer sessions. CORS is a browser policy and does not replace authentication.

Images are buffered up to 5 MB, checked for matching extension and MIME type, fully decoded, bounded to 40 megapixels, and re-encoded with metadata removed before storage. PNG/WebP use lossless encoding; JPEG uses maximum quality. Public filenames are generated. No unvalidated temporary file is written to the public uploads directory. Derivatives retain the existing responsive width ladder.

Local writes never overwrite different existing bytes. R2 failures never silently forward media to Hostinger. Legacy Hostinger is supported only through explicit `STORAGE_PROVIDER=hostinger` and a reviewed `HOSTINGER_UPLOAD_URL`; production requires `HOSTINGER_UPLOAD_TOKEN` and a handler that verifies it. Deletion of unknown/legacy storage is refused. Referenced images, including source-bundled images and drafts, cannot be deleted. A storage error does not remove the registry record or report success.

The native `POST /api/contact` endpoint validates and rate-limits enquiries, then uses optional `CONTACT_WEBHOOK_URL` and `CONTACT_WEBHOOK_TOKEN`. Configure the existing reviewed PHP handler here if retained. Until configured it returns 503 and directs visitors to call/email.

Public blog/detail/share routes only read published rows. Share output is escaped, permalinks are validated, and API/share responses are noindex/no-store. Public portfolio/gallery lists return real stored data or empty results.

The optional backfill script permits only explicitly allowed HTTPS upload origins, verifies public DNS addresses, rejects redirects and embedded credentials, and limits download size. Its dry-run does not alter the schema. Do not run it against production until an authorized operator reviews the storage and database configuration.

See `../PRODUCTION_REVIEW.md` for publication blockers and manual verification requirements.
