"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

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
  const [countdown, setCountdown] = useState(4);
  const [phaseLabel, setPhaseLabel] = useState("");
  const [isPause, setIsPause] = useState(false);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) {
      setProgress(0);
      setCountdown(4);
      setIsPause(false);
      setPhaseLabel("");
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
      return;
    }

    const arcDuration = 4000;
    const pauseDuration = 4000;

    if (!isPause) {

      setPhaseLabel(arcs[index].direction.charAt(0).toUpperCase() + arcs[index].direction.slice(1));
      setCountdown(4);

      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / arcDuration, 1);
        setProgress(t);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      
      let count = 1;
      setCountdown(count);
      if (countdownInterval.current) clearInterval(countdownInterval.current);

      countdownInterval.current = setInterval(() => {
        count++;
        setCountdown(count);
        if (count >= 4) {
          clearInterval(countdownInterval.current!);
        }
      }, 1000);


  
      const timer = setTimeout(() => {
        setIsPause(true);
      }, arcDuration);

      return () => {
        clearTimeout(timer);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      };
    } else {
 
              setPhaseLabel("Pause");
              setProgress(1); 

              let count = 1;
              setCountdown(count);
              if (countdownInterval.current) clearInterval(countdownInterval.current);

              countdownInterval.current = setInterval(() => {
                count++;
                setCountdown(count);
                if (count >= 4) {
                  clearInterval(countdownInterval.current!);
                }
              }, 1000);

              const pauseTimer = setTimeout(() => {
                setIndex((prev) => (prev + 1) % arcs.length);
                setIsPause(false);
                setProgress(0);
              }, 4000);

              return () => {
                clearTimeout(pauseTimer);
                if (countdownInterval.current) clearInterval(countdownInterval.current);
              };
            }

  }, [running, index, isPause]);

  const r = 100 - index * 10;
  const direction = arcs[index].direction === "inhale" ? 1 : -1;
  const t = direction === 1 ? progress : 1 - progress;

  const angle = Math.PI - (Math.PI / 2) * t;

  const centerX = 190;
  const centerY = 150;
  const cx = centerX + r * Math.cos(angle);
  const cy = centerY - r * Math.sin(angle);

  return (
    <Card className="w-full max-w-md py-10  flex flex-col items-center mx-auto space-y-8">
      <svg viewBox="0 0 300 200" className="w-full h-auto">
        <g transform="scale(1.5)" className="origin-center">
          {arcs.map((arc, i) => {
            const r = 100 - i * 10;
            const arcId = `arc-${i}`;

            return (
              <g key={i}>
                <path
                  id={arcId}
                  d={`M ${centerX - r} ${centerY} A ${r} ${r} 0 0 1 ${centerX} ${centerY - r}`}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="9"
                />
                <text fontSize="10" fontWeight="bold" fill="white">
                  <textPath
                    href={`#${arcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {arc.direction === "inhale" ? "Inhale -->" : "<-- Exhale"}
                  </textPath>
                </text>
              </g>
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
        </g>
        <text
          x={100}      
          y={200}      
          fontSize="14"
          fontWeight="bold"
          fill="black"
          textAnchor="middle"
        >
          Pause
        </text>
        <text
          x={30}      
          y={320}      
          fontSize="14"
          fontWeight="bold"
          fill="black"
          textAnchor="start"
          dominantBaseline="middle"
          transform="rotate(-90 10,100)"   
        >
          Pause
        </text>


      </svg>

      
      {running && (
        <div className="text-lg font-semibold text-center mt-5 px-4 py-2 rounded-md shadow-sm bg-blue-50"
        style={{ color: arcs[index].color }}
        >
          {phaseLabel} - {countdown}
        </div>
      )}

      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            setIndex(0);
            setProgress(0);
            setIsPause(false);
            setCountdown(4);
          }
        }}
        className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-full shadow-md hover:scale-105 transition-transform"
      >
        {running ? "Stop" : "Start"}
      </button>
    </Card>
  );
}
