import { NextRequest } from "next/server";
import { requireEnv } from "./env";

export const API_PREFIX = "/api/v1" as const;

function backendBase(): string {
  const base = requireEnv("URL_BACKEND");
  return base.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${backendBase()}${API_PREFIX}${p}`;
}

export async function forwardRaw(
  req: NextRequest,
  path: string,
  init?: RequestInit & { method?: string; includeBody?: boolean }
): Promise<Response> {
  const url = apiUrl(path);
  const headers: HeadersInit = {
    ...init?.headers,
    cookie: req.headers.get("cookie") || "",
  };

  let body: BodyInit | undefined = undefined;
  if (init?.includeBody) {
    body = await req.text();
  }

  const res = await fetch(url, {
    ...init,
    method: init?.method || "GET",
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const text = await res.text();
  return new Response(text, { status: res.status, headers: res.headers });
}

export async function getJSON(path: string, headers?: HeadersInit): Promise<Response> {
  const url = apiUrl(path);
  const res = await fetch(url, { headers, cache: "no-store", redirect: "manual" });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: res.headers });
}

export async function postJSON(path: string, body: unknown, headers?: HeadersInit): Promise<Response> {
  const url = apiUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: res.headers });
}
