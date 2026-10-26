import { redis, COLLECTIONS, key, validId, isAdmin, noDb } from "../lib/redis.js";

/*
  POST /api/restore  (x-admin-key)
  corpo: { coll, docs: { id: dados, ... }, replace?: boolean }
  Grava vários registros de uma vez (usado pelo "Restaurar backup").
*/

export default async function handler(req, res) {
  if (!redis) return noDb(res);
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  if (!isAdmin(req)) return res.status(401).json({ error: "Senha inválida." });
  const { coll, docs, replace } = req.body || {};
  if (!COLLECTIONS.includes(coll) || !docs || typeof docs !== "object") return res.status(400).json({ error: "Backup inválido." });
  const fields = {};
  for (const id in docs) {
    if (!validId(id) || !docs[id] || typeof docs[id] !== "object") continue;
    fields[id] = JSON.stringify(docs[id]);
  }
  try {
    const p = redis.pipeline();
    if (replace) p.del(key(coll));
    if (Object.keys(fields).length) p.hset(key(coll), fields);
    await p.exec();
    return res.status(200).json({ ok: true, count: Object.keys(fields).length });
  } catch (e) {
    console.error(e);
    return res.status(503).json({ error: "Falha ao gravar. Tente de novo." });
  }
}
