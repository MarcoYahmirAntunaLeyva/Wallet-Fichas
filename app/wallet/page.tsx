'use client';
import React, { useState } from 'react';
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
      <div className="mt-8">
        <div className="mb-8">
          <BalanceCard
            balance={chips}
            chipColor={chipColor}
            vip={chips >= 10000}
            onCashOut={openFreePurchaseSelection}
            onBuyChips={openPackageSelection}
          />
          <div className="flex gap-4 mt-4">
            <button className="casino-btn green" onClick={openFreePurchaseSelection}>
              Depositar
            </button>
            <button className="casino-btn yellow" onClick={openPackageSelection}>
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
      <div className={`relative max-h-[92vh] w-full overflow-y-auto rounded-[28px] border border-green-700/80 bg-[linear-gradient(180deg,rgba(14,49,37,0.98)_0%,rgba(7,21,16,0.98)_100%)] p-8 shadow-2xl ${maxWidthClass}`}>
        <button
          className="absolute right-4 top-3 text-lg font-bold text-yellow-400 hover:text-yellow-200"
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
      <h3 className="mb-3 text-center text-2xl font-bold text-yellow-400">Comprar fichas</h3>
      <p className="mb-6 text-center text-sm text-green-200/80">
        Elige un monto y despues agrega una tarjeta para completar la simulacion de pago.
      </p>
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
      <button
        className="casino-btn green w-full mb-2"
        onClick={() => onContinue(Number(amount), chips)}
        disabled={Number(amount) <= 0}
      >
        Continuar al pago
      </button>
      <button className="casino-btn yellow w-full" onClick={onClose}>Cancelar</button>
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
      <h3 className="mb-3 text-center text-2xl font-bold text-yellow-400">Paquetes de fichas</h3>
      <p className="mb-6 text-center text-sm text-green-200/80">
        Selecciona un paquete y despues agrega una tarjeta para continuar con la compra.
      </p>
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
      {pkgError && <p className="mb-3 text-sm text-red-400">{pkgError}</p>}
      <button
        className="casino-btn yellow w-full mb-2"
        onClick={() => {
          if (selected === null) return;
          onContinue(selected, packages[selected]?.price ?? 0, packages[selected]?.chips ?? 0);
        }}
        disabled={selected === null}
      >
        Continuar al pago
      </button>
      <button className="casino-btn green w-full" onClick={onClose}>Cancelar</button>
    </div>
  );
}
