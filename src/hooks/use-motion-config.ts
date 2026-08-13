"use client";

import { useReducedMotion } from "framer-motion";
import { motionVariants, motionTransitions } from "@/lib/motion";

export { motionVariants, motionTransitions, calc3DTilt } from "@/lib/motion";

// ============================================================================
// Main Hook
// ============================================================================

export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  // When reduced-motion is preferred, disable animations entirely
  const shouldAnimate = !prefersReduced;

  /**
   * Returns a variant that's either the full animation or
   * an instant (opacity-only) version for reduced-motion users.
   */
  function getVariant(variant: keyof typeof motionVariants) {
    if (!shouldAnimate) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    }
    return motionVariants[variant];
  }

  /**
   * Returns a transition — or an instant one for reduced-motion users.
   */
  function getTransition(transition: keyof typeof motionTransitions) {
    if (!shouldAnimate) {
      return { duration: 0 };
    }
    return motionTransitions[transition];
  }

  return {
    shouldAnimate,
    variants: motionVariants,
    transitions: motionTransitions,
    getVariant,
    getTransition,
  };
}
