import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export const easePremium = [0.32, 0.72, 0, 1] as const;

/**
 * Like framer-motion's `useReducedMotion`, but SSR-safe.
 *
 * The server has no access to the user's OS "reduce motion" preference, so it
 * always renders as if motion is enabled. Returning the real preference on the
 * first client render would diverge from the server HTML and trigger a
 * hydration mismatch. This returns `false` until after mount, then the real
 * value — so the first client render matches the server.
 */
export function useHydratedReducedMotion(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(reduce) : false;
}

export const spring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

export const fadeUpBlur = {
  hidden: { opacity: 0, y: 48, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: easePremium },
  },
};
