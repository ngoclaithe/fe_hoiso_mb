import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  // Forward to backend /loans/my-loans
  return forwardRaw(req, "/loans/my-loans", { method: "GET", headers: { ...(req.headers.get("authorization") ? { authorization: req.headers.get("authorization")! } : {} ) } });
}
