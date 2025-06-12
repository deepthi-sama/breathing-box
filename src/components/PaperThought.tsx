'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const suggestions: Record<string, string[]> = {
  iam: ['not good enough', 'a failure', 'unworthy', 'powerless', 'incompetent', 'dishonest', 'coward', 'useless', 'unskilled', 'stupid', 'incapable'],
  peopleSee: ['a burden', 'lazy', 'weird', 'fake', 'arrogant', 'unfunny', 'a joke', 'annoying', 'ignorant', 'selfish'],
  always: ['messing things up', 'too emotional', 'anxious', 'hesitant', 'ignored', 'neglected', 'wrong'],
  never: ['succeed', 'be loved', 'be enough', 'enjoy life', 'feel blessed'],
};

const affirmations: Record<string, string> = {
  'I am': 'I am enough and worthy of love.',
  'People see me as': 'People appreciate the real me.',
  "I'm always": 'I am growing and learning every day.',
  "I'll never be able to": 'I am capable of amazing things.',
};

type SentenceKeys = 'I am' | 'People see me as' | "I'm always" | "I'll never be able to";

type Fragment = {
  id: number;
  size: number;
  initialX: number;
  initialY: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  delay: number;
  text: string;
};

const generateTearStages = (cardWidth = 320, cardHeight = 500, thoughts: string[] = []) => {
  const stages = [];
  for (let stage = 0; stage < 4; stage++) {
    const pieces = Math.pow(2, stage + 1);
    const stageFragments = [];
    for (let i = 0; i < pieces; i++) {
      const angle = (Math.PI * 2 * i) / pieces;
      const radius = 20 + Math.random() * 30;
      stageFragments.push({
        id: stage * 10 + i,
        size: cardWidth / Math.sqrt(pieces),
        initialX: Math.cos(angle) * radius,
        initialY: Math.sin(angle) * radius,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * 180 + (Math.random() - 0.5) * 50,
        velocityY: Math.sin(angle) * 180 + (Math.random() - 0.5) * 50,
        delay: stage * 0.5,
        text: thoughts[i % thoughts.length] || '',
      });
    }
    stages.push(stageFragments);
  }
  return stages;
};

