# Equb · እቁብ

A transparent savings-circle (equb/ekub) manager for Ethiopian students and small traders.
One honest record of who has paid, whose turn it is, and how much is in the pot, with an optional read-only page members can check.

**Live URL:** _add after deploying_

## Run it (Windows, Mac or Linux)
Needs Node.js 20.9 or newer (use the latest LTS, it contains security fixes).
```bash
npm install
npm run dev
```
Open http://localhost:3000. No setup file is needed in development.

If `npm install` fails with an SSL or EPERM error: close VS Code, delete the `node_modules` folder, run `npm cache clean --force`, turn off VPN/antivirus web scanning, and try again. `.npmrc` already adds retries.

## Check it
```bash
npm run typecheck
npm run build
npm audit
```

## Environment variables (production)
| Name | Purpose |
|---|---|
| `AUTH_SECRET` | Signs session cookies. At least 32 characters. The app refuses to start in production without it. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `SITE_URL` | Public origin, e.g. `https://equb.vercel.app`. Used for og:image, sitemap and canonical URLs. |

## Deploy to Vercel
1. Push this folder to a GitHub repository (`.env.local` and `.data` are git-ignored).
2. Import the repository on vercel.com. The defaults are correct.
3. Add `AUTH_SECRET` and `SITE_URL` under Settings, Environment Variables, then redeploy.
4. **Storage note:** data lives in a JSON file (`/tmp` on Vercel) and resets on redeploy. Replace `lib/db.ts` with Postgres (Neon or Supabase) before real use.

## Security choices
- Next.js 16.4.3 and React 19.3.1, the patched versions after the October 14, 2026 security release. `npm audit` reports 0 vulnerabilities.
- Image optimizer switched off (`images.unoptimized`); the app uses no raster images.
- Three auth layers (proxy, layout, ownership check in every Server Action), signed `httpOnly` cookies, scrypt password hashing, sign-in rate limit, sanitised `?next=` redirect.
- Content-Security-Policy, HSTS, `X-Frame-Options`, `nosniff`, Referrer and Permissions policies.
- Keep Node.js patched: Node released security fixes on 21 October 2026 (22.23.4, 24.22.1, 26.12.1).
