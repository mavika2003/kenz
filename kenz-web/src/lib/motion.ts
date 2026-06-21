export const easePremium = [0.32, 0.72, 0, 1] as const;

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
