"use client";

import { useCallback, useEffect } from "react";

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const female =
    /samantha|karen|moira|victoria|tessa|fiona|allison|kate|zira|jenny|aria|natasha|sonia|google uk english female|google us english/i;
  return (
    voices.find((v) => v.lang.startsWith("en") && female.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

export function useSpeechSynthesis() {
  // Warm the voice list early — Chrome loads voices asynchronously.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const warm = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
      window.speechSynthesis.cancel();
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
        options?.onEnd?.();
        return;
      }

      // Cancel any in-progress speech.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("[Kenzr TTS] error:", e.error);
        }
        options?.onEnd?.();
      };

      // resume() unblocks Chrome's synth if it got stuck after a cancel.
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    },
    [cancel],
  );

  return { speak, cancel };
}
