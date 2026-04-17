'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet.store';
import { RouletteWheel } from '@/components/roulette/RouletteWheel';
import { BettingTable } from '@/components/roulette/BettingTable';
import { ChipSelector } from '@/components/roulette/ChipSelector';
import { getAuthHeaders } from '@/lib/utils';
import { Loader2, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_GAMES_API_URL || 'http://localhost:3000/api';

interface Bet {
  type: string;
  value: string | number;
  amount: number;
}

interface SpinResult {
  winningSelection: number;
  winner: boolean;
  payout: number;
}

export default function RoulettePage() {
  const { balance, error: balanceError, fetchBalance } = useWalletStore();
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [pendingResult, setPendingResult] = useState<SpinResult | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);

  useEffect(() => {
    void fetchBalance();
    const interval = setInterval(() => {
      void fetchBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchBalance]);

  const placeBet = (bet: Omit<Bet, 'amount'>) => {
    if (isSpinning) return;
    const existingBetIndex = bets.findIndex(b => b.type === bet.type && b.value === bet.value);
    if (existingBetIndex > -1) {
      const newBets = [...bets];
      newBets[existingBetIndex].amount += selectedChip;
      setBets(newBets);
    } else {
      setBets([...bets, { ...bet, amount: selectedChip }]);
    }
  };

  const clearBets = () => {
    if (isSpinning) return;
    setBets([]);
  };

  const handleSpin = async () => {
    const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
    if (totalAmount === 0 || totalAmount > balance) return;

    setIsSpinning(true);
    setWinningNumber(null);
    setLastResult(null);
    setSpinError(null);

    try {
      const response = await fetch(`${API}/games/bet`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          amount: totalAmount,
          gameType: 'roulette',
          selection: bets
        })
      });

      if (!response.ok) {
        const errData: { message?: string } = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${response.status}`);
      }

      const data: SpinResult = await response.json();
      setWinningNumber(data.winningSelection);
      setPendingResult(data);
    } catch (error: unknown) {
      console.error('Error in bet:', error);
      const message = error instanceof Error ? error.message : 'Error al conectar con el servidor';
      setSpinError(message);
      setIsSpinning(false);
    }
  };

  const onSpinComplete = useCallback(() => {
    setIsSpinning(false);
    if (pendingResult) {
      setLastResult(pendingResult);
      setPendingResult(null);
    }
    fetchBalance();
  }, [fetchBalance, pendingResult]);

  const totalBetAmount = bets.reduce((sum, b) => sum + b.amount, 0);
  const isBetOverBalance = totalBetAmount > balance;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-28">
      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">

        {/* Left Column: Wheel & Stats */}
        <div className="lg:w-1/3 flex flex-col items-center gap-8 sticky top-24">
          <RouletteWheel
            spinning={isSpinning}
            winningNumber={winningNumber}
            onSpinComplete={onSpinComplete}
          />

          <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Resumen de Apuesta</span>
              <span className={`text-xl font-mono font-bold ${isBetOverBalance ? 'text-red-500' : 'text-indigo-400'}`}>
                {totalBetAmount} fichas
              </span>
            </div>

            <AnimatePresence>
              {balanceError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 text-amber-300 text-xs bg-amber-500/10 rounded-xl px-3 py-2"
                >
                  {balanceError}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isBetOverBalance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2"
                >
                  La apuesta supera tu saldo ({balance} fichas)
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {spinError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2"
                >
                  {spinError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                onClick={clearBets}
                disabled={isSpinning || bets.length === 0}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-white/60 hover:text-white transition-all disabled:opacity-20"
              >
                <Trash2 className="w-4 h-4" /> LIMPIAR
              </button>
              <button
                onClick={handleSpin}
                disabled={isSpinning || totalBetAmount === 0 || isBetOverBalance}
                className="flex-[2] h-12 bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-20 active:translate-y-1"
              >
                {isSpinning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GIRAR RUEDA'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`w-full p-4 rounded-2xl text-center font-bold text-lg border-2 ${lastResult.winner ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}
              >
                {lastResult.winner ? `¡GANASTE ${lastResult.payout} fichas!` : 'MEJOR SUERTE LA PRÓXIMA VEZ'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Table & Chips */}
        <div className="lg:w-2/3 flex flex-col gap-8">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
                Ruleta <span className="text-red-500">Premium</span>
              </h1>
              <p className="text-white/40 font-light mt-2 max-w-md">La misma experiencia que conoces, ahora integrada en nuestro casino virtual.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Tu Saldo</div>
                <div className="text-2xl font-mono font-bold text-white flex items-center gap-3">
                  {balance} fichas
                </div>
              </div>
            </div>
          </div>

          <BettingTable
            bets={bets}
            selectedChip={selectedChip}
            onPlaceBet={placeBet}
            disabled={isSpinning}
          />

          <ChipSelector
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            disabled={isSpinning}
          />
        </div>
      </div>
    </div>
  );
}
