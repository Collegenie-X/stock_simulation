'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CHART_PATTERNS, type ChartPattern } from '@/data/chart-patterns';
import {
  getScenarioForRound,
  calculateRoundScore,
  getFinalResult,
  calcPnl,
  getTurnFeedback,
  TOTAL_ROUNDS,
  TURNS_PER_ROUND,
  CANDLES_PER_TURN,
  INITIAL_REVEAL,
  MAX_POSITION,
  DECISION_TIMERS,
  type PatternScenario,
  type Candle,
  type RoundScore,
  type TradeLog,
  type TurnFeedback,
} from '@/data/pattern-practice';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, RotateCcw, ChevronRight, Star, Play,
  Trophy, Flame, Eye, X, ShoppingCart, BadgeDollarSign,
  CheckCircle2, XCircle, MinusCircle, Package,
} from 'lucide-react';

// ─── 시작 주식 수 (표시용) ──────────────────────────────
const INITIAL_SHARES = 5;

// ═══════════════════════════════════════════════════════════
// LineChart
// ═══════════════════════════════════════════════════════════
function LineChart({
  candles, visibleCount, buyTurns, sellTurns,
}: {
  candles: Candle[]; visibleCount: number;
  buyTurns?: number[]; sellTurns?: number[];
}) {
  const visible = candles.slice(0, visibleCount);
  if (visible.length === 0) return null;
  const W = 340; const H = 200; const MR = 50; const ML = 4; const MT = 16; const MB = 16;
  const drawW = W - MR - ML; const drawH = H - MT - MB;
  const closes = visible.map(c => c.close);
  const maxP = Math.max(...closes); const minP = Math.min(...closes);
  const range = maxP - minP || 1; const pad = range * 0.12;
  const yMax = maxP + pad; const yMin = minP - pad;
  const pToY = (p: number) => MT + drawH * (1 - (p - yMin) / (yMax - yMin));
  const iToX = (i: number) => ML + (drawW / Math.max(visible.length - 1, 1)) * i;
  const gridPrices = Array.from({ length: 3 }, (_, i) => yMin + ((yMax - yMin) * (i + 1)) / 4);
  const linePoints = visible.map((c, i) => `${iToX(i)},${pToY(c.close)}`).join(' ');
  const first = visible[0]; const last = visible[visible.length - 1];
  const prevClose = visible.length > 1 ? visible[visible.length - 2].close : last.close;
  const trendUp = last.close >= first.close; const lastUp = last.close >= prevClose;
  const lineColor = trendUp ? '#4ade80' : '#f87171';
  const areaPoints = `${iToX(0)},${pToY(first.close)} ${linePoints} ${iToX(visible.length - 1)},${H - MB} ${iToX(0)},${H - MB}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="aU" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.25"/><stop offset="100%" stopColor="#4ade80" stopOpacity="0.02"/></linearGradient>
        <linearGradient id="aD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity="0.25"/><stop offset="100%" stopColor="#f87171" stopOpacity="0.02"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="dg"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width={W} height={H} fill="#0a0a0a" rx="12"/>
      {gridPrices.map((p, i) => (
        <g key={i}>
          <line x1={ML} y1={pToY(p)} x2={ML + drawW + 5} y2={pToY(p)} stroke="#1a1a1a" strokeWidth="0.5"/>
          <text x={ML + drawW + 10} y={pToY(p) + 4} fill="#555" fontSize="9" fontFamily="sans-serif">{Math.round(p / 1000)}K</text>
        </g>
      ))}
      <polygon points={areaPoints} fill={`url(#${trendUp ? 'aU' : 'aD'})`}/>
      <polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={iToX(visible.length - 1)} cy={pToY(last.close)} r="5" fill={lineColor} stroke="#0a0a0a" strokeWidth="2" filter="url(#dg)"/>
      {buyTurns?.map(idx => idx < visibleCount ? (
        <g key={`b${idx}`}>
          <circle cx={iToX(idx)} cy={pToY(candles[idx].close) - 14} r="8" fill="#22c55e" stroke="#0a0a0a" strokeWidth="2" filter="url(#glow)"/>
          <text x={iToX(idx)} y={pToY(candles[idx].close) - 11} fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">B</text>
        </g>
      ) : null)}
      {sellTurns?.map(idx => idx < visibleCount ? (
        <g key={`s${idx}`}>
          <circle cx={iToX(idx)} cy={pToY(candles[idx].close) - 14} r="8" fill="#ef4444" stroke="#0a0a0a" strokeWidth="2" filter="url(#glow)"/>
          <text x={iToX(idx)} y={pToY(candles[idx].close) - 11} fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">S</text>
        </g>
      ) : null)}
      <rect x={ML + drawW + 2} y={pToY(last.close) - 10} width={46} height={20} fill={lastUp ? '#22c55e' : '#ef4444'} rx="6" filter="url(#glow)"/>
      <text x={ML + drawW + 25} y={pToY(last.close) + 4} fill="white" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
        {(last.close / 1000).toFixed(1)}K
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// Exit Confirm Dialog
// ═══════════════════════════════════════════════════════════
function ExitDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🚪</div>
          <h3 className="text-xl font-black text-white">정말 종료할까요?</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            지금까지의 점수가 <span className="text-red-400 font-bold">사라져요!</span><br/>
            정말 게임을 끝낼까요?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12 rounded-2xl bg-[#252525] border-white/10 text-white font-bold hover:bg-[#2a2a2a]">
            계속할게요
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-12 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 border-0">
            종료할게요
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// In-game Turn History (live during play)
// ═══════════════════════════════════════════════════════════
interface TurnHistoryEntry {
  turn: number;
  action: 'buy' | 'sell' | 'skip' | 'timeout';
  price: number;
  sharesAfter: number;
}

function InGameHistory({ history }: { history: TurnHistoryEntry[] }) {
  if (history.length === 0) return null;
  return (
    <div className="mt-3 rounded-2xl bg-[#111] border border-white/5 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/5">
        <p className="text-xs font-bold text-gray-600">내 투자 기록</p>
      </div>
      <div className="divide-y divide-white/5">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
              h.action === 'buy' ? 'bg-green-500/25 text-green-400' :
              h.action === 'sell' ? 'bg-red-500/25 text-red-400' : 'bg-white/5 text-gray-500',
            )}>
              {h.action === 'buy' ? '↑' : h.action === 'sell' ? '↓' : '−'}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-300">턴 {h.turn + 1}</span>
              {(h.action === 'buy' || h.action === 'sell') && (
                <span className="text-xs text-gray-500 ml-2">{h.price.toLocaleString('ko-KR')}원</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-gray-600" />
              <span className={cn('text-xs font-black',
                h.action === 'buy' ? 'text-green-400' :
                h.action === 'sell' ? 'text-red-400' : 'text-gray-500',
              )}>{h.sharesAfter}주</span>
              {h.action === 'buy' && <span className="text-[10px] text-green-600">+1</span>}
              {h.action === 'sell' && <span className="text-[10px] text-red-600">-1</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Round Result Trade History
// ═══════════════════════════════════════════════════════════
function TradeHistoryList({ trades, scenario }: { trades: TradeLog[]; scenario: PatternScenario }) {
  const isBuy = scenario.signal === 'buy';
  function evalTrade(t: TradeLog): { icon: React.ReactNode; label: string; color: string } {
    if (t.action === 'skip' || t.action === 'timeout') {
      return { icon: <MinusCircle className="w-4 h-4" />, label: t.action === 'timeout' ? '시간초과' : '관망', color: 'text-gray-500' };
    }
    const isCorrDir = (t.action === 'buy' && isBuy) || (t.action === 'sell' && !isBuy);
    const isWrongDir = (t.action === 'buy' && !isBuy && trades.filter(x => x.action === 'sell').length === 0) ||
      (t.action === 'sell' && isBuy && trades.filter(x => x.action === 'buy').length === 0);
    if (isWrongDir) return { icon: <XCircle className="w-4 h-4" />, label: '방향 반대!', color: 'text-red-400' };
    if (isCorrDir) return { icon: <CheckCircle2 className="w-4 h-4" />, label: '잘했어요!', color: 'text-green-400' };
    return { icon: <CheckCircle2 className="w-4 h-4" />, label: '괜찮아요', color: 'text-blue-400' };
  }
  if (trades.length === 0) {
    return (
      <div className="bg-[#111] rounded-2xl p-4 border border-white/5 text-center">
        <p className="text-gray-500 text-sm">이번 라운드에 거래가 없었어요</p>
      </div>
    );
  }
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5">
        <p className="text-xs font-bold text-gray-500">내 투자 기록</p>
      </div>
      <div className="divide-y divide-white/5">
        {trades.map((t, i) => {
          const ev = evalTrade(t);
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                t.action === 'buy' ? 'bg-green-500/20 text-green-400' :
                t.action === 'sell' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/10 text-gray-500',
              )}>
                {t.action === 'buy' ? '매수' : t.action === 'sell' ? '매도' : '관망'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  턴 {t.turn + 1}
                  {(t.action === 'buy' || t.action === 'sell') && (
                    <span className="text-xs text-gray-400 font-normal ml-2">{t.price.toLocaleString('ko-KR')}원</span>
                  )}
                </p>
              </div>
              <div className={cn('flex items-center gap-1 text-xs font-bold shrink-0', ev.color)}>
                {ev.icon}<span>{ev.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Particle Effects
// ═══════════════════════════════════════════════════════════
function ParticleEffect({ type }: { type: 'sparkle' | 'shake' }) {
  const emojis = type === 'sparkle'
    ? ['✨', '💰', '⭐', '🎯', '💫', '🌟', '💎', '🔥']
    : ['💥', '😵', '❌', '💨', '😤', '🌀'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {emojis.map((e, i) => (
        <div key={i} className="absolute text-3xl" style={{ left: `${15 + (i * 11) % 70}%`, top: `${10 + (i * 17) % 60}%`, animation: `pf 1.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>{e}</div>
      ))}
      <style>{`@keyframes pf{0%{opacity:1;transform:scale(0.5) translateY(0)}50%{opacity:1;transform:scale(1.2) translateY(-20px)}100%{opacity:0;transform:scale(0.8) translateY(-60px)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
function fmtPrice(n: number) { return n.toLocaleString('ko-KR') + '원'; }
function fmtPnl(n: number) { return `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}원`; }
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => (
        <Star key={i} className={cn('w-12 h-12 transition-all duration-700', i < stars ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-800')} style={{ transitionDelay: `${i * 300}ms` }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
type GamePhase = 'intro' | 'countdown' | 'revealing' | 'deciding' | 'feedback' | 'closing' | 'round-result' | 'final-result';
interface RoundData { score: RoundScore; trades: TradeLog[]; netPosition: number; scenario: PatternScenario; }

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
export default function PatternPracticePage() {
  const params = useParams();
  const router = useRouter();

  const [pattern, setPattern] = useState<ChartPattern | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundData[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const [scenario, setScenario] = useState<PatternScenario | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [netPosition, setNetPosition] = useState(0);
  // displayShares = INITIAL_SHARES + netPosition
  const [timer, setTimer] = useState(12);
  const [countdownVal, setCountdownVal] = useState(3);
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null);
  const [turnHistory, setTurnHistory] = useState<TurnHistoryEntry[]>([]);

  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tracks which turn triggered the current feedback (prevents double-fire)
  const feedbackTurnRef = useRef(-1);

  const confirmExit = useCallback(() => {
    if (revealRef.current) clearTimeout(revealRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(`/learn/patterns/${params.id}`);
  }, [router, params.id]);

  useEffect(() => { setPattern(CHART_PATTERNS.find(p => p.id === params.id) ?? null); }, [params.id]);
  useEffect(() => () => {
    if (revealRef.current) clearTimeout(revealRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const totalCandles = scenario?.candles.length ?? 0;
  const currentPrice = scenario && visibleCount > 0 ? scenario.candles[visibleCount - 1].close : 0;
  const targetVisible = INITIAL_REVEAL + (currentTurn + 1) * CANDLES_PER_TURN;
  const displayShares = INITIAL_SHARES + netPosition;

  const pnl = useMemo(
    () => trades.length === 0 ? 0 : calcPnl(trades, netPosition, currentPrice),
    [trades, netPosition, currentPrice],
  );
  const buyIndices = useMemo(() => trades.filter(t => t.action === 'buy').map(t =>
    Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, totalCandles - 1)
  ), [trades, totalCandles]);
  const sellIndices = useMemo(() => trades.filter(t => t.action === 'sell').map(t =>
    Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, totalCandles - 1)
  ), [trades, totalCandles]);

  // ── Reveal candles ─────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'revealing' || !scenario) return;
    const target = Math.min(targetVisible, totalCandles);
    if (visibleCount >= target) {
      const secs = DECISION_TIMERS[currentRound] ?? 10;
      setTimer(secs);
      setGamePhase('deciding');
      return;
    }
    revealRef.current = setTimeout(() => setVisibleCount(v => v + 1), 200);
    return () => { if (revealRef.current) clearTimeout(revealRef.current); };
  }, [gamePhase, visibleCount, targetVisible, totalCandles, scenario, currentRound]);

  // ── Decision timer ──────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'deciding') return;
    if (timer <= 0) { handleDecision('skip', true); return; }
    timerRef.current = setInterval(() => setTimer(v => v - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, timer]);

  // ── Feedback auto-dismiss ───────────────────────────────
  // Only depends on gamePhase to avoid re-firing on currentTurn change.
  // We capture the turn in feedbackTurnRef (set in handleDecision).
  useEffect(() => {
    if (gamePhase !== 'feedback') return;
    const capturedTurn = feedbackTurnRef.current;
    const t = setTimeout(() => {
      if (capturedTurn >= TURNS_PER_ROUND - 1) {
        setGamePhase('closing');
      } else {
        setCurrentTurn(capturedTurn + 1);
        setGamePhase('revealing');
      }
    }, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]);

  // ── Closing: reveal remaining ───────────────────────────
  useEffect(() => {
    if (gamePhase !== 'closing' || !scenario) return;
    if (visibleCount >= totalCandles) { endRound(); return; }
    const t = setTimeout(() => setVisibleCount(v => v + 1), 120);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, visibleCount, totalCandles]);

  // ── Start round ─────────────────────────────────────────
  const startRound = useCallback((round: number) => {
    const s = getScenarioForRound(pattern?.id ?? '', round);
    if (!s) return;
    setScenario(s);
    setVisibleCount(INITIAL_REVEAL);
    setTrades([]);
    setNetPosition(0);
    setCurrentTurn(0);
    setFeedback(null);
    setTurnHistory([]);
    setTimer(DECISION_TIMERS[round] ?? 10);
    feedbackTurnRef.current = -1;
    setGamePhase('countdown');
    setCountdownVal(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); setGamePhase('revealing'); }
      else setCountdownVal(c);
    }, 600);
  }, [pattern]);

  // ── Handle decision ─────────────────────────────────────
  const handleDecision = useCallback((action: 'buy' | 'sell' | 'skip', isTimeout = false) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!scenario) return;
    const price = currentPrice;

    let newNetPos = netPosition;
    if (action === 'buy') {
      setTrades(prev => [...prev, { action: 'buy', price, turn: currentTurn }]);
      newNetPos = netPosition + 1;
      setNetPosition(newNetPos);
    } else if (action === 'sell') {
      setTrades(prev => [...prev, { action: 'sell', price, turn: currentTurn }]);
      newNetPos = netPosition - 1;
      setNetPosition(newNetPos);
    }

    // Add to in-game history
    setTurnHistory(prev => [...prev, {
      turn: currentTurn,
      action: isTimeout ? 'timeout' : action,
      price,
      sharesAfter: INITIAL_SHARES + newNetPos,
    }]);

    const fb = getTurnFeedback({
      action,
      candleIndex: visibleCount - 1,
      scenario,
      netPosition: newNetPos,
      isTimeout,
    });
    setFeedback(fb);
    feedbackTurnRef.current = currentTurn; // capture BEFORE state update
    setGamePhase('feedback');
  }, [currentPrice, currentTurn, scenario, visibleCount, netPosition]);

  // ── End round ───────────────────────────────────────────
  const endRound = useCallback(() => {
    if (!scenario) return;
    const finalPrice = scenario.candles[totalCandles - 1].close;
    const score = calculateRoundScore(trades, netPosition, finalPrice, scenario);
    setRoundResults(prev => [...prev, { score, trades, netPosition, scenario }]);
    setTotalScore(prev => prev + score.total);
    setStreak(prev => score.total >= 8 ? prev + 1 : 0);
    setVisibleCount(totalCandles);
    setGamePhase('round-result');
  }, [scenario, totalCandles, trades, netPosition]);

  const handleNextRound = () => {
    const n = currentRound + 1;
    if (n >= TOTAL_ROUNDS) setGamePhase('final-result');
    else { setCurrentRound(n); startRound(n); }
  };
  const handleRetry = () => {
    setCurrentRound(0); setRoundResults([]); setTotalScore(0); setStreak(0);
    setGamePhase('intro');
  };

  if (!pattern) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-pulse text-6xl">📊</div></div>;

  // ═══════════════ INTRO ═══════════════════════
  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-black pb-32">
        <div className="pt-12 px-5 max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-gray-500 text-sm mb-4">← 뒤로</button>
          <section className="text-center mt-2">
            <div className="text-8xl mb-4 animate-bounce">{pattern.emoji}</div>
            <h1 className="text-3xl font-black text-white tracking-tight">{pattern.name}</h1>
            <p className="text-base text-gray-500 mt-1">{pattern.nameEn}</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-5 py-2 rounded-full border border-indigo-500/40">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-lg font-black text-white">{TOTAL_ROUNDS}라운드 · {TURNS_PER_ROUND}턴</span>
            </div>
          </section>
          <section className="mt-8 space-y-3">
            {[
              { emoji: '📦', text: `${INITIAL_SHARES}주를 가지고 시작해요!`, color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30' },
              { emoji: '📈', text: '선 그래프가 자동으로 그려져요', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
              { emoji: '🎯', text: `${TURNS_PER_ROUND}턴 동안 사거나 팔거나 기다려요`, color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
              { emoji: '⏱️', text: '제한시간 안에 버튼을 누르세요!', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' },
              { emoji: '🏆', text: '끝나면 얼마나 벌었는지 점수 매겨요!', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
            ].map((r, i) => (
              <div key={i} className={cn('flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r border', r.color)}>
                <span className="text-3xl">{r.emoji}</span>
                <p className="text-base font-bold text-white">{r.text}</p>
              </div>
            ))}
          </section>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-md mx-auto">
            <Button onClick={() => { setCurrentRound(0); startRound(0); }} className="w-full h-16 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-500/30">
              <Play className="w-6 h-6 mr-2" /> 게임 시작!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ COUNTDOWN ═══════════════════
  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-lg text-gray-500 mb-4 font-bold">라운드 {currentRound + 1} / {TOTAL_ROUNDS}</p>
        <div className="relative">
          <div className="text-[140px] font-black text-white leading-none">{countdownVal}</div>
          <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full -z-10" />
        </div>
        <p className="text-base text-indigo-400 mt-6 font-bold">⏱️ 턴당 {DECISION_TIMERS[currentRound]}초 · 📦 {INITIAL_SHARES}주로 시작!</p>
      </div>
    );
  }

  // ═══════════════ ROUND RESULT ═══════════════════
  if (gamePhase === 'round-result') {
    const rd = roundResults[roundResults.length - 1];
    if (!rd || !scenario) return null;
    const s = rd.score;
    const finalShares = INITIAL_SHARES + rd.netPosition;
    return (
      <div className="min-h-screen bg-black pb-36">
        {showExitDialog && <ExitDialog onConfirm={confirmExit} onCancel={() => setShowExitDialog(false)} />}
        <main className="pt-6 px-5 max-w-md mx-auto">
          <div className="text-center">
            <span className="text-sm text-gray-500 font-bold">라운드 {currentRound + 1}/{TOTAL_ROUNDS}</span>
            <div className="text-8xl mt-3 mb-2 animate-bounce">{s.emoji}</div>
            <h2 className="text-3xl font-black text-white">{s.message}</h2>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-yellow-400">{s.total}</span>
              <span className="text-lg text-gray-600">/20점</span>
              <span className={cn('text-xl font-black px-3 py-1 rounded-lg',
                s.grade === 'S' ? 'bg-yellow-500/30 text-yellow-300' : s.grade === 'A' ? 'bg-green-500/30 text-green-300' :
                s.grade === 'B' ? 'bg-blue-500/30 text-blue-300' : s.grade === 'C' ? 'bg-orange-500/30 text-orange-300' : 'bg-gray-500/30 text-gray-400',
              )}>{s.grade}</span>
            </div>
            {streak >= 2 && <div className="mt-2 text-xl font-black text-orange-400 animate-pulse">🔥 {streak}연승!</div>}
          </div>

          {/* Chart */}
          <section className="mt-5 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="h-40 p-1"><LineChart candles={scenario.candles} visibleCount={totalCandles} buyTurns={buyIndices} sellTurns={sellIndices} /></div>
          </section>

          {/* P&L + Shares (emphasized) */}
          <section className="mt-4">
            {/* P&L - big and prominent */}
            <div className={cn('rounded-2xl p-5 border mb-3 text-center', s.userPnl >= 0 ? 'bg-green-500/15 border-green-500/30' : 'bg-red-500/15 border-red-500/30')}>
              <p className="text-sm font-bold text-gray-400 mb-1">💰 내 손익</p>
              <p className={cn('text-4xl font-black', s.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>{fmtPnl(s.userPnl)}</p>
              <p className="text-xs text-gray-500 mt-1">최적 손익: {fmtPnl(s.optimalPnl)}</p>
            </div>
            {/* Shares card */}
            <div className="bg-[#111] rounded-2xl px-4 py-3 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-gray-300">최종 보유 주식</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{INITIAL_SHARES}주 시작</span>
                <span className="text-gray-600">→</span>
                <span className="text-xl font-black text-white">{finalShares}주</span>
                {rd.netPosition !== 0 && (
                  <span className={cn('text-sm font-bold', rd.netPosition > 0 ? 'text-green-400' : 'text-red-400')}>
                    ({rd.netPosition > 0 ? '+' : ''}{rd.netPosition})
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Trade history */}
          <section className="mt-3">
            <TradeHistoryList trades={rd.trades} scenario={rd.scenario} />
          </section>

          {/* Cumulative score */}
          <section className="mt-3 bg-[#111] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <span className="text-base text-gray-400 font-bold">누적 점수</span>
            <span className="text-2xl font-black text-yellow-400">{totalScore} <span className="text-sm text-gray-600">/ {TOTAL_ROUNDS * 20}</span></span>
          </section>
        </main>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" onClick={() => setShowExitDialog(true)} className="h-16 w-16 rounded-2xl bg-[#111] border-white/10 text-white font-bold hover:bg-[#1a1a1a] shrink-0">
              <X className="w-5 h-5" />
            </Button>
            <Button onClick={handleNextRound} className="flex-1 h-16 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-500/30">
              {currentRound + 1 < TOTAL_ROUNDS ? <>다음 라운드 <ChevronRight className="w-6 h-6 ml-1" /></> : <><Trophy className="w-6 h-6 mr-2" /> 최종 결과</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ FINAL RESULT ═══════════════════
  if (gamePhase === 'final-result') {
    const result = getFinalResult(totalScore);
    return (
      <div className="min-h-screen bg-black pb-36">
        <main className="pt-8 px-5 max-w-md mx-auto">
          <section className="text-center mt-4">
            <div className="text-[100px] leading-none mb-4">{result.emoji}</div>
            <h2 className="text-3xl font-black text-white">{result.title}</h2>
            <p className="text-lg text-gray-400 mt-2">{result.sub}</p>
          </section>
          <section className="mt-6"><StarRating stars={result.stars} /></section>
          <section className="mt-6 bg-[#111] rounded-3xl p-6 border border-white/5 text-center">
            <p className="text-sm text-gray-500">최종 점수</p>
            <p className="text-6xl font-black text-white mt-1">{totalScore}<span className="text-xl text-gray-600">/{TOTAL_ROUNDS * 20}</span></p>
          </section>
          <section className="mt-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-400">라운드별 투자 기록</h3>
            {roundResults.map((rd, i) => (
              <div key={i} className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-base font-black text-gray-400">{i + 1}</div>
                  <span className="text-2xl">{rd.score.emoji}</span>
                  <span className={cn('text-sm font-black px-2 py-0.5 rounded-lg',
                    rd.score.grade === 'S' ? 'bg-yellow-500/20 text-yellow-300' : rd.score.grade === 'A' ? 'bg-green-500/20 text-green-300' :
                    rd.score.grade === 'B' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400',
                  )}>{rd.score.grade}</span>
                  <span className="text-lg font-black text-yellow-400 flex-1">{rd.score.total}점</span>
                  <div className="text-right">
                    <p className={cn('text-sm font-black', rd.score.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>{fmtPnl(rd.score.userPnl)}</p>
                    <p className="text-xs text-gray-500">{INITIAL_SHARES}주→{INITIAL_SHARES + rd.netPosition}주</p>
                  </div>
                </div>
                {rd.trades.filter(t => t.action === 'buy' || t.action === 'sell').length > 0 && (
                  <div className="px-4 py-2 flex flex-wrap gap-2">
                    {rd.trades.map((t, j) => (
                      t.action === 'buy' || t.action === 'sell' ? (
                        <span key={j} className={cn('text-xs font-bold px-2 py-1 rounded-lg',
                          t.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400',
                        )}>
                          {t.action === 'buy' ? '📈' : '📉'} T{t.turn + 1}
                        </span>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" onClick={() => router.push(`/learn/patterns/${pattern.id}`)} className="flex-1 h-14 rounded-2xl bg-[#111] border-white/10 text-white text-base font-bold hover:bg-[#1a1a1a]">패턴 복습</Button>
            <Button onClick={handleRetry} className="flex-[2] h-14 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-500/30">
              <RotateCcw className="w-5 h-5 mr-2" /> 다시 도전
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ PLAYING ═══════════════════════
  if (!scenario) return null;
  const decSecs = DECISION_TIMERS[currentRound] ?? 10;
  const timerPct = (timer / decSecs) * 100;
  const isDeciding = gamePhase === 'deciding';
  const isFeedback = gamePhase === 'feedback';
  const isRevealing = gamePhase === 'revealing';
  const isClosing = gamePhase === 'closing';
  const canBuy = netPosition < MAX_POSITION;
  const canSell = netPosition > -MAX_POSITION;
  const pnlColor = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-black" style={{ paddingBottom: '200px' }}>
      {showExitDialog && <ExitDialog onConfirm={confirmExit} onCancel={() => setShowExitDialog(false)} />}

      {/* Feedback overlay */}
      {isFeedback && feedback && (
        <div className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          feedback.isGood ? 'bg-gradient-to-b from-green-900/80 via-black/80 to-black/90'
            : feedback.effect === 'shake' ? 'bg-gradient-to-b from-red-900/80 via-black/80 to-black/90'
            : 'bg-gradient-to-b from-gray-900/80 via-black/80 to-black/90',
        )} style={feedback.effect === 'shake' ? { animation: 'shake 0.4s ease-in-out' } : undefined}>
          <div className="relative text-center px-6">
            <ParticleEffect type={feedback.effect === 'sparkle' ? 'sparkle' : 'shake'} />
            <div className="text-[80px] leading-none mb-4" style={{ animation: 'pop 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)' }}>{feedback.emoji}</div>
            <h2 className="text-3xl font-black text-white mb-2">{feedback.title}</h2>
            <p className="text-lg text-white/70 max-w-[280px] mx-auto leading-snug">{feedback.reason}</p>
          </div>
          <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}@keyframes pop{0%{transform:scale(0.3);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}

      {/* Game Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowExitDialog(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/30 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-2xl">{pattern.emoji}</span>
            <p className="text-sm font-black text-white">R{currentRound + 1} · 턴 {currentTurn + 1}/{TURNS_PER_ROUND}</p>
          </div>
          <div className="flex items-center gap-2">
            {streak >= 2 && <span className="text-base font-black text-orange-400 animate-pulse">🔥{streak}</span>}
            <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
              <span className="text-sm font-black text-yellow-400">{totalScore}점</span>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-14 px-4 max-w-md mx-auto">
        {/* Turn progress */}
        <section className="mt-2 flex gap-2">
          {Array.from({ length: TURNS_PER_ROUND }).map((_, i) => (
            <div key={i} className={cn('h-2.5 flex-1 rounded-full transition-all duration-300',
              i < currentTurn ? 'bg-indigo-500' : i === currentTurn ? (isDeciding ? 'bg-yellow-400 animate-pulse' : 'bg-indigo-400') : 'bg-[#1a1a1a]',
            )} />
          ))}
        </section>

        {/* Chart */}
        <section className="mt-3 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-48 p-1"><LineChart candles={scenario.candles} visibleCount={visibleCount} buyTurns={buyIndices} sellTurns={sellIndices} /></div>
        </section>

        {/* ── Portfolio Card (emphasized) ── */}
        <section className="mt-3">
          <div className={cn('rounded-2xl px-4 py-3 border grid grid-cols-3 gap-2',
            pnl > 0 ? 'bg-green-500/8 border-green-500/20' :
            pnl < 0 ? 'bg-red-500/8 border-red-500/20' : 'bg-[#111] border-white/5',
          )}>
            {/* Stock count */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-[10px] text-gray-500 font-bold">보유 주식</p>
              </div>
              <p className="text-2xl font-black text-white leading-none">{displayShares}<span className="text-sm text-gray-500">주</span></p>
              {netPosition !== 0 && (
                <p className={cn('text-xs font-bold', netPosition > 0 ? 'text-green-400' : 'text-red-400')}>
                  {netPosition > 0 ? `+${netPosition}` : netPosition}주
                </p>
              )}
            </div>
            {/* Current price */}
            <div className="text-center border-x border-white/5">
              <p className="text-[10px] text-gray-500 font-bold mb-0.5">현재가</p>
              <p className="text-base font-black text-white">{(currentPrice / 1000).toFixed(1)}<span className="text-xs text-gray-500">K</span></p>
            </div>
            {/* P&L */}
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold mb-0.5">💰 손익</p>
              {trades.length > 0 ? (
                <>
                  <p className={cn('text-lg font-black leading-none', pnlColor)}>
                    {pnl >= 0 ? '+' : ''}{Math.round(pnl / 1000)}K
                  </p>
                  <p className={cn('text-[10px] font-bold', pnlColor)}>{fmtPnl(pnl)}</p>
                </>
              ) : (
                <p className="text-lg font-black text-gray-700 leading-none">—</p>
              )}
            </div>
          </div>
        </section>

        {/* Hint */}
        <section className="mt-2">
          <div className="bg-[#111] rounded-xl px-3 py-2 border border-yellow-500/20 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p className="text-xs text-yellow-200/70 font-medium leading-snug">{scenario.hint}</p>
          </div>
        </section>

        {/* In-game turn history */}
        <InGameHistory history={turnHistory} />
      </main>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-6 px-4">
        <div className="max-w-md mx-auto space-y-2.5">
          {/* Timer bar */}
          {isDeciding && (
            <div className="flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div className="flex-1 h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-1000',
                  timerPct > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                  timerPct > 25 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-red-600 animate-pulse',
                )} style={{ width: `${timerPct}%` }} />
              </div>
              <span className={cn('text-2xl font-black w-8 text-right tabular-nums', timer > 3 ? 'text-yellow-400' : 'text-red-500 animate-pulse')}>{timer}</span>
            </div>
          )}

          {isRevealing && <p className="text-center text-base text-gray-500 animate-pulse py-1">📈 차트 그리는 중...</p>}
          {isClosing && <p className="text-center text-base text-purple-400 animate-pulse py-1">⚡ 결과 집계 중...</p>}

          {/* Action buttons */}
          {isDeciding && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDecision('buy')}
                disabled={!canBuy}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-[72px] rounded-2xl border-2 transition-all active:scale-95 select-none',
                  canBuy
                    ? 'bg-green-500/15 border-green-500/50 hover:bg-green-500/25 active:bg-green-500/35'
                    : 'bg-[#111] border-white/5 opacity-25 cursor-not-allowed',
                )}
              >
                <ShoppingCart className="w-7 h-7 text-green-400" />
                <span className="text-base font-black text-green-400">매수</span>
                <span className="text-[10px] text-green-600 font-bold leading-none">+1주 사기</span>
              </button>

              <button
                onClick={() => handleDecision('skip')}
                className="flex flex-col items-center justify-center gap-1 h-[72px] rounded-2xl border-2 bg-[#111] border-white/10 hover:bg-white/5 active:bg-white/10 transition-all active:scale-95 select-none"
              >
                <Eye className="w-7 h-7 text-gray-400" />
                <span className="text-base font-black text-gray-300">관망</span>
                <span className="text-[10px] text-gray-600 font-bold leading-none">기다리기</span>
              </button>

              <button
                onClick={() => handleDecision('sell')}
                disabled={!canSell}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-[72px] rounded-2xl border-2 transition-all active:scale-95 select-none',
                  canSell
                    ? 'bg-red-500/15 border-red-500/50 hover:bg-red-500/25 active:bg-red-500/35'
                    : 'bg-[#111] border-white/5 opacity-25 cursor-not-allowed',
                )}
              >
                <BadgeDollarSign className="w-7 h-7 text-red-400" />
                <span className="text-base font-black text-red-400">매도</span>
                <span className="text-[10px] text-red-600 font-bold leading-none">-1주 팔기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
