# CREATACANVAS / bigsocho

Responsive Next.js blog with a private publisher workspace and MySQL storage, prepared for Hostinger Node.js hosting.

## Features

- Full-image cards with small one-line titles, search and database-managed categories.
- Mobile: two side-by-side cards followed by a full-width horizontal card; video support remains.
- Private `/admin` email/password sign-in; no public signup or admin link in the footer.
- Overview, post search/status filters, article editor, preview, drafts, publish/update/delete.
- Cover image uploads and media library; image data persists in MySQL across deployments.
- Direct MP4/WebM video URLs, optional article image prompts, SEO descriptions and sitemap.
- Category management with protection against deleting categories in use.
- Activity history and database status. Legacy comment moderation remains at `/admin/comments`.
- Hashed passwords, signed secure sessions, origin validation, shared database login throttling, transactional revisions and draft access protection.

## Hostinger deployment

Read **[HOSTINGER.md](HOSTINGER.md)** for the complete steps. Requires Node.js-capable Business/Cloud hosting or a VPS, MySQL, and private environment variables. No hosting credentials, default password or GitHub publishing token are included.

Create the database and import [database/bootstrap.sql](database/bootstrap.sql) using phpMyAdmin. This imports the bundled posts without replacing existing database content. Then connect this repository as a **Next.js Node.js app** in Hostinger and configure environment variables before deploying.

```sh
npm ci
npm run admin:hash
# Set private credentials and MySQL configuration in the hosting environment.
npm run build
npm start
```

For development, copy `.env.example` to `.env.local`, set the local origin to `http://localhost:3000`, and run `npm run dev`. Escape each `$` in ADMIN_PASSWORD_HASH as `\$` in dotenv files; hPanel values use the raw hash. If using a local MySQL database, `npm run db:setup` creates tables and imports starter content idempotently.

## Content and storage

Runtime publishing uses MySQL, not GitHub commits. `content/posts.json` and `content/comments.json` are starter imports, while the other JSON files supply publisher pages. Uploaded cover images are private until referenced by a published post. Videos remain external HTTPS links. Large video uploads and multiple administrator accounts are not part of this version.

```sh
npm test
```

Validation limits and live setup checks are documented in HOSTINGER.md. Hostinger deployment, DNS and a live database require configuration in your own hosting account.

Before monetization, replace placeholder publisher contact details, verify image rights, and review privacy disclosures for services you actually enable. No ad code or analytics trackers are installed by this change.


## Security update / audit

Read [SECURITY-AUDIT.md](SECURITY-AUDIT.md) for findings, fixes, verification and remaining provider-side checks. Existing deployments must import [database/security-migration.sql](database/security-migration.sql) before this version. Passwords generated earlier in chat must be rotated privately. This update revokes sessions on logout and expires idle sessions.

```sh
npm run security:check
npm run security:history
# In the production hosting environment only (no secrets are printed):
npm run security:env -- --database
```

`npm start` forces production mode and runs the environment preflight. No permissive CORS is configured: browser writes require the configured exact origin. Public comment submissions are disabled. See HOSTINGER.md for rate limits and the least-privilege database setup.


## Consent and audience insights

A first-party cookie banner and preferences dialog control optional MySQL analytics. The footer Cookie settings control allows withdrawal. Owner-only Admin → Analytics reports consented page/blog views, estimated browsers, visits, UTC trends, popular content, sources and viewport categories. No third-party analytics key is required. See [ANALYTICS.md](ANALYTICS.md) for definitions, privacy limitations, testing, migration and daily retention cleanup.
