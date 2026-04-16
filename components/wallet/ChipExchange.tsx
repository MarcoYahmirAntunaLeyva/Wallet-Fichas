'use client';
import React, { useState } from 'react';
import { ArrowRightLeft, Landmark, ShieldCheck } from 'lucide-react';

export default function ChipExchange({ rate, onWithdraw, withdrawLoading, withdrawError }: {
  rate: number;
  onWithdraw: (payload: { chips: number }) => void;
  withdrawLoading: boolean;
  withdrawError: { message: string } | null;
}) {
  const [amountStr, setAmountStr] = useState('');
  const amount = Number(amountStr) || 0;
  const isValidAmount = Number.isFinite(amount) && amount > 0;
  const equivalent = amount > 0 ? `$${(amount * rate).toFixed(2)} MXN` : '—';

  const handleSubmit = () => {
    if (!isValidAmount) return;
    onWithdraw({ chips: amount });
  };

  return (
    <section className="rounded-[30px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_24px_60px_rgba(0,0,0,0.35)] md:p-7">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Retiro seguro
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">Convierte fichas a saldo visible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Define cuantas fichas deseas retirar y revisa de inmediato el equivalente en MXN antes de confirmar.
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(201,150,47,0.3)] bg-[rgba(201,150,47,0.08)] px-4 py-3 text-sm text-yellow-100/90">
          <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-[#C9962F]">
            <Landmark className="h-4 w-4" />
            Tasa actual
          </div>
          <div className="mt-2 whitespace-nowrap text-lg font-black tracking-tight text-white md:text-xl">1 ficha = ${rate.toFixed(2)} MXN</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Fichas a retirar</label>
          <input
            type="number"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/25 focus:border-yellow-300/55 focus:bg-black/25"
            min={1}
            placeholder="Ej: 500"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Recibiras</label>
          <div className="flex h-[54px] items-center rounded-2xl border border-yellow-300/15 bg-yellow-300/8 px-4 text-lg font-bold text-yellow-200">
            {amount > 0 ? equivalent : '—'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-white/60">
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
        El retiro es una simulacion de interfaz. Verifica el monto antes de continuar.
      </div>

      <button
        className="btn-primary mt-5 w-full rounded-2xl px-6 py-4 text-lg"
        onClick={handleSubmit}
        disabled={withdrawLoading || !isValidAmount}
      >
        {withdrawLoading
          ? 'Procesando...'
          : `Retirar ${amount} fichas → $${(amount * rate).toFixed(2)} MXN`}
      </button>

      {withdrawError && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {withdrawError.message}
        </div>
      )}
    </section>
  );
}
