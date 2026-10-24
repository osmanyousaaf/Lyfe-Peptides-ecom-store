import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// Append-only store for orders, carts, sign-ups, messages and analytics events.
//
// Two backends, same API:
// - Upstash Redis (production, e.g. on Vercel): used when KV_REST_API_URL + KV_REST_API_TOKEN
//   (Vercel Marketplace names) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
//   Each kind is a Redis list of JSON strings.
// - Local files (development / a single Node server): one JSON object per line in data/<kind>.jsonl.
// Sample data is kept apart (data/sample/ or sample:* keys) so it never mixes with real records.

export type Kind = "events" | "orders" | "carts" | "subscribers" | "contact";
const KINDS: Kind[] = ["events", "orders", "carts", "subscribers", "contact"];

/* ---------------- Upstash Redis (REST) ---------------- */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);
const PREFIX = "lyfe:";

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result as T;
}

const key = (kind: Kind, sample = false) => `${PREFIX}${sample ? "sample:" : ""}${kind}`;
const SAMPLE_FLAG = `${PREFIX}sample:on`;

const parse = <T,>(lines: string[]): T[] => {
  const rows: T[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      /* skip a damaged line */
    }
  }
  return rows;
};

/* ---------------- local files ---------------- */
// On a read-only host without Redis (e.g. Vercel before Redis is connected) fall back to /tmp,
// which works but is wiped between deployments and instances.
const ROOT = process.env.VERCEL ? path.join("/tmp", "lyfe-data") : path.join(process.cwd(), "data");
const SAMPLE_DIR = path.join(ROOT, "sample");
const file = (kind: Kind, sample = false) => path.join(sample ? SAMPLE_DIR : ROOT, `${kind}.jsonl`);

async function readFileRows<T>(p: string): Promise<T[]> {
  try {
    return parse<T>((await readFile(p, "utf8")).split("\n"));
  } catch {
    return [];
  }
}

/* ---------------- public API ---------------- */
export const storageMode = () => (useRedis ? "redis" : process.env.VERCEL ? "temporary" : "files");

export async function append(kind: Kind, record: object) {
  if (useRedis) {
    await redis(["RPUSH", key(kind), JSON.stringify(record)]);
    return;
  }
  await mkdir(ROOT, { recursive: true });
  await appendFile(file(kind), JSON.stringify(record) + "\n");
}

export async function sampleOn(): Promise<boolean> {
  if (useRedis) return Boolean(await redis<number>(["EXISTS", SAMPLE_FLAG]));
  return existsSync(path.join(SAMPLE_DIR, "on"));
}

// Real rows, plus sample rows while sample mode is on.
export async function readAll<T>(kind: Kind): Promise<T[]> {
  if (useRedis) {
    const real = parse<T>(await redis<string[]>(["LRANGE", key(kind), 0, -1]));
    if (!(await sampleOn())) return real;
    return [...parse<T>(await redis<string[]>(["LRANGE", key(kind, true), 0, -1])), ...real];
  }
  const real = await readFileRows<T>(file(kind));
  if (!(await sampleOn())) return real;
  return [...(await readFileRows<T>(file(kind, true))), ...real];
}

export async function writeSample(data: Record<Kind, object[]>) {
  if (useRedis) {
    await clearSample();
    for (const kind of KINDS) {
      const rows = data[kind].map((r) => JSON.stringify(r));
      for (let i = 0; i < rows.length; i += 500) await redis(["RPUSH", key(kind, true), ...rows.slice(i, i + 500)]);
    }
    await redis(["SET", SAMPLE_FLAG, new Date().toISOString()]);
    return;
  }
  await mkdir(SAMPLE_DIR, { recursive: true });
  for (const kind of KINDS) {
    await writeFile(file(kind, true), data[kind].map((r) => JSON.stringify(r)).join("\n") + "\n");
  }
  await writeFile(path.join(SAMPLE_DIR, "on"), new Date().toISOString());
}

export async function clearSample() {
  if (useRedis) {
    await redis(["DEL", SAMPLE_FLAG, ...KINDS.map((k) => key(k, true))]);
    return;
  }
  await rm(SAMPLE_DIR, { recursive: true, force: true });
}
