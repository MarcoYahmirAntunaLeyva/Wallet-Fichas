'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, LockKeyhole, ShieldCheck, Sparkles, Waves } from 'lucide-react';

type PaymentMethodModalProps = {
  purchaseLabel: string;
  chips: number;
  moneyAmount: number;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function PaymentMethodModal({
  purchaseLabel,
  chips,
  moneyAmount,
  loading,
  error,
  onBack,
  onClose,
  onConfirm,
}: PaymentMethodModalProps) {
  const [cardholderName, setCardholderName] = useState('Marco Antuna');
  const [cardNumber, setCardNumber] = useState('4111111111111111');
  const [expiry, setExpiry] = useState('1228');
  const [cvv, setCvv] = useState('123');

  const formattedNumber = formatCardNumber(cardNumber);
  const inputCardNumber = formatEditableCardNumber(cardNumber);
  const formattedExpiry = formatExpiry(expiry);
  const brand = detectBrand(cardNumber);
  const cardDigits = cardNumber.replace(/\D/g, '');
  const expiryDigits = expiry.replace(/\D/g, '');
  const cvvDigits = cvv.replace(/\D/g, '');
  const previewNumber = getCardPreviewNumber(cardDigits);
  const previewExpiry = getPreviewExpiry(expiryDigits);
  const previewCardholder = cardholderName.trim() || 'Nombre del titular';

  const isFormValid =
    cardholderName.trim().length >= 4 &&
    cardDigits.length >= 16 &&
    expiryDigits.length === 4 &&
    cvvDigits.length >= 3;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.95fr] lg:gap-8">
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[30px] border border-emerald-400/20 bg-[linear-gradient(145deg,#102f26_0%,#0f4e3c_55%,#0b2019_100%)] p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-yellow-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-6 h-28 w-28 rounded-full bg-emerald-300/15 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,224,102,0.08),transparent_28%),linear-gradient(120deg,transparent_15%,rgba(255,255,255,0.03)_45%,transparent_75%)]" />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
              <Sparkles className="h-3.5 w-3.5" />
              Metodo de pago
            </p>
            <h3 className="text-2xl font-bold text-yellow-200">Agrega una tarjeta</h3>
            <p className="mt-2 max-w-md text-sm text-emerald-50/70">
              Simulacion visual del alta de tarjeta. Los datos son editables para que la experiencia se vea realista y profesional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, rotateX: -8, y: 18 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3, rotateZ: -0.4 }}
          className="relative mb-6 overflow-hidden rounded-[30px] border border-white/15 bg-[linear-gradient(135deg,#10213f_0%,#0f4f4f_40%,#5b8f54_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.42)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_18%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_14%),linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.07)_48%,transparent_72%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20" />
          <div className="pointer-events-none absolute right-5 top-4 flex gap-2 opacity-80">
            <span className="h-10 w-10 rounded-full bg-white/16 backdrop-blur-sm" />
            <span className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
          <div className="pointer-events-none absolute bottom-5 right-6 opacity-20">
            <Waves className="h-14 w-14 text-white" />
          </div>

          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[0.35em] text-white/60">Regnum Casino</span>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-11 w-14 place-items-center rounded-xl border border-white/20 bg-black/15 backdrop-blur-sm">
                  <CreditCard className="h-6 w-6 text-yellow-100" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">{brand}</span>
              </div>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
              Premium
            </div>
          </div>

          <div className="mb-8 text-[clamp(1.4rem,2vw,2rem)] font-semibold tracking-[0.28em] text-white drop-shadow-sm">
            {previewNumber}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/55">Cardholder</div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                {previewCardholder}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/55">Expira</div>
              <div className="mt-2 text-sm font-semibold tracking-[0.18em] text-white">{previewExpiry}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">
              Numero de tarjeta
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              value={inputCardNumber}
              onChange={event => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-black/25"
              placeholder="1234 5678 9012 3456"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">
              Nombre del titular
            </span>
            <input
              type="text"
              value={cardholderName}
              onChange={event => setCardholderName(event.target.value.slice(0, 26))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-black/25"
              placeholder="Como aparece en la tarjeta"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">
              Fecha de expiracion
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={formattedExpiry}
              onChange={event => setExpiry(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-black/25"
              placeholder="MM/AA"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">
              CVV
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={cvv}
              onChange={event => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-black/25"
              placeholder="123"
            />
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-black/15 px-4 py-3 text-sm text-emerald-50/75"
        >
          <LockKeyhole className="h-4 w-4 text-emerald-300" />
          Tu pago es una simulacion visual. No se realizara ningun cargo real.
        </motion.div>
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col justify-between rounded-[30px] border border-yellow-300/15 bg-[linear-gradient(180deg,rgba(18,29,24,0.98)_0%,rgba(10,16,13,0.98)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
      >
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-300 text-green-950 shadow-lg shadow-yellow-300/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-200/80">Resumen</p>
              <h4 className="text-xl font-bold text-white">Compra lista para pagar</h4>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <SummaryRow label="Tipo de compra" value={purchaseLabel} />
            <SummaryRow label="Pago total" value={`$${moneyAmount.toLocaleString('es-MX')} MXN`} emphasis />
            <SummaryRow label="Fichas a recibir" value={chips.toLocaleString('es-MX')} />
            <SummaryRow label="Tarjeta" value={brand} />
          </div>

          <div className="mt-4 border-t border-white/8 pt-4 text-sm text-white/55">
            El pago es una simulacion visual para la interfaz. No se procesa ningun cargo real.
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isFormValid || loading}
            className="w-full rounded-2xl bg-yellow-300 px-5 py-4 text-base font-bold text-green-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Procesando compra...' : 'Guardar tarjeta y comprar'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl bg-[#2ecc40] px-5 py-4 text-base font-bold text-green-950 transition hover:brightness-95"
          >
            Volver a la seleccion
          </button>
        </div>
      </motion.aside>
    </div>
  );
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-black/10 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{label}</span>
      <span className={emphasis ? 'text-lg font-bold text-yellow-200' : 'text-sm font-semibold text-white'}>{value}</span>
    </div>
  );
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatEditableCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (!digits) return 'MM/AA';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card Gold';
}

function getCardPreviewNumber(digits: string) {
  const padded = `${digits}${'•'.repeat(Math.max(0, 16 - digits.length))}`.slice(0, 16);
  return padded.match(/.{1,4}/g)?.join(' ') ?? padded;
}

function getPreviewExpiry(digits: string) {
  if (!digits) return 'MM/AA';
  if (digits.length <= 2) return `${digits}${digits.length === 2 ? '/' : ''}`;
  return `${digits.slice(0, 2)}/${digits.slice(2).padEnd(2, '•')}`;
}