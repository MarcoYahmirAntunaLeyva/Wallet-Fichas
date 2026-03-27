import React from 'react';

interface Activity {
  title: string;
  type: string;
  date: string;
  chips: number;
  status: 'Success' | 'Pending';
}

const typeColors: Record<string, string> = {
  GAMING:      'bg-green-700 text-green-200',
  WALLET:      'bg-blue-800 text-blue-200',
  'ENTRY FEE': 'bg-red-800 text-red-200',
  PROMO:       'bg-yellow-800 text-yellow-200',
};

const typeIcons: Record<string, string> = {
  GAMING: '🎰',
  WALLET: '💳',
  'ENTRY FEE': '🎟️',
  PROMO: '🎁',
};

export default function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <section className="bg-green-800 rounded-lg p-6">
        <div className="text-green-300 text-lg font-semibold mb-4">Actividad Reciente</div>
        <p className="text-green-500 text-center py-4">No hay transacciones aún</p>
      </section>
    );
  }

  return (
    <section className="bg-green-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-green-300 text-lg font-semibold">Actividad Reciente</div>
        <span className="text-green-500 text-sm">{activities.length} movimientos</span>
      </div>
      <ul className="space-y-1">
        {activities.map((a, idx) => (
          <li key={idx} className="flex justify-between items-center py-3 border-b border-green-900 last:border-none">
            <div className="flex items-center gap-3">
              <span className="text-xl">{typeIcons[a.type] ?? '💰'}</span>
              <div>
                <div className="font-semibold text-white text-sm">
                  {a.title}
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${typeColors[a.type] ?? 'bg-gray-700 text-gray-200'}`}>
                    {a.type}
                  </span>
                </div>
                <div className="text-green-400 text-xs mt-0.5">{a.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className={`font-bold text-sm ${a.chips > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {a.chips > 0 ? '+' : ''}{a.chips.toLocaleString()} fichas
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'Success' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                {a.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
