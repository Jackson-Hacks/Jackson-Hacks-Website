import React, { useEffect, useRef } from 'react';

/*
 * A soft light that trails the cursor over the dark page, like a flashlight.
 * The transform is written directly in the mousemove handler; the CSS
 * transition supplies the floaty lag. pointer-events-none keeps it from
 * blocking clicks; hidden on touch/small screens.
 */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{ transform: 'translate(-600px, -600px)' }}
      className="pointer-events-none fixed left-0 top-0 z-30 hidden transition-transform duration-500 ease-out md:block"
    >
      <div className="h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_closest-side,rgba(158,196,234,0.09)_0%,rgba(158,196,234,0.05)_45%,rgba(158,196,234,0.02)_70%,transparent_100%)]" />
    </div>
  );
}
