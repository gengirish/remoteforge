---
name: auth-password-reset
description: Build a complete password reset flow (forgot-password + reset-password) for a Next.js App Router app using Prisma, bcryptjs, and a custom JWT cookie session. Use when the user wants to add, build, fix, or debug forgot-password / password-reset / "I can't log in" functionality, or when they migrate users off a third-party auth provider and need a self-service recovery path. NOT for Clerk / NextAuth (Auth.js) / Auth0 / Supabase Auth apps — those have built-in reset flows.
---

# Password Reset for Next.js + Prisma + Custom JWT

Production-ready forgot-password / reset-password flow with single-use, hashed, time-limited tokens emailed to the user's verified inbox. Battle-tested against the bugs documented under "Critical gotchas" — every one of them was a real failure during the original build.

## When to apply

Auto-apply when the user says:
- "add password reset", "build forgot password", "users need to reset their password"
- "I can't log in to my own app", "user can't log in"
- "users are stuck after we migrated off Clerk/NextAuth/OAuth"

Required stack:
- Next.js 14+ App Router
- Prisma + Postgres (or any SQL DB Prisma supports)
- bcryptjs for password hashing
- A `User` model with `email` (unique) and `passwordHash` (nullable string)
- Email provider — flow is provider-agnostic (AgentMail, Resend, Postmark, SMTP). Reference templates use AgentMail; swap the body of `lib/email/sendPasswordResetEmail.ts`.

## What gets built (8 changes)

| # | Change | Path |
|---|---|---|
| 1 | Schema model | `prisma/schema.prisma` — add `PasswordResetToken` + relation on `User` |
| 2 | Token utilities | `lib/auth/passwordReset.ts` — generate / hash / issue / consume |
| 3 | Email helper | `lib/email/sendPasswordResetEmail.ts` — provider-agnostic, no-op-safe |
| 4 | Request route | `app/api/auth/forgot-password/route.ts` |
| 5 | Reset route | `app/api/auth/reset-password/route.ts` |
| 6 | Request page | `app/forgot-password/page.tsx` |
| 7 | Reset page | `app/reset-password/page.tsx` (reads `?token=` from URL) |
| 8 | Wiring | sign-in page link + middleware `PUBLIC_PATHS` + `.env.example` |

Full ready-to-copy templates for every file in [reference.md](reference.md).

## Implementation order

Build in this order — each step depends on the previous:

1. **Schema**: add the `PasswordResetToken` model and `passwordResetTokens` relation on `User`. Run `npx prisma generate`. Defer `prisma db push` until you're ready to deploy (or use the deploy pipeline's auto-migrate step).
2. **Libraries**: create `lib/auth/passwordReset.ts` (universal) and `lib/email/sendPasswordResetEmail.ts` (swap the send body to match your email provider).
3. **API routes**: `forgot-password` first, then `reset-password`.
4. **Pages**: `forgot-password` then `reset-password`. Match your existing sign-in page's styling.
5. **Sign-in link**: add a "Forgot password?" link next to the password field on the sign-in form.
6. **Middleware**: add `/forgot-password` and `/reset-password` to `PUBLIC_PATHS`. (`/api/auth/*` is usually already public.)
7. **Env vars**: document the email-provider system inbox env var in `.env.example`. The reference template uses `AGENTMAIL_SYSTEM_INBOX_ID` — rename to match your provider.
8. **Verify**: `npx tsc --noEmit` clean, run unit tests, commit, push. Deploy must run `prisma db push` (or migrate) before the routes go live, otherwise reset-password returns 500 on missing table.

## Critical gotchas

These are real bugs caught during the original build — don't skip them.

### 1. Email sender must be no-op-safe
If the email-provider config is missing OR the send fails, `sendPasswordResetEmail` MUST return `{ delivered: false }` instead of throwing, AND log the full reset URL to server logs. The founder always needs a recovery channel — getting locked out of your own app because AgentMail isn't configured is the worst possible failure mode.

### 2. Allow reset for users with `passwordHash: null`
Users migrated from a previous auth system (Clerk, NextAuth, OAuth-only) often have a `User` row but `passwordHash: null`. Allow these users through the reset flow — it lets them set their initial password. The only condition that should suppress the email is **the `User` row is missing entirely**. Inbox-access requirement is the security boundary, not the presence of a prior password.

### 3. `NEXT_PUBLIC_APP_URL` must be the canonical custom domain
The reset email URL is built from `NEXT_PUBLIC_APP_URL`. If this defaults to `https://<project>.vercel.app`, the link points at Vercel's preview alias which can 404 in production (`DEPLOYMENT_NOT_FOUND`). Set it to your custom domain BEFORE the first reset email goes out. `NEXT_PUBLIC_*` vars are baked into the client bundle at build time — a redeploy is required after changing.

### 4. Anti-enumeration: always return generic success
`POST /api/auth/forgot-password` MUST return an identical response body whether the email is registered or not. Add 50-150ms random jitter on the `!user` branch to mask the lookup-only timing from the lookup+token+send timing.

### 5. Hash tokens in the DB; raw token only in the URL
Generate 32 bytes of randomness, base64url-encode for the URL, store SHA-256 hash in the DB. A DB leak then doesn't expose active reset tokens. Lookup is by exact hash (not by ID then verify) — `tokenHash` should be `@unique`.

### 6. Single-use; latest-link-wins
Issuing a new token must invalidate all prior unused tokens for the same user (`updateMany ... usedAt: now`). Consuming a token must set `usedAt` atomically before returning success — a second consume of the same token returns `{ ok: false, reason: "used" }`.

### 7. Rate limit per-IP AND per-email
- `5` forgot-password requests per IP per hour — stops mailbomb / mass enumeration
- `1` forgot-password request per email per minute — stops re-spamming a real user from a single attacker IP
- `10` reset-password attempts per IP per 15 minutes — stops brute-forcing token guesses

### 8. Token TTL = 1 hour
Short enough to limit attack window if the email link is intercepted, long enough that a user reading email an hour later can still use it. Configurable via a single constant in `lib/auth/passwordReset.ts`.

### 9. Migration runs BEFORE the routes go live
If you push code that imports `prisma.passwordResetToken` before the table exists, the reset endpoint returns HTTP 500 instead of the structured 400 error. Either run the migration first, or wire the deploy pipeline to run `prisma db push` between build and traffic-cutover.

## Verification checklist

After building, manually confirm against production (or local with seeded data):

- [ ] `npx tsc --noEmit` passes
- [ ] `prisma db push` ran successfully — `PasswordResetToken` table exists
- [ ] `/forgot-password` renders publicly (HTTP 200, no auth redirect, public in middleware)
- [ ] `/reset-password?token=abc` renders publicly
- [ ] `POST /api/auth/forgot-password` with bogus email returns the **same** generic success as a real email
- [ ] `POST /api/auth/forgot-password` with a real email actually sends (check provider's sent-folder dashboard, not just HTTP 200)
- [ ] `POST /api/auth/reset-password` with bogus token returns HTTP **400** with `reason: "not_found"` (NOT 500 — that means migration didn't run)
- [ ] Sign-in page has "Forgot password?" link visible
- [ ] Reset email URL uses the custom domain, NOT `*.vercel.app`
- [ ] Setting a new password on a user with `passwordHash: null` succeeds, then they can sign in normally
- [ ] Re-using a token returns HTTP 400 with `reason: "used"`
- [ ] Rate-limit kicks in: 6th forgot-password from same IP in an hour returns HTTP 429

## Reference

Full ready-to-copy templates for all 8 files (schema, 2 libs, 2 routes, 2 pages, wiring snippets) in [reference.md](reference.md).
