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
import { getScenario, type PatternScenario, type Candle } from '@/data/pattern-practice';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ChevronRight,
  Star,
  Lightbulb,
  Play,
  DollarSign,
  Target,
  ArrowDownCircle,
  ArrowUpCircle,
  XCircle,
  Zap,
} from 'lucide-react';

// ─────────── CandlestickChart ───────────
function CandlestickChart({
  candles,
  visibleCount,
  entryIndex,
  entryPrice,
  exitIndex,
  exitPrice,
}: {
  candles: Candle[];
  visibleCount: number;
  entryIndex?: number;
  entryPrice?: number;
  exitIndex?: number;
  exitPrice?: number;
}) {
  const visible = candles.slice(0, visibleCount);
  if (visible.length === 0) return null;

  const CHART_W = 320;
  const CHART_H = 180;
  const MARGIN_R = 55;
  const MARGIN_T = 8;
  const MARGIN_B = 8;
  const drawW = CHART_W - MARGIN_R;
  const drawH = CHART_H - MARGIN_T - MARGIN_B;

  const allHigh = visible.map(c => c.high);
  const allLow = visible.map(c => c.low);
  const maxP = Math.max(...allHigh);
  const minP = Math.min(...allLow);
  const range = maxP - minP || 1;
  const pad = range * 0.08;
  const yMax = maxP + pad;
  const yMin = minP - pad;

  const candleSpacing = Math.min(14, drawW / visible.length);
  const candleW = Math.max(candleSpacing * 0.6, 3);

  const priceToY = (p: number) =>
    MARGIN_T + drawH * (1 - (p - yMin) / (yMax - yMin));
  const idxToX = (i: number) => candleSpacing * i + candleSpacing / 2;

  const gridLines = 4;
  const gridPrices = Array.from({ length: gridLines }, (_, i) =>
    yMin + ((yMax - yMin) * (i + 1)) / (gridLines + 1),
  );

  const lastCandle = visible[visible.length - 1];

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={CHART_W} height={CHART_H} fill="#1a1a1a" rx="8" />

      {/* Grid */}
      {gridPrices.map((p, i) => (
        <g key={i}>
          <line
            x1={0}
            y1={priceToY(p)}
            x2={drawW}
            y2={priceToY(p)}
            stroke="#333"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
          <text
            x={drawW + 4}
            y={priceToY(p) + 3}
            fill="#666"
            fontSize="8"
            fontFamily="monospace"
          >
            {(p / 1000).toFixed(1)}K
          </text>
        </g>
      ))}

      {/* Candles */}
      {visible.map((c, i) => {
        const x = idxToX(i);
        const bullish = c.close >= c.open;
        const color = bullish ? '#22c55e' : '#ef4444';
        const bodyTop = priceToY(Math.max(c.open, c.close));
        const bodyBot = priceToY(Math.min(c.open, c.close));
        const bodyH = Math.max(bodyBot - bodyTop, 1);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={priceToY(c.high)}
              x2={x}
              y2={priceToY(c.low)}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}

      {/* Current price line */}
      <line
        x1={0}
        y1={priceToY(lastCandle.close)}
        x2={drawW}
        y2={priceToY(lastCandle.close)}
        stroke="#818cf8"
        strokeWidth="0.7"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      <rect
        x={drawW + 1}
        y={priceToY(lastCandle.close) - 7}
        width={50}
        height={14}
        fill="#818cf8"
        rx="3"
      />
      <text
        x={drawW + 26}
        y={priceToY(lastCandle.close) + 3}
        fill="white"
        fontSize="7.5"
        fontFamily="monospace"
        textAnchor="middle"
        fontWeight="bold"
      >
        {lastCandle.close.toLocaleString()}
      </text>

      {/* Entry marker */}
      {entryIndex != null && entryIndex < visibleCount && entryPrice != null && (
        <g>
          <line
            x1={idxToX(entryIndex)}
            y1={priceToY(entryPrice)}
            x2={drawW}
            y2={priceToY(entryPrice)}
            stroke="#f59e0b"
            strokeWidth="0.7"
            strokeDasharray="3 2"
            opacity="0.7"
          />
          <circle
            cx={idxToX(entryIndex)}
            cy={priceToY(entryPrice)}
            r="4"
            fill="#f59e0b"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <text
            x={idxToX(entryIndex)}
            y={priceToY(entryPrice) - 7}
            fill="#f59e0b"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            진입
          </text>
        </g>
      )}

      {/* Exit marker */}
      {exitIndex != null && exitIndex < visibleCount && exitPrice != null && (
        <g>
          <circle
            cx={idxToX(exitIndex)}
            cy={priceToY(exitPrice)}
            r="4"
            fill="#a855f7"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <text
            x={idxToX(exitIndex)}
            y={priceToY(exitPrice) - 7}
            fill="#a855f7"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            청산
          </text>
        </g>
      )}
    </svg>
  );
}

// ─────────── Price formatting ───────────
function fmtPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}
function fmtPct(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

// ─────────── Star rating ───────────
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {[0, 1, 2].map(i => (
        <Star
          key={i}
          className={cn(
            'w-9 h-9 transition-all duration-500',
            i < stars
              ? 'text-yellow-400 fill-yellow-400 scale-110'
              : 'text-gray-700 fill-transparent',
          )}
          style={{ transitionDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

// ─────────── Types ───────────
type Phase = 'intro' | 'watching' | 'holding' | 'autoplay' | 'result';
type Position = 'long' | 'short' | null;

export default function PatternPracticePage() {
  const params = useParams();
  const router = useRouter();

  const [pattern, setPattern] = useState<ChartPattern | null>(null);
  const [scenario, setScenario] = useState<PatternScenario | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [visibleCount, setVisibleCount] = useState(0);

  const [position, setPosition] = useState<Position>(null);
  const [entryIndex, setEntryIndex] = useState<number | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [exitIndex, setExitIndex] = useState<number | null>(null);
  const [exitPrice, setExitPrice] = useState<number | null>(null);

  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const found = CHART_PATTERNS.find(p => p.id === params.id);
    setPattern(found || null);
    if (found) {
      const s = getScenario(found.id);
      setScenario(s);
    }
  }, [params.id]);

  useEffect(() => {
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, []);

  const totalCandles = scenario?.candles.length ?? 0;
  const currentCandle = scenario && visibleCount > 0 ? scenario.candles[visibleCount - 1] : null;
  const currentPrice = currentCandle?.close ?? 0;

  const pnl = useMemo(() => {
    if (entryPrice == null) return 0;
    const exit = exitPrice ?? currentPrice;
    if (position === 'long' || (exitPrice != null && entryPrice < exitPrice))
      return ((exit - entryPrice) / entryPrice) * 100;
    return ((entryPrice - exit) / entryPrice) * 100;
  }, [position, entryPrice, exitPrice, currentPrice]);

  const optimalPnl = useMemo(() => {
    if (!scenario) return 0;
    const oEntry = scenario.candles[scenario.optimalEntryIndex]?.close ?? 0;
    const oExit = scenario.candles[scenario.optimalExitIndex]?.close ?? 0;
    if (scenario.signal === 'buy') return ((oExit - oEntry) / oEntry) * 100;
    return ((oEntry - oExit) / oEntry) * 100;
  }, [scenario]);

  const handleStart = () => {
    if (!scenario) return;
    setPhase('watching');
    setVisibleCount(scenario.initialReveal);
    setPosition(null);
    setEntryIndex(null);
    setEntryPrice(null);
    setExitIndex(null);
    setExitPrice(null);
  };

  const handleNextCandle = () => {
    if (!scenario) return;
    if (visibleCount >= totalCandles) {
      if (position) {
        setExitPrice(currentPrice);
        setExitIndex(visibleCount - 1);
      }
      setPhase('result');
      return;
    }
    setVisibleCount(v => Math.min(v + 1, totalCandles));
  };

  const handleEntry = (type: 'long' | 'short') => {
    setPosition(type);
    setEntryIndex(visibleCount - 1);
    setEntryPrice(currentPrice);
    setPhase('holding');
  };

  const handleExit = () => {
    setExitPrice(currentPrice);
    setExitIndex(visibleCount - 1);
    setPhase('autoplay');
    autoplayRef.current = setInterval(() => {
      setVisibleCount(prev => {
        if (prev >= totalCandles) {
          if (autoplayRef.current) clearInterval(autoplayRef.current);
          autoplayRef.current = null;
          setPhase('result');
          return prev;
        }
        return prev + 1;
      });
    }, 400);
  };

  const handleForceEnd = useCallback(() => {
    if (!scenario) return;
    if (position && !exitPrice) {
      const lastPrice = scenario.candles[totalCandles - 1]?.close ?? currentPrice;
      setExitPrice(lastPrice);
      setExitIndex(totalCandles - 1);
    }
    setVisibleCount(totalCandles);
    setPhase('result');
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, [scenario, position, exitPrice, totalCandles, currentPrice]);

  const handleRetry = () => {
    if (pattern) {
      setScenario(getScenario(pattern.id));
    }
    setPhase('intro');
    setVisibleCount(0);
    setPosition(null);
    setEntryIndex(null);
    setEntryPrice(null);
    setExitIndex(null);
    setExitPrice(null);
  };

  if (!pattern || !scenario) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">📊</div>
      </div>
    );
  }

  const catConfig = PATTERN_CATEGORIES[pattern.category];
  const isLastCandle = visibleCount >= totalCandles;
  const signalLabel = scenario.signal === 'buy' ? '매수' : '매도';
  const signalColor = scenario.signal === 'buy' ? 'text-green-400' : 'text-red-400';

  // ──────── Intro ────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#191919] pb-32">
        <MobileHeader title="패턴 연습" showBack />
        <main className="pt-16 px-5 max-w-md mx-auto">
          <section className="mt-6 text-center">
            <div className="text-5xl mb-3">{pattern.emoji}</div>
            <h2 className="text-2xl font-bold text-white">{pattern.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{pattern.nameEn}</p>
          </section>

          <section className="mt-6 bg-[#252525] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs font-bold text-yellow-400">연습 방법</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">1</div>
                <p className="text-xs text-gray-300">차트가 캔들 하나씩 공개됩니다</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">2</div>
                <p className="text-xs text-gray-300">
                  <span className={cn('font-bold', signalColor)}>{pattern.name}</span> 패턴을 발견하면{' '}
                  <span className={cn('font-bold', signalColor)}>{signalLabel}</span> 버튼을 누르세요
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">3</div>
                <p className="text-xs text-gray-300">적절한 타이밍에 <span className="font-bold text-purple-400">청산</span>하여 수익을 확정하세요</p>
              </div>
            </div>
          </section>

          <section className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-400 mb-1">패턴 힌트</p>
                <p className="text-xs text-gray-300 leading-relaxed">{scenario.hint}</p>
              </div>
            </div>
          </section>

          <section className="mt-4 flex gap-3">
            <div className="flex-1 bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500">난이도</p>
              <p className="text-sm text-white mt-0.5">{'⭐'.repeat(pattern.difficulty)}</p>
            </div>
            <div className="flex-1 bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500">신뢰도</p>
              <p className="text-sm text-white mt-0.5">{'⭐'.repeat(pattern.reliability)}</p>
            </div>
            <div className="flex-1 bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500">신호</p>
              <p className={cn('text-sm font-bold mt-0.5', signalColor)}>{signalLabel}</p>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleStart}
              className="w-full h-14 rounded-xl font-bold text-white text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
            >
              <Play className="w-5 h-5 mr-2" />
              연습 시작
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ──────── Result ────────
  if (phase === 'result') {
    const finalPnl =
      entryPrice != null && exitPrice != null
        ? position === 'short'
          ? ((entryPrice - exitPrice) / entryPrice) * 100
          : ((exitPrice - entryPrice) / entryPrice) * 100
        : 0;
    const noTrade = entryPrice == null;

    const pnlDiff = Math.abs(finalPnl - optimalPnl);
    const stars = noTrade ? 0 : pnlDiff < 2 ? 3 : pnlDiff < 5 ? 2 : finalPnl > 0 ? 1 : 0;
    const message = noTrade
      ? { emoji: '🤔', text: '매매를 하지 않았어요', sub: '패턴을 발견하면 과감히 진입해보세요!' }
      : stars === 3
        ? { emoji: '🎉', text: '완벽한 타이밍!', sub: '최적 매매와 거의 같은 수익률입니다!' }
        : stars === 2
          ? { emoji: '👏', text: '좋은 판단이에요!', sub: '타이밍을 조금 더 다듬으면 완벽해요!' }
          : finalPnl > 0
            ? { emoji: '💪', text: '수익을 냈어요!', sub: '패턴 확인 후 진입하면 더 좋은 결과를!' }
            : { emoji: '📚', text: '아쉬운 결과네요', sub: '패턴 설명을 복습하고 다시 도전해보세요!' };

    return (
      <div className="min-h-screen bg-[#191919] pb-36">
        <MobileHeader
          title="연습 결과"
          showBack
          onBack={() => router.push(`/learn/patterns/${pattern.id}`)}
        />
        <main className="pt-16 px-5 max-w-md mx-auto">
          {/* Chart */}
          <section className="mt-4 bg-[#1a1a1a] rounded-2xl p-2 border border-white/5">
            <div className="h-44">
              <CandlestickChart
                candles={scenario.candles}
                visibleCount={totalCandles}
                entryIndex={entryIndex ?? undefined}
                entryPrice={entryPrice ?? undefined}
                exitIndex={exitIndex ?? undefined}
                exitPrice={exitPrice ?? undefined}
              />
            </div>
          </section>

          {/* Result */}
          <section className="mt-5 text-center">
            <div className="text-5xl mb-2">{message.emoji}</div>
            <h3 className="text-xl font-bold text-white">{message.text}</h3>
            <p className="text-sm text-gray-400 mt-1">{message.sub}</p>
          </section>

          <section className="mt-4">
            <StarRating stars={stars} />
          </section>

          {!noTrade && (
            <section className="mt-5 space-y-3">
              <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
                <p className="text-[10px] text-gray-500 mb-2">내 매매</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">진입가</p>
                    <p className="text-sm text-white font-bold">{fmtPrice(entryPrice!)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-400">청산가</p>
                    <p className="text-sm text-white font-bold">{fmtPrice(exitPrice!)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">수익률</p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        finalPnl >= 0 ? 'text-green-400' : 'text-red-400',
                      )}
                    >
                      {fmtPct(finalPnl)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-300 mb-2">최적 매매 (비교)</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">진입가</p>
                    <p className="text-sm text-indigo-300 font-bold">
                      {fmtPrice(scenario.candles[scenario.optimalEntryIndex].close)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-400">청산가</p>
                    <p className="text-sm text-indigo-300 font-bold">
                      {fmtPrice(scenario.candles[scenario.optimalExitIndex].close)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">수익률</p>
                    <p className="text-sm font-bold text-indigo-300">{fmtPct(optimalPnl)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/learn/patterns/${pattern.id}`)}
              className="flex-1 h-12 rounded-xl bg-[#252525] border-white/10 text-white hover:bg-[#333]"
            >
              패턴 복습
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-[2] h-12 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 도전
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ──────── Trading (watching / holding / autoplay) ────────
  const holdingPnl =
    entryPrice != null
      ? position === 'short'
        ? ((entryPrice - currentPrice) / entryPrice) * 100
        : ((currentPrice - entryPrice) / entryPrice) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#191919] pb-52">
      <MobileHeader
        title={`${pattern.emoji} ${pattern.name}`}
        showBack
        onBack={() => router.push(`/learn/patterns/${pattern.id}`)}
      />

      <main className="pt-16 px-4 max-w-md mx-auto">
        {/* Progress */}
        <section className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(visibleCount / totalCandles) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 whitespace-nowrap">
            {visibleCount}/{totalCandles}
          </span>
        </section>

        {/* Chart */}
        <section className="mt-3 bg-[#1a1a1a] rounded-2xl p-2 border border-white/5">
          <div className="h-48">
            <CandlestickChart
              candles={scenario.candles}
              visibleCount={visibleCount}
              entryIndex={entryIndex ?? undefined}
              entryPrice={entryPrice ?? undefined}
              exitIndex={exitIndex ?? undefined}
              exitPrice={exitPrice ?? undefined}
            />
          </div>
        </section>

        {/* Hint */}
        <section className="mt-3">
          <div className="bg-[#252525] rounded-xl px-3 py-2.5 border border-white/5 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <p className="text-[11px] text-gray-400 leading-snug">{scenario.hint}</p>
          </div>
        </section>

        {/* Position info */}
        {phase === 'holding' && entryPrice != null && (
          <section className="mt-3 bg-[#252525] rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    position === 'long' ? 'bg-green-500/20' : 'bg-red-500/20',
                  )}
                >
                  {position === 'long' ? (
                    <ArrowUpCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">
                    {position === 'long' ? '매수' : '매도'} 포지션
                  </p>
                  <p className="text-xs text-white font-bold">{fmtPrice(entryPrice)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500">평가 손익</p>
                <p
                  className={cn(
                    'text-sm font-bold',
                    holdingPnl >= 0 ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  {fmtPct(holdingPnl)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Autoplay info */}
        {phase === 'autoplay' && (
          <section className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-purple-300">
              청산 완료! 나머지 차트를 확인하고 있습니다...
            </p>
          </section>
        )}
      </main>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919]/95 to-transparent">
        <div className="max-w-md mx-auto space-y-2.5">
          {/* Watching: show Buy/Sell + Next */}
          {phase === 'watching' && (
            <>
              <div className="flex gap-2.5">
                <Button
                  onClick={() => handleEntry('long')}
                  className="flex-1 h-12 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  매수
                </Button>
                <Button
                  onClick={() => handleEntry('short')}
                  className="flex-1 h-12 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="w-4 h-4 mr-1.5" />
                  매도
                </Button>
              </div>
              <Button
                onClick={handleNextCandle}
                disabled={isLastCandle}
                className="w-full h-11 rounded-xl bg-[#333] text-white hover:bg-[#444] font-medium"
              >
                {isLastCandle ? (
                  '차트 종료'
                ) : (
                  <>
                    다음 캔들
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* Holding: show Close + Next */}
          {phase === 'holding' && (
            <>
              <Button
                onClick={handleExit}
                className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                청산 (포지션 정리)
              </Button>
              <Button
                onClick={() => {
                  if (isLastCandle) {
                    handleForceEnd();
                  } else {
                    handleNextCandle();
                  }
                }}
                className="w-full h-11 rounded-xl bg-[#333] text-white hover:bg-[#444] font-medium"
              >
                {isLastCandle ? (
                  '결과 보기'
                ) : (
                  <>
                    다음 캔들 (보유 중)
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* Autoplay: skip button */}
          {phase === 'autoplay' && (
            <Button
              onClick={handleForceEnd}
              className="w-full h-11 rounded-xl bg-[#333] text-white hover:bg-[#444] font-medium"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              결과 바로 보기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
