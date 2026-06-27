"use client";

import { useCallback, useEffect, useRef } from "react";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

const SPEECH_THRESHOLD = 0.018;
const SPEECH_START_MS = 220;
const SILENCE_END_MS = 1400;
const MIN_UTTERANCE_MS = 450;
const MAX_UTTERANCE_MS = 22_000;
const POLL_MS = 80;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function rmsFromAnalyser(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const sample = (data[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / data.length);
}

export function useMicrophoneSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

type UseConversationListenerOptions = {
  onUtterance: (blob: Blob, mimeType: string) => void;
  onError?: (message: string) => void;
  onHearingChange?: (hearing: boolean) => void;
  enabled: boolean;
  paused: boolean;
};

export function useConversationListener({
  onUtterance,
  onError,
  onHearingChange,
  enabled,
  paused,
}: UseConversationListenerOptions) {
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const pollTimerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const speechStartedAtRef = useRef<number | null>(null);
  const lastSpeechAtRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);
  const onUtteranceRef = useRef(onUtterance);
  const onErrorRef = useRef(onError);
  const onHearingChangeRef = useRef(onHearingChange);

  onUtteranceRef.current = onUtterance;
  onErrorRef.current = onError;
  onHearingChangeRef.current = onHearingChange;

  const cleanup = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    isRecordingRef.current = false;
    recordingStartedAtRef.current = null;
    speechStartedAtRef.current = null;
    lastSpeechAtRef.current = null;
    chunksRef.current = [];

    analyserRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const beginRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || isRecordingRef.current) return;

    const mimeType = mimeTypeRef.current;
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const startedAt = recordingStartedAtRef.current ?? Date.now();
      const duration = Date.now() - startedAt;
      isRecordingRef.current = false;
      recordingStartedAtRef.current = null;
      onHearingChangeRef.current?.(false);

      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
      chunksRef.current = [];

      if (duration >= MIN_UTTERANCE_MS && blob.size > 0) {
        onUtteranceRef.current(blob, mimeTypeRef.current);
      }
    };

    recorderRef.current = recorder;
    isRecordingRef.current = true;
    recordingStartedAtRef.current = Date.now();
    onHearingChangeRef.current?.(true);
    recorder.start();
  }, []);

  const endRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    recorderRef.current = null;
  }, []);

  const pollAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || paused) return;

    const now = Date.now();
    const level = rmsFromAnalyser(analyser);
    const isSpeech = level >= SPEECH_THRESHOLD;

    if (!isRecordingRef.current) {
      if (isSpeech) {
        if (speechStartedAtRef.current === null) {
          speechStartedAtRef.current = now;
        } else if (now - speechStartedAtRef.current >= SPEECH_START_MS) {
          beginRecording();
          lastSpeechAtRef.current = now;
        }
      } else {
        speechStartedAtRef.current = null;
      }
      return;
    }

    if (isSpeech) {
      lastSpeechAtRef.current = now;
      return;
    }

    const lastSpeech = lastSpeechAtRef.current ?? recordingStartedAtRef.current ?? now;
    const recordingFor = now - (recordingStartedAtRef.current ?? now);

    if (now - lastSpeech >= SILENCE_END_MS) {
      speechStartedAtRef.current = null;
      lastSpeechAtRef.current = null;
      endRecording();
      return;
    }

    if (recordingFor >= MAX_UTTERANCE_MS) {
      speechStartedAtRef.current = null;
      lastSpeechAtRef.current = null;
      endRecording();
    }
  }, [beginRecording, endRecording, paused]);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    if (!useMicrophoneSupported()) {
      onErrorRef.current?.(
        "Microphone recording isn't supported in this browser. Type your request instead.",
      );
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        mimeTypeRef.current = pickMimeType() ?? "audio/webm";

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        pollTimerRef.current = window.setInterval(pollAudio, POLL_MS);
      } catch {
        onErrorRef.current?.(
          "Microphone access is blocked. Allow mic permission and try again.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cleanup, enabled, pollAudio]);

  return { isSupported: useMicrophoneSupported() };
}