export default function BurnNegativeCarousel() {
  const [step, setStep] = useState(0);
  const [sentences, setSentences] = useState<Record<SentenceKeys, string>>({
    'I am': '',
    'People see me as': '',
    "I'm always": '',
    "I'll never be able to": '',
  });
  const [tearStage, setTearStage] = useState(0);
  const [isTearing, setIsTearing] = useState(false);
  const tearStages = useRef<Fragment[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const filledAny = Object.values(sentences).some(Boolean);
  const filledSentences = Object.entries(sentences)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k} ${v}`);

  const handleCrush = () => {
    tearStages.current = generateTearStages(320, 500, filledSentences);
    setIsTearing(true);
    let stage = 0;
    const interval = setInterval(() => {
      setTearStage(stage);
      stage++;
      if (stage >= tearStages.current.length) {
        clearInterval(interval);
        setTimeout(() => setStep(step + 1), 1000);
      }
    }, 500);
  };

  const handleDiscard = () => {
    setSentences({ 'I am': '', 'People see me as': '', "I'm always": '', "I'll never be able to": '' });
    setIsTearing(false);
    setTearStage(0);
    setStep(0);
  };

  const cardBaseStyle = "min-h-[500px] flex flex-col justify-between text-center p-6 select-none rounded-2xl shadow-md";

  useEffect(() => {
    const preventDrag = (e: MouseEvent) => e.preventDefault();
    const node = containerRef.current;
    if (node) {
      node.addEventListener('dragstart', preventDrag);
      node.addEventListener('mousedown', preventDrag);
    }
    return () => {
      if (node) {
        node.removeEventListener('dragstart', preventDrag);
        node.removeEventListener('mousedown', preventDrag);
      }
    };
  }, []);

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-200 overflow-hidden"
      ref={containerRef}
    >
      <Carousel className="w-full max-w-md pointer-events-none" opts={{ align: 'start', dragFree: false }}>
        <CarouselContent
          className="pointer-events-auto"
          style={{ transform: `translateX(-${step * 100}%)`, transition: 'transform 0.5s ease' }}
        >
          {/* Intro */}
          <CarouselItem className="p-4">
            <Card className={cardBaseStyle + " bg-neutral-50"}>
              <div className="flex flex-col items-center justify-center text-center flex-1">
                <h2 className="text-2xl font-bold mb-2">Burn the Negative</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Ready to let go? <br />
                  Write your thoughts and watch them disappear!
                </p>
              </div>
              <Button className="mt-6" onClick={() => setStep(1)}>Next</Button>
            </Card>
          </CarouselItem>

          {/* Input */}
          <CarouselItem className="p-4">
            <Card className={cardBaseStyle + " bg-neutral-50"}>
              <div>
                <Dropdown label="I am" value={sentences['I am']} onSelect={v => setSentences({ ...sentences, 'I am': v })} options={suggestions.iam} />
                <Dropdown label="People see me as" value={sentences['People see me as']} onSelect={v => setSentences({ ...sentences, 'People see me as': v })} options={suggestions.peopleSee} />
                <Dropdown label="I'm always" value={sentences["I'm always"]} onSelect={v => setSentences({ ...sentences, "I'm always": v })} options={suggestions.always} />
                <Dropdown label="I'll never be able to" value={sentences["I'll never be able to"]} onSelect={v => setSentences({ ...sentences, "I'll never be able to": v })} options={suggestions.never} />
              </div>
              <Button className="mt-6" disabled={!filledAny} onClick={() => setStep(2)}>Next</Button>
            </Card>
          </CarouselItem>

          {/* Tear animation */}
          <CarouselItem className="p-4">
            <Card className={cardBaseStyle + " bg-rose-100"}>
              <div className="relative flex-1 flex items-center justify-center">
                {!isTearing && (
                  <motion.div
                    className="border border-gray-300 bg-white p-4 rounded-lg shadow-md relative"
                    initial={{ scale: 1, opacity: 1 }}
                  >
                    {filledSentences.map((line, idx) => (
                      <motion.p
                        key={idx}
                        className="text-lg font-semibold text-gray-800 text-center mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.4 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </motion.div>
                )}

                {isTearing && tearStages.current[tearStage]?.map((frag) => (
                  <ThoughtFragment key={frag.id} frag={frag} />
                ))}
              </div>
              <Button variant="destructive" onClick={handleCrush} disabled={isTearing}>
                {isTearing ? 'Crushing...' : 'Crush'}
              </Button>
            </Card>
          </CarouselItem>

          {/* Final screen */}
          <CarouselItem className="p-4">
            <Card className={cardBaseStyle}>
              <motion.div
                className="flex flex-col items-center justify-center text-center flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h2
                  className="text-2xl font-bold text-green-800"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  The hard thoughts are gone, hooray!
                </motion.h2>
                <motion.p
                  className="text-green-900 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Embrace the freedom to write a new story about you!
                </motion.p>
              </motion.div>
              <div className="flex justify-center gap-4">
                <Button variant="default">Save</Button>
                <Button variant="outline" onClick={handleDiscard}>Discard</Button>
              </div>
            </Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}

type DropdownProps = {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  options: string[];
};

function Dropdown({ label, value, onSelect, options }: DropdownProps) {
  return (
    <div className="mb-6">
      <p className="text-xl font-bold mb-1">{label}</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Input
            readOnly
            value={value}
            placeholder="Tap to select..."
            className="cursor-pointer border-0 border-b border-black bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((opt, idx) => (
            <DropdownMenuItem key={idx} onClick={() => onSelect(opt)}>
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ThoughtFragment({ frag }: { frag: Fragment }) {
  return (
    <motion.div
      className="absolute bg-white border border-gray-300 shadow-sm flex items-center justify-center text-xs font-medium text-gray-700 text-center p-1"
      style={{
        width: frag.size,
        height: frag.size,
        clipPath: 'polygon(10% 0%, 0% 60%, 30% 100%, 100% 80%, 90% 20%)',
        zIndex: 50,
        lineHeight: 1.1,
        overflow: 'hidden',
      }}
      initial={{
        x: frag.initialX,
        y: frag.initialY,
        rotate: frag.rotation,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        x: frag.initialX + frag.velocityX,
        y: frag.initialY + frag.velocityY,
        rotate: frag.rotation + frag.velocityX * 1.2,
        opacity: 0,
        scale: 0.4,
      }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
      }}
    >
      {frag.text}
    </motion.div>
  );
}
