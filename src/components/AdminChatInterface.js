"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminChatInterface({ conversationId, initialMessages, userName }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card rounded-lg shadow-sm border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">{userName}</h3>
            <p className="text-xs text-muted-foreground">Customer Support Chat</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.isFromAdmin
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {msg.isFromAdmin ? (
                    <Shield className="w-3 h-3 text-primary-foreground/70" />
                  ) : (
                    <User className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${msg.isFromAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.isFromAdmin ? "Support Agent" : userName}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    msg.isFromAdmin ? "text-primary-foreground/70" : "text-muted-foreground/70"
                  }`}
                >
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground placeholder:text-muted-foreground"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
