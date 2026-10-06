"use client";

import { useEffect, useRef, useState } from "react";

/** Steps a number toward `target` for a chunky arcade counter feel. */
export function useCountUp(target: number, duration = 700, from?: number) {
  const [value, setValue] = useState(from ?? target);
  const current = useRef(from ?? target);
  useEffect(() => {
    const start = current.current;
    if (start === target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = target;
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
