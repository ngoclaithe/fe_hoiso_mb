import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  headers["content-type"] = req.headers.get("content-type") || "application/json";
  const bodyText = await req.text().catch(() => undefined);
  return forwardRaw(req, `/transactions/admin/withdraw/${encodeURIComponent(id)}/approve`, { method: "POST", includeBody: true, bodyText, headers });
}
