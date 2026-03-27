'use client';
import React, { useState } from 'react';
import BalanceCard from '@/components/wallet/BalanceCard';
import CashValueCard from '@/components/wallet/CashValueCard';
import ChipExchange from '@/components/wallet/ChipExchange';
import LifetimeWinningsCard from '@/components/wallet/LifetimeWinningsCard';
import ActivityList from '@/components/wallet/ActivityList';
import { useBalance, useDeposit, useWithdraw, usePackages } from '@/services/useWallet';

const CHIPS_PER_PESO = 10;

export default function WalletPage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false);

  const { data: balanceData, loading: balanceLoading, error: balanceError, refetch } = useBalance();

  const { depositFree, depositPkg, loading: depositLoading, error: depositError } = useDeposit(undefined, () => {
    refetch();
    setShowBuyModal(false);
    setShowPackagesModal(false);
  });

  const { withdraw, loading: withdrawLoading, error: withdrawError } = useWithdraw(undefined, () => {
    refetch();
  });

  const chips = balanceData?.wallet.chips ?? 0;
  const chipsInMoney = balanceData?.chipsInMoney ?? 0;
  const chipColor = balanceData?.chipColor ?? 'Blanca';

  const lifetimeWinnings = balanceData?.transactions
    .filter(t => t.action === 'WIN')
    .reduce((acc, t) => acc + t.amount / CHIPS_PER_PESO, 0) ?? 0;

  const activities = (balanceData?.transactions ?? []).slice(0, 10).map(t => ({
    title: t.description,
    type: actionToType(t.action),
    date: new Date(t.date).toLocaleString('es-MX'),
    chips: t.action === 'BET' || t.action === 'WITHDRAW' ? -t.amount : t.amount,
    status: 'Success' as const,
  }));

  if (balanceLoading) {
    return (
      <main className="wallet-main flex items-center justify-center pt-20">
        <div className="text-green-400 text-2xl animate-pulse">Cargando wallet...</div>
      </main>
    );
  }

  if (balanceError) {
    return (
      <main className="wallet-main flex items-center justify-center flex-col gap-4 pt-20">
        <div className="text-red-400 text-xl">Error: {balanceError}</div>
        <button className="casino-btn green" onClick={refetch}>Reintentar</button>
      </main>
    );
  }

  return (
    <main className="wallet-main pt-20">
      <div className="mt-8">
        <div className="mb-8">
          <BalanceCard
            balance={chips}
            chipColor={chipColor}
            vip={chips >= 10000}
            onCashOut={() => setShowBuyModal(true)}
            onBuyChips={() => setShowPackagesModal(true)}
          />
          <div className="flex gap-4 mt-4">
            <button className="casino-btn green" onClick={() => setShowBuyModal(true)}>
              Depositar
            </button>
            <button className="casino-btn yellow" onClick={() => setShowPackagesModal(true)}>
              Comprar por paquete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <CashValueCard cashValue={chipsInMoney} />
          <LifetimeWinningsCard winnings={lifetimeWinnings} />
        </div>

        <div className="mb-8">
          <ChipExchange
            rate={1 / CHIPS_PER_PESO}
            onWithdraw={(payload) => {
              if (payload?.chips) withdraw(payload.chips);
            }}
            withdrawLoading={withdrawLoading}
            withdrawError={withdrawError ? { message: withdrawError } : null}
          />
        </div>

        <div className="mb-8">
          <ActivityList activities={activities} />
        </div>

        {showBuyModal && (
          <Modal onClose={() => setShowBuyModal(false)}>
            <BuyFreeModal
              onConfirm={depositFree}
              loading={depositLoading}
              error={depositError}
              onClose={() => setShowBuyModal(false)}
            />
          </Modal>
        )}

        {showPackagesModal && (
          <Modal onClose={() => setShowPackagesModal(false)}>
            <BuyPackagesModal
              onConfirm={(packageIndex, moneyAmount) => depositPkg(packageIndex, moneyAmount)}
              loading={depositLoading}
              error={depositError}
              onClose={() => setShowPackagesModal(false)}
            />
          </Modal>
        )}
      </div>
    </main>
  );
}

function actionToType(action: string): string {
  const map: Record<string, string> = {
    WIN: 'GAMING',
    BET: 'ENTRY FEE',
    CONVERT_TO_CHIPS: 'WALLET',
    DEPOSIT: 'WALLET',
    WITHDRAW: 'WALLET',
  };
  return map[action] ?? 'WALLET';
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-green-900 rounded-lg p-8 w-full max-w-md shadow-2xl relative border border-green-700">
        <button
          className="absolute top-3 right-4 text-yellow-400 font-bold text-lg hover:text-yellow-200"
          onClick={onClose}
        >✕</button>
        {children}
      </div>
    </div>
  );
}

function BuyFreeModal({ onConfirm, loading, error, onClose }: {
  onConfirm: (amount: number) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const chips = Number(amount) * 10;

  return (
    <div>
      <h3 className="text-yellow-400 text-xl font-bold mb-4 text-center">💰 Comprar fichas</h3>
      <label className="block text-green-300 text-sm mb-1">Monto en pesos MXN</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full bg-green-950 text-white px-4 py-2 rounded text-lg border border-green-700 focus:outline-none focus:border-yellow-400 mb-2"
        min={1}
        placeholder="Ej: 150"
      />
      {Number(amount) > 0 && (
        <p className="text-green-300 text-sm mb-4 text-center">
          Recibirás <span className="text-yellow-400 font-bold">{chips.toLocaleString()} fichas</span>
        </p>
      )}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button
        className="casino-btn green w-full mb-2"
        onClick={() => onConfirm(Number(amount))}
        disabled={loading || Number(amount) <= 0}
      >
        {loading ? 'Procesando...' : 'Confirmar compra'}
      </button>
      <button className="casino-btn yellow w-full" onClick={onClose}>Cancelar</button>
    </div>
  );
}

function BuyPackagesModal({ onConfirm, loading, error, onClose }: {
  onConfirm: (packageIndex: number, moneyAmount: number) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const { data: pkgData, loading: pkgLoading } = usePackages();
  const [selected, setSelected] = useState<number | null>(null);

  if (pkgLoading) return <div className="text-green-300 text-center py-8">Cargando paquetes...</div>;

  const packages = pkgData?.packages ?? [];

  return (
    <div>
      <h3 className="text-yellow-400 text-xl font-bold mb-4 text-center">🎰 Paquetes de fichas</h3>
      <div className="space-y-3 mb-4">
        {packages.map((pkg, idx) => (
          <label
            key={idx}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
              selected === idx
                ? 'border-yellow-400 bg-green-800'
                : 'border-green-700 bg-green-950 hover:border-green-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="package"
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="accent-yellow-400"
              />
              <span className="text-white font-semibold">{pkg.chips.toLocaleString()} fichas</span>
            </div>
            <span className="text-yellow-400 font-bold">${pkg.price} MXN</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button
        className="casino-btn yellow w-full mb-2"
        onClick={() => {
          if (selected === null) return;
          onConfirm(selected, packages[selected]?.price ?? 0);
        }}
        disabled={loading || selected === null}
      >
        {loading ? 'Procesando...' : 'Confirmar paquete'}
      </button>
      <button className="casino-btn green w-full" onClick={onClose}>Cancelar</button>
    </div>
  );
}
