import { useEffect, useRef, useState } from "react";

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    // Reveal initially-visible elements
    const reveal = () => {
      el.querySelectorAll(".reveal-up:not(.visible)").forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add("visible");
      });
    };
    reveal();
    el.querySelectorAll(".reveal-up").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function useCountUp(target = 0, duration = 1500, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf;
    const start = performance.now();
    const t0 = Number(target) || 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 0.5 - Math.cos(p * Math.PI) / 2;
      setVal(Math.floor(t0 * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(t0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);
  return val;
}
