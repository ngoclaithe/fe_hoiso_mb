import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const headers: Record<string, string> = { cookie: req.headers.get("cookie") || "" };
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  if (token) headers["authorization"] = `Bearer ${token}`;

  return forwardRaw(req, "/auth/profile", { method: "GET", headers });
}
