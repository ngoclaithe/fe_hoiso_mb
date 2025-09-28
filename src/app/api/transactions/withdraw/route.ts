import { NextRequest } from "next/server";
import { forwardRaw } from "@/lib/http";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const headers: Record<string, string> = {};
  if (auth) headers["authorization"] = auth;
  
  headers["Content-Type"] = "application/json";

  try {
    const body = await req.json();     
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ message: "Missing body" }), { status: 400 });
    }

    const rawAmount = body.amount;
    let amountNum: number | null = null;
    
    if (typeof rawAmount === 'number') amountNum = rawAmount;
    if (typeof rawAmount === 'string') {
      const cleaned = rawAmount.replace(/\s|,/g, '');
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) amountNum = parsed;
    }

    if (amountNum === null || !Number.isFinite(amountNum) || amountNum <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid amount' }), { status: 400 });
    }

    amountNum = Math.round(amountNum * 100) / 100;
    const forwardBody = { ...body, amount: amountNum };

    return forwardRaw(req, "/transactions/withdraw", { 
      method: "POST", 
      includeBody: true, 
      bodyText: JSON.stringify(forwardBody), 
      headers 
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), { status: 400 });
  }
}