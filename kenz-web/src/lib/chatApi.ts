import { getStoredToken } from "./auth";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatUsage = {
  calls_used: number;
  calls_limit: number;
  calls_remaining: number;
};

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export function isChatConfigured(): boolean {
  return API_URL.length > 0;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Sign in to chat with a Kenzr.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseError(response: Response, fallback: string): Promise<string> {
  let detail = fallback;
  try {
    const body = (await response.json()) as { detail?: string | { msg?: string }[] };
    if (typeof body.detail === "string") {
      detail = body.detail;
    } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      detail = body.detail[0].msg;
    }
  } catch {
    // keep default
  }
  return detail;
}

export async function fetchChatHistory(): Promise<{
  messages: ChatMessage[];
  usage: ChatUsage;
}> {
  if (!API_URL) {
    throw new Error("Chat API is not configured.");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/chat/history`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Could not load chat history."));
  }

  const data = (await response.json()) as {
    messages: ChatMessage[];
    calls_used: number;
    calls_limit: number;
    calls_remaining: number;
  };

  return {
    messages: data.messages,
    usage: {
      calls_used: data.calls_used,
      calls_limit: data.calls_limit,
      calls_remaining: data.calls_remaining,
    },
  };
}

export async function sendChat(message: string): Promise<{
  reply: string;
  usage: ChatUsage;
}> {
  if (!API_URL) {
    throw new Error("Chat API is not configured.");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Something went wrong. Try again in a moment."));
  }

  const data = (await response.json()) as {
    message: string;
    calls_used: number;
    calls_limit: number;
    calls_remaining: number;
  };

  return {
    reply: data.message,
    usage: {
      calls_used: data.calls_used,
      calls_limit: data.calls_limit,
      calls_remaining: data.calls_remaining,
    },
  };
}
