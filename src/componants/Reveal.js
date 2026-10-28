import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

// Single element: fade + rise when it scrolls into view (once).
export default function Reveal({ children, delay = 0, y = 24, as = 'div', className, style }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

// Group whose children (<Item>) animate one after another.
export function Stagger({ children, className, style, gap = 0.08, delay = 0, onLoad = false }) {
  const variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  const trigger = onLoad
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: { once: true, amount: 0.12 } };
  return (
    <motion.div className={className} style={style} initial="hidden" variants={variants} {...trigger}>
      {children}
    </motion.div>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

export function Item({ children, className, style, as = 'div' }) {
  const Comp = motion[as] ?? motion.div;
  return <Comp className={className} style={style} variants={itemVariants}>{children}</Comp>;
}
