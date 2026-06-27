"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  type ChatMessage,
  type ChatUsage,
  fetchChatHistory,
  isChatConfigured,
  sendChat,
} from "@/lib/chatApi";

const OPENING_MESSAGE =
  "Hey! Ask me anything about Dubai — food, spots, transport, local tips, or help planning your itinerary.";

export default function PlannerChatPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatReady = isChatConfigured();
  const atLimit = usage !== null && usage.calls_remaining <= 0;

  useEffect(() => {
    if (!chatReady || !user) {
      setHistoryLoading(false);
      setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
      return;
    }
    void fetchChatHistory()
      .then(({ messages: saved, usage: savedUsage }) => {
        setMessages(saved.length > 0 ? saved : [{ role: "assistant", content: OPENING_MESSAGE }]);
        setUsage(savedUsage);
      })
      .catch(() => setMessages([{ role: "assistant", content: OPENING_MESSAGE }]))
      .finally(() => setHistoryLoading(false));
  }, [chatReady, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !chatReady || !user || atLimit) return;

    const previous = messages;
    setMessages([...messages, { role: "user", content: trimmed }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { reply, usage: nextUsage } = await sendChat(trimmed);
      setMessages((cur) => [...cur, { role: "assistant", content: reply }]);
      setUsage(nextUsage);
    } catch (err) {
      setMessages(previous);
      setError(err instanceof Error ? err.message : "Could not reach the chat service.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-black/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-lg">
            🇦🇪
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Kenzr AI</p>
            <p className="text-xs text-ink/45">Dubai travel assistant</p>
          </div>
          {usage && (
            <span className="ml-auto text-xs text-ink/40">
              {usage.calls_remaining}/{usage.calls_limit}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {historyLoading ? (
          <div className="py-8 text-center text-xs text-ink/40">Loading…</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "ml-auto rounded-br-sm bg-ink text-white"
                  : "mr-auto rounded-bl-sm bg-surface text-ink"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {loading && (
          <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-sm bg-surface px-3 py-2.5 text-sm text-ink/40">
            typing…
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Limit warning */}
      {atLimit && (
        <p className="px-4 pb-1 text-xs text-ink/50">
          Free message limit reached.
        </p>
      )}

      {error && (
        <p className="px-4 pb-1 text-xs text-red-600">{error}</p>
      )}

      {/* Input */}
      <div className="border-t border-black/[0.06] px-4 py-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            disabled={loading || !chatReady || historyLoading || atLimit}
            placeholder="Ask about Dubai…"
            className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-orange/50 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading || !chatReady || historyLoading || atLimit || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-white transition hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
