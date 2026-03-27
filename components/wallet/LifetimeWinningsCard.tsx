import React from 'react';

export default function LifetimeWinningsCard({ winnings }: { winnings: number }) {
  return (
    <section className="bg-green-800 rounded-lg p-6 mb-4">
      <div className="text-green-300 text-lg font-semibold">LIFETIME WINNINGS</div>
      <div className="text-3xl font-bold text-yellow-400 mt-2">
        ${winnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="w-full bg-green-900 h-2 rounded mt-2">
        <div className="bg-green-400 h-2 rounded" style={{ width: '80%' }}></div>
      </div>
    </section>
  );
}
