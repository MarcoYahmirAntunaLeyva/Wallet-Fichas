'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/wallet.store';
import { getAuthHeaders } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_GAMES_API_URL || 'http://localhost:3000/api';

// ─── Physics ──────────────────────────────────────────────────────────────────
const GRAVITY    = 0.25;
const BOUNCE     = 0.423;
const PEG_RADIUS = 6;
const BALL_RADIUS = 8;

type Risk = 'low' | 'medium' | 'high';

const MULTIPLIERS: Record<Risk, Record<number, number[]>> = {
  low:    { 8:[5.6,2.1,1.1,1.0,0.5,1.0,1.1,2.1,5.6], 12:[10,3,1.6,1.4,1.1,1.0,0.5,1.0,1.1,1.4,1.6,3,10], 16:[16,9,2,1.4,1.4,1.2,1.1,1.0,0.5,1.0,1.1,1.2,1.4,1.4,2,9,16] },
  medium: { 8:[13,3,1.3,0.7,0.4,0.7,1.3,3,13], 12:[33,11,4,2,1.1,0.6,0.3,0.6,1.1,2,4,11,33], 16:[110,41,10,5,3,1.5,1,0.5,0.3,0.5,1,1.5,3,5,10,41,110] },
  high:   { 8:[29,4,1.5,0.3,0.2,0.3,1.5,4,29], 12:[141,26,5.5,2,0.7,0.2,0.1,0.2,0.7,2,5.5,26,141], 16:[999,130,26,9,4,2,0.2,0.2,0.2,0.2,0.2,2,4,9,26,130,999] },
};

