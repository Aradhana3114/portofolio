"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface CursorProps {
  size?: number;
}

export const Cursor: React.FC<CursorProps> = ({ size = 32 }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  // @types/react 19 removed the zero-argument useRef overload, so `useRef<number>()`
  // is a compile error (TS2554). An explicit `undefined` is the same runtime value.
  const requestRef = useRef<number | undefined>(undefined);
  const previousPos = useRef({ x: -size, y: -size }); // start off-screen
  // The pointer target lives in a ref, not in state. Holding it in state made every
  // mousemove a React re-render, and because the rAF effect depends on `animate`
  // (recreated on each render) that also tore down and restarted the loop on every
  // single mousemove. A ref keeps the follow loop entirely out of React's way.
  const targetPos = useRef({ x: -size, y: -size });
  const [visible, setVisible] = useState(false);

  // Only `visible` still goes through state, so the component re-renders twice per
  // session (pointer in, pointer out) instead of once per mouse event.
  const animate = useCallback(() => {
    const el = cursorRef.current;
    if (!el) return;

    const currentX = previousPos.current.x;
    const currentY = previousPos.current.y;
    const targetX = targetPos.current.x - size / 2;
    const targetY = targetPos.current.y - size / 2;

    const deltaX = (targetX - currentX) * 0.2;
    const deltaY = (targetY - currentY) * 0.2;

    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    previousPos.current = { x: newX, y: newY };

    // Once the easing has converged there is nothing left to paint. Skipping the
    // write matters because `mix-blend-mode: difference` forces the browser to
    // re-composite everything painted underneath the cursor, so an idle cursor
    // that keeps re-writing its transform still costs a full repaint per frame.
    if (Math.abs(deltaX) < 0.05 && Math.abs(deltaY) < 0.05) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    el.style.transform = `translate(${newX}px, ${newY}px)`;
    requestRef.current = requestAnimationFrame(animate);
  }, [size]);

  useEffect(() => {
    // Touch-only devices have no cursor, so skip the listeners, the rAF loop and
    // the body `cursor: none` entirely.
    //
    // The `any-` prefixes are load-bearing. A plain `(pointer: fine)` query only
    // inspects the PRIMARY input, so a touch-capable laptop reports coarse and
    // the cursor would never start there. `any-pointer` / `any-hover` consider
    // every attached device, so a laptop with both a touchscreen and a trackpad
    // still gets the cursor while a phone gets nothing.
    if (!window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    document.body.style.cursor = "none"; // hide native cursor

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.body.style.cursor = "auto"; // restore native cursor
    };
  }, [animate]);

  return (
    <div
      ref={cursorRef}
      className="fixed left-0 top-0 pointer-events-none rounded-full bg-white mix-blend-difference z-50 transition-opacity duration-300"
      style={{
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
        // Own compositor layer, so the difference blend resolves on the GPU
        // against a cached backdrop instead of repainting the page each frame.
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
};

export default Cursor;