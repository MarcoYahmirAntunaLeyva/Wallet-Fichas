'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useWalletStore } from '@/store/wallet.store';
import { getAuthHeaders } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_GAMES_API_URL || 'http://localhost:3000/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_W = 80;
const CARD_H = 112;
const CIRC   = 2 * Math.PI * 22;

const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS  = ['clubs','diamonds','hearts','spades'];
const CHIPS  = [
  { val: 5,   color: 'radial-gradient(circle at 35% 35%, #ef4444, #991b1b)' },
  { val: 10,  color: 'radial-gradient(circle at 35% 35%, #3b82f6, #1d4ed8)' },
  { val: 25,  color: 'radial-gradient(circle at 35% 35%, #22c55e, #15803d)' },
  { val: 50,  color: 'radial-gradient(circle at 35% 35%, #f59e0b, #b45309)' },
  { val: 100, color: 'radial-gradient(circle at 35% 35%, #8b5cf6, #6d28d9)' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Card { v: string; s: string; }
interface ResultInfo { title: string; sub: string; colorClass: string; }

// ─── Deck helpers ─────────────────────────────────────────────────────────────
function buildDeck(): Card[] {
  const base = SUITS.flatMap(s => VALUES.map(v => ({ v, s })));
  const shoe = Array.from({ length: 6 }, () => [...base]).flat();
  return shuffle(shoe);
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function calcScore(hand: Card[]): number {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.v === 'A') { aces++; total += 11; }
    else if (['J','Q','K'].includes(c.v)) total += 10;
    else total += parseInt(c.v);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
function isSoftHand(hand: Card[]): boolean {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.v === 'A') { aces++; total += 11; }
    else if (['J','Q','K'].includes(c.v)) total += 10;
    else total += parseInt(c.v);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return aces > 0 && total <= 21;
}
const isBust       = (hand: Card[]) => calcScore(hand) > 21;
const isBlackjack  = (hand: Card[]) => hand.length === 2 && calcScore(hand) === 21;
const cardVal      = (c: Card) => (['J','Q','K','10'].includes(c.v) ? '10' : c.v);
function drawFrom(deck: Card[]): { card: Card; remaining: Card[] } {
  if (deck.length < 15) deck = buildDeck();
  return { card: deck[deck.length - 1], remaining: deck.slice(0, -1) };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PlayingCard({ suit = '', value = '', faceDown = false, style = {} }: {
  suit?: string; value?: string; faceDown?: boolean; style?: React.CSSProperties;
}) {
  const src = faceDown ? '/cards/back.png' : `/cards/${value}_${suit}.png`;
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(0,0,0,0.45)', flexShrink: 0, position: 'relative',
      animation: 'dealCard 0.25s ease-out', ...style,
    }}>
      <Image src={src} alt={faceDown ? 'card back' : `${value} of ${suit}`}
        fill style={{ objectFit: 'cover' }} priority />
    </div>
  );
}

function ScoreBadge({ score, style = {} }: { score: number; style?: React.CSSProperties }) {
  const bust = score > 21;
  return (
    <div style={{
      background: bust ? '#DC2626' : '#fff', color: bust ? '#fff' : '#111',
      borderRadius: '50%', width: 30, height: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      border: bust ? 'none' : '1px solid #e5e7eb',
      transition: 'background 0.3s, color 0.3s', ...style,
    }}>{score}</div>
  );
}

function CardHand({ hand, hideSecond = false, fan = false }: {
  hand: Card[]; hideSecond?: boolean; fan?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
      {hand.map((card, i) => {
        const angle = fan ? (i - (hand.length - 1) / 2) * 9 : 0;
        const tx    = fan ? (i - (hand.length - 1) / 2) * -14 : 0;
        const zIdx  = fan ? (i === Math.floor(hand.length / 2) ? 2 : 1) : i;
        return (
          <PlayingCard
            key={`${card.v}_${card.s}_${i}`}
            value={card.v} suit={card.s}
            faceDown={hideSecond && i === 1}
            style={{ transform: `rotate(${angle}deg) translateX(${tx}px)`, zIndex: zIdx, marginLeft: (!fan && i > 0) ? -6 : 0 }}
          />
        );
      })}
    </div>
  );
}

