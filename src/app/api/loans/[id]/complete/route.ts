import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new Response(JSON.stringify({ message: "Missing id" }), { status: 400 });
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, `/loans/${encodeURIComponent(id)}/complete`, { method: "PATCH", headers });
}
