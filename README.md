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
