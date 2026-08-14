# Password Reset — Code Templates

Copy-paste templates for each of the 8 changes in `SKILL.md`. All code is the production-tested version from the original implementation. Adapt naming to your project (replace `forgeahead-session`, `ForgeAhead`, etc.) and swap the email provider section as needed.

---

## 1. Schema (`prisma/schema.prisma`)

Add the model + relation. Keep existing User fields; only adding the `passwordResetTokens` line.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?  // nullable — supports OAuth-migrated users
  name         String
  // ...your other fields...

  passwordResetTokens PasswordResetToken[]
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  // SHA-256 hash of the raw token. The raw token is sent in the email link
  // and never stored in plaintext, so a DB leak doesn't compromise active resets.
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  // For audit/forensics if someone reports an unauthorized reset attempt.
  requestIp String?

  @@index([userId])
  @@index([expiresAt])
}
```

After saving: `npx prisma generate` (always) and `npx prisma db push` (when you're ready to deploy).

---

## 2. Token utilities (`lib/auth/passwordReset.ts`)

Universal — no provider dependencies.

```ts
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// Tokens are 32 bytes of randomness encoded as base64url. The raw token goes
// in the reset email URL; the SHA-256 hash is stored in the DB. This way a
// DB compromise doesn't leak active reset tokens.
const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type IssuedToken = {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
};

/** Generate a fresh single-use reset token. */
export function generateResetToken(): IssuedToken {
  const rawToken = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return { rawToken, tokenHash, expiresAt };
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Persist a fresh reset token for a user, invalidating any prior unused tokens
 * for the same user (so only the most recent reset link works).
 */
export async function issueResetTokenForUser(params: {
  userId: string;
  requestIp?: string;
}): Promise<IssuedToken> {
  const token = generateResetToken();

  await prisma.passwordResetToken.updateMany({
    where: { userId: params.userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: params.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      requestIp: params.requestIp,
    },
  });

  return token;
}

export type ConsumedToken =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

/**
 * Atomically validate and mark a reset token as used. Single-use: a second
 * consume of the same token returns "used".
 */
export async function consumeResetToken(rawToken: string): Promise<ConsumedToken> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return { ok: false, reason: "not_found" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, userId: record.userId };
}

export const PASSWORD_RESET_TTL_MINUTES = TOKEN_TTL_MS / 60_000;
```

---

## 3. Email helper (`lib/email/sendPasswordResetEmail.ts`)

Provider-agnostic shape. AgentMail variant shown; swap the `try { await sendEmail(...) }` block for your provider (Resend, Postmark, SMTP, etc.). The no-op-safe contract MUST be preserved.

```ts
import { sendEmail } from "@/lib/email/agentmail"; // or your provider client
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/auth/passwordReset";

