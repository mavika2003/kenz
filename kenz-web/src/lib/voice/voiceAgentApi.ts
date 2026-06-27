import { getStoredToken } from "../auth";
import {
  getOrCreateVoiceSessionId,
  setStoredTurnsUsed,
} from "./siteMap";
import type { PageContext, VoiceAgentResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export function isVoiceAgentConfigured(): boolean {
  return API_URL.length > 0;
}

function buildHeaders(json = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseError(response: Response, fallback: string): Promise<string> {
  let detail = fallback;
  try {
    const body = (await response.json()) as { detail?: string };
    if (typeof body.detail === "string") {
      detail = body.detail;
    }
  } catch {
    // keep default
  }
  return detail;
}

function persistTurns(data: VoiceAgentResponse): void {
  if (!getStoredToken()) {
    setStoredTurnsUsed(data.turns_used);
  }
}

export async function sendVoiceAgentTurn(
  transcript: string,
  pageContext: PageContext,
): Promise<VoiceAgentResponse> {
  if (!API_URL) {
    throw new Error("Voice agent API is not configured.");
  }

  const sessionId = getOrCreateVoiceSessionId();
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/voice/agent`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      transcript,
      session_id: sessionId,
      page_context: pageContext,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Voice agent request failed."));
  }

  const data = (await response.json()) as VoiceAgentResponse;
  persistTurns(data);
  return data;
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export async function sendVoiceAgentAudio(
  audio: Blob,
  mimeType: string,
  pageContext: PageContext,
): Promise<VoiceAgentResponse> {
  if (!API_URL) {
    throw new Error("Voice agent API is not configured.");
  }

  const sessionId = getOrCreateVoiceSessionId();
  const form = new FormData();
  form.append("session_id", sessionId);
  form.append("page_context", JSON.stringify(pageContext));
  form.append(
    "audio",
    audio,
    `recording.${extensionForMime(mimeType)}`,
  );

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/voice/agent/audio`, {
    method: "POST",
    headers: buildHeaders(false),
    body: form,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Voice agent request failed."));
  }

  const data = (await response.json()) as VoiceAgentResponse;
  persistTurns(data);
  return data;
}
