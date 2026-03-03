'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CHART_PATTERNS, type ChartPattern } from '@/data/chart-patterns';
import {
  getScenarioForRound,
  getBasicScenarioForRound,
  calculateRoundScore,
  calculateBasicRoundScore,
  getFinalResult,
  getTurnFeedback,
  TOTAL_ROUNDS,
  TURNS_PER_ROUND,
  BASIC_TURNS_PER_ROUND,
  CANDLES_PER_TURN,
  INITIAL_REVEAL,
  INITIAL_CASH,
  DECISION_TIMERS,
  BASIC_DECISION_TIMERS,
  BASIC_STRATEGIES,
  type PatternScenario,
  type Candle,
  type RoundScore,
  type TradeLog,
  type TurnFeedback,
  type TurnEval,
  type BasicStrategy,
} from '@/data/pattern-practice';
import { cn } from '@/lib/utils';
import {
  TrendingDown, RotateCcw, ChevronRight, ChevronDown, Star, Play,
  Trophy, Flame, X,
  Package, Brain, Waves,
} from 'lucide-react';
import { GameActionBar, RatioModal } from '@/components/game-play-ui';
import { TradeHistoryCard } from '@/app/learn/scenarios/[id]/play/components/TradeHistoryCard';


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
  const W = 400; const H = 260; const MR = 68; const ML = 8; const MT = 20; const MB = 20;
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
          <text x={ML + drawW + 10} y={pToY(p) + 4} fill="#555" fontSize="9" fontFamily="sans-serif">{Math.round(p).toLocaleString('ko-KR')}</text>
        </g>
      ))}
      <polygon points={areaPoints} fill={`url(#${trendUp ? 'aU' : 'aD'})`}/>
      <polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={iToX(visible.length - 1)} cy={pToY(last.close)} r="6" fill={lineColor} stroke="#0a0a0a" strokeWidth="2.5" filter="url(#dg)"/>
      {buyTurns?.map(idx => idx < visibleCount ? (
        <g key={`b${idx}`}>
          <circle cx={iToX(idx)} cy={pToY(candles[idx].close) - 16} r="10" fill="#22c55e" stroke="#0a0a0a" strokeWidth="2" filter="url(#glow)"/>
          <text x={iToX(idx)} y={pToY(candles[idx].close) - 12} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">B</text>
        </g>
      ) : null)}
      {sellTurns?.map(idx => idx < visibleCount ? (
        <g key={`s${idx}`}>
          <circle cx={iToX(idx)} cy={pToY(candles[idx].close) - 16} r="10" fill="#ef4444" stroke="#0a0a0a" strokeWidth="2" filter="url(#glow)"/>
          <text x={iToX(idx)} y={pToY(candles[idx].close) - 12} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">S</text>
        </g>
      ) : null)}
      <rect x={ML + drawW + 2} y={pToY(last.close) - 12} width={64} height={24} fill={lastUp ? '#22c55e' : '#ef4444'} rx="6" filter="url(#glow)"/>
      <text x={ML + drawW + 34} y={pToY(last.close) + 4} fill="white" fontSize="9.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
        {Math.round(last.close).toLocaleString('ko-KR')}
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
  shares: number;    // 거래 주수
  amount: number;    // 거래 금액
  sharesHeld: number; // 거래 후 보유 주수
  profit?: number;   // 매도 시 실현 손익
}

