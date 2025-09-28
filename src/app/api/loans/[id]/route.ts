import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

function buildHeaders(req: NextRequest) {
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  return headers;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  return forwardRaw(req, `/loans/${encodeURIComponent(id)}` , { method: "GET", headers: buildHeaders(req) });
}
