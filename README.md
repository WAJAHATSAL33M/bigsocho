# CREATACANVAS

Next.js App Router implementation of the approved desktop and mobile blog design. Includes eight complete article pages, search, category filters, browser-local likes and bookmarks, About, Editorial Policy, Privacy and Contact pages, sitemap and robots routes.

## Run

Node.js 20.9 or newer is required.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to your real public website origin before building. This controls canonical URLs, article metadata and the sitemap.

```sh
npm run build
npm run start
```

## Edit content

Articles live in `content/posts.json`. Publisher pages live in the other JSON files in `content/`. Styles are in `app/globals.css`; images are in `public/assets/`.

## Before AdSense submission

Supply a real public contact address and review the publisher pages. Confirm rights to the supplied reference images or replace them with owned/licensed assets. Review the AI-assisted articles and add substantiated original experience where appropriate. Make the production website public and use an eligible address you can verify. Install the exact verification code and ads.txt entry from your own AdSense account; no fake publisher ID or ad scripts are included. Update privacy disclosures and implement applicable consent controls before enabling ads. Approval is decided by Google.

## Deployment

This is a standard Next.js project; import the repository into a compatible Node.js/Next.js hosting provider. No hosting account or deployment has been configured by this conversion.

## Admin panel

Open `/admin` to sign in, create or edit a post, preview it, save a draft, or publish. Covers can use the included image library or an HTTPS image URL you have permission to use. Published posts appear immediately; draft posts are excluded from the homepage, article routes, and sitemap.

Configure these **server-side** environment variables on your Next.js host:

- `ADMIN_PASSWORD`: at least 12 characters, preferably a long unique password.
- `SESSION_SECRET`: at least 32 random characters. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `GITHUB_TOKEN`: a fine-grained token restricted to this repository, with **Contents: read and write** permission. Do not paste this into chat or commit it.
- `GITHUB_REPOSITORY`: `WAJAHATSAL33M/bigsocho`.
- `GITHUB_BRANCH`: `main`.
- `NEXT_PUBLIC_SITE_URL`: the exact public origin, such as `https://your-domain.com`. Required for production sign-in and same-origin checks.

Saving creates a GitHub commit in `content/posts.json`; optimistic revision checks reject concurrent edits rather than overwrite them. The public blog reads the current file from GitHub at runtime. It does not rely on a redeployment for a newly published post to appear. GitHub availability and API limits therefore affect content availability; this storage is intended for a small blog, not high-traffic publishing. Without a GitHub token, the bundled initial articles remain readable but admin saving is disabled.

Sessions expire after eight hours and use signed HttpOnly, SameSite Strict cookies with Secure enabled in production. Password or session-secret rotation invalidates sessions. The sign-in endpoint has a per-process attempt limiter; add host-level rate limiting for a multi-instance deployment. Admin routes are excluded from indexing. This setup supports a single administrator and does not provide account invitations or password recovery.

```sh
npm test
```
