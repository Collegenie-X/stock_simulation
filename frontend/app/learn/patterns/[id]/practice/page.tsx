'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import {
  CHART_PATTERNS,
  PATTERN_CATEGORIES,
  type ChartPattern,
} from '@/data/chart-patterns';
import {
  getScenarioForRound,
  calculateRoundScore,
  getFinalResult,
  calcPnl,
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
} from '@/data/pattern-practice';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ChevronRight,
  Star,
  Lightbulb,
  Play,
  Target,
  Trophy,
  Flame,
  Eye,
  Timer,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// CandlestickChart
// ═══════════════════════════════════════════════════════════
function CandlestickChart({
  candles,
  visibleCount,
  buyTurns,
  sellTurns,
}: {
  candles: Candle[];
  visibleCount: number;
  buyTurns?: number[];
  sellTurns?: number[];
}) {
  const visible = candles.slice(0, visibleCount);
  if (visible.length === 0) return null;

  const W = 320;
  const H = 180;
  const MR = 52;
  const MT = 8;
  const MB = 8;
  const drawW = W - MR;
  const drawH = H - MT - MB;

  const maxP = Math.max(...visible.map(c => c.high));
  const minP = Math.min(...visible.map(c => c.low));
  const range = maxP - minP || 1;
  const pad = range * 0.08;
  const yMax = maxP + pad;
  const yMin = minP - pad;

  const spacing = Math.min(12, drawW / visible.length);
  const cw = Math.max(spacing * 0.55, 2.5);
  const pToY = (p: number) => MT + drawH * (1 - (p - yMin) / (yMax - yMin));
  const iToX = (i: number) => spacing * i + spacing / 2;

  const gridPrices = Array.from({ length: 4 }, (_, i) =>
    yMin + ((yMax - yMin) * (i + 1)) / 5,
  );
  const last = visible[visible.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect width={W} height={H} fill="#0d0d0d" rx="8" />
      {gridPrices.map((p, i) => (
        <g key={i}>
          <line x1={0} y1={pToY(p)} x2={drawW} y2={pToY(p)} stroke="#1a1a1a" strokeWidth="0.5" />
          <text x={drawW + 4} y={pToY(p) + 3} fill="#444" fontSize="7" fontFamily="monospace">
            {(p / 1000).toFixed(1)}K
          </text>
        </g>
      ))}

      {visible.map((c, i) => {
        const x = iToX(i);
        const bull = c.close >= c.open;
        const color = bull ? '#22c55e' : '#ef4444';
        const bTop = pToY(Math.max(c.open, c.close));
        const bBot = pToY(Math.min(c.open, c.close));
        const bH = Math.max(bBot - bTop, 1);
        return (
          <g key={i}>
            <line x1={x} y1={pToY(c.high)} x2={x} y2={pToY(c.low)} stroke={color} strokeWidth="1" />
            <rect x={x - cw / 2} y={bTop} width={cw} height={bH} fill={color} rx="0.5" />
          </g>
        );
      })}

      {/* Buy markers */}
      {buyTurns?.map((idx) =>
        idx < visibleCount ? (
          <g key={`b${idx}`}>
            <circle cx={iToX(idx)} cy={pToY(candles[idx].close) + 10} r="3.5" fill="#22c55e" stroke="#0d0d0d" strokeWidth="1" />
            <text x={iToX(idx)} y={pToY(candles[idx].close) + 11} fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">B</text>
          </g>
        ) : null,
      )}
      {/* Sell markers */}
      {sellTurns?.map((idx) =>
        idx < visibleCount ? (
          <g key={`s${idx}`}>
            <circle cx={iToX(idx)} cy={pToY(candles[idx].close) - 10} r="3.5" fill="#ef4444" stroke="#0d0d0d" strokeWidth="1" />
            <text x={iToX(idx)} y={pToY(candles[idx].close) - 9} fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">S</text>
          </g>
        ) : null,
      )}

      {/* Current price line */}
      <line x1={0} y1={pToY(last.close)} x2={drawW} y2={pToY(last.close)} stroke="#818cf8" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
      <rect x={drawW + 1} y={pToY(last.close) - 7} width={48} height={14} fill="#818cf8" rx="3" />
      <text x={drawW + 25} y={pToY(last.close) + 3} fill="white" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        {last.close.toLocaleString()}
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
function fmtPrice(n: number) { return n.toLocaleString('ko-KR') + '원'; }
function fmtPnl(n: number) { return `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}원`; }

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {[0, 1, 2].map(i => (
        <Star
          key={i}
          className={cn('w-9 h-9 transition-all duration-500', i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700')}
          style={{ transitionDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
type GamePhase =
  | 'intro'
  | 'countdown'
  | 'revealing'
  | 'deciding'
  | 'feedback'
  | 'closing'
  | 'round-result'
  | 'final-result';

interface FeedbackData {
  emoji: string;
  text: string;
  sub: string;
  color: string;
}

interface RoundData {
  score: RoundScore;
  trades: TradeLog[];
  netPosition: number;
}

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

  // Per-round state
  const [scenario, setScenario] = useState<PatternScenario | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [netPosition, setNetPosition] = useState(0);
  const [timer, setTimer] = useState(10);
  const [countdownVal, setCountdownVal] = useState(3);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decisionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPattern(CHART_PATTERNS.find(p => p.id === params.id) ?? null);
  }, [params.id]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (decisionTimerRef.current) clearInterval(decisionTimerRef.current);
    };
  }, []);

  const totalCandles = scenario?.candles.length ?? 0;
  const currentPrice = scenario && visibleCount > 0 ? scenario.candles[visibleCount - 1].close : 0;
  const targetVisible = INITIAL_REVEAL + (currentTurn + 1) * CANDLES_PER_TURN;

  const pnl = useMemo(() => {
    if (trades.length === 0) return 0;
    return calcPnl(trades, netPosition, currentPrice);
  }, [trades, netPosition, currentPrice]);

  const buyIndices = useMemo(() => trades.filter(t => t.action === 'buy').map(t => {
    const turnTarget = INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN;
    return Math.min(turnTarget - 1, totalCandles - 1);
  }), [trades, totalCandles]);

  const sellIndices = useMemo(() => trades.filter(t => t.action === 'sell').map(t => {
    const turnTarget = INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN;
    return Math.min(turnTarget - 1, totalCandles - 1);
  }), [trades, totalCandles]);

  // ─── Revealing candles one-by-one ──────────────────────
  useEffect(() => {
    if (gamePhase !== 'revealing' || !scenario) return;
    const target = Math.min(targetVisible, totalCandles);
    if (visibleCount >= target) {
      setGamePhase('deciding');
      const secs = DECISION_TIMERS[currentRound] ?? 8;
      setTimer(secs);
      return;
    }
    revealTimerRef.current = setTimeout(() => {
      setVisibleCount(v => v + 1);
    }, 250);
    return () => { if (revealTimerRef.current) clearTimeout(revealTimerRef.current); };
  }, [gamePhase, visibleCount, targetVisible, totalCandles, scenario, currentRound]);

  // ─── Decision timer ────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'deciding') return;
    if (timer <= 0) {
      handleDecision('skip', true);
      return;
    }
    decisionTimerRef.current = setInterval(() => {
      setTimer(v => v - 1);
    }, 1000);
    return () => { if (decisionTimerRef.current) clearInterval(decisionTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, timer]);

  // ─── Feedback auto-dismiss ─────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'feedback') return;
    const t = setTimeout(() => {
      if (currentTurn >= TURNS_PER_ROUND - 1) {
        startClosing();
      } else {
        setCurrentTurn(v => v + 1);
        setGamePhase('revealing');
      }
    }, 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentTurn]);

  // ─── Closing: reveal remaining candles ─────────────────
  useEffect(() => {
    if (gamePhase !== 'closing' || !scenario) return;
    if (visibleCount >= totalCandles) {
      endRound();
      return;
    }
    const t = setTimeout(() => setVisibleCount(v => v + 1), 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, visibleCount, totalCandles]);

  // ─── Game flow ─────────────────────────────────────────
  const startRound = useCallback((round: number) => {
    const s = getScenarioForRound(pattern?.id ?? '', round);
    if (!s) return;
    setScenario(s);
    setVisibleCount(INITIAL_REVEAL);
    setTrades([]);
    setNetPosition(0);
    setCurrentTurn(0);
    setFeedback(null);
    setGamePhase('countdown');
    setCountdownVal(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        setGamePhase('revealing');
      } else {
        setCountdownVal(c);
      }
    }, 600);
  }, [pattern]);

  const handleDecision = useCallback((action: 'buy' | 'sell' | 'skip', isTimeout = false) => {
    if (decisionTimerRef.current) { clearInterval(decisionTimerRef.current); decisionTimerRef.current = null; }

    const price = currentPrice;
    const trade: TradeLog = { action: isTimeout ? 'timeout' : action, price, turn: currentTurn };

    if (action === 'buy') {
      setTrades(prev => [...prev, { action: 'buy', price, turn: currentTurn }]);
      setNetPosition(v => v + 1);
      setFeedback({ emoji: '📈', text: '매수!', sub: `${fmtPrice(price)}에 1주 매수`, color: 'bg-green-500/20 border-green-500/30' });
    } else if (action === 'sell') {
      setTrades(prev => [...prev, { action: 'sell', price, turn: currentTurn }]);
      setNetPosition(v => v - 1);
      setFeedback({ emoji: '📉', text: '매도!', sub: `${fmtPrice(price)}에 1주 매도`, color: 'bg-red-500/20 border-red-500/30' });
    } else {
      setFeedback({
        emoji: isTimeout ? '⏰' : '👀',
        text: isTimeout ? '시간 초과' : '관망',
        sub: isTimeout ? '자동으로 관망 처리됨' : '이번 턴은 지켜봅니다',
        color: 'bg-gray-500/20 border-gray-500/30',
      });
    }
    setGamePhase('feedback');
  }, [currentPrice, currentTurn]);

  const startClosing = useCallback(() => {
    setGamePhase('closing');
  }, []);

  const endRound = useCallback(() => {
    if (!scenario) return;
    const finalPrice = scenario.candles[totalCandles - 1].close;
    const score = calculateRoundScore(trades, netPosition, finalPrice, scenario);
    setRoundResults(prev => [...prev, { score, trades, netPosition }]);
    setTotalScore(prev => prev + score.total);
    setStreak(prev => score.total >= 8 ? prev + 1 : 0);
    setVisibleCount(totalCandles);
    setGamePhase('round-result');
  }, [scenario, totalCandles, trades, netPosition]);

  const handleNextRound = () => {
    const next = currentRound + 1;
    if (next >= TOTAL_ROUNDS) {
      setGamePhase('final-result');
    } else {
      setCurrentRound(next);
      startRound(next);
    }
  };

  const handleRetry = () => {
    setCurrentRound(0);
    setRoundResults([]);
    setTotalScore(0);
    setStreak(0);
    setGamePhase('intro');
  };

  if (!pattern) {
    return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="animate-pulse text-4xl">📊</div></div>;
  }

  const signalLabel = scenario?.signal === 'buy' ? '매수' : '매도';

  // ═══════════════════ INTRO ═════════════════════════════
  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] pb-32">
        <MobileHeader title="패턴 챌린지" showBack />
        <main className="pt-16 px-5 max-w-md mx-auto">
          <section className="mt-6 text-center">
            <div className="text-6xl mb-3">{pattern.emoji}</div>
            <h2 className="text-2xl font-bold text-white">{pattern.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{pattern.nameEn}</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-indigo-500/15 px-4 py-1.5 rounded-full border border-indigo-500/30">
              <Flame className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-indigo-300">{TOTAL_ROUNDS}라운드 × {TURNS_PER_ROUND}턴</span>
            </div>
          </section>

          <section className="mt-6 bg-[#141414] rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-400" /> 게임 규칙
            </h3>
            {[
              { n: '1', text: '매 턴마다 4개의 캔들이 공개됩니다', c: 'bg-blue-500/20 text-blue-300' },
              { n: '2', text: '각 턴에서 매수(+1주), 매도(-1주), 관망 선택', c: 'bg-green-500/20 text-green-300' },
              { n: '3', text: '5턴 동안 패턴을 파악하며 포지션을 쌓으세요', c: 'bg-purple-500/20 text-purple-300' },
              { n: '4', text: `최대 ${MAX_POSITION}주까지 매수/공매도 가능`, c: 'bg-yellow-500/20 text-yellow-300' },
              { n: '5', text: '5턴 후 자동 청산, 수익률로 점수 산정!', c: 'bg-red-500/20 text-red-300' },
            ].map(r => (
              <div key={r.n} className="flex items-start gap-3">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', r.c)}>{r.n}</div>
                <p className="text-xs text-gray-300 pt-0.5">{r.text}</p>
              </div>
            ))}
          </section>

          <section className="mt-4 flex gap-2">
            <div className="flex-1 bg-[#141414] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-gray-600">난이도</p>
              <p className="text-sm mt-0.5">{'⭐'.repeat(pattern.difficulty)}</p>
            </div>
            <div className="flex-1 bg-[#141414] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-gray-600">만점</p>
              <p className="text-sm font-bold text-yellow-400 mt-0.5">{TOTAL_ROUNDS * 20}점</p>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
          <div className="max-w-md mx-auto">
            <Button onClick={() => { setCurrentRound(0); startRound(0); }} className="w-full h-14 rounded-xl font-bold text-white text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90">
              <Play className="w-5 h-5 mr-2" /> 챌린지 시작!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════ COUNTDOWN ═════════════════════════
  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center">
        <p className="text-sm text-gray-500 mb-2">라운드 {currentRound + 1}/{TOTAL_ROUNDS}</p>
        <div className="text-8xl font-black text-white animate-pulse">{countdownVal}</div>
        <p className="text-xs text-gray-600 mt-4">턴당 {DECISION_TIMERS[currentRound]}초 제한</p>
      </div>
    );
  }

  // ═══════════════════ ROUND RESULT ═════════════════════
  if (gamePhase === 'round-result') {
    const rd = roundResults[roundResults.length - 1];
    if (!rd || !scenario) return null;
    const s = rd.score;

    return (
      <div className="min-h-screen bg-[#0d0d0d] pb-32">
        <main className="pt-8 px-5 max-w-md mx-auto">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[#141414] px-3 py-1 rounded-full text-xs text-gray-400 border border-white/5">
              라운드 {currentRound + 1}/{TOTAL_ROUNDS}
            </span>
          </div>

          <div className="text-center">
            <div className="text-7xl mb-2 animate-bounce">{s.emoji}</div>
            <h2 className="text-xl font-bold text-white">{s.message}</h2>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141414] border border-white/10">
              <span className="text-2xl font-black text-yellow-400">{s.total}</span>
              <span className="text-sm text-gray-500">/ 20점</span>
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded',
                s.grade === 'S' ? 'bg-yellow-500/20 text-yellow-300' :
                s.grade === 'A' ? 'bg-green-500/20 text-green-300' :
                s.grade === 'B' ? 'bg-blue-500/20 text-blue-300' :
                s.grade === 'C' ? 'bg-orange-500/20 text-orange-300' :
                'bg-gray-500/20 text-gray-400',
              )}>{s.grade}</span>
            </div>
            {streak >= 2 && <div className="mt-2 text-sm font-bold text-orange-400 animate-pulse">🔥 {streak}연승!</div>}
          </div>

          {/* Chart with markers */}
          <section className="mt-4 bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
            <div className="h-40 p-1">
              <CandlestickChart
                candles={scenario.candles}
                visibleCount={totalCandles}
                buyTurns={buyIndices}
                sellTurns={sellIndices}
              />
            </div>
          </section>

          {/* Trade log */}
          <section className="mt-4 bg-[#141414] rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-gray-600 mb-2">매매 기록 ({rd.trades.filter(t => t.action !== 'skip' && t.action !== 'timeout').length}건)</p>
            <div className="space-y-1.5">
              {rd.trades.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 w-8">턴{t.turn + 1}</span>
                  <span className={cn('font-bold',
                    t.action === 'buy' ? 'text-green-400' :
                    t.action === 'sell' ? 'text-red-400' : 'text-gray-500',
                  )}>
                    {t.action === 'buy' ? '📈매수' : t.action === 'sell' ? '📉매도' : '👀관망'}
                  </span>
                  {(t.action === 'buy' || t.action === 'sell') && (
                    <span className="text-gray-400">{fmtPrice(t.price)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* P&L comparison */}
          <section className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-[#141414] rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-gray-600 mb-1">내 손익</p>
              <p className={cn('text-lg font-bold', s.userPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                {fmtPnl(s.userPnl)}
              </p>
            </div>
            <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
              <p className="text-[10px] text-indigo-300 mb-1">최적 손익</p>
              <p className="text-lg font-bold text-indigo-300">{fmtPnl(s.optimalPnl)}</p>
            </div>
          </section>

          <section className="mt-3 bg-[#141414] rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500">누적 점수</span>
            <span className="text-lg font-bold text-yellow-400">{totalScore} <span className="text-xs text-gray-600">/ {TOTAL_ROUNDS * 20}</span></span>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
          <div className="max-w-md mx-auto">
            <Button onClick={handleNextRound} className="w-full h-14 rounded-xl font-bold text-white text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90">
              {currentRound + 1 < TOTAL_ROUNDS
                ? <>다음 라운드 <ChevronRight className="w-5 h-5 ml-1" /></>
                : <><Trophy className="w-5 h-5 mr-2" /> 최종 결과 보기</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════ FINAL RESULT ═════════════════════
  if (gamePhase === 'final-result') {
    const result = getFinalResult(totalScore);
    return (
      <div className="min-h-screen bg-[#0d0d0d] pb-36">
        <main className="pt-8 px-5 max-w-md mx-auto">
          <section className="text-center mt-4">
            <div className="text-7xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold text-white">{result.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{result.sub}</p>
          </section>
          <section className="mt-5"><StarRating stars={result.stars} /></section>
          <section className="mt-5 bg-[#141414] rounded-2xl p-5 border border-white/5 text-center">
            <p className="text-xs text-gray-600 mb-1">최종 점수</p>
            <p className="text-5xl font-black text-white">{totalScore}<span className="text-lg text-gray-600">/{TOTAL_ROUNDS * 20}</span></p>
          </section>

          <section className="mt-4 space-y-2">
            <h3 className="text-sm font-bold text-white mb-2">라운드별 결과</h3>
            {roundResults.map((rd, i) => (
              <div key={i} className="bg-[#141414] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-bold text-gray-400">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{rd.score.emoji}</span>
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded',
                      rd.score.grade === 'S' ? 'bg-yellow-500/20 text-yellow-300' :
                      rd.score.grade === 'A' ? 'bg-green-500/20 text-green-300' :
                      rd.score.grade === 'B' ? 'bg-blue-500/20 text-blue-300' :
                      rd.score.grade === 'C' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-gray-500/20 text-gray-400',
                    )}>{rd.score.grade}</span>
                    <span className="text-yellow-400 font-bold text-sm">{rd.score.total}점</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    손익: {fmtPnl(rd.score.userPnl)} · 매매 {rd.trades.filter(t => t.action === 'buy' || t.action === 'sell').length}건
                  </p>
                </div>
              </div>
            ))}
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" onClick={() => router.push(`/learn/patterns/${pattern.id}`)} className="flex-1 h-12 rounded-xl bg-[#141414] border-white/10 text-white hover:bg-[#1a1a1a]">
              패턴 복습
            </Button>
            <Button onClick={handleRetry} className="flex-[2] h-12 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90">
              <RotateCcw className="w-4 h-4 mr-2" /> 다시 도전
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════ PLAYING (revealing / deciding / feedback / closing) ═════════
  if (!scenario) return null;
  const decisionSeconds = DECISION_TIMERS[currentRound] ?? 8;
  const timerPct = (timer / decisionSeconds) * 100;
  const isRevealing = gamePhase === 'revealing';
  const isDeciding = gamePhase === 'deciding';
  const isFeedback = gamePhase === 'feedback';
  const isClosing = gamePhase === 'closing';
  const canBuy = netPosition < MAX_POSITION;
  const canSell = netPosition > -MAX_POSITION;

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-56">
      {/* Feedback overlay */}
      {isFeedback && feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={cn('text-center p-6 rounded-2xl border', feedback.color)}>
            <div className="text-5xl mb-2">{feedback.emoji}</div>
            <p className="text-xl font-bold text-white">{feedback.text}</p>
            <p className="text-sm text-gray-400 mt-1">{feedback.sub}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between h-12 px-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-base">{pattern.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-white">R{currentRound + 1} · 턴 {currentTurn + 1}/{TURNS_PER_ROUND}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak >= 2 && <span className="text-xs font-bold text-orange-400">🔥{streak}</span>}
            <div className="bg-[#141414] px-2.5 py-0.5 rounded-full border border-white/10">
              <span className="text-[11px] font-bold text-yellow-400">{totalScore}점</span>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-12 px-4 max-w-md mx-auto">
        {/* Turn progress */}
        <section className="mt-2 flex gap-1.5">
          {Array.from({ length: TURNS_PER_ROUND }).map((_, i) => (
            <div key={i} className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i < currentTurn ? 'bg-indigo-500' :
              i === currentTurn ? (isDeciding ? 'bg-yellow-400 animate-pulse' : 'bg-indigo-400') :
              'bg-[#1a1a1a]',
            )} />
          ))}
        </section>

        {/* Chart */}
        <section className="mt-2 bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-48 p-1">
            <CandlestickChart
              candles={scenario.candles}
              visibleCount={visibleCount}
              buyTurns={buyIndices}
              sellTurns={sellIndices}
            />
          </div>
        </section>

        {/* Info row */}
        <section className="mt-2 flex gap-2">
          <div className="flex-1 bg-[#141414] rounded-xl px-3 py-2 border border-white/5">
            <p className="text-[9px] text-gray-600">현재가</p>
            <p className="text-sm font-bold text-white">{fmtPrice(currentPrice)}</p>
          </div>
          <div className={cn('flex-1 rounded-xl px-3 py-2 border',
            netPosition > 0 ? 'bg-green-500/10 border-green-500/20' :
            netPosition < 0 ? 'bg-red-500/10 border-red-500/20' :
            'bg-[#141414] border-white/5',
          )}>
            <p className="text-[9px] text-gray-600">포지션</p>
            <p className={cn('text-sm font-bold',
              netPosition > 0 ? 'text-green-400' :
              netPosition < 0 ? 'text-red-400' : 'text-gray-500',
            )}>
              {netPosition > 0 ? `보유 ${netPosition}주` : netPosition < 0 ? `공매도 ${Math.abs(netPosition)}주` : '없음'}
            </p>
          </div>
          {trades.length > 0 && (
            <div className={cn('flex-1 rounded-xl px-3 py-2 border',
              pnl >= 0 ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10',
            )}>
              <p className="text-[9px] text-gray-600">손익</p>
              <p className={cn('text-sm font-bold', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                {fmtPnl(pnl)}
              </p>
            </div>
          )}
        </section>

        {/* Hint */}
        <section className="mt-2">
          <div className="bg-[#141414] rounded-xl px-3 py-2 border border-white/5 flex items-center gap-2">
            <Lightbulb className="w-3 h-3 text-yellow-400 shrink-0" />
            <p className="text-[10px] text-gray-500">{scenario.hint}</p>
          </div>
        </section>
      </main>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent">
        <div className="max-w-md mx-auto space-y-2">
          {/* Timer bar */}
          {isDeciding && (
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-3.5 h-3.5 text-yellow-400" />
              <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-1000',
                    timerPct > 50 ? 'bg-yellow-400' : timerPct > 25 ? 'bg-orange-400' : 'bg-red-500 animate-pulse',
                  )}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
              <span className={cn('text-sm font-bold w-6 text-right',
                timer > 3 ? 'text-yellow-400' : 'text-red-500',
              )}>{timer}</span>
            </div>
          )}

          {/* Revealing indicator */}
          {isRevealing && (
            <div className="text-center py-3">
              <p className="text-xs text-gray-500 animate-pulse">📊 차트 공개 중...</p>
            </div>
          )}

          {/* Closing indicator */}
          {isClosing && (
            <div className="text-center py-3">
              <p className="text-xs text-purple-400 animate-pulse">📊 남은 차트 공개 중... 자동 청산 진행</p>
            </div>
          )}

          {/* Decision buttons */}
          {isDeciding && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision('buy')}
                disabled={!canBuy}
                className="flex-1 h-14 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <TrendingUp className="w-5 h-5 mr-1" />
                매수
                <span className="text-[10px] ml-1 opacity-70">+1주</span>
              </Button>
              <Button
                onClick={() => handleDecision('sell')}
                disabled={!canSell}
                className="flex-1 h-14 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <TrendingDown className="w-5 h-5 mr-1" />
                매도
                <span className="text-[10px] ml-1 opacity-70">-1주</span>
              </Button>
              <Button
                onClick={() => handleDecision('skip')}
                className="flex-1 h-14 rounded-xl font-bold text-white bg-[#252525] hover:bg-[#333]"
              >
                <Eye className="w-5 h-5 mr-1" />
                관망
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
