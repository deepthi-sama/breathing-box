'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function StarBreathing() {
  const scale = 3;
  const strokeColor = "#2563eb"; // nice blue

  const starPoints = [
    { x: 50, y: 0 },
    { x: 64, y: 35 },
    { x: 100, y: 35 },
    { x: 70, y: 58 },
    { x: 82, y: 93 },
    { x: 50, y: 72 },
    { x: 18, y: 93 },
    { x: 30, y: 58 },
    { x: 0, y: 35 },
    { x: 36, y: 35 },
  ].map((p) => ({ x: p.x * scale, y: p.y * scale }));

  const pathData =
    starPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";

  // Calculate each edge length
  const edgeLengths = starPoints.map((p, i) => {
    const next = starPoints[(i + 1) % starPoints.length];
    const dx = next.x - p.x;
    const dy = next.y - p.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  const totalEdgeLength = edgeLengths.reduce((a, b) => a + b, 0);

  const segmentDuration = 4000; // 4 seconds per phase (edge or pause)
  const totalSegments = starPoints.length * 2; // pause + edge for each vertex
  const fullDuration = totalSegments * segmentDuration;

  const [startTime, setStartTime] = useState<number | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [phaseName, setPhaseName] = useState("Pause");
  const [phaseSecond, setPhaseSecond] = useState(1);
  const [running, setRunning] = useState(false);
  const [targetSets, setTargetSets] = useState(2);
  const [completedSets, setCompletedSets] = useState(0);
  const [maxPausedVertex, setMaxPausedVertex] = useState(-1); // track filled vertices

  const controls = useAnimation();

  function computeStrokeProgress(segIndex: number, progressInSeg: number): number {
    const fullEdgesDone = Math.floor(segIndex / 2);
    const lengthSoFar = edgeLengths.slice(0, fullEdgesDone).reduce((a, b) => a + b, 0);

    if (segIndex % 2 === 0) {
      // Pause at vertex: stroke length stays fixed
      return lengthSoFar / totalEdgeLength;
    } else {
      // Animate along edge:
      const edgeIndex = Math.floor(segIndex / 2);
      const edgeLength = edgeLengths[edgeIndex];
      const length = lengthSoFar + edgeLength * progressInSeg;
      return length / totalEdgeLength;
    }
  }

  function updatePhase(segIndex: number) {
    if (segIndex % 2 === 0) {
      setPhaseName("Pause");
      // On pause phase, update maxPausedVertex to fill dot
      const vertexIdx = segIndex / 2;
      if (vertexIdx > maxPausedVertex) setMaxPausedVertex(vertexIdx);
    } else {
      const edgeIndex = Math.floor(segIndex / 2);
      setPhaseName(edgeIndex % 2 === 0 ? "Inhale" : "Exhale");
    }
  }

  function animate() {
    if (!startTime) return;

    const now = Date.now();
    const elapsed = now - startTime;
    const cycleElapsed = elapsed % fullDuration;

    const segIndex = Math.floor(cycleElapsed / segmentDuration);
    const progressInSeg = (cycleElapsed % segmentDuration) / segmentDuration;

    setSegmentIndex(segIndex);
    updatePhase(segIndex);
    setPhaseSecond(Math.floor(progressInSeg * 4) + 1);

    const strokeProgress = computeStrokeProgress(segIndex, progressInSeg);
    controls.set({ pathLength: strokeProgress });

    const setsDone = Math.floor(elapsed / fullDuration);
    setCompletedSets(setsDone);

    if (setsDone >= targetSets) {
      setRunning(false);
      setStartTime(null);
    }
  }

  // Reset everything on stop
  useEffect(() => {
    if (!running) {
      controls.set({ pathLength: 0 });
      setSegmentIndex(0);
      setPhaseName("Pause");
      setPhaseSecond(1);
      setCompletedSets(0);
      setStartTime(null);
      setMaxPausedVertex(-1);
      return;
    }

    let rafId: number;

    const loop = () => {
      animate();
      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(rafId);
  }, [running]);

  return (
    <Card className="w-full max-w-md h-[90vh] flex flex-col justify-center items-center gap-4 mx-auto px-4 pt-4">
      {/* Relative wrapper for SVG and timer */}
      <div className="relative w-[400px] h-[400px]">
        <svg
          viewBox={`-${10 * scale} -${10 * scale} ${120 * scale} ${120 * scale}`}
          className="w-[400px] h-[400px]"
        >
          {/* Star background */}
          <path d={pathData} fill="none" stroke="#e5e7eb" strokeWidth={scale * 1.3} />
          {/* Animated stroke */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={scale * 1.3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={controls}
          />
          {/* Edge Labels (offset above edges) */}
          {starPoints.map((pt, idx) => {
            const next = starPoints[(idx + 1) % starPoints.length];
            const midX = (pt.x + next.x) / 2;
            const midY = (pt.y + next.y) / 2;

            // Compute angle of the edge
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const angleRad = Math.atan2(dy, dx);

            // Perpendicular offset direction (rotate 90° counter-clockwise)
            const offsetDist = -10; // distance above the edge
            const offsetX = -offsetDist * Math.sin(angleRad);
            const offsetY = offsetDist * Math.cos(angleRad);

            const labelX = midX + offsetX;
            const labelY = midY + offsetY;

            const angleDeg = (angleRad * 180) / Math.PI;

            const edgeLabel = idx % 2 === 0 ? "Inhale" : "Exhale";

            return (
              <text
                key={`label-${idx}`}
                x={labelX}
                y={labelY}
                fontSize={14}
                fontWeight="bold"
                fill="#6b7280"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${angleDeg} ${labelX} ${labelY})`}
                style={{ userSelect: "none" }}
              >
                {edgeLabel}
              </text>
            );
          })}

          {/* Vertices dots */}
          {starPoints.map((pt, idx) => {
            const isVisited = idx <= maxPausedVertex;
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={6}
                fill={isVisited ? strokeColor : "#e5e7eb"} // Match unfilled edges
                stroke={isVisited ? strokeColor : "#e5e7eb"}
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* Timer overlay */}
        {running && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none z-50">
            <motion.div
              key={phaseName}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-blue-800 bg-white bg-opacity-80 px-4 rounded"
            >
              {phaseName}
            </motion.div>
            <motion.div
              key={phaseSecond}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl text-blue-600 mt-1 bg-white bg-opacity-80 px-3 rounded"
            >
              {phaseSecond}
            </motion.div>
          </div>
        )}
      </div>

      <div className="w-[280px] flex flex-col items-center select-none">
        <div className="w-[240px] flex justify-between mb-2 text-sm font-semibold text-gray-700">
          <span>Number of Sets</span>
          <span>{targetSets}</span>
        </div>

        <Slider
          id="sets"
          value={[targetSets]}
          min={1}
          max={8}
          step={1}
          onValueChange={(val) => setTargetSets(val[0])}
          disabled={running}
          className="w-[240px]"
        />
      </div>


      <Button
        onClick={() => {
          if (!running) {
            setStartTime(Date.now());
            setRunning(true);
          } else {
            setRunning(false);
          }
        }}
        disabled={targetSets === 0}
        className="mt-5"
      >
        {running ? "Stop" : "Start"}
      </Button>
    </Card>
  );
}
