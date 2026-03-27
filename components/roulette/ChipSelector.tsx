'use client';

import { motion } from 'framer-motion';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  disabled: boolean;
}

const CHIP_VALUES = [5, 10, 25, 50, 100, 500];

export function ChipSelector({ selectedChip, onSelectChip, disabled }: ChipSelectorProps) {
  const getChipColor = (value: number) => {
    if (value >= 500) return 'from-amber-600 to-amber-800';
    if (value >= 100) return 'from-purple-600 to-purple-800';
    if (value >= 50) return 'from-red-600 to-red-800';
    if (value >= 25) return 'from-green-600 to-green-800';
    if (value >= 10) return 'from-blue-600 to-blue-800';
    return 'from-yellow-600 to-yellow-800';
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center py-4 px-8 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
      {CHIP_VALUES.map((value) => (
        <motion.button
          key={value}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => onSelectChip(value)}
          disabled={disabled}
          className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${getChipColor(value)} border-4 ${
            selectedChip === value ? 'border-yellow-300 shadow-xl shadow-yellow-500/50 scale-110' : 'border-white/40'
          } shadow-lg flex flex-col items-center justify-center text-white font-black transition-all disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <span className="text-sm font-black">${value}</span>
          {selectedChip === value && (
            <motion.div
              layoutId="chip-selector-indicator"
              className="absolute -inset-1 rounded-full border-2 border-yellow-300 animate-pulse"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
