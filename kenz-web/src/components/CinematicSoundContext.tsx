"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CinematicSoundContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  enableSound: () => void;
};

const CinematicSoundContext = createContext<CinematicSoundContextValue | null>(null);

const STORAGE_KEY = "kenz-cinematic-sound";

export function CinematicSoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const persist = useCallback((enabled: boolean) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "0") setSoundEnabled(false);
    } catch {
      /* ignore */
    }
  }, []);

  const enableSound = useCallback(() => {
    setSoundEnabled(true);
    persist(true);
  }, [persist]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(
    () => ({ soundEnabled, toggleSound, enableSound }),
    [soundEnabled, toggleSound, enableSound]
  );

  return (
    <CinematicSoundContext.Provider value={value}>{children}</CinematicSoundContext.Provider>
  );
}

export function useCinematicSound() {
  const ctx = useContext(CinematicSoundContext);
  if (!ctx) {
    throw new Error("useCinematicSound must be used within CinematicSoundProvider");
  }
  return ctx;
}
