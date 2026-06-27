"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  type ChatMessage,
  type ChatUsage,
  fetchChatHistory,
  isChatConfigured,
  sendChat,
} from "@/lib/chatApi";
import { HERO_QUERY_KEY } from "./Hero";

const OPENING_MESSAGE =
  "Hey! Flying in soon? Ask me anything about Dubai — neighborhoods, food, scams to avoid, or where locals actually hang out.";

export default function ChatApp() {
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
      return;
    }

    void fetchChatHistory()
      .then(({ messages: saved, usage: savedUsage }) => {
        if (saved.length > 0) {
          setMessages(saved);
        } else {
          setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
        }
        setUsage(savedUsage);
      })
      .catch((err) => {
        setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
        setError(
          err instanceof Error ? err.message : "Could not load your chat history.",
        );
      })
      .finally(() => setHistoryLoading(false));
  }, [chatReady, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!historyLoading) {
      // Pick up any query that was typed in the hero chat input.
      const heroQuery = sessionStorage.getItem(HERO_QUERY_KEY);
      if (heroQuery) {
        setInput(heroQuery);
        sessionStorage.removeItem(HERO_QUERY_KEY);
      }
      inputRef.current?.focus();
    }
  }, [historyLoading]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !chatReady || !user || atLimit) return;

    const previous = messages;
    const optimistic: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(optimistic);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { reply, usage: nextUsage } = await sendChat(trimmed);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
      setUsage(nextUsage);
    } catch (err) {
      setMessages(previous);
      setError(
        err instanceof Error ? err.message : "Could not reach the chat service.",
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-anton)] text-[clamp(2rem,6vw,3rem)] uppercase leading-none text-black">
          Chat with a Kenzr
        </h1>
        <p className="mt-2 text-sm text-black/70">
          Hey {user?.name ?? "there"} — your Dubai local is ready.
        </p>
        {usage ? (
          <p className="mt-1 text-xs text-black/55">
            {usage.calls_remaining} of {usage.calls_limit} free messages left
          </p>
        ) : null}
      </div>

      <div className="flex min-h-[28rem] flex-col rounded-2xl border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#141210]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-orange text-2xl">
            🇦🇪
          </div>
          <div>
            <p className="text-sm font-bold">A real Kenzr</p>
            <p className="text-xs text-black/55">powered by AI · Dubai tips</p>
          </div>
        </div>

        <div className="mb-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {historyLoading ? (
            <div className="py-8 text-center text-sm text-black/55">
              Loading your chat…
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl border-[1.5px] border-black px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-6 rounded-br-sm bg-black text-white"
                    : "mr-6 rounded-bl-sm bg-paper"
                }`}
              >
                {message.content}
              </div>
            ))
          )}
          {loading && (
            <div className="mr-6 rounded-xl rounded-bl-sm border-[1.5px] border-black bg-paper px-4 py-3 text-sm text-black/55">
              typing…
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {!chatReady && (
          <p className="mb-3 rounded-lg border border-black/20 bg-paper px-3 py-2 text-xs text-black/70">
            Chat API is not configured.
          </p>
        )}

        {atLimit && (
          <p className="mb-3 rounded-lg border border-black/20 bg-paper px-3 py-2 text-xs text-black/70">
            You&apos;ve used all {usage?.calls_limit} free messages. Check back later
            for more.
          </p>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading || !chatReady || historyLoading || atLimit}
            placeholder={
              atLimit
                ? "Free message limit reached"
                : "Ask about Dubai…"
            }
            className="flex-1 rounded-lg border-2 border-black px-3 py-3 text-sm outline-none focus:outline focus:outline-[3px] focus:outline-orange-soft disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              loading ||
              !chatReady ||
              historyLoading ||
              atLimit ||
              input.trim().length === 0
            }
            className="rounded-lg border-2 border-black bg-black px-5 py-3 text-sm font-bold text-white hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-center text-xs text-red-700">{error}</p>
        )}

        <p className="mt-3 text-center text-xs text-black/55">
          AI tips for planning — always double-check before you book.
        </p>
      </div>
    </div>
  );
}
