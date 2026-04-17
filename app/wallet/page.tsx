'use client';
import React, { useState } from 'react';
import { Coins, Gem, ShieldCheck } from 'lucide-react';
import BalanceCard from '@/components/wallet/BalanceCard';
import CashValueCard from '@/components/wallet/CashValueCard';
import ChipExchange from '@/components/wallet/ChipExchange';
import LifetimeWinningsCard from '@/components/wallet/LifetimeWinningsCard';
import ActivityList from '@/components/wallet/ActivityList';
import PaymentMethodModal from '@/components/wallet/PaymentMethodModal';
import { useBalance, useDeposit, useWithdraw, usePackages } from '@/services/useWallet';

const CHIPS_PER_PESO = 10;

type PurchaseDraft =
  | {
      kind: 'free';
      purchaseLabel: string;
      chips: number;
      moneyAmount: number;
    }
  | {
      kind: 'package';
      packageIndex: number;
      purchaseLabel: string;
      chips: number;
      moneyAmount: number;
    };

export default function WalletPage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseDraft | null>(null);

  const { data: balanceData, loading: balanceLoading, error: balanceError, refetch } = useBalance();

  const { depositFree, depositPkg, loading: depositLoading, error: depositError, reset: resetDepositState } = useDeposit(undefined, () => {
    refetch();
    setShowBuyModal(false);
    setShowPackagesModal(false);
    setPurchaseDraft(null);
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
    title: formatTransactionDescription(t.description),
    type: actionToType(t.action),
    date: new Date(t.date).toLocaleString('es-MX'),
    chips: t.action === 'BET' || t.action === 'WITHDRAW' ? -t.amount : t.amount,
    status: 'Success' as const,
  }));

  if (balanceLoading) {
    return (
      <main className="wallet-main flex items-center justify-center pt-20">
        <div className="rounded-[28px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,37,30,0.98)_0%,rgba(10,20,17,0.98)_100%)] px-8 py-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">Wallet</div>
          <div className="mt-3 text-2xl font-black text-emerald-300 animate-pulse">Cargando panel...</div>
        </div>
      </main>
    );
  }

  if (balanceError) {
    return (
      <main className="wallet-main flex items-center justify-center flex-col gap-4 pt-20">
        <div className="rounded-[28px] border border-red-400/20 bg-[linear-gradient(180deg,rgba(44,16,16,0.98)_0%,rgba(25,10,10,0.98)_100%)] px-8 py-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-red-200/70">Wallet</div>
          <div className="mt-3 text-xl font-black text-red-200">Error: {balanceError}</div>
          <button
            type="button"
            className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400 px-5 py-3 text-sm font-bold text-[#0f211a] transition hover:brightness-95"
            onClick={refetch}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const openFreePurchaseSelection = () => {
    resetDepositState();
    setPurchaseDraft(null);
    setShowPackagesModal(false);
    setShowBuyModal(true);
  };

  const openPackageSelection = () => {
    resetDepositState();
    setPurchaseDraft(null);
    setShowBuyModal(false);
    setShowPackagesModal(true);
  };

  const openPaymentForFree = (moneyAmount: number, chipAmount: number) => {
    resetDepositState();
    setPurchaseDraft({
      kind: 'free',
      purchaseLabel: 'Compra individual',
      moneyAmount,
      chips: chipAmount,
    });
    setShowBuyModal(false);
  };

  const openPaymentForPackage = (packageIndex: number, moneyAmount: number, chipAmount: number) => {
    resetDepositState();
    setPurchaseDraft({
      kind: 'package',
      packageIndex,
      purchaseLabel: 'Paquete de fichas',
      moneyAmount,
      chips: chipAmount,
    });
    setShowPackagesModal(false);
  };

  const closePaymentModal = () => {
    resetDepositState();
    setPurchaseDraft(null);
  };

  const goBackFromPayment = () => {
    if (!purchaseDraft) return;
    resetDepositState();
    const previousStep = purchaseDraft.kind;
    setPurchaseDraft(null);
    if (previousStep === 'free') {
      setShowBuyModal(true);
      return;
    }
    setShowPackagesModal(true);
  };

  const confirmPurchase = () => {
    if (!purchaseDraft) return;

    if (purchaseDraft.kind === 'free') {
      depositFree(purchaseDraft.moneyAmount);
      return;
    }

    depositPkg(purchaseDraft.packageIndex, purchaseDraft.moneyAmount);
  };

  return (
    <main className="wallet-main pt-20">
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-6">

          <BalanceCard
            balance={chips}
            chipColor={chipColor}
            vip={chips >= 10000}
            onCashOut={openFreePurchaseSelection}
            onBuyChips={openPackageSelection}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <CashValueCard cashValue={chipsInMoney} />
            <LifetimeWinningsCard winnings={lifetimeWinnings} />
            <ChipExchange
              rate={1 / CHIPS_PER_PESO}
              onWithdraw={(payload) => {
                if (payload?.chips) withdraw(payload.chips);
              }}
              withdrawLoading={withdrawLoading}
              withdrawError={withdrawError ? { message: withdrawError } : null}
            />
          </div>

          <ActivityList activities={activities} />
        </section>

        {showBuyModal && (
          <Modal onClose={() => setShowBuyModal(false)} maxWidthClass="max-w-lg">
            <BuyFreeModal
              onContinue={openPaymentForFree}
              onClose={() => setShowBuyModal(false)}
            />
          </Modal>
        )}

        {showPackagesModal && (
          <Modal onClose={() => setShowPackagesModal(false)} maxWidthClass="max-w-xl">
            <BuyPackagesModal
              onContinue={openPaymentForPackage}
              onClose={() => setShowPackagesModal(false)}
            />
          </Modal>
        )}

        {purchaseDraft && (
          <Modal onClose={closePaymentModal} maxWidthClass="max-w-5xl">
            <PaymentMethodModal
              purchaseLabel={purchaseDraft.purchaseLabel}
              chips={purchaseDraft.chips}
              moneyAmount={purchaseDraft.moneyAmount}
              loading={depositLoading}
              error={depositError}
              onBack={goBackFromPayment}
              onClose={closePaymentModal}
              onConfirm={confirmPurchase}
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

function formatTransactionDescription(description: string): string {
  const trimmedDescription = description.trim();
  const match = trimmedDescription.match(/^(.*?:)\s*(\{.*\})$/);

  if (!match) {
    return trimmedDescription;
  }

  const [, prefix, rawJson] = match;

  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const formattedDetails = formatDescriptionDetails(parsed);
    return formattedDetails ? `${prefix} ${formattedDetails}` : prefix;
  } catch {
    return trimmedDescription;
  }
}

function formatDescriptionDetails(details: Record<string, unknown>): string {
  const parts: string[] = [];

  if (typeof details.multiplier === 'number') {
    parts.push(`x${details.multiplier}`);
  }

  if (typeof details.rows === 'number') {
    parts.push(`${details.rows} filas`);
  }

  if (typeof details.risk === 'string') {
    parts.push(`riesgo ${translateRisk(details.risk)}`);
  }

  if (parts.length > 0) {
    return parts.join(' · ');
  }

  return Object.entries(details)
    .map(([key, value]) => `${humanizeKey(key)} ${String(value)}`)
    .join(' · ');
}

function translateRisk(risk: string): string {
  const riskLabels: Record<string, string> = {
    low: 'bajo',
    medium: 'medio',
    high: 'alto',
  };

  return riskLabels[risk] ?? risk;
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();
}

function Modal({
  children,
  onClose,
  maxWidthClass = 'max-w-md',
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className={`relative max-h-[92vh] w-full overflow-y-auto rounded-[32px] border border-[rgba(0,245,128,0.15)] bg-[linear-gradient(160deg,rgba(18,38,25,0.98)_0%,rgba(13,31,24,1)_100%)] p-8 shadow-[0_0_0_1px_rgba(0,245,128,0.05),0_32px_80px_rgba(0,0,0,0.8)] ${maxWidthClass}`}>
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-yellow-200 transition hover:bg-white/10"
          onClick={onClose}
        >✕</button>
        {children}
      </div>
    </div>
  );
}

function BuyFreeModal({ onContinue, onClose }: {
  onContinue: (amount: number, chips: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const chips = Number(amount) * 10;

  return (
    <div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
          <Coins className="h-3.5 w-3.5" />
          Compra libre
        </div>
      </div>
      <h3 className="mb-3 mt-5 text-center text-3xl font-black tracking-tight text-white">Comprar fichas</h3>
      <p className="mb-6 text-center text-sm text-white/55">
        Elige un monto y despues agrega una tarjeta para completar la simulacion de pago.
      </p>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Monto en pesos MXN</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="mb-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/25 focus:border-yellow-300/55 focus:bg-black/25"
        min={1}
        placeholder="Ej: 150"
      />
      {Number(amount) > 0 && (
        <p className="mb-5 rounded-2xl border border-emerald-400/12 bg-emerald-400/8 px-4 py-3 text-center text-sm text-white/70">
          Recibiras <span className="font-bold text-yellow-200">{chips.toLocaleString('es-MX')} fichas</span>
        </p>
      )}

      <div className="space-y-3">
        <button
          className="btn-primary w-full !mt-0"
          onClick={() => onContinue(Number(amount), chips)}
          disabled={Number(amount) <= 0}
        >
          Continuar al pago
        </button>
        <button
          className="w-full rounded-2xl border border-[rgba(0,245,128,0.15)] bg-black/25 px-5 py-4 text-base font-semibold text-[#E8F0EB] transition hover:border-[rgba(0,245,128,0.3)] hover:bg-white/5"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function BuyPackagesModal({ onContinue, onClose }: {
  onContinue: (packageIndex: number, moneyAmount: number, chips: number) => void;
  onClose: () => void;
}) {
  const { data: pkgData, loading: pkgLoading, error: pkgError } = usePackages();
  const [selected, setSelected] = useState<number | null>(null);

  if (pkgLoading) return <div className="text-green-300 text-center py-8">Cargando paquetes...</div>;

  const packages = pkgData?.packages ?? [];

  return (
    <div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
          <Gem className="h-3.5 w-3.5" />
          Seleccion de paquetes
        </div>
      </div>
      <h3 className="mb-3 mt-5 text-center text-3xl font-black tracking-tight text-white">Paquetes de fichas</h3>
      <p className="mb-6 text-center text-sm text-white/55">
        Selecciona un paquete y despues agrega una tarjeta para continuar con la compra.
      </p>
      <div className="space-y-3 mb-4">
        {packages.map((pkg, idx) => (
          <label
            key={idx}
            className={`flex items-center justify-between rounded-[22px] border p-4 transition-all ${
              selected === idx
                ? 'border-yellow-300/40 bg-yellow-300/10 shadow-[0_12px_30px_rgba(201,150,47,0.12)]'
                : 'border-white/8 bg-black/20 hover:border-emerald-400/30 hover:bg-black/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="package"
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="accent-yellow-300"
              />
              <div>
                <div className="font-semibold text-white">{pkg.chips.toLocaleString('es-MX')} fichas</div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/35">Entrega inmediata</div>
              </div>
            </div>
            <span className="text-lg font-black text-yellow-200">${pkg.price} MXN</span>
          </label>
        ))}
      </div>
      {pkgError && <p className="mb-3 rounded-2xl border border-red-400/20 bg-red-950/50 px-4 py-3 text-sm text-red-200">{pkgError}</p>}
      <div className="space-y-3">
        <button
          className="btn-primary w-full !mt-0 disabled:opacity-40"
          onClick={() => {
            if (selected === null) return;
            onContinue(selected, packages[selected]?.price ?? 0, packages[selected]?.chips ?? 0);
          }}
          disabled={selected === null}
        >
          Continuar al pago
        </button>
        <button
          className="w-full rounded-2xl border border-[rgba(0,245,128,0.15)] bg-black/25 px-5 py-4 text-base font-semibold text-[#E8F0EB] transition hover:border-[rgba(0,245,128,0.3)] hover:bg-white/5"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/6 bg-black/18 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
        <span className="text-emerald-300">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-lg font-bold text-white">{value}</div>
    </div>
  );
}
