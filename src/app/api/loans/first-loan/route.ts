import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  return headers;
}

export async function GET(req: NextRequest) {
  return forwardRaw(req, "/loans/first-loan", { method: "GET", headers: buildHeaders(req) });
}
