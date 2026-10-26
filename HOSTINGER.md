# Deploy CREATACANVAS on Hostinger

This version uses **Next.js + MySQL**, with one private owner account. GitHub stores source code only. Publishing, categories, images and comments no longer need a GitHub token or a redeployment.

## 1. Confirm your hosting supports Node.js

Use Hostinger **Business Web Hosting or a Cloud plan with Node.js web apps**. A VPS also works with manual setup. This is not a PHP/static-upload app; a Premium/static-only plan cannot run the private admin/API server.

Official instructions:
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/

Do not use the old Namecheap `server.js`, `public_html/_next` copying steps or `process.env.GITHUB_TOKEN = ''` workaround. Hostinger builds and serves the whole Next.js application.

## 2. Create a MySQL database

In hPanel open **Websites → Dashboard → Databases → Management**. Create a database and user. Save the password privately. Copy the **full prefixed names** shown in hPanel (for example, `u123456789_journal`). For Hostinger-managed Node.js apps use `127.0.0.1` as DB_HOST, not `localhost`.

Open phpMyAdmin for that database and **Import `database/bootstrap.sql` from this repository**. This creates the tables and imports the eight existing articles, existing comments, and categories. It is safe to re-import: `CREATE TABLE IF NOT EXISTS` and `INSERT IGNORE` preserve existing database content. Keep database backups before future upgrades.

Alternative with terminal access: configure environment variables, then run `npm run db:setup`. That reads bundled `content/posts.json` and `content/comments.json` and preserves existing rows. Never run the setup against an unrelated database.

## 3. Generate your private login credentials

On your own computer install Node.js 22+, download/clone the repository, then run:

```sh
npm ci
npm run admin:hash
```

Enter a unique password of at least 12 characters. Terminal input is hidden when supported. Save your original password in your password manager; the script outputs only the salted password hash. The website stores neither a default password nor a plaintext admin password.

Generate a random session secret:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Choose your private owner email address. There is no signup page. Changing the hash, email or session secret invalidates existing admin sessions. To reset a forgotten password, run the hash command again and update the variable in Hostinger.

## 4. Import the GitHub repository in Hostinger

In hPanel choose **Add website → Node.js web app → GitHub**, authorize the repository and select the branch containing this change (or `main` after merging). Configure:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Node.js | 22.x or newer supported LTS |
| Root directory | Repository root (`.`) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command, if requested | `npm start` |

Use Next.js framework detection; leave output settings at Hostinger’s Next.js defaults. Do not select static export or manually upload the source into a public web root.

## 5. Set environment variables

Add these in Hostinger's deployment environment settings **before building**:

| Name | Value |
|---|---|
| NODE_ENV | `production` |
| NEXT_PUBLIC_SITE_URL | Exact HTTPS origin, e.g. `https://brandifya.com` |
| DB_HOST | `127.0.0.1` for Hostinger-managed MySQL |
| DB_PORT | `3306` |
| DB_NAME | Full database name from hPanel |
| DB_USER | Full database username from hPanel |
| DB_PASSWORD | The database password |
| ADMIN_EMAIL | Your owner email |
| ADMIN_PASSWORD_HASH | Complete raw `scrypt$…$…` value from the script |
| SESSION_SECRET | Random secret from the command above |

In hPanel enter values without surrounding quotes; preserve `$` in the password hash. For local `.env.local` only, escape each `$` in the hash as `\$` because Next.js expands environment variables in dotenv files. Never prefix a secret with NEXT_PUBLIC_. Do not commit a real `.env` file or send credentials in chat.

Remove the obsolete `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_BRANCH` and `GITHUB_REPOSITORY` variables. They are not used.

For local development set NEXT_PUBLIC_SITE_URL to `http://localhost:3000` and run `npm run dev`. Production admin cookies require HTTPS. Use the exact domain you visit for sign-in; a different www/non-www origin will fail CSRF checks.

## 6. Deploy, connect the domain, then verify

Deploy the app, connect the domain using the records Hostinger supplies, and enable HTTPS. Open `/admin` directly and sign in with your owner email and original password.

Verify:
1. **System & activity** reports a connected database.
2. Create a draft and confirm it is not on the homepage or accessible publicly by its article URL.
3. Upload a JPEG/PNG/WebP under 2 MB. Unpublished uploads require admin access; an uploaded cover becomes public only when referenced by a published post.
4. Publish, confirm the post appears immediately, then edit it and verify changes.
5. Add a category and select it in a post. Categories in use cannot be deleted.
6. Sign out and confirm admin APIs reject unauthenticated requests.
7. Redeploy and confirm your posts and images remain in MySQL.

Media library stores images in MySQL so deployment-local files are not required. Videos use direct HTTPS MP4/WebM URLs from your media host; large video binary uploads are not supported. Uploaded images are capped at 2 MB. Some MySQL hosts use a small max_allowed_packet: if uploads fail with ER_NET_PACKET_TOO_LARGE, use a smaller image or ask Hostinger to adjust the limit.

## Troubleshooting

| Symptom | Check |
|---|---|
| Admin says configuration needed | All DB_* and private login variables are set; password hash preserved literally |
| Database unavailable | Correct full DB/user names, password, `127.0.0.1`, and bootstrap SQL imported |
| Sign-in origin rejected | NEXT_PUBLIC_SITE_URL matches the exact HTTPS origin you are visiting |
| Too many attempts | Wait 15 minutes; the shared MySQL limiter allows five sign-in attempts per window |
| Static asset 404 | Deploy as a Next.js Node.js app and rebuild from the repository; remove old domain/static routing |
| Save conflict | Copy any unsaved text, refresh the post list, and reopen the article |
| Uploaded image 404 | Draft-only and unattached images require an authenticated admin session |

Admin is excluded from indexing, protected with an HttpOnly/Secure/SameSite Strict signed cookie, same-origin write checks, a salted scrypt password hash, and a database-backed login limiter. API responses do not expose database credentials. No public registration, default credentials or email password-recovery service is provided. This is single-owner access, not a multi-user roles system. Use your Hostinger database backups for recovery.

## Implementation / validation notes

Content collections use InnoDB rows containing JSON text with revisions and transactional row locks. Uploaded images, login attempt counters and activity records have separate tables. New deployments without DB settings show bundled content, with admin saving disabled. With DB settings present, database errors fail explicitly rather than silently switching to stale bundled content.

`npm test` covers credentials, sessions, CSRF checks, draft filtering, post validation, upload validation, comment visibility, and transactional post/category behavior with an in-memory transaction adapter. `npm run build` validates the production application. Actual HTTP checks also verified that anonymous admin reads return 401 and cross-origin writes return 403. A full browser pass could not be completed in the build environment because the Chromium download failed; verify the responsive admin in your own browser. No live MySQL credentials were available, so database tests use the transaction adapter rather than a running Hostinger database. Tests do not substitute for the real Hostinger/MySQL verification above.
