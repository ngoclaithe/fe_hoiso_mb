import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const base = process.env.URL_BACKEND;
  if (!base) return new Response(JSON.stringify({ error: "Thiếu URL_BACKEND" }), { status: 500 });
  const url = `${base.replace(/\/$/, "")}/api/v1/auth/login`;
  const body = await req.text();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") || "application/json",
      cookie: req.headers.get("cookie") || "",
    },
    body,
    redirect: "manual",
  });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: res.headers });
}
