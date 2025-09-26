import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.URL_BACKEND;
  if (!base) return new Response(JSON.stringify({ error: "Thiếu URL_BACKEND" }), { status: 500 });
  const url = `${base.replace(/\/$/, "")}/api/v1/auth/profile`;
  const res = await fetch(url, {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
    redirect: "manual",
  });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: res.headers });
}
