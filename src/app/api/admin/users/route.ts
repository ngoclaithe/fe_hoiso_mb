import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  return forwardRaw(req, "/users", { method: "GET", headers: { cookie: req.headers.get("cookie") || "", ...(req.headers.get("authorization") ? { authorization: req.headers.get("authorization")! } : {}) } });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  return forwardRaw(req, `/users/${id}`, { method: "DELETE", headers: { cookie: req.headers.get("cookie") || "", ...(req.headers.get("authorization") ? { authorization: req.headers.get("authorization")! } : {}) } });
}
