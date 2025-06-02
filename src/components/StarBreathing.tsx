'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react";

export default function StarBreathing() {
  const scale = 3;
  const starPoints = [
    { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 },
    { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 },
  ].map(p => ({ x: p.x * scale, y: p.y * scale }));

  const pathData = starPoints
    .map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x},${p.y}`)
    .join(' ') + ' Z';

  const stepDuration = 4000; 
  const totalCycle = starPoints.length * stepDuration;

  const phases = [
    { name: "Inhale", edges: [0, 1, 2], color: "#22c55e" },
    { name: "Pause", edges: [3], color: "#facc15" },
    { name: "Exhale", edges: [4, 5, 6, 7], color: "#ef4444" },
    { name: "Pause", edges: [8, 9], color: "#facc15" },
  ];

  function getCurrentPhase(edgeIndex: number) {
    return phases.find(phase => phase.edges.includes(edgeIndex)) || phases[0];
  }

  const [running, setRunning] = useState(false);
  const [dotPos, setDotPos] = useState(starPoints[0]);
  const [phaseName, setPhaseName] = useState(phases[0].name);
  const [phaseColor, setPhaseColor] = useState(phases[0].color);
  const startTimeRef = useRef<number | null>(null);

  function lerp(start: { x: number, y: number }, end: { x: number, y: number }, t: number) {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  }

  function getEdgeLabelPos(edgeIndex: number) {
  const from = starPoints[edgeIndex];
  const to = starPoints[(edgeIndex + 1) % starPoints.length];
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const offset = -10; 
  const offsetX = -(dy / length) * offset;
  const offsetY = (dx / length) * offset;

  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return {
    x: midX + offsetX,
    y: midY + offsetY,
    angle,
  };
}


  useEffect(() => {
    if (!running) {
      setDotPos(starPoints[0]);
      setPhaseName(phases[0].name);
      setPhaseColor(phases[0].color);
      startTimeRef.current = null;
      return;
    }

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) % totalCycle;
      const currentEdge = Math.floor(elapsed / stepDuration);
      const progress = (elapsed % stepDuration) / stepDuration;

      const from = starPoints[currentEdge];
      const to = starPoints[(currentEdge + 1) % starPoints.length];

      setDotPos(lerp(from, to, progress));

      const currentPhase = getCurrentPhase(currentEdge);
      setPhaseName(currentPhase.name);
      setPhaseColor(currentPhase.color);

      requestAnimationFrame(animate);
    }

    const rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      startTimeRef.current = null;
    };
  }, [running]);

  return (
    <Card className="w-full max-w-md h-[60vh] flex flex-col justify-center items-center gap-4 mx-auto">
      <svg
        viewBox={`-${10 * scale} -${10 * scale} ${120 * scale} ${120 * scale}`}
        className="w-[400px] h-[400px]"
      >
        <path
          d={pathData}
          fill="#fbbf24"
          fillOpacity="0.3"
          stroke="#f59e0b"
          strokeWidth={scale / 3}
        />
        {starPoints.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={1.5 * scale / 2} fill="#f97316" />
        ))}
        {Array.from({ length: starPoints.length }).map((_, i) => {
          const { x, y, angle } = getEdgeLabelPos(i);
          const label = i % 2 === 0 ? "Exhale" : "Inhale";
          const color = i % 2 === 0 ? "#ef4444" : "#22c55e";

          return (
            <text
              key={`edge-label-${i}`}
              x={x}
              y={y}
              fill={color}
              fontSize={6 * scale / 2}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
              pointerEvents="none"
              userSelect="none"
              transform={`rotate(${angle} ${x} ${y})`}
            >
              {label}
            </text>
          );
        })}
        <circle
          r={5 * scale / 2} 
          fill="#f97316"
          cx={dotPos.x}
          cy={dotPos.y}
        />
      </svg>


      <button
        onClick={() => setRunning(r => !r)}
        className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition"
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </Card>
  );
}
