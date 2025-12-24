import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function AdminChatPage() {
  const conversations = await prisma.conversation.findMany({
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Support Chat</h2>

      <div className="grid gap-4">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/admin/chat/${conv.id}`}
            className="block p-6 bg-card rounded-xl shadow-sm border border-border hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {conv.user.name?.[0] || conv.user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-card-foreground">
                    {conv.user.name || conv.user.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {conv.messages[0]?.content.substring(0, 50)}
                    {conv.messages[0]?.content.length > 50 ? "..." : ""}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-card-foreground">No conversations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When users start a chat, it will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
