import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  return forwardRaw(req, `/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", headers });
}
