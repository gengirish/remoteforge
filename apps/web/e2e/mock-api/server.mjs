// Stand-in for apps/api during e2e runs. Serves fixtures in the same
// { success, data } envelope and records every write so specs can assert on
// what the browser sent. It never touches Postgres, so e2e runs cost nothing.
//
//   node e2e/mock-api/server.mjs        (port from E2E_API_PORT, default 4010)
//   GET  /__e2e/requests                 recorded non-GET requests
//   POST /__e2e/reset                    clear the log

import { createServer } from "node:http";
import {
  closedJob,
  companies,
  escapedWwrJob,
  gigEarnings,
  gigs,
  incomeReport,
  internalStats,
  jobs,
  salaryByRole,
  salaryRoles,
  wins,
} from "./fixtures.mjs";

const PORT = Number(process.env.E2E_API_PORT ?? 4010);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

/** @type {{ method: string; path: string; body: unknown; at: string }[]} */
let requests = [];
/** email -> signals, so a repeat signup gets alreadySubscribed like the real API. */
const subscribers = new Map();

const ok = (data) => ({ status: 200, body: { success: true, data } });
const fail = (status, error) => ({ status, body: { success: false, error } });

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function listJobs(q) {
  let list = jobs;
  const category = q.get("category");
  const search = q.get("search")?.toLowerCase();
  if (category) list = list.filter((j) => j.category === category);
  if (q.get("indiaOnly") === "true") list = list.filter((j) => j.indiaFriendly);
  if (search) {
    list = list.filter(
      (j) => j.title.toLowerCase().includes(search) || j.company.toLowerCase().includes(search),
    );
  }
  const limit = Number(q.get("limit") ?? 20);
  const page = Number(q.get("page") ?? 1);
  return {
    jobs: list.slice((page - 1) * limit, page * limit),
    total: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / limit)),
  };
}

function listGigs(q) {
  let list = gigs;
  const type = q.get("type");
  if (type) list = list.filter((g) => g.type === type);
  if (q.get("indiaOnly") === "true") list = list.filter((g) => g.indiaAccepted);
  const limit = Number(q.get("limit") ?? 50);
  return { platforms: list.slice(0, limit), total: list.length };
}

function handleGet(path, q) {
  if (path === "/health" || path === "/api/health") return { status: 200, body: { status: "ok" } };
  if (path === "/api/home") {
    return ok({
      jobCount: jobs.length,
      gigCount: gigs.length,
      indiaGigCount: gigs.filter((g) => g.indiaAccepted).length,
      jobs,
      gigs,
    });
  }
  if (path === "/api/jobs") return ok(listJobs(q));
  if (path === "/api/jobs/slugs") return ok(jobs.map((j) => j.slug));
  if (path === "/api/jobs/recommended") return ok({ jobs, personalized: false });

  let m;
  if ((m = path.match(/^\/api\/jobs\/by-slug\/([^/]+)$/))) {
    const job = [...jobs, closedJob, escapedWwrJob].find((j) => j.slug === m[1]);
    return job ? ok(job) : fail(404, "Job not found");
  }

  if (path === "/api/gigs") return ok(listGigs(q));
  if (path === "/api/gigs/slugs") return ok(gigs.map((g) => g.slug));
  if ((m = path.match(/^\/api\/gigs\/by-slug\/([^/]+)$/))) {
    const gig = gigs.find((g) => g.slug === m[1]);
    return gig ? ok(gig) : fail(404, "Platform not found");
  }
  if ((m = path.match(/^\/api\/gigs\/([^/]+)\/earnings$/))) {
    const data = gigEarnings(m[1]);
    return data ? ok(data) : fail(404, "Platform not found");
  }

  if (path === "/api/companies/india") return ok({ companies });
  if ((m = path.match(/^\/api\/companies\/([^/]+)$/))) {
    const company = companies.find((c) => c.slug === m[1]);
    return company ? ok(company) : fail(404, "Company not found");
  }

  if (path === "/api/salary/roles") return ok({ roles: salaryRoles });
  if ((m = path.match(/^\/api\/salary\/([^/]+)$/))) {
    const data = salaryByRole[m[1]];
    return data ? ok(data) : ok({ roleSlug: m[1], dataPoints: 0, message: "No data for this role yet." });
  }

  if (path === "/api/community/wins") return ok(wins);
  if (path === "/api/community/income-report") return ok(incomeReport);

  if (path === "/api/internal/stats") return ok(internalStats);

  if (path === "/__e2e/requests") return { status: 200, body: requests };
  return fail(404, "Not found");
}

function handleWrite(method, path, body) {
  if (method === "POST" && path === "/__e2e/reset") {
    requests = [];
    return { status: 200, body: { reset: true } };
  }

  requests.push({ method, path, body, at: new Date().toISOString() });

  if (path === "/api/subscribe") {
    const email = body?.email;
    const phone = body?.phone;
    if (typeof email !== "string" || !EMAIL_RE.test(email) || (phone !== undefined && !E164_RE.test(phone))) {
      return fail(400, "Enter a valid email and a WhatsApp number like +919876543210");
    }
    // Mirrors handleSubscribe: only a new address or a new signal counts as a fresh signup.
    const signals = subscribers.get(email);
    const signal = body?.signal;
    const alreadySubscribed = !!signals && !(signal && !signals.has(signal));
    if (!signals) subscribers.set(email, new Set(signal ? [signal] : []));
    else if (signal) signals.add(signal);
    return ok({ id: `sub_${requests.length}`, email, alreadySubscribed });
  }
  if (path === "/api/salary") {
    if (!body?.role || !body?.yearsExp || !body?.salaryUsd) return fail(400, "Invalid salary report");
    return ok({ roleSlug: slugify(body.role) });
  }
  if (path === "/api/gigs/earnings") return ok({ id: `earn_${requests.length}` });
  if (path === "/api/referral/click") return ok({ recorded: true });
  if (path === "/api/applications") return fail(401, "Sign in to track applications");
  return fail(404, "Not found");
}

function readJson(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch {
        resolve(undefined);
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const cors = {
    "Access-Control-Allow-Origin": req.headers.origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Key, X-Cron-Secret",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors).end();
    return;
  }

  // /go/:id is a redirect, not JSON. Point it somewhere inert.
  const go = url.pathname.match(/^\/go\/([^/]+)$/);
  if (go && req.method === "GET") {
    requests.push({ method: "GET", path: url.pathname + url.search, body: undefined, at: new Date().toISOString() });
    res.writeHead(302, { ...cors, Location: `https://example.com/?go=${go[1]}` }).end();
    return;
  }

  const result =
    req.method === "GET"
      ? handleGet(url.pathname, url.searchParams)
      : handleWrite(req.method ?? "POST", url.pathname, await readJson(req));

  res.writeHead(result.status, { ...cors, "Content-Type": "application/json" });
  res.end(JSON.stringify(result.body));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[e2e mock api] listening on http://127.0.0.1:${PORT}`);
});
