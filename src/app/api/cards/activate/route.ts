import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

type ActivateCardPayload = {
  cardId?: string;
};

type ActivateCardResult =
  | { ok: true; cardId: string }
  | { ok: false; error: string };

export async function POST(request: Request) {
  const session = await resolveSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await parsePayload(request);
  if (payload.ok === false) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const { cardId } = payload;
  const existingCard = await prisma.card.findUnique({
    where: { cardId },
  });

  if (!existingCard) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  if (existingCard.userId && existingCard.userId !== session.user.id) {
    return NextResponse.json(
      { error: "This card is already assigned to another user." },
      { status: 409 }
    );
  }

  const updated = await prisma.card.update({
    where: { cardId },
    data: {
      userId: session.user.id,
      isActive: true,
      activatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to activate card. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    card: sanitizeCard(updated),
    message: existingCard.isActive
      ? "Card activation refreshed."
      : "Card activated successfully.",
  });
}

async function resolveSession() {
  try {
    const headerList = await headers();
    return await auth.api.getSession({ headers: headerList });
  } catch (error) {
    console.error("Card activation: failed to resolve session", error);
    return null;
  }
}

async function parsePayload(request: Request): Promise<ActivateCardResult> {
  try {
    const body = (await request.json()) as ActivateCardPayload;

    if (!body || typeof body.cardId !== "string") {
      return { ok: false, error: "cardId must be provided." };
    }

    const trimmed = body.cardId.trim();

    if (!/^[A-Za-z0-9_-]{4,64}$/.test(trimmed)) {
      return { ok: false, error: "Invalid card identifier format." };
    }

    return { ok: true, cardId: trimmed };
  } catch (error) {
    console.error("Card activation: invalid JSON payload", error);
    return { ok: false, error: "Invalid request payload." };
  }
}

function sanitizeCard(card: any) {
  return {
    cardId: card.cardId,
    cardName: nullableString(card.cardName),
    cardType: nullableString(card.cardType),
    isActive: Boolean(card.isActive),
    activatedAt: normalizeDate(card.activatedAt),
    expiresAt: normalizeDate(card.expiresAt),
    createdAt: normalizeDate(card.createdAt),
    updatedAt: normalizeDate(card.updatedAt),
  };
}

function nullableString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

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
