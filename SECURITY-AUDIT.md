# Security audit and hardening — 27 October 2026

## Scope and result

Reviewed `WAJAHATSAL33M/bigsocho` main at `48998a357283b3e7267bf7ba5eddbbca432313af`, all application/API routes, client/server boundaries, persistence, inputs, uploaded files, dependencies, committed environment examples, public files, and every reachable object from the Git refs fetched during the audit. Applied fixes in a separate review branch.

**This is a source/dependency review with automated regression and local production HTTP testing, not a guarantee that the site cannot be compromised.** Live Hostinger credentials, environment values, filesystem, database grants, backups, DNS/CDN settings and server logs were not accessible. No production credentials were requested, printed or committed. No production data was changed and no Git history was rewritten.

## Findings and remediation

| Priority | Finding | Resolution / remaining action |
|---|---|---|
| Critical dependency advisory | Next.js 16.3.8 fell in the affected range of the October 14 upstream security release. This app does not currently use all affected features; exploitability on the deployed site was not established. | Updated and pinned Next.js and @next/env to 16.4.3, React/React DOM to 19.3.1, sharp to 0.35.5. npm audit now reports zero known advisories. Disabled the unused image-optimization endpoint. |
| High | Logout cleared the cookie but a copied, otherwise valid signed token could remain usable until expiry. | Added random session identifiers and server-side hashed session records, revocation on logout, 30-minute idle expiry and eight-hour absolute expiry. Credential/secret rotation invalidates sessions. Existing deployments must apply the migration before rollout. |
| High operational action | An admin password and matching hash were previously generated in chat. This is separate from Git history; the history scan cannot assess who has access to that conversation. | **Owner must generate a new password/hash privately and rotate SESSION_SECRET.** No replacement credential has been hard-coded or published by this audit. |
| Medium | Private API writes and uploads lacked shared action-specific limits. The unused anonymous comment API still accepted submissions with an in-memory address-based limiter. | Added MySQL-backed owner read/write, upload and public-media limits. Disabled new anonymous comments and removed the unused dialog. Kept private historical moderation. Login retains its shared five-attempt window and does not trust arbitrary client forwarding headers. |
| Medium / defense in depth | Publisher HTML was rendered without a sanitizer, CSP was absent, and uploaded images were checked by signature only. These are hardening gaps, not proof of a public XSS exploit. | Allowlist-sanitized publisher HTML, escaped plain-text article/form rendering, correct script-safe JSON-LD, per-response nonce CSP, no production unsafe-inline/unsafe-eval, no inline style attributes. Images are decoded with a 20-million-pixel cap and re-encoded to WebP without original metadata. |
| Medium | Remote database connections could be configured without TLS or explicit hostname verification. | Require verified TLS and a certified hostname for non-loopback production DB connections. Explicit prepared execution and multipleStatements=false. Real database permissions and TLS handshake still require provider-side verification. |
| Medium / operational | Framework patches, public-file checks and deployment secret checks were manual. | Exact dependency pins, lockfile, weekly Dependabot configuration, prebuild public-file scan, redacted environment checker and repeatable audit/HTTP commands. |
| Low / defense in depth | Security headers and sensitive-path protection were incomplete. | Added HSTS, nonce CSP, frame denial, nosniff, restrictive Permissions-Policy, same-origin resource policy, private/no-store for nonce HTML and private APIs, source-map suppression and sensitive file-path denial. Actual Hostinger web-root exposure still requires inspection. |

## Access-control model

This app has **one owner account and anonymous readers**, not a multi-tenant user/role system. There is no public signup, invite, password-recovery, or arbitrary role assignment API.

- `/admin` returns a sign-in screen unless an active server-backed owner session exists.
- `/admin/comments` requires that session and redirects anonymous requests.
- All admin reads and mutations have server-side authorization; CSP/proxy checks are not the sole authorization layer.
- Same-origin browser writes require the configured exact canonical origin; cross-site Fetch Metadata is rejected. API responses do not enable permissive Access-Control-Allow-Origin/credentials headers. CORS is not treated as authentication.
- Owner cookies use HttpOnly, SameSite=Strict, and Secure plus the `__Host-` prefix in production. Session records store only token digests, not bearer tokens or passwords.
- Public article/homepage/sitemap reads exclude drafts. Draft-only and unattached database images require the owner session. Media responses are no-store and vary on Cookie, with an image MIME allowlist and same-origin resource policy.
- User text stays text and is escaped by React; it is not interpreted as HTML. Validation limits and whitelists fields and URL schemes. JSON requests require application/json and reject oversized bodies, array roots, excessive nesting and prototype-related keys. Internal errors are not returned verbatim.

## Passwords and secrets

New passwords use salted scrypt with N=32768, r=8, p=3 (64 MB max-memory allowance). Verification uses constant-time comparison. The `scrypt-v2$` format records the upgraded version; older `scrypt$` hashes remain temporarily accepted to avoid silently locking out an existing owner during migration, and the environment checker warns about them. Rotate to v2 privately.

Only NEXT_PUBLIC_SITE_URL is used publicly by the app. DB credentials, ADMIN_PASSWORD_HASH and SESSION_SECRET remain in server modules/hosting environment settings. `.env*` files, keys and common backups/dumps are ignored by Git. Ignoring a file is not a substitute for revoking a credential that was ever committed or otherwise exposed.

