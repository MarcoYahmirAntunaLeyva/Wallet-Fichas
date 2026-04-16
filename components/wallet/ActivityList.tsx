import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CalendarClock, CircleDollarSign, Trophy, WalletCards } from 'lucide-react';

interface Activity {
  title: string;
  type: string;
  date: string;
  chips: number;
  status: 'Success' | 'Pending';
}

const typeColors: Record<string, string> = {
  GAMING: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  WALLET: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  'ENTRY FEE': 'border-red-400/20 bg-red-400/10 text-red-200',
  PROMO: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-200',
};

function getTypeIcon(type: string, chips: number) {
  if (type === 'GAMING') return Trophy;
  if (type === 'ENTRY FEE') return ArrowUpRight;
  if (type === 'WALLET' && chips > 0) return CircleDollarSign;
  if (type === 'WALLET') return ArrowDownLeft;
  return WalletCards;
}

export default function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <section className="rounded-[30px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_24px_60px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.04] text-emerald-200">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Actividad reciente</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Movimientos del wallet</h2>
          </div>
        </div>
        <p className="mt-6 rounded-2xl border border-white/6 bg-black/15 px-4 py-6 text-center text-white/50">No hay transacciones aun</p>
      </section>
    );
  }

  return (
    <section className="rounded-[30px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-6 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_24px_60px_rgba(0,0,0,0.35)] md:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.04] text-emerald-200">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Actividad reciente</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Movimientos del wallet</h2>
          </div>
        </div>
        <span className="inline-flex h-fit items-center rounded-full border border-yellow-300/16 bg-yellow-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">
          {activities.length} movimientos
        </span>
      </div>

      <ul className="space-y-3">
        {activities.map((a, idx) => (
          <li key={idx} className="flex flex-col gap-4 rounded-[24px] border border-white/6 bg-black/15 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.04] text-white/80">
                {React.createElement(getTypeIcon(a.type, a.chips), { className: 'h-5 w-5' })}
              </div>
              <div>
                <div className="font-semibold text-white text-sm md:text-base">
                  {a.title}
                  <span className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${typeColors[a.type] ?? 'border-white/10 bg-white/6 text-white/65'}`}>
                    {a.type}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/40">{a.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className={`text-sm font-black uppercase tracking-[0.08em] ${a.chips > 0 ? 'text-emerald-300' : 'text-yellow-200'}`}>
                {a.chips > 0 ? '+' : ''}{a.chips.toLocaleString()} fichas
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${a.status === 'Success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-yellow-300/20 bg-yellow-300/10 text-yellow-200'}`}>
                {a.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
