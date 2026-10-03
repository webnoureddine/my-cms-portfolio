// Shared scroll-reveal animation variants (Framer Motion).
// Import these instead of redefining fadeUp/stagger locally in every
// component, so all scroll animations stay consistent site-wide.
//
// Usage pattern (already used throughout the app):
//   const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
//   const controls = useAnimation();
//   useEffect(() => { if (inView) controls.start('visible'); }, [inView]);
//   <motion.section ref={ref} initial="hidden" animate={controls} variants={stagger}>
//     <motion.div variants={slideInRight}>...</motion.div>
//   </motion.section>

const EASE = [0.22, 1, 0.36, 1];

// Parent wrapper — staggers children's own variants as they enter.
export const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

// Simple fade + rise — the default used across the site.
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// "Box slides in from the right" — starts off to the right, settles in place.
export const slideInRight = {
  hidden: { opacity: 0, x: 70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

// Mirror — slides in from the left. Pair with slideInRight on two-column
// layouts so the two sides converge toward the middle as you scroll.
export const slideInLeft = {
  hidden: { opacity: 0, x: -70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

// Gentle pop — good for cards/badges.
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

// Picks slideInLeft / slideInRight by index so a grid of cards alternates
// direction (even index from the left, odd from the right).
export const sideReveal = (index) => (index % 2 === 0 ? slideInLeft : slideInRight);

// RTL-aware version — in Arabic (right-to-left) layouts "left" and "right"
// should swap so the motion still matches the reading direction.
export const sideRevealRTL = (index, rtl) => {
  const fromLeft = index % 2 === 0;
  const useLeft = rtl ? !fromLeft : fromLeft;
  return useLeft ? slideInLeft : slideInRight;
};
