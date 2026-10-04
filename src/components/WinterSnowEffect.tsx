/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";

interface Flake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
  char: string;
}

export default function WinterSnowEffect() {
  const flakes: Flake[] = useMemo(() => {
    const chars = ["❄", "✨", "⭐", "❅", "❆", "•"];
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 to 100%
      size: Math.random() * 14 + 10, // 10px to 24px
      duration: Math.random() * 7 + 6, // 6s to 13s
      delay: -(Math.random() * 10), // start immediately across screen
      opacity: Math.random() * 0.55 + 0.25, // 0.25 to 0.8
      drift: (Math.random() - 0.5) * 80, // slight left/right drift
      char: chars[Math.floor(Math.random() * chars.length)]
    }));
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(var(--drift), 50vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(calc(var(--drift) * -1), 105vh, 0) rotate(360deg);
          }
        }
      `}</style>

      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="absolute text-amber-200/90 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            top: 0,
            animation: `snowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            // @ts-ignore
            "--drift": `${flake.drift}px`,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
