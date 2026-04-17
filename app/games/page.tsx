import { ArrowRight, CircleDot, Layers, Wallet, Triangle } from "lucide-react";
import Link from "next/link";

export default function GamesPage() {
  const games = [
    {
      id: "roulette",
      name: "Ruleta Premium",
      description: "Prueba tu suerte con el motor de generación cuántica. Apuesta en números, colores y docenas.",
      icon: <CircleDot className="w-8 h-8 text-red-500" />,
      color: "from-red-500/20 to-orange-500/20",
      path: "/games/roulette",
      available: true,
    },
    {
      id: "plinko",
      name: "Plinko",
      description: "Deja caer la bola y multiplica tus fichas. Elige riesgo y filas.",
      icon: <Triangle className="w-8 h-8 text-green-400" />,
      color: "from-green-500/20 to-emerald-500/20",
      path: "/games/plinko",
      available: true,
    },
    {
      id: "blackjack",
      name: "Blackjack Royale",
      description: "Duelo de cartas contra el Dealer. Estrategia y riesgo.",
      icon: <Layers className="w-8 h-8 text-blue-500" />,
      color: "from-blue-500/20 to-indigo-500/20",
      path: "/games/blackjack",
      available: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pt-28">
      <header className="mb-16">
        <h1 className="text-5xl font-black mb-4 leading-tight" style={{
          background: 'linear-gradient(to right, #E8F0EB, rgba(232,240,235,0.4))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ELIGE TU DESAFÍO
        </h1>
        <p className="text-white/40 text-lg max-w-2xl font-light">
          Explora nuestra selección de juegos optimizados para ofrecer la mejor experiencia visual y justicia algorítmica.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {games.map((game) => (
          game.available ? (
            <Link
              key={game.id}
              href={game.path}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${game.color} p-8 hover:border-indigo-500/50 transition-all duration-500 hover:scale-[1.02] no-underline`}
            >
              <div className="relative z-10">
                <div className="mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                  {game.icon}
                </div>
                <h2 className="text-3xl font-bold mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-white">
                  {game.name}
                </h2>
                <p className="text-white/40 group-hover:text-white/60 transition-colors mb-8 text-lg font-light leading-relaxed">
                  {game.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-400">
                  Jugar Ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            </Link>
          ) : (
            <div
              key={game.id}
              className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br ${game.color} p-8 opacity-50 cursor-not-allowed`}
            >
              <div className="relative z-10">
                <div className="mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                  {game.icon}
                </div>
                <h2 className="text-3xl font-bold mb-3 uppercase tracking-tight text-white">
                  {game.name}
                </h2>
                <p className="text-white/40 mb-8 text-lg font-light leading-relaxed">
                  {game.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/20">
                  Próximamente
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>
          )
        ))}
      </div>

      {/* Quick access to wallet */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(0,245,128,0.05)] to-[rgba(201,150,47,0.05)] p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gestiona tus fichas</h2>
            <p className="text-white/40">Deposita, retira y controla tu saldo desde la billetera.</p>
          </div>
          <Link
            href="/wallet"
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[#1C3D30] no-underline transition-all hover:opacity-90 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00F580, #00C468)' }}
          >
            <Wallet className="w-5 h-5" />
            Ir a Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
