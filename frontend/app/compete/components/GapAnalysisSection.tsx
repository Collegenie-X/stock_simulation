'use client';

import { TrendingUp, TrendingDown, Target, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────

interface GapPlayer {
  profitRate: number;
  waveAccuracy: number;
  winRate: number;
  avgHoldDays: number;
  weakPoint?: string;
  style: string;
}

interface BestPlayer extends GapPlayer {
  nickname: string;
  keyDiff: string;
}

interface SimilarAI extends GapPlayer {
  name: string;
  emoji: string;
  label: string;
  strategy: string;
}

interface WeeklyGapItem {
  week: string;
  me: number;
  bestPlayer: number;
  similarAI: number;
}

interface Insight {
  type: string;
  icon: string;
  title: string;
  value: string;
  desc: string;
  action: string;
}

interface GapAnalysis {
  me: GapPlayer;
  bestPlayer: BestPlayer;
  similarAI: SimilarAI;
  weeklyGap: WeeklyGapItem[];
  insights: Insight[];
}

interface GapAnalysisSectionProps {
  gapAnalysis: GapAnalysis;
}

// ── 수익률 바 비교 ─────────────────────────────────────────

function CompareBar({
  label,
  value,
  maxValue,
  color,
  isMe,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  isMe?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const isNeg = value < 0;

  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-[10px] w-14 shrink-0 font-bold', isMe ? 'text-white' : 'text-gray-400')}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs font-black tabular-nums w-12 text-right shrink-0', isNeg ? 'text-blue-400' : isMe ? 'text-white' : 'text-gray-300')}>
        {value > 0 ? '+' : ''}{value}%
      </span>
    </div>
  );
}

// ── 스탯 비교 행 ───────────────────────────────────────────

function StatRow({
  label,
  me,
  other,
  unit = '%',
  higherIsBetter = true,
}: {
  label: string;
  me: number;
  other: number;
  unit?: string;
  higherIsBetter?: boolean;
}) {
  const diff = me - other;
  const isBetter = higherIsBetter ? diff >= 0 : diff <= 0;

  return (
    <div className="flex items-center justify-between py-[5px] border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-white tabular-nums">{me}{unit}</span>
        <span className="text-[10px] text-gray-600">vs</span>
        <span className="text-xs text-gray-400 tabular-nums">{other}{unit}</span>
        <span className={cn(
          'text-[10px] font-black px-1.5 py-0.5 rounded-md tabular-nums',
          isBetter
            ? 'bg-green-500/15 text-green-400'
            : 'bg-red-500/15 text-red-400'
        )}>
          {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
        </span>
      </div>
    </div>
  );
}

// ── 인사이트 카드 ──────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const isGap = insight.type.startsWith('gap');
  const isStrength = insight.type === 'strength';

  return (
    <div className={cn(
      'rounded-xl p-3 border',
      isStrength
        ? 'bg-green-500/8 border-green-500/20'
        : isGap
        ? 'bg-[#1e1e1e] border-white/8'
        : 'bg-[#1e1e1e] border-white/8'
    )}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{insight.icon}</span>
          <span className="text-xs font-bold text-white">{insight.title}</span>
        </div>
        <span className={cn(
          'text-sm font-black shrink-0',
          insight.value.startsWith('+') && !insight.value.includes('%p') ? 'text-red-400' :
          insight.value.startsWith('-') ? 'text-blue-400' :
          'text-yellow-300'
        )}>
          {insight.value}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mb-1.5 leading-relaxed">{insight.desc}</p>
      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
        <Target className="w-3 h-3 text-cyan-400 shrink-0" />
        <p className="text-[10px] text-cyan-300 font-semibold">{insight.action}</p>
      </div>
    </div>
  );
}

// ── 주간 갭 미니 차트 ──────────────────────────────────────

