"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const arcs = [
  { color: "#ef4444", direction: "inhale" },
  { color: "#f97316", direction: "exhale" },
  { color: "#eab308", direction: "inhale" },
  { color: "#10b981", direction: "exhale" },
  { color: "#3b82f6", direction: "inhale" },
  { color: "#8b5cf6", direction: "exhale" },
];

export default function RainbowBreathing() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!running) return;

    const arcDuration = 4000;
    const pauseDuration = 1000;

    const timer = setTimeout(() => {
      if (index < arcs.length - 1) {
        setIndex(index + 1);
        setProgress(0);
      } else {
        setRunning(false);
        setIndex(0);
        setProgress(0);
      }
    }, arcDuration + pauseDuration);

    const animateProgress = () => {
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / arcDuration, 1);
        setProgress(t);

        if (t < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    animateProgress();
    return () => clearTimeout(timer);
  }, [running, index]);

  const r = 100 - index * 10;
  const direction = arcs[index].direction === "inhale" ? 1 : -1;
  const t = direction === 1 ? progress : 1 - progress;

  const angle = Math.PI * (1 - t);
  const cx = 150 + r * Math.cos(angle);
  const cy = 150 - r * Math.sin(angle);

  return (
    <Card className="w-full max-w-md py-10 mt-12 flex flex-col items-center mx-auto space-y-8">
      <svg viewBox="0 0 300 180" className="w-full h-auto">
    
        {arcs.map((arc, i) => {
          const r = 100 - i * 10;
          return (
            <path
              key={i}
              d={`M ${150 - r} 150 A ${r} ${r} 0 0 1 ${150 + r} 150`}
              fill="none"
              stroke={arc.color}
              strokeWidth="6"
            />
          );
        })}

        
        {running && (
          <motion.circle
            r="6"
            fill={arcs[index].color}
            stroke="white"
            strokeWidth="2"
            cx={cx}
            cy={cy}
          />
        )}
      </svg>

      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            setIndex(0);
            setProgress(0);
          }
        }}
        className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-full shadow-md hover:scale-105 transition-transform"
      >
        {running ? "Stop" : "Start"}
      </button>
    </Card>
  );
}
