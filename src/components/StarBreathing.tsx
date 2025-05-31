'use client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function StarBreathing() {
  const starPoints = [
    { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 },
    { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 },
  ];

  const pathData = starPoints
    .map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x},${p.y}`)
    .join(' ') + ' Z';

  const [pointIndex, setPointIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointIndex((prev) => (prev + 1) % starPoints.length);
    }, 4000); // 4 seconds per edge
    return () => clearInterval(interval);
  }, []);

  const next = starPoints[(pointIndex + 1) % starPoints.length];

  return (
    <Card className="w-full max-w-md h-[50vh] flex flex-col justify-center items-center gap-4 mx-auto">
      <svg viewBox="-10 -10 120 120" className="w-[300px] h-[300px]">
        <path
          d={pathData}
          fill="#fbbf24"
          fillOpacity="0.3"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        {starPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={1.5} fill="#f97316" />
        ))}
        <motion.circle
          r={3.5}
          fill="#f97316"
          initial={false}
          animate={{ cx: next.x, cy: next.y }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </svg>

      <button className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition">
        Start
      </button>
    </Card>
  );
}
