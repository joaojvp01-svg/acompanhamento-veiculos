import { Redis } from "@upstash/redis";
import { timingSafeEqual } from "node:crypto";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;

/* Cada coleção é um hash no Redis: av:<coleção> -> { id: JSON } */
export const COLLECTIONS = ["romaneios", "historico", "manuais", "config"];
export const key = (c) => `av:${c}`;
export const validId = (id) => typeof id === "string" && /^[A-Za-z0-9_\-:.]{1,80}$/.test(id);

export function isAdmin(req) {
  const expected = process.env.ADMIN_KEY || "";
  const got = String(req.headers["x-admin-key"] || "");
  if (!expected || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export function noDb(res) {
  return res.status(500).json({ error: "Banco não configurado. Conecte o Upstash ao projeto na Vercel (aba Storage)." });
}

export async function readAll() {
  const out = {};
  const p = redis.pipeline();
  COLLECTIONS.forEach((c) => p.hgetall(key(c)));
  const res = await p.exec();
  COLLECTIONS.forEach((c, i) => {
    let h = res[i] || {};
    if (Array.isArray(h)) { const o = {}; for (let j = 0; j + 1 < h.length; j += 2) o[h[j]] = h[j + 1]; h = o; }
    const obj = {};
    for (const id in h) {
      try { obj[id] = typeof h[id] === "string" ? JSON.parse(h[id]) : h[id]; } catch { /* ignora registro corrompido */ }
    }
    out[c] = obj;
  });
  return out;
}
