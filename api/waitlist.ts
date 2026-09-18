type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = { status: (code: number) => VercelResponse; json: (value: unknown) => void; setHeader: (name: string, value: string) => void };

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Content-Type", "application/json");
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const body = request.body as { email?: unknown; role?: unknown } | undefined;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || role.length > 120) return response.status(400).json({ error: "Enter a valid email address." });
  const destination = process.env.WAITLIST_WEBHOOK_URL;
  if (!destination) return response.status(503).json({ error: "Waitlist registration is being configured. Please contact hello@virtuhost.app." });
  const upstream = await fetch(destination, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role, source: "virtuhost-landing", submittedAt: new Date().toISOString() }) });
  if (!upstream.ok) return response.status(502).json({ error: "We could not save your place just now. Please try again." });
  return response.status(201).json({ ok: true });
}
