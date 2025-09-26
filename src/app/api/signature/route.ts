import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function GET(req: NextRequest) {
  return forwardRaw(req, "/cloudinary/signature", { method: "POST" });
}

export async function POST(req: NextRequest) {
  return forwardRaw(req, "/cloudinary/signature", {
    method: "POST",
    includeBody: true,
    headers: { "content-type": req.headers.get("content-type") || "application/json" },
  });
}
