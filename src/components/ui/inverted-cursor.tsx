"use client";

import React, { useState, useEffect, useRef } from "react";

interface CursorProps {
  size?: number;
}

export const Cursor: React.FC<CursorProps> = ({ size = 32 }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  // Only deviation from the source snippet: @types/react 19 removed the
  // zero-argument useRef overload, so `useRef<number>()` is a compile error
  // (TS2554). An explicit `undefined` is the same runtime value.
  const requestRef = useRef<number | undefined>(undefined);
  const previousPos = useRef({ x: -size, y: -size }); // start off-screen

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: -size, y: -size });

  // Animation loop for smooth cursor follow
  const animate = () => {
    if (!cursorRef.current) return;

    const currentX = previousPos.current.x;
    const currentY = previousPos.current.y;
    const targetX = position.x - size / 2;
    const targetY = position.y - size / 2;

    const deltaX = (targetX - currentX) * 0.2;
    const deltaY = (targetY - currentY) * 0.2;

    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    previousPos.current = { x: newX, y: newY };
    cursorRef.current.style.transform = `translate(${newX}px, ${newY}px)`;

    requestRef.current = requestAnimationFrame(animate);
  };

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
      setVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });
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
      }}
      aria-hidden="true"
    />
  );
};

export default Cursor;
