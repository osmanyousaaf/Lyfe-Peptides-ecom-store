# Lyfe Peptides storefront

Next.js 16 store for lyfepeptidescanada.com: catalogue, cart and Stripe checkout, blog, documentation with
real certificates of analysis, a support chatbot, a 10%-off sign-up flow, and an admin dashboard at `/admin`.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values you need
npm run dev                  # http://localhost:3000
```

Local data (orders, carts, sign-ups, messages, analytics) is written to `data/` as JSON lines. That folder is
git-ignored because it holds customer details.

## Environment variables

| Variable | Needed for | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Checkout | `sk_test_…` while testing, `sk_live_…` in production |
| `STRIPE_WEBHOOK_SECRET` | Recording orders reliably | From the webhook endpoint below |
| `NEXT_PUBLIC_SITE_URL` | Checkout redirects, product images on Stripe | e.g. `https://lyfepeptidescanada.com` |
| `ADMIN_PASSWORD` | `/admin` sign-in | Use a long, unique password |
| `ADMIN_SECRET` | Signing the admin session cookie | Any long random string |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Saving data on Vercel | Added automatically when you connect Upstash Redis (see below). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work |
| `ANTHROPIC_API_KEY` | AI answers in the chatbot | Without it the chatbot answers from built-in FAQs |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | "Continue with Google" in the sign-up pop-up | Google Cloud OAuth client ID (Web) |

## Deploy on Vercel

1. **Import the repo.** In Vercel: *Add New → Project*, pick `osmanyousaaf/Lyfe-Peptides-ecom-store`, branch `main`.
   The framework is detected as Next.js; `vercel.json` sets the install and build commands and security headers.
2. **Connect storage (required).** Vercel's file system is read-only, so data must go to a database. In the project:
   *Storage → Marketplace → Upstash (Redis) → Create* and connect it to the project. This adds
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. Without it the admin shows a red warning and data
   only lives until the next deploy.
3. **Add environment variables** (*Settings → Environment Variables*) from the table above, at least
   `ADMIN_PASSWORD`, `ADMIN_SECRET`, `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL`.
4. **Deploy.** Every push to `main` redeploys automatically.
5. **Stripe webhook.** Stripe Dashboard → *Developers → Webhooks → Add endpoint*:
   `https://<your-domain>/api/stripe/webhook`, event `checkout.session.completed`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET` and redeploy.
6. **Domain.** *Settings → Domains*, add `lyfepeptidescanada.com` and follow the DNS instructions.
7. **Google sign-in (optional).** Add your domain to the OAuth client's *Authorized JavaScript origins*.

### After deploying

- Visit `/admin`, sign in, and check there is no red storage warning.
- Place a test order with a Stripe test card (`4242 4242 4242 4242`) and confirm it appears under *Orders*.
- Visitor locations (province, country) come from Vercel's geo headers, so they only show on the deployed site.
- `/?hero=lab` shows the alternative lab-background hero for comparison.

## Project map

- `src/app` – pages and API routes (`/api/checkout`, `/api/track`, `/api/subscribe`, `/api/contact`, `/api/chat`,
  `/api/stripe/webhook`, `/api/admin/*`)
- `src/app/admin` – dashboard (password-protected)
- `src/lib/store.ts` – storage (Upstash Redis in production, files locally)
- `src/lib/dashboard.ts` – analytics behind the dashboard
- `src/data/products.json` – the catalogue
- `public/coa` – certificates of analysis from Peptide Test Canada

For research purposes only. Not for human consumption.
