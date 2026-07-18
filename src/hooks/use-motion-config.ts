/**
 * use-motion-config.ts
 * 
 * Centralised Framer Motion configuration hook.
 * Respects `prefers-reduced-motion` for accessibility compliance.
 * 
 * Usage:
 *   const { shouldAnimate, fadeUp, fadeIn, slideLeft, slideRight, scaleIn } = useMotionConfig();
 */

"use client";

import { useReducedMotion } from "framer-motion";

// ============================================================================
// Variant Definitions
// ============================================================================

export const motionVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  flipIn: {
    hidden: { opacity: 0, rotateY: -8, scale: 0.97 },
    visible: { opacity: 1, rotateY: 0, scale: 1 },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },
  staggerContainerFast: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0,
      },
    },
  },
} as const;

// ============================================================================
// Transition Presets
// ============================================================================

export const motionTransitions = {
  smooth: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  snappy: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  spring: { type: "spring" as const, damping: 25, stiffness: 200 },
  springGentle: { type: "spring" as const, damping: 30, stiffness: 120 },
  floatLoop: { repeat: Infinity, repeatType: "loop" as const, ease: "easeInOut" as const, duration: 3.5 },
  floatLoopSlow: { repeat: Infinity, repeatType: "loop" as const, ease: "easeInOut" as const, duration: 5 },
  breathe: { repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const, duration: 2.5 },
} as const;

// ============================================================================
// 3D Tilt Utility
// ============================================================================

/**
 * Calculates `rotateX` and `rotateY` values from a mouse event
 * relative to a card element for a subtle 3D tilt effect.
 */
export function calc3DTilt(
  e: React.MouseEvent<HTMLElement>,
  el: HTMLElement,
  intensity = 8
): { rotateX: number; rotateY: number } {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -intensity;
  const rotateY = ((x - centerX) / centerX) * intensity;
  return { rotateX, rotateY };
}

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
