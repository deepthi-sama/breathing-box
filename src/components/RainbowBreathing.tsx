"use client";

import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Helper to convert hex to rgba with opacity
function hexToRGBA(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

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
  const [sets, setSets] = useState(2);
  const [currentSet, setCurrentSet] = useState(1);

  const centerX = 190;
  const centerY = 150;

  useEffect(() => {
    if (!running) {
      setProgress(0);
      setCountdown(4);
      setIsPause(false);
      setPhaseLabel("");
      setIndex(0);
      setCurrentSet(1);
      return;
    }

    const arcDuration = 4000;
    const pauseDuration = 4000;

    let animationFrameId: number;
    let startTime: number | null = null;

    const animateArc = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / arcDuration, 1);
      setProgress(t);

      // Countdown from 1 to 4 seconds
      setCountdown(Math.min(4, Math.floor(elapsed / 1000) + 1));

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animateArc);
      } else {
        setIsPause(true);
      }
    };

    const animatePause = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;

      setCountdown(Math.min(4, Math.floor(elapsed / 1000) + 1));
      setProgress(1); // progress stays full during pause

      if (elapsed < pauseDuration) {
        animationFrameId = requestAnimationFrame(animatePause);
      } else {
        // If last arc and last set, stop running
        if (index === arcs.length - 1) {
          if (currentSet >= sets) {
            setRunning(false);
            return;
          } else {
            setCurrentSet((prev) => prev + 1);
          }
        }
        setIndex((prev) => (prev + 1) % arcs.length);
        setIsPause(false);
        setProgress(0);
      }
    };

    if (!isPause) {
      setPhaseLabel(arcs[index].direction.charAt(0).toUpperCase() + arcs[index].direction.slice(1));
      setCountdown(1);
      animationFrameId = requestAnimationFrame(animateArc);
    } else {
      setPhaseLabel("Pause");
      setCountdown(1);
      animationFrameId = requestAnimationFrame(animatePause);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [running, index, isPause, currentSet, sets]);

  return (
    <Card className="w-full max-w-md py-6 flex flex-col items-center mx-auto space-y-2">
      <svg viewBox="0 0 300 200" className="w-full h-auto">
        <g transform="scale(1.5)" className="origin-center">
          {arcs.map((arc, i) => {
            const r = 100 - i * 10;
            const arcId = `arc-${i}`;
            const circumference = (Math.PI * r) / 2;
            const isActive = running && i === index;

            // strokeDashoffset depends on direction for exhale arcs
            const strokeDashoffset = isActive
              ? arc.direction === "exhale"
                ? circumference * progress // reverse fill for exhale
                : circumference * (1 - progress)
              : circumference;

            const inactiveColor = hexToRGBA(arc.color, 0.3);
            const textColor = isActive ? arc.color : inactiveColor;

            return (
              <g key={i}>
                {/* Inactive arc always visible */}
                <g key={i}>
                {/* 🔹 Hidden path only for text anchor (always present) */}
                <path
                  id={`text-${arcId}`}
                  d={`M ${centerX - r} ${centerY} A ${r} ${r} 0 0 1 ${centerX} ${centerY - r}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="0"
                />

                {/* 🔹 Inactive arc always visible */}
                <path
                  d={`M ${centerX - r} ${centerY} A ${r} ${r} 0 0 1 ${centerX} ${centerY - r}`}
                  fill="none"
                  stroke={inactiveColor}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                />

                {/* 🔹 Animated arc (only while active) */}
                {isActive && (
                  <motion.path
                    id={arcId}
                    d={`M ${centerX - r} ${centerY} A ${r} ${r} 0 0 1 ${centerX} ${centerY - r}`}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 0.1s linear" }}
                  />
                )}

                {/* 🔹 Text always visible using hidden text path */}
                <text fontSize="10" fontWeight="bold" fill="white">
                  <textPath
                    href={`#text-${arcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {arc.direction === "inhale" ? "Inhale -->" : "<-- Exhale"}
                  </textPath>
                </text>
              </g>

              </g>
            );
          })}
        </g>
      </svg>

      {/* Animated phase label and countdown */}
      {running && (
        <div className="w-full flex flex-col items-center select-none">
          {/* Phase Label */}
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold"
            style={{ color: arcs[index].color }}
          >
            {phaseLabel}
          </motion.div>

          {/* Countdown Circle */}
          <motion.div
            key={countdown}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 flex items-center justify-center  text-blue-800 font-mono text-2xl font-semibold select-none"
            style={{ color: arcs[index].color }}
          >
            {countdown}
          </motion.div>
        </div>
      )}

      <div className="w-[280px] flex flex-col items-center select-none">
         <div className="w-[240px] flex justify-between mb-2 text-sm font-semibold text-gray-700">
          <span>Number of Sets</span>
          <span>{sets}</span>
        </div>
        <Slider
          id="setsRange"
          value={[sets]}
          min={1}
          max={8}
          step={1}
          disabled={running}
          onValueChange={(val) => setSets(val[0])}
          className="w-[240px]"
        />
      </div>

      <Button
        onClick={() => {
          if (running) {
            setRunning(false);
          } else {
            setRunning(true);
            setIndex(0);
            setProgress(0);
            setIsPause(false);
            setCountdown(4);
            setCurrentSet(1);
          }
        }}
      >
        {running ? "Stop" : "Start"}
      </Button>
    </Card>
  );
}
