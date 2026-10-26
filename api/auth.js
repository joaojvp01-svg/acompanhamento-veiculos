import { isAdmin } from "../lib/redis.js";

/* POST /api/auth  (cabeçalho x-admin-key) -> { ok: true } se a senha estiver certa */
export default function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  if (!process.env.ADMIN_KEY) return res.status(500).json({ error: "Defina ADMIN_KEY nas variáveis de ambiente da Vercel." });
  return isAdmin(req) ? res.status(200).json({ ok: true }) : res.status(401).json({ error: "Senha inválida." });
}
