import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  const headers: Record<string, string> = { cookie: req.headers.get("cookie") || "" };
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, "/auth/profile", { method: "GET", headers });
}
