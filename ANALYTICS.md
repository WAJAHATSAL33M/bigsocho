# Cookie choices and first-party analytics

## What is included

- A responsive, non-blocking cookie banner using the journal's design: **Essential only**, **Accept analytics**, **Customize**, and a privacy-policy link.
- A keyboard-accessible native preferences dialog, with optional analytics off until accepted, and a **Cookie settings** footer control.
- No analytics identifiers or pageview writes before acceptance. Unknown, refused, expired and tampered choices fail closed. Withdrawn choices clear analytics browser/visit cookies. Do Not Track and Global Privacy Control are honored.
- A private **Admin → Analytics** screen: 7/30/90-day filters; page views, estimated visitors, visits and blog views; a UTC trend; popular pages/articles; referrer domains; broad viewport categories; genuine empty states.
- First-party MySQL collection. No Google Analytics, third-party tracking scripts, vendor keys, session replay or advertising cookies are introduced. Existing CSP and owner API guards remain in effect.

## Required Hostinger setup

1. Back up the database.
2. Import **database/analytics-migration.sql** using phpMyAdmin. This only creates `canvas_pageviews` and `canvas_analytics_limits`; it does not modify articles, images or owner credentials. If the earlier security migration has not been applied, import that too. New installs can use the updated bootstrap.sql; `npm run db:setup` also creates all tables idempotently.
3. Deploy the updated branch with the existing MySQL and private admin environment variables. No additional API key or public secret variable is required. Use the real canonical HTTPS origin in NEXT_PUBLIC_SITE_URL.
4. In the production environment run `npm run security:env -- --database`. It now checks the analytics tables too, without printing credentials.
5. Sign in to `/admin` and choose **Analytics** in the sidebar.
6. Use a separate signed-out browser profile to test real visitor analytics. Owner sessions are excluded, so refreshing the website while signed in will not increase counts.
7. Configure a daily Hostinger cron job to run `npm run analytics:prune` from the app directory with the production environment loaded. Alternatively invoke `node scripts/prune-analytics.mjs` with the Node.js executable/path supplied by Hostinger. Do not publish a web-accessible cleanup endpoint or include passwords in cron URLs.

## What is measured

| Metric | Meaning |
|---|---|
| Page views | Accepted, deduplicated page-load/client-navigation events on allowed public routes |
| Estimated visitors | Distinct first-party browser identifiers represented by keyed hashes, within the selected period |
| Visits | Distinct visit identifiers active in the period; a new ID is created after 30 minutes of inactivity |
| Blog views | Pageview events for articles that were published when the event was validated |
| Daily trend | UTC counts per day; missing days are zero-filled |
| Sources | External referrer hostname only, or Direct / internal; displayed counts are page views |
| Devices | Mobile/tablet/desktop viewport-size groups, not a hardware fingerprint |

These are **consenting browser estimates, not an exact number of people or all website visitors**. Cookie expiry/reset, consent withdrawal/re-acceptance, blockers, device sharing and admin/bot exclusions affect counts. No historical traffic is imported. Metrics begin only after deployment, setup and visitor acceptance. Daily unique counts cannot be summed to obtain period uniques. Historical article counts remain even if an article is later unpublished/deleted; only the owner can see the dashboard.

Article and total aggregates are read within one repeatable-read transaction for a coherent dashboard snapshot. Pageview event UUIDs have a unique index to deduplicate retries. Known bot agents are filtered as a best effort, not a guarantee of bot-free or fraud-proof analytics.

## Cookies and choice handling

Production names use the `__Host-` prefix; development names omit it. All are HttpOnly, SameSite=Lax, path `/`, and Secure on production HTTPS.

| Cookie | Purpose | Lifetime |
|---|---|---|
| canvas-consent | Signed, versioned necessary preference; records choice and issue time | Up to 180 days |
| canvas-visitor | Random first-party analytics browser ID, set only after acceptance | Up to 30 days, not refreshed on ordinary views |
| canvas-visit | Random first-party visit ID, set only after acceptance | 30 minutes, refreshed by measured views |

The existing owner session cookie is separate and remains necessary for sign-in. Choosing essential-only does not log the owner out. Browser privacy signals suppress analytics even when a prior accepted preference exists. If optional analytics is not configured, acceptance is disabled and essential-only remains available.

The server verifies consent for each collection request. The client sends no collection request until acceptance, and broadcasts preference changes across tabs with focus/page-show refresh as a fallback. Requests already in flight when consent is withdrawn may have been recorded while consent was still valid. Changing the preference stops future collection and clears identifiers, but does not automatically delete past stored events.

## Stored data and retention

Each event contains an event UUID, keyed hashes of browser and visit IDs, an allowed public pathname, optional article slug, a broad device category, a referrer domain and a UTC timestamp. The application does **not** store raw IP addresses, email addresses, full referrer URLs, URL query strings/fragments, raw user-agent strings or fingerprints in these tables. Hashes are purpose-separated with the existing server secret; rotating that secret changes analytics identities and invalidates consent signatures, requiring a fresh choice.

Records older than 90 days are pruned on collection and dashboard access. The daily cleanup is needed to enforce deletion even when the site is quiet. Expired browser limiter rows are also pruned. Database backups and Hostinger access/security logs have their own retention and may contain request information independently of optional analytics; review those settings separately.

Cookie IDs and hashes are pseudonymous, not guaranteed anonymous. The privacy notice has been updated, but the publisher must supply their real public privacy contact and review the final notice/services/retention before launch. This implementation does not claim regulatory certification or replace a legal review.

## Security and limits

- Exact-origin writes, bounded JSON bodies, validated UUIDs and public-route allowlists; draft/admin/API paths cannot be measured.
- The private reporting endpoint uses the existing owner session checks, shared read limiter and no-store caching. There is no public stats endpoint.
- Parameterized SQL, event deduplication, a 30-events/browser/minute counter and a 5,000-events/minute global budget. Counter cleanup limits stale-row accumulation.
- Raw identifiers are stored only in browser HttpOnly cookies; the database receives keyed digests. No new browser-accessible key or third-party script is needed.
- Collection failures never block website navigation. Use provider/edge bot controls for large-scale abuse; app-level throttles are not DDoS protection.

## Verification

Automated tests cover consent expiry/tampering, refusal and withdrawal, privacy signals, owner and draft exclusions, referrer minimization, date-window filling, private dashboard access, deduplicated/parameterized inserts, coherent summaries, limits and cookie isolation. Existing security checks are retained. Local HTTP checks additionally exercise preference lookup/refusal and absence of analytics IDs without consent.

Real Hostinger/MySQL setup and interactive browser checks remain required: refuse first, confirm no `/api/analytics` request or visitor/visit cookies; accept, navigate, confirm one event per view; withdraw, confirm cookies disappear and collection stops; test another tab and browser privacy signals. Finally inspect the private dashboard in desktop and mobile browsers. SQL tests use adapters rather than a running MySQL server in this environment.

Implementation validation: production build, all 40 automated tests, and local HTTP security/consent checks passed. npm audit reported zero known vulnerabilities. A live Hostinger/MySQL service and a full interactive browser visual pass were not available; perform the staging checks above before launch.
