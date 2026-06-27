"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { VoiceAgentProvider } from "./voice/VoiceAgentContext";
import VoiceAgentWidget from "./voice/VoiceAgentWidget";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <VoiceAgentProvider>
        {children}
        <VoiceAgentWidget />
      </VoiceAgentProvider>
    </AuthProvider>
  );
}
