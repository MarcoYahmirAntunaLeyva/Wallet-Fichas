import React from 'react';

const chipColorMap: Record<string, string> = {
  Blanca:  'bg-white text-gray-900',
  Azul:    'bg-blue-400 text-white',
  Roja:    'bg-red-500 text-white',
  Verde:   'bg-green-500 text-white',
  Negra:   'bg-gray-900 text-white border border-gray-600',
  Morada:  'bg-purple-600 text-white',
  Dorada:  'bg-yellow-400 text-gray-900',
};

export default function BalanceCard({ balance, chipColor = 'Blanca', vip, onCashOut, onBuyChips }: {
  balance: number;
  chipColor?: string;
  vip: boolean;
  onCashOut?: () => void;
  onBuyChips?: () => void;
}) {
  const colorClass = chipColorMap[chipColor] ?? chipColorMap.Blanca;

  return (
    <section className="bg-green-800 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-yellow-400 text-lg font-semibold">SALDO DE FICHAS</div>
          <div className="text-5xl font-bold text-white mt-2">{balance.toLocaleString()}</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-opacity-30 ${colorClass}`}>
            {balance > 0 ? chipColor[0] : '—'}
          </div>
          <span className="text-xs text-green-300">Ficha {chipColor}</span>
          {vip && (
            <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded font-bold text-xs">⭐ VIP</span>
          )}
        </div>
      </div>
    </section>
  );
}
