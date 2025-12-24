import { NextResponse } from "next/server";

type PaystackEventPayload = {
  event?: string;
  data?: unknown;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-paystack-signature") ?? null;
  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch (error) {
    console.error("[Paystack Webhook] Failed to read request body", {
      error,
    });

    return NextResponse.json(
      {
        received: false,
        error: "Unable to read request body",
      },
      { status: 400 },
    );
  }

  let payload: PaystackEventPayload | null = null;

  if (rawBody.length > 0) {
    try {
      payload = JSON.parse(rawBody) as PaystackEventPayload;
    } catch (error) {
      console.error("[Paystack Webhook] Invalid JSON payload", {
        error,
        rawBody,
      });

      return NextResponse.json(
        {
          received: false,
          error: "Invalid JSON payload",
        },
        { status: 400 },
      );
    }
  }

  const eventName = payload?.event ?? "unknown";
  console.info("[Paystack Webhook] Event received", {
    signature,
    event: eventName,
    payload,
  });

  return NextResponse.json(
    {
      received: true,
      event: eventName,
    },
    { status: 200 },
  );
}
