# Second App

Multi-vendor marketplace for certified pre-owned products.

Monorepo, managed by [Turborepo](https://turbo.build):

| Path | What |
| --- | --- |
| `apps/web` | Next.js 16 storefront + vendor dashboard |
| `apps/admin` | Next.js admin panel (`admin.gosecond.in`) |
| `apps/mobile` | Flutter app placeholder |
| `packages/database` | Prisma schema, migrations, seed, search-vocab builder |
| `packages/shared` | Shared types + constants |
| `packages/config` | Shared config stubs |

## Local setup

```bash
cp .env.example .env
# Fill in DATABASE_URL + JWT_SECRET at minimum
npm install
npm run db:generate
npm run db:migrate          # creates the initial migration on first run
npm run db:seed              # loads demo catalog + admin user (9999999999)
npm run db:build-search-vocab
npm run dev                  # starts apps/web and apps/admin via turbo
```

Web lives on `http://localhost:3000`, admin on `http://localhost:3001` (or whichever port Next picks).

In dev mode with no SMS provider configured, OTPs are printed to the server console — the login UI shows a banner telling you where to look. The seeded admin user is phone `9999999999` (admin panel only).

## Production deploy

The app is designed to run on Vercel (one project per app) + a Postgres database somewhere (Neon / Supabase / RDS), with S3 or Cloudflare R2 for uploads. Nothing is Vercel-specific — Railway / Render / Fly work the same way.

**Before the first deploy:**

1. Create a Postgres database. Set `DATABASE_URL`.
2. `openssl rand -base64 48` → `JWT_SECRET`. **Both web and admin must share the same value** — they share the `sa_session` cookie.
3. Pick providers and fill the rest of `.env.example`:
   - **SMS**: `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID`. Without these, OTPs log to the server console, which is fine for staging but not production.
   - **Email** (optional): `RESEND_API_KEY` + `EMAIL_FROM`.
   - **Payments** (optional for launch): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Without these, checkout uses a mock provider that instantly settles — acceptable for a soft launch.
   - **Storage**: `S3_BUCKET` + credentials. Without these, uploads land under `apps/web/public/uploads` which is fine locally but won't survive a stateless redeploy.
4. Run the initial migration from a box with network access to the database:

   ```bash
   DATABASE_URL=... npm run db:migrate:deploy
   DATABASE_URL=... npm run db:seed                  # only on a brand-new db
   DATABASE_URL=... npm run db:build-search-vocab
   ```
5. Build both apps: `turbo build`. Each Next.js app deploys as an independent project; point `gosecond.in` at `apps/web` and `admin.gosecond.in` at `apps/admin`.

**Health checks**: `GET /api/health` on either app hits Postgres with `SELECT 1` and returns `{ ok, db, latencyMs }`. Wire that to your uptime monitor.

**Rebuilding the search vocabulary**: re-run `npm run db:build-search-vocab` periodically (daily cron is fine) to roll frequent user queries from `SearchQueryLog` into the autosuggest index.

## Scripts

| Command | What |
| --- | --- |
| `npm run dev` | Run both Next apps in dev mode via turbo |
| `npm run build` | Build all workspaces |
| `npm run db:migrate` | Create + apply a dev migration (interactive) |
| `npm run db:migrate:deploy` | Apply pending migrations in production |
| `npm run db:seed` | Seed catalog + demo vendors + admin user |
| `npm run db:build-search-vocab` | Rebuild the autosuggest `SearchTerm` table |
| `npm run db:studio` | Open Prisma Studio against `DATABASE_URL` |

## Default admin login

After `db:seed`:

- Phone: `9999999999`
- OTP: printed to the server console (or whatever you set `DEV_OTP` to)

Change the phone in `packages/database/seed.ts` before running on a real database.