function WeeklyGapMini({ data }: { data: WeeklyGapItem[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.bestPlayer, d.me, d.similarAI]));
  const minVal = Math.min(...data.flatMap((d) => [d.me]));
  const range = maxVal - Math.min(minVal, 0);

  const toY = (v: number) => {
    const pct = (v - Math.min(minVal, 0)) / range;
    return 44 - pct * 40;
  };

  const points = (key: keyof WeeklyGapItem) =>
    data.map((d, i) => `${(i / (data.length - 1)) * 200},${toY(d[key] as number)}`).join(' ');

  return (
    <div className="bg-[#111] rounded-xl p-3 border border-white/5">
      <p className="text-[10px] text-gray-500 mb-2 font-semibold">주간 수익률 비교 (실전 시뮬레이션)</p>
      <svg viewBox="0 0 200 48" className="w-full h-10" preserveAspectRatio="none">
        {/* 0선 */}
        <line x1="0" y1={toY(0)} x2="200" y2={toY(0)} stroke="#ffffff10" strokeWidth="1" />
        {/* 최고 투자자 */}
        <polyline points={points('bestPlayer')} fill="none" stroke="#eab308" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 2" />
        {/* 유사 AI */}
        <polyline points={points('similarAI')} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" />
        {/* 나 */}
        <polyline points={points('me')} fill="none" stroke="#ffffff" strokeWidth="2" />
        {/* 나 점 */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 200}
            cy={toY(d.me)}
            r="2.5"
            fill="#ffffff"
          />
        ))}
      </svg>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-white rounded" /><span className="text-[9px] text-gray-400">나</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-cyan-400 rounded" /><span className="text-[9px] text-gray-400">유사 AI</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-400 rounded opacity-60" style={{ borderTop: '1px dashed' }} /><span className="text-[9px] text-gray-400">최고 투자자</span></div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────

export function GapAnalysisSection({ gapAnalysis }: GapAnalysisSectionProps) {
  const { me, bestPlayer, similarAI, weeklyGap, insights } = gapAnalysis;
  const maxProfit = Math.max(bestPlayer.profitRate, similarAI.profitRate, me.profitRate) + 5;
  const gapToBest = (bestPlayer.profitRate - me.profitRate).toFixed(1);
  const gapToAI = (me.profitRate - similarAI.profitRate).toFixed(1);
  const isAheadOfAI = me.profitRate >= similarAI.profitRate;

  return (
    <section className="mt-6">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          나의 투자 갭 분석
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">실전 시뮬레이션 기준 · 방향성 파악</p>
      </div>

      {/* 수익률 비교 바 */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 mb-3">
        <p className="text-xs text-gray-500 mb-3 font-semibold">이번 주 수익률 비교</p>
        <div className="space-y-2.5">
          <CompareBar label="최고 투자자" value={bestPlayer.profitRate} maxValue={maxProfit} color="bg-gradient-to-r from-yellow-400 to-orange-400" />
          <CompareBar label={`${similarAI.name} AI`} value={similarAI.profitRate} maxValue={maxProfit} color="bg-gradient-to-r from-cyan-400 to-blue-400" />
          <CompareBar label="나" value={me.profitRate} maxValue={maxProfit} color="bg-gradient-to-r from-white/60 to-white/40" isMe />
        </div>

        {/* 갭 요약 */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="bg-yellow-500/8 rounded-xl p-2.5 border border-yellow-500/15">
            <p className="text-[10px] text-yellow-400/70 mb-0.5">최고 투자자와 갭</p>
            <p className="text-base font-black text-yellow-300">-{gapToBest}%p</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{bestPlayer.keyDiff}</p>
          </div>
          <div className={cn(
            'rounded-xl p-2.5 border',
            isAheadOfAI
              ? 'bg-green-500/8 border-green-500/15'
              : 'bg-cyan-500/8 border-cyan-500/15'
          )}>
            <p className="text-[10px] text-cyan-400/70 mb-0.5">유사 AI와 갭</p>
            <p className={cn('text-base font-black', isAheadOfAI ? 'text-green-300' : 'text-cyan-300')}>
              {isAheadOfAI ? '+' : ''}{gapToAI}%p
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{similarAI.label} · {similarAI.strategy}</p>
          </div>
        </div>
      </div>

      {/* 주간 추이 차트 */}
      <WeeklyGapMini data={weeklyGap} />

      {/* 세부 스탯 비교 (나 vs 유사 AI) */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-white">세부 스탯 비교</p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">나</span>
            <span className="text-[10px] text-gray-600">vs</span>
            <span className="text-[10px] text-cyan-400">{similarAI.emoji} {similarAI.name} AI</span>
          </div>
        </div>
        <StatRow label="파도 정확도" me={me.waveAccuracy} other={similarAI.waveAccuracy} />
        <StatRow label="승률" me={me.winRate} other={similarAI.winRate} />
        <StatRow label="평균 보유일" me={me.avgHoldDays} other={similarAI.avgHoldDays} unit="일" />
      </div>

      {/* 인사이트 & 방향성 */}
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <InsightCard key={insight.type} insight={insight} />
        ))}
      </div>
    </section>
  );
}
