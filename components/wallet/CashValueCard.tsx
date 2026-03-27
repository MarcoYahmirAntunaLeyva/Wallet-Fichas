import React from 'react';

export default function CashValueCard({ cashValue }: { cashValue: number }) {
  return (
    <section className="bg-green-800 rounded-lg p-6 mb-4">
      <div className="text-green-300 text-lg font-semibold">EQUIVALENT CASH VALUE</div>
      <div className="text-3xl font-bold text-green-400 mt-2">
        ${cashValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="text-green-200 text-xs mt-1">10 chips = $100 Rate</div>
    </section>
  );
}
