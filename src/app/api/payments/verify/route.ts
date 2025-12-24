import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  getPaymentByReference,
  updatePaymentStatus,
  getProfile,
  createCard,
  getUserSubscription,
} from "@/lib/db";

type VerifyPayload = {
  reference?: string;
};

type PaystackVerificationResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel?: string;
    paid_at?: string;
    created_at?: string;
    gateway_response?: string;
    metadata?: Record<string, unknown>;
    authorization?: {
      authorization_code?: string;
      card_type?: string;
      bank?: string;
      channel?: string;
      last4?: string;
    };
    customer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    subscription?: {
      subscription_code?: string;
      plan?: string;
      status?: string;
    };
  };
};

const PAYSTACK_VERIFY_ENDPOINT =
  "https://api.paystack.co/transaction/verify/";
const CARD_ID_PREFIX = "1NC";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 },
      );
    }

    const session = await resolveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await parsePayload(request);
    if (!payload.ok) {
      return NextResponse.json({ error: (payload as any).error }, { status: 400 });
    }

    const paystackResponse = await verifyWithPaystack(
      payload.reference,
      secretKey,
    );

    if (!paystackResponse.status || !paystackResponse.data) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: paystackResponse.message,
        },
        { status: 400 },
      );
    }

    const paystackData = paystackResponse.data;

    if (paystackData.status !== "success") {
      return NextResponse.json(
        {
          error: "Payment not successful",
          status: paystackData.status,
          message: paystackResponse.message,
        },
        { status: 400 },
      );
    }

    const {
      data: paymentRecord,
      error: paymentError,
    } = await getPaymentByReference(paystackData.reference);

    if (paymentError) {
      console.error("Failed to fetch payment record:", paymentError);
      return NextResponse.json(
        { error: "Failed to fetch payment record" },
        { status: 500 },
      );
    }

    if (!paymentRecord) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }

    if (paymentRecord.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (paymentRecord.status === "completed") {
      return NextResponse.json({
        payment: sanitizePayment(paymentRecord),
        message: "Payment already verified",
      });
    }

    const paidAt =
      paystackData.paid_at ?? paystackData.created_at ?? new Date().toISOString();
    const amountMajor = (paystackData.amount / 100).toFixed(2);

    await prisma.payment.update({
      where: { reference: paystackData.reference },
      data: {
        amount: amountMajor,
        currency: paystackData.currency,
        status: "completed",
        paymentMethod:
          paystackData.channel ?? paymentRecord.paymentMethod ?? null,
        paidAt: new Date(paidAt).toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: mergeMetadata(
          paymentRecord.metadata,
          buildGatewayMetadata(paystackData),
        ) as Prisma.JsonValue,
      },
    });

    await updatePaymentStatus(
      paystackData.reference,
      "completed",
      new Date(paidAt),
    );

    await Promise.all([
      handleCardPurchase(session.user.id, paymentRecord.metadata),
      handleSubscription(session.user.id, paymentRecord.metadata, paystackData),
    ]);

    const {
      data: refreshedPayment,
      error: refreshedError,
    } = await getPaymentByReference(paystackData.reference);

    if (refreshedError || !refreshedPayment) {
      return NextResponse.json(
        {
          payment: sanitizePayment(paymentRecord),
          warning: "Payment verified but failed to refresh record",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      payment: sanitizePayment(refreshedPayment),
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}

async function resolveSession() {
  try {
    const headerList = await headers();
    return await auth.api.getSession({ headers: headerList });
  } catch (error) {
    console.error("Payment verify: failed to resolve session", error);
    return null;
  }
}

async function parsePayload(
  request: Request,
): Promise<{ ok: true; reference: string } | { ok: false; error: string }> {
  try {
    const body = (await request.json()) as VerifyPayload;

    if (!body || typeof body.reference !== "string") {
      return { ok: false, error: "reference must be provided" };
    }

    const reference = body.reference.trim();

    if (!/^[A-Za-z0-9_-]{6,128}$/.test(reference)) {
      return {
        ok: false,
        error:
          "reference must be 6-128 characters and contain only letters, numbers, underscores, or dashes",
      };
    }

    return { ok: true, reference };
  } catch (error) {
    console.error("Payment verify: invalid JSON payload", error);
    return { ok: false, error: "Invalid request payload" };
  }
}

async function verifyWithPaystack(reference: string, secretKey: string) {
  const response = await fetch(`${PAYSTACK_VERIFY_ENDPOINT}${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as PaystackVerificationResponse;

  if (!response.ok) {
    return {
      status: false,
      message: payload.message ?? "Unknown Paystack verification error",
    };
  }

  return payload;
}

async function handleCardPurchase(
  userId: string,
  metadata: Record<string, unknown> | null,
) {
  if (!isTruthyFlag(metadata, "card_purchase")) {
    return;
  }

  const cardName =
    (metadata?.plan_type as string | undefined)?.trim() || "OneCard";
  const cardType =
    (metadata?.card_type as string | undefined)?.trim() || "standard";

  const cardId = await generateUniqueCardId();

  const { error } = await createCard({
    userId,
    cardId,
    cardName,
    cardType,
  });

  if (error) {
    console.error("Failed to create card after payment:", error);
  }
}

async function generateUniqueCardId(): Promise<string> {
  while (true) {
    const candidate = buildCardId();
    const existing = await prisma.card.findUnique({
      where: { cardId: candidate },
    });

    if (!existing) {
      return candidate;
    }
  }
}

function buildCardId() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${CARD_ID_PREFIX}${Date.now()}${random}`;
}

async function handleSubscription(
  userId: string,
  metadata: Record<string, unknown> | null,
  paystackData: NonNullable<PaystackVerificationResponse["data"]>,
) {
  // Allow subscription creation for both explicit subscriptions AND card purchases
  if (!isTruthyFlag(metadata, "subscription") && !isTruthyFlag(metadata, "card_purchase")) {
    return;
  }

  const planName =
    (metadata?.plan_type as string | undefined)?.trim() ??
    paystackData.subscription?.plan ??
    "Premium";
  const planId =
    (metadata?.plan_id as string | undefined)?.trim() ??
    planName.toLowerCase().replace(/\s+/g, "-");
  const billingCycle = getBillingCycle(metadata);

  const startDate = paystackData.paid_at
    ? new Date(paystackData.paid_at)
    : new Date();
  const nextBillingDate = computeNextBillingDate(startDate, billingCycle);

  const existing = await getUserSubscription(userId);

  if (existing.data) {
    try {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "active",
          subscriptionCode:
            paystackData.subscription?.subscription_code ??
            existing.data.subscriptionCode ??
            paystackData.reference,
          startDate,
          nextBillingDate,
          expiryDate: nextBillingDate,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
    return;
  }

  try {
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        planName,
        status: "active",
        subscriptionCode:
          paystackData.subscription?.subscription_code ?? paystackData.reference,
        startDate,
        nextBillingDate,
        expiryDate: nextBillingDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (createError) {
    console.error("Failed to create subscription record:", createError);
  }
}

function getBillingCycle(metadata: Record<string, unknown> | null) {
  const raw = (metadata?.billing_cycle as string | undefined)?.toLowerCase();
  if (raw === "annual" || raw === "yearly") return "annual";
  return "monthly";
}

function computeNextBillingDate(date: Date, cycle: "monthly" | "annual") {
  const result = new Date(date);
  if (cycle === "annual") {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}

function isTruthyFlag(
  metadata: Record<string, unknown> | null,
  key: string,
): boolean {
  const value = metadata?.[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
}

function buildGatewayMetadata(
  data: NonNullable<PaystackVerificationResponse["data"]>,
) {
  return {
    gateway: "paystack",
    channel: data.channel ?? null,
    gatewayResponse: data.gateway_response ?? null,
    authorizationCode: data.authorization?.authorization_code ?? null,
    cardType: data.authorization?.card_type ?? null,
    bank: data.authorization?.bank ?? null,
    customerEmail: data.customer?.email ?? null,
  };
}

function mergeMetadata(
  existing: Record<string, unknown> | null,
  additions: Record<string, unknown>,
) {
  return {
    ...(existing ?? {}),
    ...additions,
  };
}

function sanitizePayment(payment: any) {
  return {
    reference: payment.reference,
    amount: payment.amount,
    currency: payment.currency ?? null,
    status: payment.status,
    paymentType: payment.paymentType,
    paymentMethod: payment.paymentMethod ?? null,
    paidAt: normalizeDate(payment.paidAt),
    createdAt: normalizeDate(payment.createdAt),
    updatedAt: normalizeDate(payment.updatedAt),
    metadata: payment.metadata ?? null,
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
