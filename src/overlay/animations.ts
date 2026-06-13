import type { Variants } from "framer-motion";
import type { AnimationType } from "../types";

/**
 * Framer-Motion-Varianten für die Ein-/Ausblend-Animationen.
 * Die Positionierung übernimmt der äußere Container – hier wird nur
 * relativ dazu animiert, damit die Varianten mit jedem Preset funktionieren.
 */
export const ANIMATION_VARIANTS: Record<AnimationType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.3, transition: { duration: 0.25 } },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.2 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 12 },
    },
    exit: { opacity: 0, scale: 0.4, transition: { duration: 0.25 } },
  },
  "slide-up": {
    initial: { opacity: 0, y: 120 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: 120, transition: { duration: 0.3 } },
  },
  "slide-down": {
    initial: { opacity: 0, y: -120 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: -120, transition: { duration: 0.3 } },
  },
  "slide-left": {
    initial: { opacity: 0, x: 160 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, x: 160, transition: { duration: 0.3 } },
  },
  "slide-right": {
    initial: { opacity: 0, x: -160 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, x: -160, transition: { duration: 0.3 } },
  },
};
