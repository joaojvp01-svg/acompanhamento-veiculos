import { redis, COLLECTIONS, key, validId, isAdmin, noDb, readAll } from "../lib/redis.js";

/*
  GET  /api/data            -> todos os dados { romaneios, historico, manuais, config }
  POST /api/data            -> { op: "set"|"del", coll, id, data }   (exige cabeçalho x-admin-key)
*/
export default async function handler(req, res) {
  if (!redis) return noDb(res);
  try {
    if (req.method === "GET") {
      return res.status(200).json(await readAll());
    }
    if (req.method === "POST") {
      if (!isAdmin(req)) return res.status(401).json({ error: "Senha inválida." });
      const { op, coll, id, data } = req.body || {};
      if (!COLLECTIONS.includes(coll) || !validId(id)) return res.status(400).json({ error: "Coleção ou identificador inválido." });
      if (op === "del") { await redis.hdel(key(coll), id); return res.status(200).json({ ok: true }); }
      if (op === "set") {
        if (!data || typeof data !== "object" || Array.isArray(data)) return res.status(400).json({ error: "Dados inválidos." });
        const s = JSON.stringify(data);
        if (s.length > 2_000_000) return res.status(413).json({ error: "Registro grande demais." });
        await redis.hset(key(coll), { [id]: s });
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: "Operação inválida." });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (e) {
    console.error(e);
    return res.status(503).json({ error: "Falha ao acessar o banco. Tente de novo." });
  }
}
