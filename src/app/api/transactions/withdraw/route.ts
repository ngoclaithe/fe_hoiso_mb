import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new Response(JSON.stringify({ message: "Missing body" }), { status: 400 });

  // Backend updated: accept body-only withdraw (amount, description). Forward as-is to /transactions/withdraw
  return forwardRaw(req, "/transactions/withdraw", { method: "POST", includeBody: true, bodyText: JSON.stringify(body), headers });
}
