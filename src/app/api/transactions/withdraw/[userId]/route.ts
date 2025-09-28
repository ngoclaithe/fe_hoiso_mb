import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!userId) return new Response(JSON.stringify({ message: "Missing userId" }), { status: 400 });
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  // Forward the request body to backend
  return forwardRaw(req, `/transactions/withdraw/${encodeURIComponent(userId)}`, { method: "POST", includeBody: true, headers });
}
