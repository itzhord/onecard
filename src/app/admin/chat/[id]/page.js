import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminChatInterface from "@/components/AdminChatInterface";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminChatDetailPage({ params }) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const userName = conversation.user?.name || conversation.user?.email || "Unknown User";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/chat"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat with {userName}</h1>
          <p className="text-sm text-gray-500">{conversation.user?.email}</p>
        </div>
      </div>

      <AdminChatInterface
        conversationId={conversation.id}
        initialMessages={conversation.messages}
        userName={userName}
      />
    </div>
  );
}
