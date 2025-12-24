"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Shield, Loader2, Check, Clock } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChat();
    // Poll every 10 seconds for new messages
    const interval = setInterval(fetchChat, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChat = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setMessages(data.conversation.messages || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      id: tempId,
      content: input,
      isFromAdmin: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempMessage.content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? data.message : msg))
        );
      } else {
        // Handle error (maybe remove message or show error)
        console.error("Failed to send");
      }
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">Support Chat</h3>
          <p className="text-xs text-gray-500">Chat with the Dev/Admin team</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isFromAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.isFromAdmin
                    ? "bg-white border text-gray-800"
                    : "bg-blue-600 text-white"
                } ${msg.pending ? "opacity-70" : ""}`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isFromAdmin ? "text-gray-400" : "text-blue-100"}`}>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!msg.isFromAdmin && (
                    msg.pending ? (
                      <Clock className="w-3 h-3 animate-pulse" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
