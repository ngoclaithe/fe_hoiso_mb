import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

// Define interface for request body
interface RequestBody {
  id?: string;
  [key: string]: unknown;
}

function buildHeaders(req: NextRequest, contentType?: string) {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  return headers;
}

export async function GET(req: NextRequest) {
  // Admin: list all loans
  return forwardRaw(req, "/loans", { method: "GET", headers: buildHeaders(req) });
}

export async function PATCH(req: NextRequest) {
  // Expect query param id or body.id and JSON body with fields to update
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const text = await req.text().catch(() => "");
  let body: RequestBody = {};
  try { 
    body = text ? JSON.parse(text) : {}; 
  } catch {
    // Handle JSON parse error silently with empty object
  }
  const targetId = id || body.id;
  if (!targetId) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });

  const headers = buildHeaders(req, req.headers.get("content-type") || "application/json");
  return forwardRaw(req, `/loans/${targetId}`, { method: "PATCH", includeBody: true, headers });
}