import { createHmac, timingSafeEqual } from "crypto";

export interface PaymentOrderInput {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  provider: "mock" | "razorpay";
  externalId: string;
  amount: number;
  currency: string;
  status: "created" | "attempted" | "paid";
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

function hasRazorpayCreds(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function paymentProvider(): "mock" | "razorpay" {
  return hasRazorpayCreds() ? "razorpay" : "mock";
}

export async function createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder> {
  const currency = input.currency || "INR";

  if (!hasRazorpayCreds()) {
    return {
      provider: "mock",
      externalId: `mock_${input.receipt}_${Date.now()}`,
      amount: input.amount,
      currency,
      status: "created",
    };
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }

  const body = (await res.json()) as { id: string; amount: number; currency: string; status: string };
  return {
    provider: "razorpay",
    externalId: body.id,
    amount: body.amount,
    currency: body.currency,
    status: (body.status as PaymentOrder["status"]) || "created",
  };
}

export function verifyPaymentSignature(input: PaymentVerification): boolean {
  if (!hasRazorpayCreds()) {
    return input.signature.startsWith("mock_");
  }

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(input.signature, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
