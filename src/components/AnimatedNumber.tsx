import { useEffect, useRef, useState, type ReactNode } from 'react';

const NUMERIC = /^(\d[\d\s]*(?:[.,]\d+)?)(\s*(?:%|\/.*)?)$/;

/** Сан кичине мааниден акыркы мааниге чейин "санап" көрүнөт. Сан эмес болсо — ошол бойдон. */
export function AnimatedNumber({ value, duration = 800 }: { value: ReactNode; duration?: number }) {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value : null;
  const match = text ? text.match(NUMERIC) : null;
  const raw = match ? match[1].replace(/\s/g, '').replace(',', '.') : '';
  const target = match ? Number(raw) : NaN;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  const suffix = match ? match[2] : '';
  const grouped = !!match && /\d\s\d/.test(match[1]);

  const [shown, setShown] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? target : 0,
  );
  const fromRef = useRef(0);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    fromRef.current = target;
    if (reduce || from === target) {
      setShown(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  if (Number.isNaN(target)) return <>{value}</>;
  const num = grouped ? Math.round(shown).toLocaleString('ru-RU') : shown.toFixed(decimals);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {num}
      {suffix}
    </span>
  );
}
