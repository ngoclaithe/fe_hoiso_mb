import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function PATCH(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "application/json";
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = { "content-type": contentType };
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, "/wallet/add-balance", { method: "PATCH", includeBody: true, headers });
}
