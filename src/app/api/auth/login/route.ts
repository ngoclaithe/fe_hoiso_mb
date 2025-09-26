import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  return forwardRaw(req, "/auth/login", {
    method: "POST",
    headers: { "content-type": req.headers.get("content-type") || "application/json" },
    includeBody: true,
  });
}