const RISK_COLORS: Record<Risk, { active: string; glow: string }> = {
  low:    { active: '#99fcff', glow: '#acf0ff' },
  medium: { active: '#ff9800', glow: '#ff980066' },
  high:   { active: '#ff1744', glow: '#ff174466' },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Peg    { x: number; y: number; flash: number; }
interface Bucket { x: number; y: number; w: number; h: number; mult: number; flash: number; }
interface BallObj { x: number; y: number; vx: number; vy: number; color: string; trail: { x: number; y: number }[]; landed: boolean; bucketIndex: number; alpha: number; }
interface PlinkoResult { winner: boolean; payout: number; winningSelection: { bucketIndex: number; multiplier: number }; message: string; }

function bucketColors(len: number) {
  return Array.from({ length: len }, (_, i) => {
    if (i === 0 || i === len - 1) return { bg: '#ff1744', text: '#fff' };
    if (i === 1 || i === len - 2) return { bg: '#ff9800', text: '#fff' };
    if (i === 2 || i === len - 3) return { bg: '#ffd600', text: '#111' };
    return { bg: '#0A2A1F', text: '#D4AF37' };
  });
}

const btnSmall: React.CSSProperties = {
  background: '#1E6F4F', border: '1px solid #D4AF37', borderRadius: 6,
  color: '#fff', padding: '8px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlinkoPage() {
  const { balance, fetchBalance } = useWalletStore();

  const bgRef  = useRef<HTMLCanvasElement>(null);
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const sRef   = useRef({
    balls:    [] as BallObj[],
    pegs:     [] as Peg[],
    buckets:  [] as Bucket[],
    rows:     16,
    risk:     'high' as Risk,
    pendingBucket: null as number | null,
    pendingResult: null as PlinkoResult | null,
    animId:   0,
  });
  const onLandedRef = useRef<((r: PlinkoResult) => void) | null>(null);

  const [risk, setRisk]           = useState<Risk>('high');
  const [rows, setRows]           = useState(16);
  const [betAmount, setBetAmount] = useState('10');
  const [isDropping, setIsDropping] = useState(false);
  const [lastResult, setLastResult] = useState<PlinkoResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [winFlash, setWinFlash]   = useState<{ mult: number; payout: number } | null>(null);

  // ─── Layout builder ────────────────────────────────────────────────────────
  const buildLayout = useCallback((canvas: HTMLCanvasElement, r: number) => {
    const W = canvas.width, H = canvas.height;
    const BUCKET_H = 44, TOP_PAD = 60, BOTTOM_PAD = BUCKET_H + 12;
    const rowSpacing = (H - TOP_PAD - BOTTOM_PAD) / (r + 1);
    const pegs: Peg[] = [];
    for (let row = 0; row < r; row++) {
      const cols = row + 3;
      const y = TOP_PAD + (row + 1) * rowSpacing;
      const totalW = (cols - 1) * (W / (r + 3));
      const startX = (W - totalW) / 2;
      const spacing = cols > 1 ? totalW / (cols - 1) : 0;
      for (let col = 0; col < cols; col++) pegs.push({ x: startX + col * spacing, y, flash: 0 });
    }
    const mults = MULTIPLIERS[sRef.current.risk][r];
    const bucketW = W / mults.length;
    const bucketY = H - BUCKET_H - 4;
    const buckets: Bucket[] = mults.map((m, i) => ({ x: i * bucketW, y: bucketY, w: bucketW, h: BUCKET_H, mult: m, flash: 0 }));
    return { pegs, buckets };
  }, []);

  // ─── Background draw ───────────────────────────────────────────────────────
  const drawBg = useCallback(() => {
    const c = bgRef.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const bg = ctx.createLinearGradient(0, 0, 0, c.height);
    bg.addColorStop(0, '#0A2A1F'); bg.addColorStop(1, '#0F3D2E');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
    for (let x = 0; x < c.width; x += 40)  { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
  }, []);

  // ─── Animation loop ────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const s = sRef.current;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    // Pegs
    for (const peg of s.pegs) {
      if (peg.flash > 0) peg.flash--;
      const glow = peg.flash > 0;
      if (glow) { ctx.shadowBlur = 18; ctx.shadowColor = '#00e5ff'; }
      ctx.beginPath(); ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = glow ? '#00e5ff' : '#1e3a5a'; ctx.fill();
      ctx.strokeStyle = glow ? '#80ffff' : '#2a5a8a'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Buckets
    const mults  = MULTIPLIERS[s.risk][s.rows];
    const colors = bucketColors(mults.length);
    for (let i = 0; i < s.buckets.length; i++) {
      const b = s.buckets[i]; if (b.flash > 0) b.flash--;
      const col = colors[i];
      ctx.save();
      if (b.flash > 0) { ctx.shadowBlur = 30; ctx.shadowColor = col.bg; }
      ctx.fillStyle   = b.flash > 0 ? col.bg : col.bg + 'bb';
      ctx.strokeStyle = col.bg; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = col.text; ctx.font = "bold 11px 'Courier New', monospace";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${b.mult}×`, b.x + b.w / 2, b.y + b.h / 2);
      ctx.restore();
    }

    // Balls
    const active: BallObj[] = [];
    for (const ball of s.balls) {
      if (!ball.landed) {
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 12) ball.trail.shift();
        ball.vy += GRAVITY; ball.x += ball.vx; ball.y += ball.vy;
        if (ball.x - BALL_RADIUS < 0) { ball.x = BALL_RADIUS; ball.vx = Math.abs(ball.vx) * BOUNCE; }
        if (ball.x + BALL_RADIUS > W) { ball.x = W - BALL_RADIUS; ball.vx = -Math.abs(ball.vx) * BOUNCE; }
        for (const peg of s.pegs) {
          const dx = ball.x - peg.x, dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const min = BALL_RADIUS + PEG_RADIUS;
          if (dist < min && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * BOUNCE + (Math.random() - 0.5) * 0.4;
            ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE;
            ball.x = peg.x + nx * (min + 0.5); ball.y = peg.y + ny * (min + 0.5);
            peg.flash = 8;
          }
        }
        const bucketY = s.buckets[0]?.y ?? H - 50;
        if (ball.y + BALL_RADIUS >= bucketY - 4) {
          ball.landed = true;
          ball.y = bucketY - BALL_RADIUS;
          // Snap to server's bucket
          if (s.pendingBucket !== null) {
            const tb = s.buckets[s.pendingBucket];
            if (tb) { ball.x = tb.x + tb.w / 2; ball.bucketIndex = s.pendingBucket; tb.flash = 25; }
            const result = s.pendingResult;
            s.pendingBucket = null; s.pendingResult = null;
            if (result && onLandedRef.current) onLandedRef.current(result);
          }
        }
      } else {
        ball.alpha -= 0.015;
      }

      // Trail
      for (let t = 0; t < ball.trail.length; t++) {
        const a = (t / ball.trail.length) * 0.4 * ball.alpha;
        ctx.beginPath(); ctx.arc(ball.trail[t].x, ball.trail[t].y, BALL_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = ball.color + Math.floor(a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // Ball
      if (ball.alpha > 0) {
        ctx.save(); ctx.globalAlpha = ball.alpha;
        ctx.shadowBlur = 16; ctx.shadowColor = ball.color;
        const gr = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, BALL_RADIUS);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, ball.color); gr.addColorStop(1, ball.color + '88');
        ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill(); ctx.restore();
        active.push(ball);
      }
    }
    s.balls = active;
    s.animId = requestAnimationFrame(loop);
  }, []);

  // ─── Canvas init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const cv = cvRef.current, bg = bgRef.current;
    if (!cv || !bg) return;
    const resize = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
      bg.width = bg.offsetWidth; bg.height = bg.offsetHeight;
      drawBg();
      const { pegs, buckets } = buildLayout(cv, sRef.current.rows);
      sRef.current.pegs = pegs; sRef.current.buckets = buckets;
    };
    resize();
    window.addEventListener('resize', resize);
    sRef.current.animId = requestAnimationFrame(loop);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(sRef.current.animId); };
  }, [loop, buildLayout, drawBg]);

  useEffect(() => { void fetchBalance(); }, [fetchBalance]);

  // ─── Controls ──────────────────────────────────────────────────────────────
  const handleRisk = useCallback((r: Risk) => {
    setRisk(r); sRef.current.risk = r;
    const cv = cvRef.current; if (!cv) return;
    const { pegs, buckets } = buildLayout(cv, sRef.current.rows);
    sRef.current.pegs = pegs; sRef.current.buckets = buckets;
    drawBg();
  }, [buildLayout, drawBg]);

  const handleRows = useCallback((r: number) => {
    const snap = [8, 12, 16].reduce((a, b) => Math.abs(b - r) < Math.abs(a - r) ? b : a);
    setRows(snap); sRef.current.rows = snap;
    const cv = cvRef.current; if (!cv) return;
    const { pegs, buckets } = buildLayout(cv, snap);
    sRef.current.pegs = pegs; sRef.current.buckets = buckets;
  }, [buildLayout]);

  // ─── Bet ───────────────────────────────────────────────────────────────────
  const handleBet = useCallback(async () => {
    const amount = parseInt(betAmount, 10);
    if (!amount || amount <= 0 || amount > balance || isDropping) return;
    setIsDropping(true); setError(null); setLastResult(null);

    try {
      const res = await fetch(`${API}/games/bet`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ amount, gameType: 'plinko', selection: { rows: sRef.current.rows, risk: sRef.current.risk } }),
      });
      if (!res.ok) {
        const err: { message?: string } = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Error ${res.status}`);
      }
      const data: PlinkoResult = await res.json();

      sRef.current.pendingBucket = data.winningSelection.bucketIndex;
      sRef.current.pendingResult = data;

      onLandedRef.current = (result) => {
        setLastResult(result);
        setWinFlash({ mult: result.winningSelection.multiplier, payout: result.payout });
        setTimeout(() => setWinFlash(null), 1500);
        setIsDropping(false);
        void fetchBalance();
        onLandedRef.current = null;
      };

      // Drop ball after API responds
      const cv = cvRef.current; if (!cv) return;
      const ballColors = ['#ff1744', '#ff9100', '#ffea00', '#00e5ff', '#d500f9', '#00e676'];
      sRef.current.balls.push({
        x: cv.width / 2 + (Math.random() - 0.5) * 15,
        y: 30, vx: (Math.random() - 0.5) * 1.2, vy: 0,
        color: ballColors[Math.floor(Math.random() * ballColors.length)],
        trail: [], landed: false, bucketIndex: -1, alpha: 1,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al conectar con el servidor');
      setIsDropping(false);
    }
  }, [betAmount, balance, isDropping, fetchBalance]);

  const riskColor = RISK_COLORS[risk];
  const amount    = parseInt(betAmount || '0', 10);
  const betDisabled = isDropping || amount <= 0 || amount > balance;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 4rem)', marginTop: '4rem', background: '#0A2A1F', fontFamily: "'Lexend', sans-serif", color: '#e0f0ff', overflow: 'hidden' }}>

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <div style={{ minWidth: 240, background: 'linear-gradient(180deg, #0F3D2E 0%, #0A2A1F 100%)', borderRight: '1px solid #1a3050', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 16, overflowY: 'auto' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 4, color: '#D4AF37', textShadow: '0 0 20px #D4AF37', fontFamily: 'EB Garamond, serif' }}>PLINKO</div>
          <div style={{ fontSize: 10, color: '#00FF88', letterSpacing: 3, marginTop: 2, fontFamily: 'EB Garamond, serif' }}>GAME</div>
        </div>

        {/* Balance */}
        <div style={{ background: '#0A2A1F', borderRadius: 8, padding: '10px 14px', border: '1px solid #D4AF37' }}>
          <div style={{ fontSize: 10, color: '#00FF88', letterSpacing: 2, marginBottom: 4 }}>SALDO</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{balance} fichas</div>
        </div>

        {/* Bet amount */}
        <div>
          <label style={{ fontSize: 10, color: '#00FF88', letterSpacing: 2, display: 'block', marginBottom: 6 }}>APUESTA (fichas)</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number" min="1" step="1" value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              style={{ flex: 1, background: '#0A2A1F', border: '1px solid #D4AF37', borderRadius: 6, color: '#e0f0ff', padding: '8px 10px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
            <button onClick={() => setBetAmount(v => String(Math.max(1, Math.floor(parseInt(v || '0') / 2))))} style={btnSmall}>½</button>
            <button onClick={() => setBetAmount(v => String(parseInt(v || '0') * 2))} style={btnSmall}>2×</button>
          </div>
        </div>

        {/* Risk */}
        <div>
          <label style={{ fontSize: 10, color: '#00FF88', letterSpacing: 2, display: 'block', marginBottom: 6 }}>RIESGO</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['low', 'medium', 'high'] as Risk[]).map(r => (
              <button key={r} onClick={() => handleRisk(r)} style={{
                flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid',
                borderColor: risk === r ? RISK_COLORS[r].active : '#D4AF37',
                background: risk === r ? RISK_COLORS[r].active + '22' : '#1E6F4F',
                color: risk === r ? RISK_COLORS[r].active : '#3a6080',
                fontSize: 10, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div>
          <label style={{ fontSize: 10, color: '#00FF88', letterSpacing: 2, display: 'block', marginBottom: 6 }}>FILAS: {rows}</label>
          <input type="range" min={8} max={16} step={4} value={rows}
            onChange={e => handleRows(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: riskColor.active }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#00FF88', marginTop: 4 }}>
            <span>8</span><span>12</span><span>16</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#ff174422', border: '1px solid #ff1744', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ff6060' }}>
            {error}
          </div>
        )}

        {/* Bet button */}
        <button
          onClick={handleBet}
          disabled={betDisabled}
          style={{
            padding: 14, borderRadius: 8, border: 'none',
            background: betDisabled ? '#1E6F4F' : 'linear-gradient(135deg, #00FF88, #00C468)',
            color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 2,
            cursor: betDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            boxShadow: betDisabled ? 'none' : '0 0 20px #00FF8866', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: betDisabled ? 0.5 : 1,
          }}
        >
          {isDropping
            ? <><Loader2 className="w-4 h-4 animate-spin" /> CAYENDO...</>
            : `▶ APOSTAR ${amount} fichas`}
        </button>

        {/* Last result */}
        {lastResult && (
          <div style={{ background: '#0A2A1F', border: `1px solid ${lastResult.winner ? '#00FF88' : '#ff1744'}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#00FF88', marginBottom: 4 }}>ÚLTIMO RESULTADO</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: lastResult.winner ? '#00e676' : '#ff6060' }}>
              {lastResult.winner ? `+${lastResult.payout}` : '0'} fichas
            </div>
            <div style={{ fontSize: 12, color: '#ffffff66', marginTop: 2 }}>{lastResult.winningSelection.multiplier}×</div>
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: 10, color: '#00FF8888', textAlign: 'center', lineHeight: 1.6 }}>
          Resultado calculado en el servidor.<br />La física es visual.
        </div>
      </div>

      {/* ─── Canvas ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', position: 'relative', background: '#0A2A1F' }}>
        <canvas ref={bgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }} />
        <div style={{ width: 700, height: '100%', position: 'relative', zIndex: 1 }}>
          <canvas ref={cvRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          {winFlash && (
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', animation: 'popIn 0.2s ease' }}>
              <div style={{ fontSize: 52, fontWeight: 'bold', color: '#ffea00', textShadow: '0 0 30px #ffea00', lineHeight: 1 }}>{winFlash.mult}×</div>
              <div style={{ fontSize: 24, color: '#00e676', textShadow: '0 0 20px #00e676' }}>+{winFlash.payout} fichas</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.5); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px; background:#D4AF37; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#00FF88; cursor:pointer; }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
}
