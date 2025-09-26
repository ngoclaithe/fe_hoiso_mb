import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.URL_BACKEND;
  if (!base) return NextResponse.json({ error: "Thiếu URL_BACKEND" }, { status: 500 });
  const url = `${base.replace(/\/$/, "")}/api/v1/cloudinary/signature`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
