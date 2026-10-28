import { useEffect, useRef, useState } from 'react';

/**
 * Animates the number inside a label like "4+", "10+", "98%" from 0 when the
 * element scrolls into view. Non-numeric labels ("∞") are returned unchanged.
 */
export default function useCountUp(label, duration = 1400) {
  const ref = useRef(null);
  const str = String(label ?? '');
  const match = str.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const [value, setValue] = useState(match ? `${match[1]}0${match[3]}` : str);

  useEffect(() => {
    if (!match) { setValue(str); return undefined; }
    const [, pre, num, post] = match;
    const target = parseFloat(num);
    const decimals = (num.split('.')[1] || '').length;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setValue(str); return undefined; }

    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(`${pre}${(target * eased).toFixed(decimals)}${post}`);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str, duration]);

  return [ref, value];
}
