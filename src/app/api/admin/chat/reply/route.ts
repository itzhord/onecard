import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        isFromAdmin: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[ADMIN_CHAT_REPLY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
