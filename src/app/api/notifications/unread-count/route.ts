import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, "/notifications/unread-count", { method: "GET", headers });
}
