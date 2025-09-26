import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  return forwardRaw(req, "/loans", { method: "POST", includeBody: true, headers: { "content-type": req.headers.get("content-type") || "application/json" } });
}
