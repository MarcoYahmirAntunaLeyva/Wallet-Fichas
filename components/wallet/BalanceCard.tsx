import React from 'react';
import { Crown, Sparkles, Wallet2 } from 'lucide-react';

const chipColorMap: Record<string, string> = {
  Blanca: 'bg-white text-gray-900',
  Azul: 'bg-blue-400 text-white',
  Roja: 'bg-red-500 text-white',
  Verde: 'bg-green-500 text-white',
  Negra: 'border border-gray-600 bg-gray-900 text-white',
  Morada: 'bg-purple-600 text-white',
  Dorada: 'bg-yellow-400 text-gray-900',
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
    <section className="relative overflow-hidden rounded-[32px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_32px_80px_rgba(0,0,0,0.8)] md:p-8">
      <div className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[rgba(201,150,47,0.08)] blur-3xl" />

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
            <Wallet2 className="h-3.5 w-3.5" />
            Wallet central
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/45">Saldo de fichas</div>
          <div className="mt-3 text-5xl font-black tracking-tight text-white md:text-6xl">{balance.toLocaleString('es-MX')}</div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/55 md:text-base">
            Administra tus fichas con la misma estetica premium del resto del casino. Deposita, compra paquetes o retira saldo desde un solo panel.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCashOut}
              className="btn-primary inline-flex items-center justify-center !mt-0 rounded-2xl px-5 py-3 text-sm"
            >
              Depositar fichas
            </button>
            <button
              type="button"
              onClick={onBuyChips}
              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(0,245,128,0.15)] bg-black/25 px-5 py-3 text-sm font-semibold text-[#E8F0EB] transition hover:border-[rgba(0,245,128,0.3)] hover:bg-white/5"
            >
              Comprar por paquete
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-[28px] border border-white/8 bg-black/20 p-5 backdrop-blur-sm md:max-w-[26rem] md:p-6 xl:max-w-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/40">Ficha activa</div>
              <div className="mt-2 text-2xl font-bold text-white">{chipColor}</div>
            </div>
            <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/10 text-2xl font-black shadow-[0_10px_25px_rgba(0,0,0,0.3)] ${colorClass}`}>
              {balance > 0 ? chipColor[0] : '-'}
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1">
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Nivel</div>
              <div className="mt-3 flex items-center gap-3 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold leading-5 text-white">Jugador verificado</div>
                  <div className="mt-0.5 text-[11px] font-medium tracking-[0.08em] text-emerald-100/65">Perfil activo</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Estado</div>
              <div className="mt-3 flex items-center gap-3 text-[#C9962F]">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-[rgba(201,150,47,0.2)] bg-[rgba(201,150,47,0.1)] text-[#C9962F]">
                  <Crown className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold leading-5 text-white">{vip ? 'Membresia VIP' : 'Cuenta standard'}</div>
                  <div className="mt-0.5 text-[11px] font-medium tracking-[0.08em] text-[#C9962F]">{vip ? 'Beneficios habilitados' : 'Estado regular'}</div>
                </div>
              </div>
            </div>
          </div>

          {vip && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(201,150,47,0.3)] bg-[rgba(201,150,47,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#C9962F]">
              <Crown className="h-3.5 w-3.5" />
              Beneficios VIP disponibles
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
