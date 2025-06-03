'use client';

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function StarBreathing() {
  const scale = 3;
  const starPoints = [
    { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 },
    { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 },
  ].map(p => ({ x: p.x * scale, y: p.y * scale }));

  const pathData = starPoints
    .map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x},${p.y}`)
    .join(' ') + ' Z';

  const segmentCount = starPoints.length * 2; // 20 segments
  const segmentDuration = 4000; // 4 seconds per segment
  const fullCycleDuration = segmentCount * segmentDuration; // 80,000 ms

  const inhaleColor = "#22c55e"; 
  const exhaleColor = "#ef4444";
  const pauseColor = "#facc15";

  const controls = useAnimation();

  const [running, setRunning] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(1); // start from Inhale segment index 1
  const [phaseName, setPhaseName] = useState("Inhale");
  const [phaseColor, setPhaseColor] = useState(inhaleColor);
  const [phaseSecond, setPhaseSecond] = useState(1);
  const [startTime, setStartTime] = useState<number | null>(null);

  function getEdgePositions(edgeIndex: number) {
    const from = starPoints[edgeIndex % starPoints.length];
    const to = starPoints[(edgeIndex + 1) % starPoints.length];
    return { from, to };
  }

  function getVertexPosition(vertexIndex: number) {
    return starPoints[vertexIndex % starPoints.length];
  }

  function updatePhase(segIndex: number) {
    if (segIndex % 2 === 0) {
      const edgeIdx = segIndex / 2;
      const phase = edgeIdx % 2 === 0 ? "Exhale" : "Inhale";
      const color = phase === "Inhale" ? inhaleColor : exhaleColor;
      setPhaseName(phase);
      setPhaseColor(color);
    } else {
      setPhaseName("Pause");
      setPhaseColor(pauseColor);
    }
  }

  function getCurrentSegmentAndProgress() {
    if (!startTime) return { segIndex: 1, progress: 0 };
    const now = Date.now();
    const elapsed = (now - startTime + fullCycleDuration) % fullCycleDuration;
    const segIndex = Math.floor(elapsed / segmentDuration);
    const progress = (elapsed % segmentDuration) / segmentDuration;
    return { segIndex, progress };
  }

  function updatePosition() {
    const { segIndex, progress } = getCurrentSegmentAndProgress();
    setSegmentIndex(segIndex);
    updatePhase(segIndex);
    setPhaseSecond(Math.floor(progress * 4) + 1);

    if (segIndex % 2 === 0) {
      const edgeIndex = segIndex / 2;
      const { from, to } = getEdgePositions(edgeIndex);
      const cx = from.x + (to.x - from.x) * progress;
      const cy = from.y + (to.y - from.y) * progress;
      controls.set({ cx, cy });
    } else {
      const vertexIndex = (segIndex + 1) / 2;
      const pos = getVertexPosition(vertexIndex);
      controls.set({ cx: pos.x, cy: pos.y });
    }
  }

  useEffect(() => {
    if (!running) {
      const inhaleEdgeStart = starPoints[1];
      controls.set({ cx: inhaleEdgeStart.x, cy: inhaleEdgeStart.y });
      setPhaseName("Inhale");
      setPhaseColor(inhaleColor);
      setPhaseSecond(1);
      setSegmentIndex(1);
      setStartTime(null);
      return;
    }

    let animationFrameId: number;

    function loop() {
      updatePosition();
      animationFrameId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [running]);

  function getEdgeLabelPos(index: number) {
    const from = starPoints[index];
    const to = starPoints[(index + 1) % starPoints.length];
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const offset = -15;
    const offsetX = -(dy / length) * offset;
    const offsetY = (dx / length) * offset;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x: midX + offsetX, y: midY + offsetY, angle };
  }

  return (
    <Card className="w-full max-w-md h-[60vh] flex flex-col justify-center items-center gap-4 mx-auto">
      <svg
        viewBox={`-${10 * scale} -${10 * scale} ${120 * scale} ${120 * scale}`}
        className="w-[400px] h-[400px]"
      >
        <path
          d={pathData}
          fill={phaseColor}
          fillOpacity="0.3"
          stroke={phaseColor}
          strokeWidth={scale * 1.2}
        />

        {starPoints.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={2.5 * scale / 2} fill="#f97316" />
        ))}

        {starPoints.map((_, i) => {
          const { x, y, angle } = getEdgeLabelPos(i);
          const label = i % 2 === 0 ? "Exhale" : "Inhale";
          const color = i % 2 === 0 ? exhaleColor : inhaleColor;
          return (
            <text
              key={`edge-label-${i}`}
              x={x}
              y={y}
              fill={color}
              fontSize={10 * scale / 2}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
              pointerEvents="none"
              transform={`rotate(${angle} ${x} ${y})`}
            >
              {label}
            </text>
          );
        })}

       {running && (<motion.circle
          r={5 * scale / 2}
          fill={phaseColor}
          initial={{ cx: starPoints[1].x, cy: starPoints[1].y }}
          animate={controls}
          style={{
            filter: `drop-shadow(0 0 12px ${phaseColor})`,
          }}
        />)}  
      </svg>

      
      {running && (
        <div
          className="text-lg font-semibold text-center mt-5 px-4 py-2 rounded-md shadow-sm bg-blue-50"
          style={{ color: phaseColor }}
        >
          {phaseName} - {phaseSecond}
        </div>
      )}

      <button
        onClick={() => {
          if (!running) {
            setStartTime(Date.now() - segmentDuration);
            setRunning(true);
          } else {
            setRunning(false);
            setStartTime(null);
          }
        }}
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-full shadow-md hover:scale-105 transition-transform"
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </Card>
  );
}
