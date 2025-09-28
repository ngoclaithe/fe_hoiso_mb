import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  const incomingCT = req.headers.get("content-type") || req.headers.get("Content-Type");
  // Force forwarding Content-Type as application/json to backend
  headers["Content-Type"] = "application/json";
  try { console.log("Incoming Content-Type:", incomingCT); } catch {}

  // Read raw body as text to debug Content-Type mismatches
  const rawText = await req.text().catch(() => "");
  try { console.log("Incoming raw body text:", rawText); } catch {}
  let body: any = null;
  if (rawText) {
    try { body = JSON.parse(rawText); } catch { body = null; }
  }
  if (!body || typeof body !== "object") return new Response(JSON.stringify({ message: "Missing body" }), { status: 400 });

  // Normalize amount: accept string or number, remove thousand separators, ensure max 2 decimals
  const rawAmount = body.amount;
  let amountNum: number | null = null;
  if (typeof rawAmount === 'number') amountNum = rawAmount;
  if (typeof rawAmount === 'string') {
    // remove common thousands separators and whitespace
    const cleaned = rawAmount.replace(/\s|,/g, '');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) amountNum = parsed;
  }

  if (amountNum === null || !Number.isFinite(amountNum) || amountNum <= 0) {
    return new Response(JSON.stringify({ message: 'Invalid amount' }), { status: 400 });
  }

  // Round to max 2 decimals
  amountNum = Math.round(amountNum * 100) / 100;

  const forwardBody = { ...body, amount: amountNum };

  // Log the normalized body for debugging (server logs)
  try { console.log("Forwarding withdraw body:", JSON.stringify(forwardBody)); } catch {}

  return forwardRaw(req, "/transactions/withdraw", { method: "POST", includeBody: true, bodyText: JSON.stringify(forwardBody), headers });
}
