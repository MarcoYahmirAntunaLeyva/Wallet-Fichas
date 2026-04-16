import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

export default function LifetimeWinningsCard({ winnings }: { winnings: number }) {
  const progress = winnings <= 0 ? 8 : Math.min(100, 24 + winnings / 8);

  return (
    <section className="rounded-[28px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">Lifetime winnings</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-yellow-200 md:text-4xl">
            ${winnings.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(201,150,47,0.2)] bg-[rgba(201,150,47,0.08)] text-[#C9962F]">
          <Trophy className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/6 bg-black/15 p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          <span>Rendimiento acumulado</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <TrendingUp className="h-3.5 w-3.5" />
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#c9962f_0%,#00f580_100%)]" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-3 text-sm text-white/55">Tus ganancias historicas aparecen resumidas aqui para mantener contexto del progreso general.</p>
      </div>
    </section>
  );
}
