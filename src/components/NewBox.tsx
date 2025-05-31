'use client'

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion";
import { useState, useEffect } from 'react'


const colorMap: Record<string, string> = {
  "bg-green-500": "#22c55e",  
  "bg-yellow-400": "#facc15", 
  "bg-red-500": "#ef4444",    
};

function getTailwindColorHex(twClass: string) {
  return colorMap[twClass] || "#000"; 
}

export default function NewBox() {
  const phases = ["Inhale", "PauseAfterInhale", "Exhale", "PauseAfterExhale"];
  const phaseDuration = 4000; 
  const totalCycle = phases.length * phaseDuration; 
  const [running, setRunning] = useState(false);
  const toggleRunning = () => setRunning(prev => !prev);

  const phaseStyles: Record<string, { text: string; color: string; border: string }> = {
    Inhale: { text: "text-green-600", color: "bg-green-500", border: "border-green-500" },
    PauseAfterInhale: { text: "text-yellow-500", color: "bg-yellow-400", border: "border-yellow-400" },
    Exhale: { text: "text-red-600", color: "bg-red-500", border: "border-red-500" },
    PauseAfterExhale: { text: "text-yellow-500", color: "bg-yellow-400", border: "border-yellow-400" },
  };

  const [phase, setPhase] = useState(phases[0]);

  useEffect(() => {
    let startTime = Date.now();

    const updatePhase = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % totalCycle;
      const index = Math.floor(elapsed / phaseDuration);
      setPhase(phases[index]);
    };

    if (running) {
      updatePhase();
      const interval = setInterval(updatePhase, 100);
      return () => clearInterval(interval);
    }
  }, [running]);

  return (
    <>
      <Card className="w-full max-w-md h-[50vh] flex flex-col justify-between items-center mx-auto"
     
      >
        <div className="relative flex-grow flex justify-center items-center">
          <div className={`w-32 h-32 md:h-40 md:w-40 border-4 relative ${phaseStyles[phase].border}`}>
            <span className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-8 text-sm ${phase === "Inhale" ? phaseStyles[phase].text + " font-semibold scale-110" : "text-blue-300"}`}>
              Inhale
            </span>

            <span className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-full text-sm pl-8 ${phase === "PauseAfterInhale" ? phaseStyles[phase].text + " font-semibold scale-110" : "text-blue-300"}`}>
              Pause
            </span>

            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-8 text-sm ${phase === "Exhale" ? phaseStyles[phase].text + " font-semibold scale-110" : "text-blue-300"}`}>
              Exhale
            </span>

            <span className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full pr-8 text-sm ${phase === "PauseAfterExhale" ? phaseStyles[phase].text + " font-semibold scale-110" : "text-blue-300"}`}>
              Pause
            </span>

            {running && (
              <motion.div
                className={`w-4 h-4 rounded-full absolute ${phaseStyles[phase].color} shadow-lg`}
                style={{
                  boxShadow: `0 0 12px 4px ${getTailwindColorHex(phaseStyles[phase].color)}`,
                }}
                animate={{
                  x: [-10, 145, 145, -10, -10],
                  y: [-10, -10, 145, 145, -10],
                  scale: [1, 1.2, 1.2, 1, 1],
                }}
                transition={{
                  duration: 16,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            )}
          </div>
        </div>
        <button
          onClick={toggleRunning}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-full shadow-md hover:scale-105 transition-transform"
        >
          {running ? "Stop" : "Start"}
        </button>
      </Card>
    </>
  );
}
