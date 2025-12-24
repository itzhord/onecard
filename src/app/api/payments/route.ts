import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { createPaymentRecord } from "@/lib/db";

type PaymentPayload = {
  reference?: string;
  amount?: number | string;
  currency?: string;
  paymentType?: string;
  metadata?: Record<string, unknown>;
};

const REFERENCE_PATTERN = /^[a-zA-Z0-9_-]{6,128}$/;
const PAYMENT_TYPES = new Set(["card", "subscription"]);

export async function POST(request: Request) {
  const session = await resolveSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payloadResult = await parsePayload(request);
  if (!payloadResult.ok) {
    // Narrowing sometimes doesn't work across union returns — assert here for TS
    return NextResponse.json({ error: (payloadResult as any).error }, { status: 400 });
  }

  const { reference, amount, currency, paymentType, metadata } = payloadResult as any;

  const { data, error } = await createPaymentRecord({
    userId: session.user.id,
    reference,
    amount,
    currency,
    paymentType,
    metadata,
  });

  if (error) {
    const errorCode = (error as { code?: string }).code;
    if (errorCode === "23505") {
      return NextResponse.json(
        { error: "Payment reference already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create payment record:", error);
    return NextResponse.json(
      { error: "Failed to create payment record" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { payment: sanitizePayment(data) },
    { status: 201 }
  );
}

async function resolveSession() {
  try {
    const headerList = await headers();
    return await auth.api.getSession({ headers: headerList });
  } catch (error) {
    console.error("Payment route: failed to resolve session", error);
    return null;
  }
}

async function parsePayload(
  request: Request
): Promise<
  | {
      ok: true;
      reference: string;
      amount: string;
      currency?: string;
      paymentType: string;
      metadata?: Record<string, unknown>;
    }
  | { ok: false; error: string }
> {
  let body: PaymentPayload;

  try {
    body = (await request.json()) as PaymentPayload;
  } catch (error) {
    console.error("Payment route: invalid JSON payload", error);
    return { ok: false, error: "Invalid request payload" };
  }

  if (!body || typeof body.reference !== "string") {
    return { ok: false, error: "reference must be provided" };
  }

  const reference = body.reference.trim();
  if (!REFERENCE_PATTERN.test(reference)) {
    return {
      ok: false,
      error:
        "reference must be 6-128 characters and contain only letters, numbers, underscores, or dashes",
    };
  }

  const amountValue = body.amount;
  if (
    amountValue === undefined ||
    (typeof amountValue !== "number" && typeof amountValue !== "string")
  ) {
    return { ok: false, error: "amount must be provided" };
  }

  const amountString =
    typeof amountValue === "number"
      ? amountValue.toFixed(2)
      : amountValue.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(amountString)) {
    return {
      ok: false,
      error: "amount must be a positive number with up to two decimals",
    };
  }

  const paymentType = (body.paymentType ?? "").trim().toLowerCase();
  if (!PAYMENT_TYPES.has(paymentType)) {
    return {
      ok: false,
      error: `paymentType must be one of: ${Array.from(PAYMENT_TYPES).join(", ")}`,
    };
  }

  const currency = normalizeCurrency(body.currency);
  if (currency === null) {
    return {
      ok: false,
      error: "currency must be a 3-letter ISO code if provided",
    };
  }

  const metadata =
    body.metadata && typeof body.metadata === "object"
      ? body.metadata
      : undefined;

  return {
    ok: true,
    reference,
    amount: amountString,
    currency: currency ?? undefined,
    paymentType,
    metadata,
  };
}

function normalizeCurrency(input: unknown): string | undefined | null {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== "string") return null;

  const trimmed = input.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

type PaymentRecord = {
  reference: string;
  amount: string;
  currency: string | null;
  paymentType: string;
  status: string;
  paidAt: Date | string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  metadata?: Record<string, unknown> | null;
};

function sanitizePayment(payment: PaymentRecord) {
  return {
    reference: payment.reference,
    amount: payment.amount,
    currency: payment.currency ?? null,
    paymentType: payment.paymentType,
    status: payment.status,
    paidAt: normalizeDate(payment.paidAt),
    createdAt: normalizeDate(payment.createdAt),
    updatedAt: normalizeDate(payment.updatedAt),
    metadata:
      payment.metadata && typeof payment.metadata === "object"
        ? payment.metadata
        : null,
  };
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}