function TimerRing({ value, total }: { value: number; total: number }) {
  const offset = CIRC * (1 - value / total);
  return (
    <svg width="50" height="50" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="22" fill="#0A2A1F" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
      <circle cx="25" cy="25" r="22" fill="none" stroke="#00FF88" strokeWidth="3"
        strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
        transform="rotate(-90 25 25)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      <foreignObject x="7" y="10" width="36" height="30">
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
          {value}
        </div>
      </foreignObject>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlackjackPage() {
  const { balance: walletBalance, fetchBalance } = useWalletStore();
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const balance = localBalance ?? walletBalance;

  const [bet, setBet]                   = useState(0);
  const [selectedChip, setSelectedChip] = useState(25);
  const [phase, setPhase]               = useState<'bet'|'play'|'dealer'|'done'>('bet');
  const [timerVal, setTimerVal]         = useState(20);
  const [isSettling, setIsSettling]     = useState(false);
  const [settleError, setSettleError]   = useState<string | null>(null);

  const [dealerHand, setDealerHand]   = useState<Card[]>([]);
  const [playerHand, setPlayerHand]   = useState<Card[]>([]);
  const [hideDealer, setHideDealer]   = useState(true);

  const [splitActive, setSplitActive] = useState(false);
  const [splitHands, setSplitHands]   = useState<Card[][]>([[], []]);
  const [splitIndex, setSplitIndex]   = useState(0);

  const [insuranceBanner, setInsuranceBanner] = useState(false);
  const [insurance, setInsurance]     = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);

  const [doubled, setDoubled]   = useState(false);
  const [totalWin, setTotalWin] = useState(0);
  const [result, setResult]     = useState<ResultInfo | null>(null);

  const phaseRef  = useRef(phase);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const deckRef   = useRef<Card[]>([]);
  phaseRef.current = phase;

  // sync local balance when wallet loads
  useEffect(() => {
    if (localBalance === null && walletBalance > 0) {
      setLocalBalance(walletBalance);
    }
  }, [walletBalance, localBalance]);

  useEffect(() => { void fetchBalance(); }, [fetchBalance]);

  // ── Timer ──
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback((seconds: number, onExpire: () => void) => {
    clearTimer();
    setTimerVal(seconds);
    timerRef.current = setInterval(() => {
      setTimerVal(t => {
        if (t <= 1) { clearTimer(); onExpire(); return seconds; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Settle with backend ───────────────────────────────────────────────────
  async function settleGame(
    pHand: Card[], dHand: Card[],
    hasInsurance: boolean, insBet: number,
    finalBet: number,
    isSplitGame: boolean,
    splitFinalHands?: Card[][],
  ) {
    setIsSettling(true);
    setSettleError(null);
    try {
      const response = await fetch(`${API}/games/bet`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          amount: finalBet,
          gameType: 'blackjack',
          selection: {
            playerHand: isSplitGame ? splitFinalHands : pHand,
            dealerHand: dHand,
            doubled,
            insurance: hasInsurance,
            insuranceBet: insBet,
            isSplit: isSplitGame,
          },
        }),
      });
      if (!response.ok) {
        const err: { message?: string } = await response.json().catch(() => ({}));
        throw new Error(err.message || `Error ${response.status}`);
      }
    } catch (error) {
      setSettleError(error instanceof Error ? error.message : 'Error al conectar con el servidor');
    } finally {
      setIsSettling(false);
      await fetchBalance();
      setLocalBalance(null); // let wallet store take over
    }
  }

  // ── Deal ──────────────────────────────────────────────────────────────────
  function handleDeal() {
    if (bet === 0 || balance < bet) return;
    let d = buildDeck();
    const draw = () => { const r = drawFrom(d); d = r.remaining; return r.card; };
    const p  = [draw(), draw()];
    const dl = [draw(), draw()];
    deckRef.current = d;

    setLocalBalance(b => (b ?? walletBalance) - bet);
    setDealerHand(dl);
    setPlayerHand(p);
    setHideDealer(true);
    setSplitActive(false);
    setSplitHands([[], []]);
    setSplitIndex(0);
    setInsurance(false);
    setInsuranceBet(0);
    setDoubled(false);
    setTotalWin(0);
    setResult(null);
    setSettleError(null);

    const pBJ = isBlackjack(p);
    const dBJ = isBlackjack(dl);

    if (dl[0].v === 'A' && !pBJ) {
      setPhase('play');
      setInsuranceBanner(true);
      startTimer(30, () => { if (phaseRef.current === 'play') triggerStand(); });
      return;
    }
    if (pBJ || dBJ) {
      setHideDealer(false);
      finishGame(p, dl, false, false, 0, bet);
      return;
    }
    setPhase('play');
    startTimer(30, () => { if (phaseRef.current === 'play') triggerStand(); });
  }

  // ── Insurance ─────────────────────────────────────────────────────────────
  function handleInsurance(take: boolean) {
    setInsuranceBanner(false);
    let insBet = 0;
    if (take) {
      insBet = Math.floor(bet / 2);
      setLocalBalance(b => (b ?? walletBalance) - insBet);
      setInsurance(true);
      setInsuranceBet(insBet);
    }
    const pBJ = isBlackjack(playerHand);
    const dBJ = isBlackjack(dealerHand);
    if (pBJ || dBJ) {
      setHideDealer(false);
      finishGame(playerHand, dealerHand, false, take, insBet, bet);
      return;
    }
    if (phase === 'play') {
      startTimer(30, () => { if (phaseRef.current === 'play') triggerStand(); });
    }
  }

  // ── Hit ───────────────────────────────────────────────────────────────────
  function handleHit() {
    if (phase !== 'play') return;
    const { card, remaining } = drawFrom(deckRef.current);
    deckRef.current = remaining;
    if (splitActive) {
      const newSplitHands = splitHands.map((h, i) => i === splitIndex ? [...h, card] : h);
      setSplitHands(newSplitHands);
      const hand = newSplitHands[splitIndex];
      if (isBust(hand) || calcScore(hand) === 21) handleNextSplitHand(newSplitHands);
    } else {
      const newHand = [...playerHand, card];
      setPlayerHand(newHand);
      if (isBust(newHand)) {
        setHideDealer(false);
        finishGame(newHand, dealerHand, false, insurance, insuranceBet, bet, true);
      } else if (calcScore(newHand) === 21) {
        triggerDealerTurn(newHand);
      }
    }
  }

  // ── Stand ─────────────────────────────────────────────────────────────────
  const triggerStand = useCallback(() => {
    if (phaseRef.current !== 'play') return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    triggerDealerTurn(playerHand);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHand]);

  function handleStand() {
    if (phase !== 'play') return;
    if (splitActive) handleNextSplitHand(splitHands);
    else triggerDealerTurn(playerHand);
  }

  // ── Double ────────────────────────────────────────────────────────────────
  function handleDouble() {
    if (phase !== 'play' || balance < bet) return;
    const { card, remaining } = drawFrom(deckRef.current);
    deckRef.current = remaining;
    setLocalBalance(b => (b ?? walletBalance) - bet);
    const newBet  = bet * 2;
    setBet(newBet);
    setDoubled(true);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    if (isBust(newHand)) {
      setHideDealer(false);
      finishGame(newHand, dealerHand, false, insurance, insuranceBet, newBet, true);
    } else {
      triggerDealerTurn(newHand, newBet);
    }
  }

  // ── Split ─────────────────────────────────────────────────────────────────
  function handleSplit() {
    if (phase !== 'play' || balance < bet) return;
    setLocalBalance(b => (b ?? walletBalance) - bet);
    let d = deckRef.current;
    const draw = () => { const r = drawFrom(d); d = r.remaining; return r.card; };
    const hands: Card[][] = [[playerHand[0], draw()], [playerHand[1], draw()]];
    deckRef.current = d;
    setSplitHands(hands);
    setSplitActive(true);
    setSplitIndex(0);
  }

  function handleNextSplitHand(hands: Card[][]) {
    if (splitIndex === 0) {
      setSplitIndex(1);
      if (calcScore(hands[1]) === 21) runDealerTurn(hands);
    } else {
      runDealerTurn(hands);
    }
  }

  // ── Dealer turn ───────────────────────────────────────────────────────────
  function triggerDealerTurn(finalPlayerHand: Card[], finalBet?: number) {
    clearTimer();
    setPhase('dealer');
    setHideDealer(false);
    setTimeout(() => runDealerLoop(dealerHand, finalPlayerHand, finalBet ?? bet), 500);
  }

  function runDealerLoop(dHand: Card[], pHand: Card[], finalBet: number) {
    const ds = calcScore(dHand);
    if (ds < 17 || (ds === 17 && isSoftHand(dHand))) {
      const { card, remaining } = drawFrom(deckRef.current);
      deckRef.current = remaining;
      const newDHand = [...dHand, card];
      setDealerHand(newDHand);
      setTimeout(() => runDealerLoop(newDHand, pHand, finalBet), 1000);
    } else {
      finishGame(pHand, dHand, false, insurance, insuranceBet, finalBet);
    }
  }

  function runDealerTurn(splitFinalHands: Card[][]) {
    clearTimer();
    setPhase('dealer');
    setHideDealer(false);
    setTimeout(() => runDealerLoopSplit(dealerHand, splitFinalHands), 1000);
  }

  function runDealerLoopSplit(dHand: Card[], splitFinalHands: Card[][]) {
    const ds = calcScore(dHand);
    if (ds < 17 || (ds === 17 && isSoftHand(dHand))) {
      const { card, remaining } = drawFrom(deckRef.current);
      deckRef.current = remaining;
      const newDHand = [...dHand, card];
      setDealerHand(newDHand);
      setTimeout(() => runDealerLoopSplit(newDHand, splitFinalHands), 1000);
    } else {
      finishGameSplit(splitFinalHands, dHand);
    }
  }

  // ── Resolve ───────────────────────────────────────────────────────────────
  function finishGame(
    pHand: Card[], dHand: Card[],
    _isSplit: boolean, hasInsurance: boolean, insBet: number,
    finalBet: number, _bustImmediate = false,
  ) {
    const ps = calcScore(pHand);
    const ds = calcScore(dHand);
    const pBJ = isBlackjack(pHand);
    const dBJ = isBlackjack(dHand);
    let win = 0, title = '', colorClass = '#00c864';

    if (ps > 21)         { title = '¡Te pasaste!';       colorClass = '#ef4444'; }
    else if (pBJ && dBJ) { title = 'Empate';             colorClass = '#fbbf24'; win = finalBet; }
    else if (pBJ)        { title = '¡Blackjack! 🃏';    colorClass = '#FFD700'; win = Math.floor(finalBet * 2.5); }
    else if (dBJ)        { title = 'Dealer Blackjack';   colorClass = '#ef4444'; }
    else if (ds > 21)    { title = '¡Dealer se pasó!';  colorClass = '#00c864'; win = finalBet * 2; }
    else if (ps > ds)    { title = '¡Ganaste!';          colorClass = '#00c864'; win = finalBet * 2; }
    else if (ps === ds)  { title = 'Empate';             colorClass = '#fbbf24'; win = finalBet; }
    else                 { title = 'Perdiste';           colorClass = '#ef4444'; }

    if (hasInsurance && dBJ) win += insBet * 3;

    const net = win - finalBet;
    const sub = win > 0
      ? `Recibes ${win} fichas · Neto: ${net >= 0 ? '+' : ''}${net}`
      : `Pierdes ${finalBet} fichas`;

    setTotalWin(win);
    setLocalBalance(b => (b ?? walletBalance) + win);

    setTimeout(() => {
      setResult({ title, sub, colorClass });
      setPhase('done');
      void settleGame(pHand, dHand, hasInsurance, insBet, finalBet, false);
    }, 500);
    clearTimer();
  }

  function finishGameSplit(hands: Card[][], dHand: Card[]) {
    const ds  = calcScore(dHand);
    const dBJ = isBlackjack(dHand);
    let totalW = 0;
    const labels = hands.map(h => {
      const ps = calcScore(h);
      if (ps > 21) return 'Bust';
      if (dBJ && h.length === 2 && ps === 21) { totalW += bet; return 'Empate'; }
      if (dBJ)         return 'Pierdes';
      if (ds > 21 || ps > ds) { totalW += bet * 2; return 'Ganas'; }
      if (ps === ds)   { totalW += bet; return 'Empate'; }
      return 'Pierdes';
    });
    const net        = totalW - bet * 2;
    const title      = labels.join(' / ');
    const colorClass = totalW > bet * 2 ? '#00c864' : totalW > 0 ? '#fbbf24' : '#ef4444';
    const sub        = `Recibes ${totalW} fichas · Neto: ${net >= 0 ? '+' : ''}${net}`;

    setTotalWin(totalW);
    setLocalBalance(b => (b ?? walletBalance) + totalW);

    setTimeout(() => {
      setResult({ title, sub, colorClass });
      setPhase('done');
      void settleGame([], dHand, false, 0, bet * 2, true, hands);
    }, 1000);
    clearTimer();
  }

  // ── New round ─────────────────────────────────────────────────────────────
  function handleNewRound() {
    setBet(b => Math.min(b, balance));
    setPhase('bet');
    setDealerHand([]);
    setPlayerHand([]);
    setHideDealer(true);
    setSplitActive(false);
    setSplitHands([[], []]);
    setSplitIndex(0);
    setInsuranceBanner(false);
    setResult(null);
    setTotalWin(0);
    setDoubled(false);
    clearTimer();
  }

  useEffect(() => { handleNewRound(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeHand  = splitActive ? splitHands[splitIndex] : playerHand;
  const dealerScore = hideDealer ? calcScore([dealerHand[0]].filter(Boolean)) : calcScore(dealerHand);
  const canDouble   = phase === 'play' && activeHand.length === 2 && balance >= (doubled ? 0 : bet) && !doubled;
  const canSplit    = phase === 'play' && !splitActive && playerHand.length === 2
    && cardVal(playerHand[0]) === cardVal(playerHand[1]) && balance >= bet;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes dealCard {
          from { opacity: 0; transform: translateY(-20px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes resultPop {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', paddingTop: '4rem',
        background: 'radial-gradient(ellipse at 50% 0%, #1a5c3a 0%, #0d3520 60%, #071a0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* ── TABLE ── */}
        <div style={{
          width: 900, minHeight: 560, borderRadius: 26,
          background: 'linear-gradient(180deg, #1E6F4F 0%, #165a40 60%, #0f3d2b 100%)',
          border: '6px solid #2d4a38',
          boxShadow: '0 0 0 3px #0a1a12, 0 24px 70px rgba(0,0,0,.75), inset 0 0 80px rgba(0,0,0,.3)',
          position: 'relative', overflow: 'hidden', userSelect: 'none',
        }}>

          {/* Felt texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='1' cy='1' r='.5' fill='rgba(255,255,255,.015)'/%3E%3C/svg%3E")`,
          }} />

          {/* Arc lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <ellipse cx="450" cy="590" rx="420" ry="180" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2" />
            <ellipse cx="450" cy="615" rx="465" ry="205" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="2" />
          </svg>

          {/* Balance */}
          <div style={{
            position: 'absolute', top: 16, left: 16, background: '#0A2A1F',
            borderRadius: 10, padding: '8px 16px',
            border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 2px 8px rgba(0,0,0,.4)',
          }}>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, letterSpacing: '.5px' }}>Fichas</div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>
              {isSettling ? '...' : balance.toLocaleString()}
            </div>
          </div>

          {/* Settle error */}
          {settleError && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(239,68,68,.9)', color: '#fff', padding: '6px 14px',
              borderRadius: 8, fontSize: 12, zIndex: 50,
            }}>
              {settleError}
            </div>
          )}

          {/* Timer */}
          {phase !== 'bet' && playerHand.length > 0 && (
            <div style={{ position: 'absolute', top: 16, right: 20, width: 50, height: 50 }}>
              <TimerRing value={timerVal} total={30} />
            </div>
          )}

          {/* ── DEALER ── */}
          <div style={{
            position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            {dealerHand.length > 0 && (
              <>
                <CardHand hand={dealerHand} hideSecond={hideDealer} />
                <ScoreBadge score={dealerScore} />
              </>
            )}
          </div>

          {/* ── PLAYER ── */}
          {!splitActive ? (
            <div style={{
              position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              {playerHand.length > 0 && (
                <>
                  <ScoreBadge score={calcScore(playerHand)} />
                  <CardHand hand={playerHand} fan />
                </>
              )}
            </div>
          ) : (
            <div style={{
              position: 'absolute', bottom: 88, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 24,
            }}>
              {splitHands.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  outline: i === splitIndex ? '2px solid #00FF88' : 'none',
                  outlineOffset: 8, borderRadius: 8, padding: '4px 8px',
                }}>
                  <CardHand hand={h} fan />
                  {h.length > 0 && <ScoreBadge score={calcScore(h)} style={{ width: 26, height: 26, fontSize: 11 }} />}
                </div>
              ))}
            </div>
          )}

          {/* ── INSURANCE BANNER ── */}
          {insuranceBanner && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              background: 'rgba(14,165,233,.95)', color: '#fff', padding: '16px 28px',
              borderRadius: 12, zIndex: 40, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(0,0,0,.5)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>¿Tomar seguro?</div>
              <div style={{ fontSize: 13, opacity: .8 }}>Cuesta la mitad de tu apuesta ({Math.floor(bet / 2)} fichas)</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleInsurance(true)} style={{ padding: '7px 20px', borderRadius: 50, border: 'none', background: '#fff', color: '#0369a1', fontWeight: 700, cursor: 'pointer' }}>Sí</button>
                <button onClick={() => handleInsurance(false)} style={{ padding: '7px 20px', borderRadius: 50, border: '1px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>No</button>
              </div>
            </div>
          )}

          {/* ── RESULT OVERLAY ── */}
          {result && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,.45)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 30, borderRadius: 20,
            }}>
              <div style={{
                background: '#0A2A1F', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 16, padding: '28px 40px', textAlign: 'center',
                boxShadow: '0 12px 40px rgba(0,0,0,.7)',
                animation: 'resultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: result.colorClass }}>{result.title}</div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, marginBottom: 20 }}>{result.sub}</div>
                {isSettling && (
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginBottom: 12 }}>Sincronizando saldo…</div>
                )}
                <button
                  onClick={handleNewRound}
                  disabled={isSettling}
                  style={{
                    padding: '11px 32px', borderRadius: 50, border: 'none',
                    background: isSettling ? 'rgba(0,200,100,.3)' : 'linear-gradient(135deg,#00c864,#007a3d)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: isSettling ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0,200,100,.4)',
                  }}
                >Nueva Ronda</button>
              </div>
            </div>
          )}

          {/* ── ACTION BUTTONS (play phase) ── */}
          {phase === 'play' && !insuranceBanner && (
            <div style={{
              position: 'absolute', bottom: 82, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 10, zIndex: 20,
            }}>
              {([
                { label: 'Pedir',     onClick: handleHit,    bg: 'linear-gradient(135deg,#22c55e,#15803d)',  show: true },
                { label: 'Plantarse', onClick: handleStand,  bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', show: true },
                { label: 'Doblar',   onClick: handleDouble,  bg: 'linear-gradient(135deg,#f59e0b,#b45309)',  show: canDouble, disabled: !canDouble },
                { label: 'Dividir',  onClick: handleSplit,   bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',  show: canSplit,  disabled: !canSplit },
              ] as const).filter(b => b.show).map(({ label, onClick, bg, disabled }) => (
                <button key={label} onClick={onClick}
                  disabled={disabled as boolean | undefined}
                  style={{
                    padding: '10px 22px', borderRadius: 50, border: 'none',
                    background: bg, color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: (disabled as boolean | undefined) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 3px 10px rgba(0,0,0,.4)', letterSpacing: '.5px',
                    opacity: (disabled as boolean | undefined) ? .4 : 1,
                  }}
                >{label}</button>
              ))}
            </div>
          )}

          {/* ── CHIP SELECTOR (bet phase) ── */}
          {phase === 'bet' && (
            <div style={{
              position: 'absolute', bottom: 82, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 8, zIndex: 20,
            }}>
              {CHIPS.map(({ val, color }) => (
                <div key={val} onClick={() => setSelectedChip(val)} style={{
                  width: 44, height: 44, borderRadius: '50%', background: color,
                  border: `3px solid ${selectedChip === val ? '#00FF88' : 'rgba(255,255,255,.25)'}`,
                  boxShadow: selectedChip === val
                    ? '0 0 0 2px #00FF88, 0 3px 8px rgba(0,0,0,.4)'
                    : '0 3px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2)',
                  cursor: 'pointer', fontWeight: 800, fontSize: 12, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform .1s, box-shadow .15s',
                }}>{val}</div>
              ))}
            </div>
          )}

          {/* ── BOTTOM BAR ── */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 74,
            background: '#0A2A1F', borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', overflow: 'visible',
          }}>
            {/* Apuesta */}
            <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,.08)', padding: '0 28px' }}>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, letterSpacing: '.5px' }}>Apuesta</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{bet} fichas</div>
            </div>
            {/* Ganancia */}
            <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,.08)', padding: '0 28px' }}>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, letterSpacing: '.5px' }}>Ganancia</div>
              <div style={{ color: totalWin > 0 ? '#00FF88' : '#fff', fontSize: 18, fontWeight: 700 }}>{totalWin} fichas</div>
            </div>

            {/* Controls */}
            <div style={{
              flex: 2, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative',
            }}>
              {bet > 0 && (
                <div style={{
                  position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)',
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #ef4444, #991b1b)',
                  border: '3px solid rgba(255,255,255,.3)',
                  boxShadow: '0 4px 10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 14, zIndex: 10,
                }}>{bet}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => { if (phase === 'bet') setBet(b => Math.max(0, b - selectedChip)); }}
                  disabled={phase !== 'bet' || bet === 0}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: 'transparent',
                    border: '2px solid #ef4444', color: '#ef4444', fontSize: 22,
                    cursor: phase === 'bet' ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: phase !== 'bet' || bet === 0 ? .35 : 1,
                  }}
                >−</button>
                <button
                  onClick={handleDeal}
                  disabled={phase !== 'bet' || bet === 0 || balance < bet}
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(145deg,#2a2a2a,#111)',
                    border: '2px solid rgba(255,255,255,.15)', color: '#fff',
                    fontSize: 12, fontWeight: 700, letterSpacing: '.5px',
                    cursor: phase === 'bet' && bet > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: '0 3px 10px rgba(0,0,0,.5)',
                    opacity: phase !== 'bet' || bet === 0 || balance < bet ? .5 : 1,
                  }}
                >DEAL</button>
                <button
                  onClick={() => { if (phase === 'bet' && balance - bet >= selectedChip) setBet(b => b + selectedChip); }}
                  disabled={phase !== 'bet' || balance - bet < selectedChip}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: 'transparent',
                    border: '2px solid #00FF88', color: '#00FF88', fontSize: 20,
                    cursor: phase === 'bet' ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: phase !== 'bet' || balance - bet < selectedChip ? .35 : 1,
                  }}
                >+</button>
              </div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, letterSpacing: '.5px' }}>Jugador</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
