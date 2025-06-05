'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export default function NewBox() {
  const phases = ["Inhale", "PauseAfterInhale", "Exhale", "PauseAfterExhale"];
  const phaseDuration = 4000;
  const totalCycle = phases.length * phaseDuration;
  const maxSets = 8;

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(phases[0]);
  const [phaseSeconds, setPhaseSeconds] = useState(1);
  const [setCount, setSetCount] = useState(0);
  const [targetSets, setTargetSets] = useState(2);

  const controls = useAnimation();

  const toggleRunning = () => {
    if (running) {
      setRunning(false);
      setSetCount(0);
      setPhase(phases[0]);
      setPhaseSeconds(1);
    } else {
      setRunning(true);
      setSetCount(0);
    }
  };

  useEffect(() => {
    let startTime = Date.now();

    const updatePhase = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const cycleElapsed = elapsed % totalCycle;
      const index = Math.floor(cycleElapsed / phaseDuration);
      setPhase(phases[index]);
      const seconds = Math.floor((cycleElapsed % phaseDuration) / 1000) + 1;
      setPhaseSeconds(seconds);

      const completedSets = Math.floor(elapsed / totalCycle);

      if (completedSets >= targetSets) {
        setRunning(false);
        setSetCount(targetSets);
      } else {
        setSetCount(completedSets);
      }
    };

    if (running) {
      updatePhase();
      const interval = setInterval(updatePhase, 100);
      return () => clearInterval(interval);
    }
  }, [running, targetSets]);

  useEffect(() => {
    const boxSize = 200;
    if (running) {
      controls.start({
        strokeDashoffset: 0,
        transition: {
          duration: totalCycle / 1000,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    } else {
      controls.stop();
      controls.set({ strokeDashoffset: 4 * (boxSize - 4) });
    }
  }, [running, totalCycle]);

  function formatPhase(phase: string) {
    if (phase.startsWith("Pause")) return "Pause";
    return phase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  const boxSize = 200;
  const strokeLength = 4 * (boxSize - 4);
  const borderColor = "#3b82f6";

  return (
    <Card className="w-full max-w-md mt-12 flex flex-col items-center mx-auto px-6 py-10 space-y-8 select-none">
      {/* Box with motion outline */}
      <div className="relative w-[220px] h-[220px] mb-8">
        <svg width={boxSize} height={boxSize} className="absolute top-0 left-0">
          <rect
            x="2"
            y="2"
            width={boxSize - 4}
            height={boxSize - 4}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <motion.rect
            x="2"
            y="2"
            width={boxSize - 4}
            height={boxSize - 4}
            fill="transparent"
            stroke={borderColor}
            strokeWidth="4"
            strokeDasharray={strokeLength}
            strokeDashoffset={strokeLength}
            animate={controls}
          />
        </svg>

        {running && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-blue-800"
            >
              {formatPhase(phase)}
            </motion.div>
            <motion.div
              key={phase + phaseSeconds}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg text-blue-600 mt-1"
            >
              {phaseSeconds}
            </motion.div>
          </div>
        )}

        {/* Phase Labels */}
        <span className="absolute left-[-3.5rem] top-1/2 -translate-y-1/2 text-sm text-blue-500 font-medium">Pause</span>
        <span className="absolute top-[-1.5rem] left-1/2 -translate-x-1/2 text-sm text-blue-500 font-medium">Inhale</span>
        <span className="absolute right-[-3.5rem] top-1/2 -translate-y-1/2 text-sm text-blue-500 font-medium">Pause</span>
        <span className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 text-sm text-blue-500 font-medium">Exhale</span>
      </div>

      {/* Slider */}
      <div className="w-[280px] flex flex-col items-center select-none">
        <div className="w-[240px] flex justify-between mb-2 text-sm font-semibold text-gray-700">
          <span>Number of Sets</span>
          <span>{targetSets}</span>
        </div>
        <Slider
          value={[targetSets]}
          onValueChange={(val) => {
            if (!running) {
              setTargetSets(val[0]);
              setSetCount(0);
            }
          }}
          min={1}
          max={8}
          step={1}
          disabled={running}
          className="w-[240px]"
        />
      </div>

      {/* Start-Stop Button */}
      <Button onClick={toggleRunning} disabled={targetSets === 0}>
        {running ? "Stop" : "Start"}
      </Button>
    </Card>
  );
}
