import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const base = process.env.URL_BACKEND;
  if (!base) return NextResponse.json({ error: "Thiếu URL_BACKEND" }, { status: 500 });
  const body = await req.json();
  const url = `${base.replace(/\/$/, "")}/api/v1/loans`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
