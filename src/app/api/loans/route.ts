import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "application/json";
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = { "content-type": contentType };
  if (auth) headers["authorization"] = auth;

  return forwardRaw(req, "/loans", { method: "POST", includeBody: true, headers });
}
