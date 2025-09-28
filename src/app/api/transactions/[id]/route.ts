import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, `/transactions/${encodeURIComponent(id)}`, { method: "GET", headers });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;

  // If path is /transactions/withdraw, forward to backend withdraw endpoint
  if (id === "withdraw") {
    const bodyText = await req.text().catch(() => null);
    const incomingCT = req.headers.get("content-type") || req.headers.get("Content-Type");
    headers["Content-Type"] = (incomingCT && String(incomingCT)) || "application/json";
    try { console.log("[dynamic route] forwarding withdraw bodyText:", bodyText); } catch {}
    return forwardRaw(req, `/transactions/withdraw`, { method: "POST", includeBody: true, bodyText: bodyText || undefined, headers });
  }

  return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
}
