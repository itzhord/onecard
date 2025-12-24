import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let conversation = await prisma.conversation.findFirst({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      console.log(`[Chat API] Creating new conversation for user ${session.user.id}`);
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
        },
        include: {
          messages: true,
        },
      });
    }

    console.log(`[Chat API] Fetched conversation ${conversation.id} with ${conversation.messages.length} messages`);
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[Chat API] Error fetching chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    console.warn("[Chat API] Unauthorized POST attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    console.log(`[Chat API] Processing message from user ${session.user.id}`);

    let conversation = await prisma.conversation.findFirst({
      where: { userId: session.user.id },
    });

    if (!conversation) {
      console.log(`[Chat API] Creating new conversation for message`);
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: content.trim(),
        isFromAdmin: false,
      },
    });

    console.log(`[Chat API] Message created: ${message.id}`);

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[Chat API] Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
