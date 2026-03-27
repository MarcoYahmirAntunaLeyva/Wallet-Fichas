'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getNumberBgClass, formatRouletteNumber } from '@/core/engines/roulette.engine';

interface RouletteWheelProps {
  spinning: boolean;
  winningNumber: number | null;
  onSpinComplete: () => void;
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, -1
];

export function RouletteWheel({ spinning, winningNumber, onSpinComplete }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!spinning || winningNumber === null) return;
    const winningIndex = ROULETTE_NUMBERS.indexOf(winningNumber);
    if (winningIndex === -1) {
      console.warn('[RouletteWheel] Número no encontrado:', winningNumber);
      return;
    }
    const segmentAngle = 360 / ROULETTE_NUMBERS.length;
    const spins = 5 + Math.random() * 3;
    setRotation((prev: number) => {
      const fullSpins = Math.floor(prev / 360);
      return (fullSpins + spins) * 360 + (360 - winningIndex * segmentAngle);
    });
    setDisplayNumber(null);
  }, [spinning, winningNumber]);

  return (
    <div className="relative flex flex-col items-center gap-8">
      <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 p-4 shadow-2xl">
        <div className="absolute inset-0 rounded-full border-8 border-amber-400 shadow-inner"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-6 h-12 bg-yellow-400 shadow-lg" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}></div>
        </div>

        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.12, 0, 0.39, 0] }}
          onAnimationComplete={() => {
            if (!spinning) return;
            setDisplayNumber(winningNumber);
            setTimeout(onSpinComplete, 1000);
          }}
        >
          <div className="relative w-full h-full rounded-full border-4 border-yellow-500">
            {ROULETTE_NUMBERS.map((num, index) => {
              const angle = (360 / ROULETTE_NUMBERS.length) * index;
              return (
                <div
                  key={index}
                  className="absolute w-full h-full"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-12 ${getNumberBgClass(num)} flex items-start justify-center pt-1 text-white text-[10px] font-bold border-r border-yellow-600`}
                  >
                    {formatRouletteNumber(num)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-yellow-300 shadow-xl flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-200/20" />
          </div>
        </motion.div>
      </div>

      <div className="h-32">
        {displayNumber !== null && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold text-white shadow-2xl border-4 border-white/20 ${getNumberBgClass(displayNumber)}`}>
              {formatRouletteNumber(displayNumber)}
            </div>
            <p className="mt-2 text-lg font-black uppercase tracking-widest text-white">¡GANADOR!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
