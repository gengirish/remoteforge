#!/usr/bin/env node
/**
 * What is awake, and what is it allowed to cost?
 *
 *   node scripts/idle-audit.mjs
 *
 * Reports every Fly machine (via flyctl, using your existing login) and, if
 * NEON_API_KEY is set, every Neon compute with its scale-to-zero setting and
 * autoscale ceiling. Read-only: it changes nothing.
 *
 * The rule this guards: nothing on a timer may touch a resource you want
 * asleep -- not a health check, not a cron, not an uptime monitor. A 30s probe
 * against a 5-minute idle window pins the resource awake 100% of the time.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

// Approximate shared-cpu-1x monthly rates, taken from the Fly dashboard.
// Indicative only -- the billing page is the source of truth.
const FLY_RATE = { "256MB": 2.02, "512MB": 3.32, "1GB": 5.7, "2GB": 10.7 };

async function fly(args) {
  try {
    const { stdout } = await exec("fly", args, { maxBuffer: 20 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (err) {
    if (/not found|no such app/i.test(err.stderr ?? "")) return null;
    throw err;
  }
}

console.log("FLY MACHINES");

let apps;
try {
  apps = await fly(["apps", "list", "--json"]);
} catch {
  console.log("  ! flyctl unavailable or not logged in (`fly auth login`)");
  apps = null;
}

let flyMonthly = 0;

if (apps) {
  const live = apps.filter((a) => a.Status !== "suspended");
  const suspended = apps.length - live.length;

  for (const app of live) {
    const machines = (await fly(["machines", "list", "-a", app.Name, "--json"])) ?? [];
    if (machines.length === 0) {
      console.log(`  ${app.Name.padEnd(32)} no machines`);
      continue;
    }
    for (const m of machines) {
      const size = m.config?.guest
        ? `${m.config.guest.memory_mb >= 1024 ? m.config.guest.memory_mb / 1024 + "GB" : m.config.guest.memory_mb + "MB"}`
        : "?";
      const running = m.state === "started";
      if (running) flyMonthly += FLY_RATE[size] ?? 0;
      console.log(
        `  ${app.Name.padEnd(32)} ${m.state.padEnd(9)} ${String(size).padEnd(6)} ${m.region ?? ""}  ${m.id}`,
      );
    }
  }
  console.log(`\n  ${live.length} live app(s), ${suspended} suspended (suspended apps cost nothing)`);
  console.log(`  running machines cost roughly $${flyMonthly.toFixed(2)}/mo, plus volumes`);
}

console.log("\nNEON COMPUTES");

const KEY = process.env.NEON_API_KEY;
if (!KEY) {
  console.log("  skipped: set NEON_API_KEY to include Neon");
} else {
  const api = async (p) => {
    const r = await fetch("https://console.neon.tech/api/v2" + p, {
      headers: { Accept: "application/json", Authorization: `Bearer ${KEY}` },
    });
    if (!r.ok) throw new Error(`${p} -> ${r.status} ${await r.text()}`);
    return r.json();
  };

  const { organizations = [] } = await api("/users/me/organizations");
  const awake = [];
  const alwaysOn = [];
  let total = 0;

  for (const org of organizations) {
    const { projects = [] } = await api(`/projects?org_id=${org.id}&limit=400`);
    for (const p of projects) {
      const { endpoints = [] } = await api(`/projects/${p.id}/endpoints`);
      for (const e of endpoints.filter((x) => x.type === "read_write")) {
        total++;
        if (e.current_state === "active") awake.push(p.name);
        if (e.suspend_timeout_seconds === -1) alwaysOn.push(p.name);
      }
    }
  }

  console.log(`  ${total} compute(s), ${awake.length} awake right now`);
  if (awake.length) console.log(`  awake: ${awake.join(", ")}`);
  console.log(
    alwaysOn.length
      ? `  ! never suspends: ${alwaysOn.join(", ")}`
      : "  every compute is set to scale to zero",
  );
}
