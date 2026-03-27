'use client';

import { motion } from 'framer-motion';
import { getNumberBgClass } from '@/core/engines/roulette.engine';

interface Bet {
  type: string;
  value: string | number;
  amount: number;
}

interface BettingTableProps {
  bets: Bet[];
  selectedChip: number;
  onPlaceBet: (bet: Omit<Bet, 'amount'>) => void;
  disabled: boolean;
}

export function BettingTable({ bets, selectedChip, onPlaceBet, disabled }: BettingTableProps) {
  const getBetAmount = (type: string, value: string | number) => {
    return bets
      .filter(bet => bet.type === type && bet.value === value)
      .reduce((sum, bet) => sum + bet.amount, 0);
  };

  const renderChip = (amount: number) => {
    if (amount === 0) return null;
    const chipColor = amount >= 100 ? 'bg-purple-600' : amount >= 50 ? 'bg-red-600' : amount >= 25 ? 'bg-green-600' : amount >= 10 ? 'bg-blue-600' : 'bg-yellow-600';
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${chipColor} border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold z-10 pointer-events-none`}
      >
        ${amount}
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-green-800 to-green-900 p-6 rounded-2xl shadow-2xl border-4 border-white/5">
        <div
          className="grid gap-1 mb-4"
          style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))', gridTemplateRows: 'repeat(3, 1fr)' }}
        >
          <button
            onClick={() => onPlaceBet({ type: 'straight', value: 0 })}
            disabled={disabled}
            style={{ gridRow: '1 / 4' }}
            className={`relative ${getNumberBgClass(0)} rounded font-bold text-xl hover:opacity-80 disabled:cursor-not-allowed py-2 border-2 border-yellow-500/50 transition-all flex items-center justify-center`}
          >
            0
            {renderChip(getBetAmount('straight', 0))}
          </button>

          {[3, 2, 1].map((startRow) =>
            Array.from({ length: 12 }, (_, col) => startRow + col * 3).map((num) => (
              <button
                key={num}
                onClick={() => onPlaceBet({ type: 'straight', value: num })}
                disabled={disabled}
                className={`relative ${getNumberBgClass(num)} rounded font-bold text-sm hover:opacity-80 disabled:cursor-not-allowed py-4 border-2 border-yellow-500/50 transition-all`}
              >
                {num}
                {renderChip(getBetAmount('straight', num))}
              </button>
            ))
          )}
        </div>

        <div className="grid grid-cols-6 gap-2 mt-4">
          {[
            { type: 'outside', value: '1-18', label: '1 to 18', cls: 'bg-zinc-700' },
            { type: 'outside', value: 'even', label: 'EVEN', cls: 'bg-zinc-700' },
            { type: 'outside', value: 'red', label: 'RED', cls: 'bg-red-600' },
            { type: 'outside', value: 'black', label: 'BLACK', cls: 'bg-zinc-900' },
            { type: 'outside', value: 'odd', label: 'ODD', cls: 'bg-zinc-700' },
            { type: 'outside', value: '19-36', label: '19 to 36', cls: 'bg-zinc-700' },
          ].map(({ type, value, label, cls }) => (
            <button
              key={String(value)}
              onClick={() => onPlaceBet({ type, value })}
              disabled={disabled}
              className={`relative ${cls} text-white rounded py-4 font-bold hover:opacity-80 disabled:cursor-not-allowed border-2 border-yellow-500/50 transition-all text-xs`}
            >
              {label}
              {renderChip(getBetAmount(type, value))}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { type: 'dozen', value: '1st-12', label: '1st 12' },
            { type: 'dozen', value: '2nd-12', label: '2nd 12' },
            { type: 'dozen', value: '3rd-12', label: '3rd 12' },
          ].map(({ type, value, label }) => (
            <button
              key={value}
              onClick={() => onPlaceBet({ type, value })}
              disabled={disabled}
              className="relative bg-zinc-700 text-white rounded py-3 font-bold hover:bg-zinc-600 disabled:cursor-not-allowed border-2 border-yellow-500/50 transition-all"
            >
              {label}
              {renderChip(getBetAmount(type, value))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