Run **`npm run security:env -- --database` in the production app environment**. This checks presence/format, HTTPS origin, public-secret variable names, production/debug settings, database schema and overly broad DB grants. It prints check names/status and warnings, not values. It cannot prove a secret is random or unexposed, nor automatically change Hostinger account settings. Never paste a raw env file or password into chat.

## Dependency audit

At audit time:

| Check | Before | After |
|---|---|---|
| npm advisory findings | 1 critical dependency entry | 0 info/low/moderate/high/critical entries |
| Next.js | 16.3.8 | 16.4.3 |
| React / React DOM | 19.2.x from prior lockfile | 19.3.1 |
| MySQL driver | 3.24.6 | 3.24.6 (pinned) |
| Image processor | framework-provided | direct sharp 0.35.5 (pinned) |
| HTML sanitizer | absent | sanitize-html 2.18.1 (pinned) |

Zero registry advisories does not mean zero vulnerabilities. Re-run audits regularly and review Dependabot PRs. No automatic dependency PR merge is enabled by this change.

## Git history and exposed-file checks

- Scanned **37 reachable commits** across the fetched main/remote branch refs and their blobs, plus non-ignored current files.
- No high-confidence secret pattern was found. One initial manual-review match was an empty token placeholder crossing into the next template line; inspection confirmed it was not a credential, and the scanner's whitespace handling was corrected.
- The scanner covers common provider-token/private-key patterns, credential-bearing database URLs and credential assignments, with redacted fingerprints/locations only. It does not verify keys with external providers. Unknown formats, deleted/unfetched refs, forks, CI logs/artifacts, ignored local files, chat and Hostinger settings remain outside this scan.
- No sensitive file types/secret markers were found under the repository's `public` directory. Builds now fail this check if such files are added. This does not inspect a separately uploaded provider web root.
- No history rewrite was performed because there was no confirmed historical credential to remove. If a leak is discovered later, revoke/rotate first, then coordinate history cleanup and fork/cache handling.

## Tests and observations

- **27 automated tests passed**, including existing publishing/category concurrency checks, owner authentication, session invalidation, draft media, body limits/prototype keys, XSS sanitizer/JSON-LD cases, actual image decoding, shared throttles, remote TLS configuration and env-output redaction.
- **Production build passed** with Next.js 16.4.3.
- **Local production HTTP checks passed**: anonymous private reads return 401, cross-origin writes return 403, middleware-header spoofing does not bypass authorization, no permissive CORS on API/preflight, sampled sensitive paths return 404, public comments reject writes, security headers/private caching exist, script nonces match the response CSP across sampled pages, and JSON-LD parses correctly.
- Transaction/session/limiter tests use adapters rather than a live MySQL service. A real Hostinger/MySQL login, migration, logout replay and privilege/TLS check must be performed after setup.
- A full interactive browser visual pass was not performed in this environment. The HTTP checks verified emitted CSP/script nonce consistency and absence of inline style attributes, but browser rendering and editor flows must still be exercised on staging after deployment.
- Read-only checks of `https://brandifya.com` returned `/` 200, `/admin` 404, `/.env` and `/.git/config` 403, and sampled SQL/package paths 404. The expected app security headers were not observed on the homepage. These responses do not establish that this repository is currently deployed there. No login attempts, brute force, destructive probing or production writes were performed.

## Required rollout order

1. Back up the database. Import **database/security-migration.sql** using phpMyAdmin or run the idempotent `npm run db:setup` with a migration account. New installations use the updated bootstrap SQL.
2. Generate a new admin password/hash and random session secret privately. Replace the chat-generated credential. Remove unused plaintext ADMIN_PASSWORD, obsolete GitHub tokens and any secret mistakenly put under NEXT_PUBLIC_. Rotate provider keys that were exposed outside Git even if this scan is clean.
3. Configure the production canonical HTTPS origin and server-only environment variables. For remote MySQL set DB_SSL=true and use its certified hostname; do not disable certificate or hostname verification. Use a runtime account restricted to SELECT/INSERT/UPDATE/DELETE on app tables, with separate migration credentials where possible. Do not expose port 3306 publicly for loopback hosting.
4. Run the redacted production environment/schema/grant check. Enable Hostinger backups, monitoring, edge/WAF rate limits and bot controls. The application limit is not network-level DDoS protection; the global owner login window trades some availability for resistance to header-spoofed brute force.
5. Merge/deploy this branch as a Node.js app, not source files in a static/public root. Re-authenticate after the cookie/session migration. Exclude private responses and nonce HTML from CDN caching.
6. Verify login, idle timeout, logout invalidation, draft URL/media denial, publishing, uploads, headers and CORS on the real staging/production origin. Browser-test the editor and media previews. Restrict hosting/GitHub account access and enable account MFA.

## Repeatable commands

```sh
npm ci
npm run security:check
npm run build
npm run security:http
npm run security:history
# Hostinger production environment, with private variables already configured:
npm run security:env -- --database
```

The HTTP command starts an isolated loopback server with no database credentials; it does not target an external website. Development mode remains available only through npm run dev; npm start forces production and runs the env preflight. If a provider adapter bypasses npm start, set production mode in its configuration and run the checker separately.

## References

- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://nextjs.org/docs/app/guides/content-security-policy
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