function InGameHistory({ history }: { history: TurnHistoryEntry[] }) {
  if (history.length === 0) return null;
  return (
    <div className="mt-3 rounded-2xl bg-[#111] border border-white/5 overflow-hidden">
      {/* 헤더 */}
      <div className="px-3 py-2.5 border-b border-white/5 flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Waves className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs font-bold text-white">내 투자 기록</p>
        <span className="text-[10px] text-gray-600 ml-auto">{history.length}턴</span>
      </div>
      <div className="divide-y divide-white/5">
        {history.map((h, i) => {
          const isBuy = h.action === 'buy';
          const isSell = h.action === 'sell';
          const isHold = !isBuy && !isSell;
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5">
              {/* 턴 번호 */}
              <span className="text-[11px] font-black text-gray-600 w-6 shrink-0 tabular-nums">
                {h.turn + 1}
              </span>
              {/* 액션 배지 */}
              <div className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0',
                isBuy  ? 'bg-red-500/15 text-red-400' :
                isSell ? 'bg-blue-500/15 text-blue-400' :
                'bg-gray-700/30 text-gray-500',
              )}>
                {isBuy ? '살래' : isSell ? '팔래' : '관망'}
              </div>
              {/* 수량 */}
              {!isHold && h.shares > 0 ? (
                <span className="text-sm font-bold text-white shrink-0">{h.shares}주</span>
              ) : (
                <span className="text-xs text-gray-600 shrink-0">—</span>
              )}
              {/* 금액 */}
              {!isHold && h.amount > 0 && (
                <span className="text-[10px] text-gray-500 shrink-0">
                  {h.amount.toLocaleString('ko-KR')}원
                </span>
              )}
              {/* 우측: 실현 손익 or 보유 주수 */}
              <div className="flex-1 flex justify-end items-center gap-2">
                {h.profit !== undefined ? (
                  <span className={cn('text-xs font-black shrink-0', h.profit >= 0 ? 'text-red-400' : 'text-blue-400')}>
                    {h.profit >= 0 ? '+' : ''}{h.profit.toLocaleString('ko-KR')}원
                  </span>
                ) : null}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Package className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-500">{h.sharesHeld}주</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Round Result Trade History — 공통 TradeHistoryCard 사용
// ═══════════════════════════════════════════════════════════
function TradeHistoryList({ trades, turnEvals, scenario, aiResults, initTotal, userRate }: {
  trades: TradeLog[];
  turnEvals?: TurnEval[];
  scenario?: import('@/data/pattern-practice').PatternScenario;
  aiResults?: import('@/app/learn/scenarios/[id]/play/components/TradeHistoryCard').AIResult[];
  initTotal?: number;
  userRate?: number;
}) {
  if (trades.length === 0) {
    return (
      <div className="px-4 py-3 text-center">
        <p className="text-gray-500 text-sm">이번 라운드에 거래가 없었어요</p>
      </div>
    );
  }

  // 전체 8턴 (거래 없는 관망 턴 포함)
  const allTurns = Array.from({ length: TURNS_PER_ROUND }, (_, i) => i);

  return (
    <div className="px-3 py-3 space-y-2">
      {allTurns.map((turnIdx) => {
        const t = trades.find(tr => tr.turn === turnIdx);
        const ev = turnEvals?.find(e => e.turn === turnIdx);
        const candles = scenario?.candles ?? [];
        const currentCandleIdx = INITIAL_REVEAL + (turnIdx + 1) * CANDLES_PER_TURN - 1;
        const nextCandleIdx = currentCandleIdx + CANDLES_PER_TURN;
        const currentClose = candles[Math.min(currentCandleIdx, candles.length - 1)]?.close ?? 0;
        const nextClose = candles[Math.min(nextCandleIdx, candles.length - 1)]?.close ?? 0;
        const nextTurnChange = currentClose > 0 ? ((nextClose - currentClose) / currentClose) * 100 : undefined;
        const turnPrice = candles[Math.min(currentCandleIdx, candles.length - 1)]?.close ?? 0;

        return (
          <TradeHistoryCard
            key={turnIdx}
            mode="pattern"
            index={turnIdx}
            trade={{
              turn: turnIdx,
              action: t?.action ?? 'skip',
              shares: t?.shares ?? 0,
              price: t?.price ?? turnPrice,
              amount: t?.amount ?? 0,
              turnPnl: ev?.turnPnl,
              score: ev?.score,
              verdict: ev?.verdict,
            }}
            nextTurnChange={nextTurnChange !== undefined && nextCandleIdx < candles.length ? nextTurnChange : undefined}
            showScore={!!ev}
            aiResults={aiResults}
            initTotal={initTotal}
            userRate={userRate}
            currentPrice={turnPrice}
          />
        );
      })}
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
// Turn Score List (8턴 개별 평가)
// ═══════════════════════════════════════════════════════════
function TurnScoreList({ turnEvals }: { turnEvals: TurnEval[] }) {
  const total = turnEvals.reduce((s, e) => s + e.score, 0);
  const correctCount = turnEvals.filter(e => e.correct).length;

  return (
    <div className="bg-gradient-to-b from-[#0d0d1a] to-[#111] rounded-2xl border border-indigo-500/20 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-indigo-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-black text-indigo-300">AI 턴별 채점 리포트</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{correctCount}/{turnEvals.length} 정답</span>
          <span className="text-sm font-black text-yellow-400 tabular-nums">{total.toFixed(1)}<span className="text-gray-600 text-xs">/20</span></span>
        </div>
      </div>

      {/* 8턴 리스트 */}
      <div className="divide-y divide-white/5">
        {turnEvals.map((ev) => {
          const pct = (ev.score / 2.5) * 100;
          const barColor = ev.score >= 2.0 ? 'bg-green-500' : ev.score >= 1.0 ? 'bg-yellow-500' : 'bg-red-500';
          const actionLabel = ev.action === 'buy' ? '매수' : ev.action === 'sell' ? '매도' : ev.action === 'timeout' ? '시간초과' : '관망';
          const actionColor = ev.action === 'buy' ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : ev.action === 'sell' ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : ev.action === 'timeout' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            : 'bg-white/5 text-gray-500 border-white/10';
          return (
            <div key={ev.turn} className="px-4 py-3">
              <div className="flex items-center gap-3 mb-1.5">
                {/* 턴 번호 */}
                <span className="text-xs font-black text-gray-600 w-8 shrink-0">T{ev.turn + 1}</span>
                {/* 행동 배지 */}
                <span className={cn('text-[11px] font-black px-2 py-0.5 rounded-md border shrink-0', actionColor)}>
                  {actionLabel}
                </span>
                {/* 가격 + 손익 */}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-gray-500">{ev.price.toLocaleString('ko-KR')}원</span>
                  {(ev.action === 'buy' || ev.action === 'sell') && (
                    <span className={cn('text-[11px] font-bold ml-2', ev.turnPnl > 0 ? 'text-green-400' : ev.turnPnl < 0 ? 'text-red-400' : 'text-gray-500')}>
                      {ev.turnPnl > 0 ? '+' : ''}{ev.turnPnl.toLocaleString('ko-KR')}원
                    </span>
                  )}
                </div>
                {/* 점수 */}
                <span className={cn('text-sm font-black tabular-nums shrink-0',
                  ev.score >= 2.0 ? 'text-green-400' : ev.score >= 1.0 ? 'text-yellow-400' : 'text-red-400',
                )}>{ev.score.toFixed(1)}<span className="text-gray-600 text-[10px]">/2.5</span></span>
              </div>
              {/* 점수 바 */}
              <div className="flex items-center gap-2">
                <div className="w-8 shrink-0" />
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight flex-1">{ev.verdict}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 */}
      <div className="px-4 py-3 border-t border-indigo-500/15 bg-[#0a0a15]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">턴당 평균</span>
          <span className="text-sm font-black text-indigo-300">{(total / turnEvals.length).toFixed(2)}<span className="text-gray-600 text-xs">/2.5</span></span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
type GamePhase = 'intro' | 'countdown' | 'revealing' | 'deciding' | 'feedback' | 'closing' | 'round-result' | 'final-result';
interface RoundData {
  score: RoundScore;
  trades: TradeLog[];
  finalCash: number;
  finalShares: number;
  finalAvgCost: number;  // 최종 보유 주식 평균 단가
  startingShares: number;
  scenario: PatternScenario;
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
export default function PatternPracticePage() {
  const params = useParams();
  const router = useRouter();

  const [pattern, setPattern] = useState<ChartPattern | null>(null);
  const [basicStrategy, setBasicStrategy] = useState<BasicStrategy | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundData[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [chartOpen, setChartOpen] = useState(true);

  const [scenario, setScenario] = useState<PatternScenario | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [cashRemaining, setCashRemaining] = useState(INITIAL_CASH);
  const [sharesHeld, setSharesHeld] = useState(0);
  const [avgCostBasis, setAvgCostBasis] = useState(0);
  const [startingShares, setStartingShares] = useState(0);
  const [timer, setTimer] = useState(12);
  const [countdownVal, setCountdownVal] = useState(3);
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null);
  const [turnHistory, setTurnHistory] = useState<TurnHistoryEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<'buy' | 'sell' | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTurnRef = useRef(-1);
  const decidedThisTurnRef = useRef(false);

  // 기본 전략 여부 및 턴 수 결정
  const isBasicStrategy = basicStrategy !== null;
  const turnsPerRound = isBasicStrategy ? BASIC_TURNS_PER_ROUND : TURNS_PER_ROUND;
  const decisionTimers = isBasicStrategy ? BASIC_DECISION_TIMERS : DECISION_TIMERS;

  const confirmExit = useCallback(() => {
    if (revealRef.current) clearTimeout(revealRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    router.push('/learn?tab=patterns');
  }, [router]);

  useEffect(() => {
    const id = params.id as string;
    const foundBasic = BASIC_STRATEGIES.find(s => s.id === id);
    if (foundBasic) {
      setBasicStrategy(foundBasic);
    } else {
      setPattern(CHART_PATTERNS.find(p => p.id === id) ?? null);
    }
  }, [params.id]);

  useEffect(() => () => {
    if (revealRef.current) clearTimeout(revealRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const totalCandles = scenario?.candles.length ?? 0;
  const currentPrice = scenario && visibleCount > 0 ? scenario.candles[visibleCount - 1].close : 0;
  const targetVisible = INITIAL_REVEAL + (currentTurn + 1) * CANDLES_PER_TURN;
  const totalRounds = isBasicStrategy ? basicStrategy!.scenarios.length : TOTAL_ROUNDS;

  // 총 포트폴리오 가치 및 손익
  const totalValue = cashRemaining + sharesHeld * currentPrice;
  const pnl = totalValue - INITIAL_CASH;

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
      const secs = decisionTimers[currentRound] ?? 15;
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
    if (timer <= 0) {
      if (currentTurn >= turnsPerRound - 1) {
        setTimerExpired(true);
        return;
      }
      handleDecision('skip', 0, true);
      return;
    }
    timerRef.current = setInterval(() => setTimer(v => v - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, timer]);

  // ── Feedback auto-dismiss ───────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'feedback') return;
    const capturedTurn = feedbackTurnRef.current;
    const t = setTimeout(() => {
      setPendingAction(null);
      if (capturedTurn >= turnsPerRound - 1) {
        setGamePhase('closing');
      } else {
        decidedThisTurnRef.current = false;
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
    const s = isBasicStrategy
      ? getBasicScenarioForRound(basicStrategy!.id, round)
      : getScenarioForRound(pattern?.id ?? '', round);
    if (!s) return;

    const initialPrice = s.candles[INITIAL_REVEAL - 1]?.close ?? s.candles[0].close;
    const initShares = Math.floor(INITIAL_CASH * 0.5 / initialPrice);
    const initCash = INITIAL_CASH - initShares * initialPrice;

    setScenario(s);
    setVisibleCount(INITIAL_REVEAL);
    setTrades([]);
    setCashRemaining(initCash);
    setSharesHeld(initShares);
    setAvgCostBasis(initialPrice);
    setStartingShares(initShares);
    setCurrentTurn(0);
    setFeedback(null);
    setTurnHistory([]);
    setTimer(decisionTimers[round] ?? 15);
    setTimerExpired(false);
    setChartOpen(true);
    setPendingAction(null);
    feedbackTurnRef.current = -1;
    decidedThisTurnRef.current = false;
    setGamePhase('countdown');
    setCountdownVal(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); setGamePhase('revealing'); }
      else setCountdownVal(c);
    }, 600);
  }, [pattern, basicStrategy, isBasicStrategy, decisionTimers]);

  // ── Handle decision ─────────────────────────────────────
  const handleDecision = useCallback((action: 'buy' | 'sell' | 'skip', pct = 0, isTimeout = false) => {
    if (decidedThisTurnRef.current) return;
    decidedThisTurnRef.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimerExpired(false);
    if (!scenario) return;
    const price = currentPrice;

    let tradeShares = 0;
    let tradeAmount = 0;
    let newSharesHeld = sharesHeld;
    let newCash = cashRemaining;
    let newAvgCost = avgCostBasis;
    let realizedProfit: number | undefined;

    if (action === 'buy' && pct > 0) {
      tradeShares = Math.floor(cashRemaining * pct / price);
      if (tradeShares <= 0) { decidedThisTurnRef.current = false; return; }
      tradeAmount = tradeShares * price;
      newCash = cashRemaining - tradeAmount;
      // 평균 매수가 업데이트
      newAvgCost = sharesHeld > 0
        ? (avgCostBasis * sharesHeld + price * tradeShares) / (sharesHeld + tradeShares)
        : price;
      newSharesHeld = sharesHeld + tradeShares;
      setTrades(prev => [...prev, { action: 'buy', price, turn: currentTurn, shares: tradeShares, amount: tradeAmount, pct }]);
      setCashRemaining(newCash);
      setSharesHeld(newSharesHeld);
      setAvgCostBasis(newAvgCost);

    } else if (action === 'sell' && pct > 0) {
      tradeShares = Math.max(1, Math.floor(sharesHeld * pct));
      if (tradeShares <= 0 || sharesHeld <= 0) { decidedThisTurnRef.current = false; return; }
      tradeAmount = tradeShares * price;
      realizedProfit = (price - avgCostBasis) * tradeShares;
      newCash = cashRemaining + tradeAmount;
      newSharesHeld = sharesHeld - tradeShares;
      newAvgCost = newSharesHeld <= 0 ? 0 : avgCostBasis; // 매도해도 평균 단가 유지
      setTrades(prev => [...prev, { action: 'sell', price, turn: currentTurn, shares: tradeShares, amount: tradeAmount, pct }]);
      setCashRemaining(newCash);
      setSharesHeld(newSharesHeld);
      setAvgCostBasis(newAvgCost);
    }

    // in-game 기록 추가
    setTurnHistory(prev => [...prev, {
      turn: currentTurn,
      action: isTimeout ? 'timeout' : action,
      price,
      shares: tradeShares,
      amount: tradeAmount,
      sharesHeld: newSharesHeld,
      profit: action === 'sell' ? realizedProfit : undefined,
    }]);

    const fb = getTurnFeedback({
      action,
      candleIndex: visibleCount - 1,
      scenario,
      sharesHeld: sharesHeld,  // 거래 전 보유 수량으로 판단
      isTimeout,
    });
    setPendingAction(null);
    setFeedback(fb);
    feedbackTurnRef.current = currentTurn;
    setGamePhase('feedback');
  }, [currentPrice, currentTurn, scenario, visibleCount, sharesHeld, cashRemaining, avgCostBasis]);

  // ── End round ───────────────────────────────────────────
  const endRound = useCallback(() => {
    if (!scenario) return;
    const finalPrice = scenario.candles[totalCandles - 1].close;
    const score = isBasicStrategy
      ? calculateBasicRoundScore(trades, cashRemaining, sharesHeld, finalPrice, scenario, startingShares)
      : calculateRoundScore(trades, cashRemaining, sharesHeld, finalPrice, scenario, startingShares);
    setRoundResults(prev => [...prev, { score, trades, finalCash: cashRemaining, finalShares: sharesHeld, finalAvgCost: avgCostBasis, startingShares, scenario }]);
    setTotalScore(prev => prev + score.total);
    setStreak(prev => score.total >= 8 ? prev + 1 : 0);
    setVisibleCount(totalCandles);
    setGamePhase('round-result');
  }, [scenario, totalCandles, trades, cashRemaining, sharesHeld, startingShares]);

  const handleNextRound = () => {
    const n = currentRound + 1;
    if (n >= totalRounds) setGamePhase('final-result');
    else { setCurrentRound(n); startRound(n); }
  };
  const handleRetry = () => {
    setCurrentRound(0); setRoundResults([]); setTotalScore(0); setStreak(0);
    setGamePhase('intro');
  };

  if (!pattern && !basicStrategy) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-pulse text-6xl">📊</div></div>;

  // 공통 표시 정보
  const displayEmoji = basicStrategy?.emoji ?? pattern?.emoji ?? '📊';
  const displayName = basicStrategy?.name ?? pattern?.name ?? '';
  const displayNameEn = basicStrategy?.nameEn ?? pattern?.nameEn ?? '';
  const introGradient = isBasicStrategy
    ? 'from-emerald-500 to-teal-600'
    : 'from-indigo-500 to-purple-600';

  // ═══════════════ INTRO ═══════════════════════
  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-black pb-32">
        <div className="pt-12 px-5 max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-gray-500 text-sm mb-4">← 뒤로</button>
          <section className="text-center mt-2">
            <div className="text-8xl mb-4 animate-bounce">{displayEmoji}</div>
            <h1 className="text-3xl font-black text-white tracking-tight">{displayName}</h1>
            <p className="text-base text-gray-500 mt-1">{displayNameEn}</p>
            <div className={cn('mt-4 inline-flex items-center gap-2 bg-gradient-to-r px-5 py-2 rounded-full border', isBasicStrategy ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40' : 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40')}>
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-lg font-black text-white">{totalRounds}라운드 · {turnsPerRound}턴</span>
            </div>
          </section>
          <section className="mt-8 space-y-3">
            {[
              { emoji: '💰', text: `${(INITIAL_CASH / 10000).toFixed(0)}만원으로 시작 (현금 50% + 주식 50%)`, color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30' },
              { emoji: '📈', text: '선 그래프가 자동으로 그려져요', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
              { emoji: '🎯', text: `${turnsPerRound}턴 동안 % 단위로 사거나 팔거나 기다려요`, color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
              { emoji: '⏱️', text: '조금(25%) / 반반(50%) / 많이(75%) / 전부(100%)', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' },
              { emoji: '🏆', text: '끝나면 수익 + 올바른 판단에 따라 점수 매겨요!', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
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
            <Button onClick={() => { setCurrentRound(0); startRound(0); }} className={cn('w-full h-16 rounded-2xl font-black text-xl text-white bg-gradient-to-r hover:opacity-90 shadow-lg', introGradient)}>
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
        <p className="text-lg text-gray-500 mb-4 font-bold">라운드 {currentRound + 1} / {totalRounds}</p>
        <div className="relative">
          <div className="text-[140px] font-black text-white leading-none">{countdownVal}</div>
          <div className={cn('absolute inset-0 blur-[60px] rounded-full -z-10', isBasicStrategy ? 'bg-emerald-500/30' : 'bg-indigo-500/30')} />
        </div>
        <p className={cn('text-base mt-6 font-bold', isBasicStrategy ? 'text-emerald-400' : 'text-indigo-400')}>⏱️ 턴당 {decisionTimers[currentRound] ?? 15}초 · 💰 {(INITIAL_CASH / 10000).toFixed(0)}만원 시작!</p>
      </div>
    );
  }

  // ═══════════════ ROUND RESULT ═══════════════════
  if (gamePhase === 'round-result') {
    const rd = roundResults[roundResults.length - 1];
    if (!rd || !scenario) return null;
    const s = rd.score;
    const rdFinalPrice = rd.scenario.candles[rd.scenario.candles.length - 1].close;
    const rdFinalValue = rd.finalCash + rd.finalShares * rdFinalPrice;
    // 평가 손익 (보유 주식 평균 단가 대비)
    const unrealizedPnl = rd.finalAvgCost > 0 ? (rdFinalPrice - rd.finalAvgCost) * rd.finalShares : 0;
    const unrealizedPct = rd.finalAvgCost > 0 ? ((rdFinalPrice - rd.finalAvgCost) / rd.finalAvgCost) * 100 : 0;
    // 실현 손익 = 총 손익 - 평가 손익
    const realizedPnl = s.userPnl - unrealizedPnl;
    // 원금 대비 수익률
    const totalReturnPct = (s.userPnl / INITIAL_CASH) * 100;
    // 패턴 기반 가상 AI 비교 데이터
    const rdOptimalReturnPct = (s.optimalPnl / INITIAL_CASH) * 100;
    const rdPatternAIResults = [
      {
        name: '공격왕 박영희',
        emoji: '⚡',
        type: '공격형',
        returnRate: `${rdOptimalReturnPct >= 0 ? '+' : ''}${rdOptimalReturnPct.toFixed(1)}%`,
        returnNum: rdOptimalReturnPct,
        actions: [],
      },
      {
        name: '안정왕 김철수',
        emoji: '🛡️',
        type: '안정형',
        returnRate: `${(rdOptimalReturnPct * 0.6) >= 0 ? '+' : ''}${(rdOptimalReturnPct * 0.6).toFixed(1)}%`,
        returnNum: rdOptimalReturnPct * 0.6,
        actions: [],
      },
    ];
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

          {/* ── 손익 요약 ── */}
          <section className="mt-4 space-y-2">

            {/* 총 손익 (메인) */}
            <div className={cn('rounded-2xl px-5 py-4 border', s.userPnl >= 0 ? 'bg-green-500/12 border-green-500/30' : 'bg-red-500/12 border-red-500/30')}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-400">💰 총 손익 (원금 대비)</p>
                  <p className={cn('text-3xl font-black mt-0.5', s.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {fmtPnl(s.userPnl)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">최종 자산</p>
                  <p className="text-base font-black text-white">{rdFinalValue.toLocaleString('ko-KR')}원</p>
                  <p className={cn('text-sm font-black mt-0.5', s.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
                  </p>
                </div>
              </div>
              {/* 실현 손익 vs 평가 손익 분리 */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <div className="bg-black/30 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-gray-500 font-bold mb-1">✅ 실현 손익</p>
                  <p className="text-[10px] text-gray-600 mb-1">매도 완료된 수익</p>
                  <p className={cn('text-base font-black', realizedPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {fmtPnl(realizedPnl)}
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-gray-500 font-bold mb-1">📊 평가 손익</p>
                  <p className="text-[10px] text-gray-600 mb-1">보유 주식 현재 평가</p>
                  {rd.finalShares > 0 ? (
                    <p className={cn('text-base font-black', unrealizedPnl >= 0 ? 'text-blue-400' : 'text-red-400')}>
                      {fmtPnl(unrealizedPnl)}
                    </p>
                  ) : (
                    <p className="text-base font-black text-gray-600">보유 없음</p>
                  )}
                </div>
              </div>
            </div>

            {/* 보유 주식 상세 (있을 때만) */}
            {rd.finalShares > 0 && (
              <div className="bg-[#111] rounded-2xl border border-indigo-500/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-black text-indigo-300">보유 주식</span>
                  <span className="text-sm font-black text-white ml-auto">{rd.finalShares}주</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/5 text-center">
                  <div className="py-3 px-2">
                    <p className="text-[10px] text-gray-500 mb-1">평균 단가</p>
                    <p className="text-xs font-black text-gray-300">{Math.round(rd.finalAvgCost).toLocaleString('ko-KR')}원</p>
                  </div>
                  <div className="py-3 px-2">
                    <p className="text-[10px] text-gray-500 mb-1">종가</p>
                    <p className="text-xs font-black text-white">{rdFinalPrice.toLocaleString('ko-KR')}원</p>
                  </div>
                  <div className="py-3 px-2">
                    <p className="text-[10px] text-gray-500 mb-1">평가 손익</p>
                    <p className={cn('text-xs font-black', unrealizedPnl >= 0 ? 'text-blue-400' : 'text-red-400')}>
                      {unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(1)}%
                    </p>
                    <p className={cn('text-[9px] font-bold', unrealizedPnl >= 0 ? 'text-blue-500' : 'text-red-500')}>
                      {fmtPnl(unrealizedPnl)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 현금 잔고 + 최적 매매 수익 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#111] rounded-2xl px-4 py-3 border border-white/10">
                <p className="text-[10px] text-gray-500 font-bold mb-1">💵 현금 잔고</p>
                <p className="text-sm font-black text-white">{rd.finalCash.toLocaleString('ko-KR')}원</p>
              </div>
              <div className="bg-[#111] rounded-2xl px-4 py-3 border border-yellow-500/20">
                <p className="text-[10px] text-yellow-600 font-bold mb-1">🎯 완벽 전략 수익</p>
                <p className="text-sm font-black text-yellow-400">{fmtPnl(s.optimalPnl)}</p>
                <p className="text-[9px] text-gray-600">최적 타이밍 매매 시</p>
              </div>
            </div>
          </section>

          {/* ── 차트 + 거래 기록 (펼치기/닫기) ── */}
          <section className="mt-3 bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setChartOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Waves className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-black text-white">{rd.trades.length}턴 파도 분석</span>
                <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">탭하여 AI 갭 비교</span>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-gray-500 transition-transform duration-300', chartOpen ? 'rotate-180' : '')} />
            </button>
            {chartOpen && (
              <>
                <div className="h-56 px-2 pb-2">
                  <LineChart candles={scenario.candles} visibleCount={totalCandles} buyTurns={buyIndices} sellTurns={sellIndices} />
                </div>
                <div className="border-t border-white/5">
                  <TradeHistoryList
                    trades={rd.trades}
                    turnEvals={rd.score.turnEvals}
                    scenario={rd.scenario}
                    aiResults={rdPatternAIResults}
                    initTotal={INITIAL_CASH}
                    userRate={totalReturnPct}
                  />
                </div>
              </>
            )}
          </section>

          {/* Cumulative score */}
          <section className="mt-3 bg-[#111] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <span className="text-base text-gray-400 font-bold">누적 점수</span>
            <span className="text-2xl font-black text-yellow-400">{totalScore} <span className="text-sm text-gray-600">/ {totalRounds * 20}</span></span>
          </section>
        </main>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" onClick={() => setShowExitDialog(true)} className="h-16 w-16 rounded-2xl bg-[#111] border-white/10 text-white font-bold hover:bg-[#1a1a1a] shrink-0">
              <X className="w-5 h-5" />
            </Button>
            <Button onClick={handleNextRound} className={cn('flex-1 h-16 rounded-2xl font-black text-xl text-white bg-gradient-to-r hover:opacity-90 shadow-lg', introGradient)}>
              {currentRound + 1 < totalRounds ? <>다음 라운드 <ChevronRight className="w-6 h-6 ml-1" /></> : <><Trophy className="w-6 h-6 mr-2" /> 최종 결과</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ FINAL RESULT ═══════════════════
  if (gamePhase === 'final-result') {
    const result = getFinalResult(totalScore);
    const avgTurnScore = roundResults.length > 0
      ? roundResults.reduce((s, r) => s + r.score.total, 0) / roundResults.length
      : 0;
    return (
      <div className="min-h-screen bg-black pb-36">
        <main className="pt-8 px-5 max-w-md mx-auto">
          <section className="text-center mt-4">
            <div className="text-[100px] leading-none mb-4">{result.emoji}</div>
            <h2 className="text-3xl font-black text-white">{result.title}</h2>
            <p className="text-lg text-gray-400 mt-2">{result.sub}</p>
          </section>
          <section className="mt-6"><StarRating stars={result.stars} /></section>

          {/* 총점 */}
          <section className="mt-6 bg-[#111] rounded-3xl p-6 border border-white/5 text-center">
            <p className="text-sm text-gray-500">최종 점수</p>
            <p className="text-6xl font-black text-white mt-1">{totalScore}<span className="text-xl text-gray-600">/{totalRounds * 20}</span></p>
            <p className="text-sm text-gray-500 mt-2">라운드 평균 {avgTurnScore.toFixed(1)}/20점</p>
          </section>

          {/* 라운드별 요약 + 턴별 채점 */}
          <section className="mt-5 space-y-5">
            <h3 className="text-sm font-bold text-gray-400">라운드별 AI 채점 리포트</h3>
            {roundResults.map((rd, i) => {
              const rdBuyIdx = rd.trades.filter(t => t.action === 'buy').map(t =>
                Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, rd.scenario.candles.length - 1));
              const rdSellIdx = rd.trades.filter(t => t.action === 'sell').map(t =>
                Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, rd.scenario.candles.length - 1));
              const rdFp = rd.scenario.candles[rd.scenario.candles.length - 1].close;
              const rdUnrealized = rd.finalAvgCost > 0 ? (rdFp - rd.finalAvgCost) * rd.finalShares : 0;
              const rdRealized = rd.score.userPnl - rdUnrealized;
              const rdReturnPct = (rd.score.userPnl / INITIAL_CASH) * 100;
              return (
              <div key={i} className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                {/* 라운드 헤더 */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-black text-gray-400">{i + 1}</div>
                    <span className="text-xl">{rd.score.emoji}</span>
                    <span className={cn('text-sm font-black px-2 py-0.5 rounded-lg',
                      rd.score.grade === 'S' ? 'bg-yellow-500/20 text-yellow-300' : rd.score.grade === 'A' ? 'bg-green-500/20 text-green-300' :
                      rd.score.grade === 'B' ? 'bg-blue-500/20 text-blue-300' : rd.score.grade === 'C' ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-400',
                    )}>{rd.score.grade}</span>
                    <span className="text-base font-black text-yellow-400">{rd.score.total}점</span>
                    <span className={cn('text-sm font-black ml-auto', rd.score.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {fmtPnl(rd.score.userPnl)} ({rdReturnPct >= 0 ? '+' : ''}{rdReturnPct.toFixed(1)}%)
                    </span>
                  </div>
                  {/* 실현/평가 손익 분리 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-[#0a0a0a] rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-gray-600">✅ 실현 손익</p>
                      <p className={cn('text-xs font-black', rdRealized >= 0 ? 'text-green-400' : 'text-red-400')}>{fmtPnl(rdRealized)}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-gray-600">📊 평가 손익 ({rd.finalShares}주)</p>
                      <p className={cn('text-xs font-black', rdUnrealized >= 0 ? 'text-blue-400' : 'text-red-400')}>
                        {rd.finalShares > 0 ? fmtPnl(rdUnrealized) : '보유 없음'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* 차트 */}
                <div className="h-40 p-1">
                  <LineChart candles={rd.scenario.candles} visibleCount={rd.scenario.candles.length} buyTurns={rdBuyIdx} sellTurns={rdSellIdx} />
                </div>
                {/* 턴별 거래 기록 — 공통 TradeHistoryCard */}
                <div className="border-t border-white/5">
                  <TradeHistoryList
                    trades={rd.trades}
                    turnEvals={rd.score.turnEvals}
                    scenario={rd.scenario}
                  />
                </div>
              </div>
              );
            })}
          </section>
        </main>
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" onClick={() => router.push(`/learn/patterns/${basicStrategy?.id ?? pattern?.id}`)} className="flex-1 h-14 rounded-2xl bg-[#111] border-white/10 text-white text-base font-bold hover:bg-[#1a1a1a]">{isBasicStrategy ? '전략 복습' : '패턴 복습'}</Button>
            <Button onClick={handleRetry} className={cn('flex-[2] h-14 rounded-2xl font-black text-lg text-white bg-gradient-to-r hover:opacity-90 shadow-lg', introGradient)}>
              <RotateCcw className="w-5 h-5 mr-2" /> 다시 도전
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ PLAYING ═══════════════════════
  if (!scenario) return null;
  const decSecs = decisionTimers[currentRound] ?? 15;
  const isDeciding = gamePhase === 'deciding';
  const isFeedback = gamePhase === 'feedback';
  const isRevealing = gamePhase === 'revealing';
  const isClosing = gamePhase === 'closing';
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
            <span className="text-2xl">{displayEmoji}</span>
            <p className="text-sm font-black text-white">R{currentRound + 1} · 턴 {currentTurn + 1}/{turnsPerRound}</p>
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
          {Array.from({ length: turnsPerRound }).map((_, i) => (
            <div key={i} className={cn('h-2.5 flex-1 rounded-full transition-all duration-300',
              i < currentTurn
                ? (isBasicStrategy ? 'bg-emerald-500' : 'bg-indigo-500')
                : i === currentTurn
                  ? (isDeciding ? 'bg-yellow-400 animate-pulse' : (isBasicStrategy ? 'bg-emerald-400' : 'bg-indigo-400'))
                  : 'bg-[#1a1a1a]',
            )} />
          ))}
        </section>

        {/* Chart */}
        <section className="mt-3 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-64 p-2"><LineChart candles={scenario.candles} visibleCount={visibleCount} buyTurns={buyIndices} sellTurns={sellIndices} /></div>
        </section>

        {/* ── Portfolio Card ── */}
        <section className="mt-3">
          <div className={cn('rounded-2xl border overflow-hidden',
            pnl > 0 ? 'bg-green-500/8 border-green-500/20' :
            pnl < 0 ? 'bg-red-500/8 border-red-500/20' : 'bg-[#111] border-white/5',
          )}>
            {/* 총 자산 + 손익 */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-bold">총 자산</p>
                <p className="text-xl font-black text-white leading-tight">{totalValue.toLocaleString('ko-KR')}원</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold">손익</p>
                <p className={cn('text-xl font-black', pnlColor)}>{fmtPnl(pnl)}</p>
              </div>
            </div>
            {/* 현금 + 주식 + 현재가 */}
            <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
              <div className="px-2 py-2 text-center">
                <p className="text-[9px] text-gray-500 font-bold mb-0.5">💵 현금</p>
                <p className="text-[11px] font-black text-white">{cashRemaining.toLocaleString('ko-KR')}원</p>
              </div>
              <div className="px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <Package className="w-2.5 h-2.5 text-indigo-400" />
                  <p className="text-[9px] text-gray-500 font-bold">보유 주식</p>
                </div>
                <p className="text-4xl font-black text-white leading-none">{sharesHeld}<span className="text-base text-gray-400 font-bold">주</span></p>
                {sharesHeld > 0 && avgCostBasis > 0 && (
                  <p className="text-[9px] text-gray-600 mt-0.5">평균 {Math.round(avgCostBasis).toLocaleString('ko-KR')}원</p>
                )}
              </div>
              <div className="px-2 py-2 text-center">
                <p className="text-[9px] text-gray-500 font-bold mb-0.5">현재가</p>
                <p className="text-[11px] font-black text-white">{currentPrice.toLocaleString('ko-KR')}원</p>
              </div>
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

      {/* 하단 컨트롤 - 공통 GameActionBar + RatioModal (패턴: 15초) */}
      {(isDeciding || isRevealing || isClosing) && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center">
          <div className="w-full max-w-md">
          {isRevealing && (
            <div className="text-center py-2 bg-black/90 text-gray-500 text-sm animate-pulse">📈 차트 그리는 중...</div>
          )}
          {isClosing && (
            <div className="text-center py-2 bg-black/90 text-purple-400 text-sm animate-pulse">⚡ 결과 집계 중...</div>
          )}
          {isDeciding && timerExpired && (
            <div className="text-center py-1.5 bg-red-500/20 border-t border-red-500/30 animate-pulse">
              <p className="text-sm font-black text-red-400">⏰ 시간 초과! 선택해주세요!</p>
            </div>
          )}
          {isDeciding && (
            <>
              {/* 비율 선택 모달 - 공통 컴포넌트 */}
              <RatioModal
                mode={pendingAction}
                price={currentPrice}
                cash={cashRemaining}
                holdings={sharesHeld}
                avgPrice={avgCostBasis}
                stockName={displayName}
                hint={scenario?.hint}
                onSelect={(ratio, label) => {
                  handleDecision(pendingAction === 'buy' ? 'buy' : 'sell', ratio)
                  setPendingAction(null)
                }}
                onClose={() => setPendingAction(null)}
              />
              {/* 타이머 + 액션 버튼 - 공통 컴포넌트 (패턴: 15초) */}
              <GameActionBar
                timer={timer}
                timerSec={decSecs}
                hasFeedback={isFeedback}
                canBuy={cashRemaining >= currentPrice}
                canSell={sharesHeld > 0}
                onBuy={() => setPendingAction('buy')}
                onSell={() => setPendingAction('sell')}
                onHold={() => handleDecision('skip', 0)}
                labels={{ buy: '살래', sell: '팔래', hold: '기다릴게' }}
              />
            </>
          )}
          </div>
        </div>
      )}

    </div>
  );
}
