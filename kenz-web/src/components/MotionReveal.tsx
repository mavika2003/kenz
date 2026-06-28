"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { easePremium, useHydratedReducedMotion } from "@/lib/motion";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function MotionReveal({
  children,
  className = "",
  delay = 0,
}: MotionRevealProps) {
  const reduceMotion = useHydratedReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: easePremium, delay }}
    >
      {children}
    </motion.div>
  );
}
