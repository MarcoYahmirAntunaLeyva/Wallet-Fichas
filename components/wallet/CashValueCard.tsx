import React from 'react';
import { Landmark, WalletMinimal } from 'lucide-react';

export default function CashValueCard({ cashValue }: { cashValue: number }) {
  return (
    <section className="rounded-[28px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">Valor equivalente</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-emerald-300 md:text-4xl">
            ${cashValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(0,245,128,0.15)] bg-[rgba(0,245,128,0.08)] text-emerald-200">
          <WalletMinimal className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-white/60">
        <div className="flex items-center gap-2 font-semibold text-[#C9962F]">
          <Landmark className="h-4 w-4" />
          10 fichas = $1.00 MXN en esta simulacion
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">Conversion visible para depositos y retiros</p>
      </div>
    </section>
  );
}
