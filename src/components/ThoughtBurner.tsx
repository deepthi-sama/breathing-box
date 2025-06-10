'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const suggestions: Record<string, string[]> = {
  iam: ['not good enough', 'a failure', 'unworthy','powerless','incompetent','dishonest','coward','useless','unskilled','stupid','incapable'],
  peopleSee: ['a burden', 'lazy', 'weird','fake','arrogant','unfunny','a joke','annoying','ignorant','selfish'],
  always: ['messing things up', 'too emotional', 'anxious','hesitant','ignored','neglected','wrong'],
  never: ['succeed', 'be loved', 'be enough','enjoy life','feel blessed'],
};

type SentenceKeys = 'I am' | 'People see me as' | "I'm always" | "I'll never be able to";

// Generate glass fragments with random positions and rotations
const generateGlassFragments = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20, // Random size between 20-60px
    initialX: Math.random() * 300 - 150, // Random X position
    initialY: Math.random() * 200 - 100, // Random Y position
    rotation: Math.random() * 360, // Random rotation
    velocityX: (Math.random() - 0.5) * 200, // Random horizontal velocity
    velocityY: Math.random() * -100 - 50, // Upward initial velocity
    delay: Math.random() * 0.1, // Small random delay
  }));
};

export default function BurnNegativeCarousel() {
  const [step, setStep] = useState<number>(0);
  const [sentences, setSentences] = useState<Record<SentenceKeys, string>>({
    'I am': '',
    'People see me as': '',
    "I'm always": '',
    "I'll never be able to": '',
  });
  const [crushed, setCrushed] = useState<boolean>(false);
  const [glassFragments] = useState(() => generateGlassFragments(15));
  const containerRef = useRef<HTMLDivElement>(null);

  const filledAny = Object.values(sentences).some(Boolean);
  const filledSentences = Object.entries(sentences)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k} ${v}`);

  const handleCrush = () => {
    setCrushed(true);
    setTimeout(() => setStep(step + 1), 1000); // Increased delay to see full animation
  };

  const handleDiscard = () => {
    setSentences({ 'I am': '', 'People see me as': '', "I'm always": '', "I'll never be able to": '' });
    setCrushed(false);
    setStep(0);
  };

  const cardBaseStyle = "min-h-[500px] flex flex-col justify-between text-center p-6 select-none";

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
      className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 to-purple-600 overflow-hidden"
      ref={containerRef}
    >
      <Carousel
        className="w-full max-w-md pointer-events-none"
        opts={{ align: 'start', dragFree: false }}
      >
        <CarouselContent
          className="pointer-events-auto"
          style={{ transform: `translateX(-${step * 100}%)`, transition: 'transform 0.5s ease' }}
        >
          <CarouselItem className="p-4">
            <Card className={cardBaseStyle}>
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

          <CarouselItem className="p-4">
            <Card className={cardBaseStyle}>
              <div>
                <Dropdown label="I am" value={sentences['I am']} onSelect={v => setSentences({ ...sentences, 'I am': v })} options={suggestions.iam} />
                <Dropdown label="People see me as" value={sentences['People see me as']} onSelect={v => setSentences({ ...sentences, 'People see me as': v })} options={suggestions.peopleSee} />
                <Dropdown label="I'm always" value={sentences["I'm always"]} onSelect={v => setSentences({ ...sentences, "I'm always": v })} options={suggestions.always} />
                <Dropdown label="I'll never be able to" value={sentences["I'll never be able to"]} onSelect={v => setSentences({ ...sentences, "I'll never be able to": v })} options={suggestions.never} />
              </div>
              <Button className="mt-6" disabled={!filledAny} onClick={() => setStep(2)}>Next</Button>
            </Card>
          </CarouselItem>

          <CarouselItem className="p-4">
            <Card className={cardBaseStyle}>
              <div className="relative flex-1 flex items-center justify-center">
                {/* Original card content */}
                <motion.div
                  className="border-2 border-gray-300 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(173, 216, 230,0.9) 0%, rgba(173, 216, 230,0.6) 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.1)'
                  }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={crushed ? { 
                    scale: 0.95, 
                    opacity: 0,
                    filter: 'blur(2px)'
                  } : {}}
                  transition={{ duration: 0}}
                >
                  {/* Glass shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
                  
                  {filledSentences.map((line, idx) => (
                    <motion.p
                      key={idx}
                      className="text-lg font-semibold text-gray-800 text-center mb-2 relative z-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: crushed ? 0 : 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>

                {/* Glass fragments */}
                {crushed && glassFragments.map((fragment) => (
                  <motion.div
                    key={fragment.id}
                    className="absolute bg-blue/80 backdrop-blur-sm border border-gray-200"
                    style={{
                      width: fragment.size,
                      height: fragment.size,
                      clipPath: 'polygon(30% 0%, 0% 50%, 40% 100%, 100% 70%, 80% 20%)', // Irregular glass shape
                      background: 'linear-gradient(135deg, rgba(173, 216, 230,0.9) 0%, rgba(173, 216, 230,0.6) 100%)',

                      boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)'
                    }}
                    initial={{
                      x: fragment.initialX,
                      y: fragment.initialY,
                      rotate: fragment.rotation,
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{
                      x: fragment.initialX + fragment.velocityX,
                      y: fragment.initialY + fragment.velocityY + 800, // Fall down due to gravity
                      rotate: fragment.rotation + (fragment.velocityX * 2), // Spinning based on velocity
                      opacity: 0,
                      scale: 0.3
                    }}
                    transition={{
                      duration: 2.8,
                      delay: fragment.delay,
                      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for realistic physics
                    }}
                  >
                    {/* Inner shine for each fragment */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent" />
                  </motion.div>
                ))}
              </div>
              <Button variant="destructive" onClick={handleCrush} disabled={crushed}>
                {crushed ? 'Breaking...' : 'Burn'}
              </Button>
            </Card>
          </CarouselItem>

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