/**
 * Designed to never throw — a missing email config or transient send failure
 * must not break the calling API route. Always logs the reset URL to server
 * logs as a last-resort recovery channel for the founder.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  rawToken: string;
}): Promise<{ delivered: boolean; reason?: string }> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://your-app.example.com";
  const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(params.rawToken)}`;

  // Always log so the founder can recover from a missing email setup.
  console.log(
    `[password-reset] Reset link for ${params.to}: ${resetUrl} (expires in ${PASSWORD_RESET_TTL_MINUTES} min)`
  );

  // ─── Provider-specific section — swap this block ────────────────────────
  const inboxId = process.env.AGENTMAIL_SYSTEM_INBOX_ID;
  if (!inboxId) {
    return { delivered: false, reason: "AGENTMAIL_SYSTEM_INBOX_ID not set" };
  }
  if (!process.env.AGENTMAIL_API_KEY) {
    return { delivered: false, reason: "AGENTMAIL_API_KEY not set" };
  }

  try {
    await sendEmail({
      inboxId,
      to: params.to,
      subject: "Reset your password",
      text: buildResetEmailText({ name: params.name, resetUrl }),
      html: buildResetEmailHtml({ name: params.name, resetUrl }),
      labels: ["transactional", "password-reset"],
    });
    return { delivered: true };
  } catch (err) {
    console.error("[password-reset] Email send failed:", err);
    return {
      delivered: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
  // ─── End provider-specific section ──────────────────────────────────────
}

function buildResetEmailText(params: { name: string; resetUrl: string }): string {
  return `Hi ${params.name || "there"},

Someone (hopefully you) requested a password reset for your account.

Click this link to set a new password — it works once and expires in ${PASSWORD_RESET_TTL_MINUTES} minutes:

${params.resetUrl}

If you didn't request this, you can safely ignore this email. Your password won't change.`;
}

function buildResetEmailHtml(params: { name: string; resetUrl: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0A0B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E7E9EE">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0E">
      <tr><td align="center" style="padding:40px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#13151A;border:1px solid #25282F;border-radius:16px;overflow:hidden">
          <tr><td style="padding:32px 32px 8px">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3">Reset your password</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#A8ADB8;line-height:1.6">
              Hi ${escapeHtml(params.name || "there")}, click the button below to set a new password.
            </p>
          </td></tr>
          <tr><td style="padding:8px 32px 24px" align="center">
            <a href="${params.resetUrl}" style="display:inline-block;background:#6366F1;color:white;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px">Set a new password</a>
          </td></tr>
          <tr><td style="padding:0 32px 24px">
            <p style="margin:0 0 8px;font-size:13px;color:#A8ADB8">Or copy this link:</p>
            <p style="margin:0 0 16px;font-size:12px;color:#7C8290;word-break:break-all;font-family:monospace">${escapeHtml(params.resetUrl)}</p>
            <p style="margin:0;font-size:13px;color:#7C8290">This link works once and expires in ${PASSWORD_RESET_TTL_MINUTES} minutes. If you didn't request this, ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
```

### Provider swaps (drop-in replacements for the marked block)

**Resend:**
```ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: process.env.RESEND_FROM!,
  to: params.to,
  subject: "Reset your password",
  text: buildResetEmailText({ name: params.name, resetUrl }),
  html: buildResetEmailHtml({ name: params.name, resetUrl }),
});
```

**Postmark:**
```ts
import { ServerClient } from "postmark";
const postmark = new ServerClient(process.env.POSTMARK_TOKEN!);
await postmark.sendEmail({
  From: process.env.POSTMARK_FROM!,
  To: params.to,
  Subject: "Reset your password",
  TextBody: buildResetEmailText({ name: params.name, resetUrl }),
  HtmlBody: buildResetEmailHtml({ name: params.name, resetUrl }),
  MessageStream: "outbound",
});
```

**Nodemailer / SMTP:**
```ts
import nodemailer from "nodemailer";
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transport.sendMail({
  from: process.env.SMTP_FROM,
  to: params.to,
  subject: "Reset your password",
  text: buildResetEmailText({ name: params.name, resetUrl }),
  html: buildResetEmailHtml({ name: params.name, resetUrl }),
});
```

---

## 4. Forgot-password route (`app/api/auth/forgot-password/route.ts`)

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { issueResetTokenForUser } from "@/lib/auth/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  email: z.string().email().max(254),
});

const GENERIC_SUCCESS = {
  success: true,
  message:
    "If an account exists for that email, we've sent password-reset instructions. Check your inbox (and spam folder).",
};

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    if (!rateLimit(`forgot:${ip}`, 5, 60 * 60_000)) {
      return NextResponse.json(
        { success: false, error: "Too many reset requests from this address. Try again in an hour." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
    }

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Per-email throttle: 1 attempt per minute. Even on hit, return generic
    // success so we don't reveal that the email is real.
    if (!rateLimit(`forgot:email:${email}`, 1, 60_000)) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    // Generic success path ONLY when the email is unknown. Users WITH a row
    // but WITHOUT a passwordHash (legacy OAuth migrants) ARE allowed through —
    // it lets them set their initial password. Inbox access is still required.
    if (!user) {
      // Random jitter to mask db-only timing from db+token+send timing.
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const token = await issueResetTokenForUser({ userId: user.id, requestIp: ip });
    await sendPasswordResetEmail({ to: user.email, name: user.name, rawToken: token.rawToken });

    return NextResponse.json(GENERIC_SUCCESS);
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    // Generic success even on internal error — never leak which emails exist.
    return NextResponse.json(GENERIC_SUCCESS);
  }
}
```

---

## 5. Reset-password route (`app/api/auth/reset-password/route.ts`)

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth";
import { consumeResetToken } from "@/lib/auth/passwordReset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    if (!rateLimit(`reset:${ip}`, 10, 15 * 60_000)) {
      return NextResponse.json(
        { success: false, error: "Too many reset attempts. Try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
    }

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const consumed = await consumeResetToken(token);
    if (!consumed.ok) {
      const message =
        consumed.reason === "expired"
          ? "This reset link has expired. Request a new one."
          : consumed.reason === "used"
            ? "This reset link has already been used. Request a new one."
            : "This reset link is invalid. Request a new one.";
      return NextResponse.json(
        { success: false, error: message, reason: consumed.reason },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: consumed.userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset. You can now sign in with your new password.",
    });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
```

---

## 6. Forgot-password page (`app/forgot-password/page.tsx`)

Adapt classNames to your design system. Reference uses Tailwind + a dark palette (`bg-base`, `bg-elevated`, `text-text-primary`, `border-border`, `accent-primary`) — replace with your equivalents.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || "Couldn't send reset email. Please try again.";
        toast.error(msg);
        setError(msg);
        return;
      }
      setSubmitted(true);
      toast.success("Check your inbox");
    } catch {
      const msg = "Network error. Please try again.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">YourApp</h1>
          <p className="text-text-secondary mt-2">Reset your password</p>
        </div>

        <div className="bg-elevated border border-border rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">Check your inbox</h2>
              <p className="text-sm text-text-secondary">
                If an account exists for <span className="font-medium">{email}</span>,
                we've sent password-reset instructions. The link expires in 60 minutes
                and works once.
              </p>
              <p className="text-xs text-text-muted">
                Don't see it after a couple of minutes? Check your spam folder, or{" "}
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setError(null); }}
                  className="text-accent-primary hover:underline"
                >
                  try a different email
                </button>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-text-secondary">
                Enter the email you used to sign up. We'll send you a link to choose a new password.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-base border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 rounded-lg bg-accent-primary text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Remembered it? <Link href="/sign-in" className="text-accent-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

---

## 7. Reset-password page (`app/reset-password/page.tsx`)

Note: must wrap in `Suspense` because `useSearchParams` requires it under App Router.

```tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenMissing = token.length < 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || "Couldn't reset your password. Please try again.";
        toast.error(msg);
        setError(msg);
        return;
      }
      toast.success("Password reset — sign in with your new password");
      router.push("/sign-in");
    } catch {
      const msg = "Network error. Please try again.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">YourApp</h1>
          <p className="text-text-secondary mt-2">Choose a new password</p>
        </div>

        <div className="bg-elevated border border-border rounded-2xl p-8 shadow-xl">
          {tokenMissing ? (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">Reset link looks broken</h2>
              <p className="text-sm text-text-secondary">
                The reset link in this URL is missing or malformed. Try clicking the link in your email
                again, or request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block py-2 px-4 rounded-lg bg-accent-primary text-white text-sm font-semibold"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-text-secondary">
                Pick something you'll remember — at least 8 characters. The link expires in 60 minutes.
              </p>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">New password</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  minLength={8}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-base border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-base border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Type it again"
                />
              </div>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full py-2.5 rounded-lg bg-accent-primary text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Remembered your password? <Link href="/sign-in" className="text-accent-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-base">
          <div className="animate-spin h-8 w-8 border-2 border-accent-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
```

---

## 8. Wiring snippets

### Sign-in page — add "Forgot password?" link

Inside the password field's label row:

```tsx
<div className="flex items-center justify-between mb-1.5">
  <label htmlFor="password" className="block text-sm font-medium">
    Password
  </label>
  <Link href="/forgot-password" className="text-xs text-accent-primary hover:underline">
    Forgot password?
  </Link>
</div>
```

### Middleware — add to PUBLIC_PATHS

```ts
const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",   // ← add
  "/reset-password",    // ← add
  // ...
];
```

If your `PUBLIC_API_PREFIXES` already includes `"/api/auth/"` the new routes are covered automatically. Otherwise add it.

### `.env.example` — document the new vars

```bash
# ─── Email provider (for transactional emails like password reset) ──
# AgentMail variant — replace with your provider's vars
AGENTMAIL_API_KEY=
AGENTMAIL_SYSTEM_INBOX_ID=         # required for password-reset emails

# ─── App URL (used to build reset-email links) ──────────────────────
# MUST be the canonical custom domain, NOT the *.vercel.app preview URL.
# NEXT_PUBLIC_* vars are baked into the client at build, so changing
# this requires a redeploy.
NEXT_PUBLIC_APP_URL=https://your-app.example.com
```

---

## Testing checklist (end-to-end)

Run these against production (or local with seeded data) after deploying:

```bash
# 1. Generic success on bogus email (anti-enumeration)
curl -s -X POST https://your-app.example.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  --data '{"email":"definitely-not-registered@example.com"}'
# Expect: HTTP 200, generic success body

# 2. Real email — sends + still generic success body
curl -s -X POST https://your-app.example.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  --data '{"email":"REAL_USER_EMAIL"}'
# Expect: HTTP 200, generic success body, AND email in provider's sent folder

# 3. Bogus token — 400 with structured reason (NOT 500)
curl -s -X POST https://your-app.example.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  --data '{"token":"abcdefghij1234567890","password":"newpassword123"}'
# Expect: HTTP 400, {"success":false,"error":"...invalid...","reason":"not_found"}
# If this is 500 instead, prisma db push hasn't run.

# 4. Public page reachability
curl -sI https://your-app.example.com/forgot-password   # expect HTTP 200
curl -sI "https://your-app.example.com/reset-password?token=abc"   # expect HTTP 200
```

If any of these fail, the corresponding section in `SKILL.md` "Critical gotchas" likely applies.
