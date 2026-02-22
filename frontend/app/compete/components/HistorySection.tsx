'use client';

import { useState } from 'react';
import { ChevronDown, Trophy, Sword, Waves, FlaskConical, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';

// ── Types ──────────────────────────────────────────────────

interface SimulationRecord {
  id: string;
  date: string;
  weekLabel: string;
  scenarioName: string;
  stocks: string[];
  profitRate: number;
  profitAmount: number;
  finalAssets: number;
  result: 'profit' | 'loss';
  style: string;
  rank: number;
  totalUsers: number;
  percentile: number;
  waveAccuracy: number;
  tradeCount: number;
  highlight: string;
  winDays: number;
  loseDays: number;
}

interface PracticeRecord {
  id: string;
  date: string;
  stock?: string;
  stockName?: string;
  stockEmoji?: string;
  patternName: string;
  patternEmoji: string;
  rounds: number;
  totalScore: number;
  maxScore: number;
  grade: string;
  stars: number;
  profitPct?: number;
  avgTurnScore: number;
  bestRound: number;
  highlight: string;
  isExperiment: boolean;
  wave3Accuracy?: number;
  correctionAccuracy?: number;
  roundResults: Array<{ round: number; score: number; grade: string; pnl: number; emoji: string }>;
}

interface RankTrendItem {
  week: string;
  rank: number;
  profitRate: number;
}

interface HistorySectionProps {
  simulations: SimulationRecord[];
  stockPractice: PracticeRecord[];
  wavePractice: PracticeRecord[];
  rankTrend: RankTrendItem[];
}

// ── Grade Config ───────────────────────────────────────────

const GRADE_STYLES: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  A: 'bg-green-500/20 text-green-300 border-green-500/40',
  B: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  C: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  D: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STYLE_LABEL: Record<string, { label: string; color: string }> = {
  aggressive: { label: '공격형', color: 'text-red-400' },
  conservative: { label: '안정형', color: 'text-green-400' },
  moderate: { label: '균형형', color: 'text-blue-400' },
}

// ── Sub-components ──────────────────────────────────────────

function StarRow({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn('w-3.5 h-3.5', i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700')}
        />
      ))}
    </div>
  );
}

function RankFlare({ rank, total }: { rank: number; total: number }) {
  const pct = (((total - rank) / total) * 100).toFixed(1);
  const isTop = rank <= 20;
  return (
    <div className={cn(
      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black border',
      isTop
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
        : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
    )}>
      {isTop && <span>👑</span>}
      <span>{rank}위</span>
      <span className="text-white/40">·</span>
      <span>상위 {pct}%</span>
    </div>
  );
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 85 ? 'from-yellow-400 to-orange-400' : pct >= 70 ? 'from-green-400 to-emerald-500' : pct >= 55 ? 'from-blue-400 to-indigo-500' : 'from-gray-500 to-gray-600';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full bg-gradient-to-r rounded-full', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white tabular-nums">{score}<span className="text-gray-600">/{max}</span></span>
    </div>
  );
}

// ── Simulation Card ─────────────────────────────────────────

function SimulationCard({ item }: { item: SimulationRecord }) {
  const isProfit = item.result === 'profit';
  const styleInfo = STYLE_LABEL[item.style] ?? STYLE_LABEL.aggressive;

  return (
    <Link href={`/compete/result/simulation/${item.id}`}>
      <div className={cn(
        'rounded-2xl p-4 border cursor-pointer active:scale-[0.98] transition-all duration-150 relative overflow-hidden',
        isProfit ? 'bg-[#0e1e16] border-green-500/20' : 'bg-[#1e0e0e] border-red-500/20'
      )}>
        {/* 실험 뱃지 */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-gray-400">{item.weekLabel}</span>
              <span className={cn('text-xs font-bold', styleInfo.color)}>{styleInfo.label}</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{item.scenarioName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.stocks.join(' · ')} · {item.tradeCount}회</p>
          </div>
          <div className="text-right shrink-0">
            {isProfit
              ? <p className="text-xl font-black text-red-400">+{item.profitRate}%</p>
              : <p className="text-xl font-black text-blue-400">{item.profitRate}%</p>
            }
            <p className="text-xs text-gray-500 mt-0.5">{formatNumber(item.finalAssets)}원</p>
          </div>
        </div>

        {/* 랭킹 + 파도 정확도 */}
        <div className="flex items-center justify-between gap-2">
          <RankFlare rank={item.rank} total={item.totalUsers} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-bold">{item.waveAccuracy}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-400">{item.winDays}승</span>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-red-400">{item.loseDays}패</span>
            </div>
          </div>
        </div>

        {/* 하이라이트 */}
        <p className={cn('text-xs mt-2 font-semibold', isProfit ? 'text-green-300/70' : 'text-orange-300/70')}>
          {item.highlight}
        </p>

        {/* 우상단 방향 화살표 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100">
          <span className="text-gray-600">›</span>
        </div>
      </div>
    </Link>
  );
}

// ── Practice Card (Stock / Wave) ────────────────────────────

function PracticeCard({ item, type }: { item: PracticeRecord; type: 'stock' | 'wave' }) {
  const gradeStyle = GRADE_STYLES[item.grade] ?? GRADE_STYLES.C;
  const isHighScore = item.totalScore / item.maxScore >= 0.85;

  return (
    <Link href={`/compete/result/${type}/${item.id}`}>
      <div className={cn(
        'rounded-2xl p-4 border cursor-pointer active:scale-[0.98] transition-all duration-150 relative overflow-hidden',
        type === 'stock' ? 'bg-[#110e1e] border-purple-500/20' : 'bg-[#0e1319] border-cyan-500/20'
      )}>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {item.isExperiment && (
                <span className="flex items-center gap-0.5 bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full border border-purple-500/30 font-bold">
                  <FlaskConical className="w-2.5 h-2.5" /> 실험
                </span>
              )}
              <span className="text-xs text-gray-400">{item.date.slice(5)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.patternEmoji}</span>
              {item.stockEmoji && <span className="text-base">{item.stockEmoji}</span>}
              <p className="text-sm font-bold text-white truncate">{item.patternName}</p>
            </div>
            {item.stockName && (
              <p className="text-xs text-gray-400 mt-0.5">{item.stockName} · {item.rounds}라운드</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <span className={cn('text-xs font-black px-2 py-0.5 rounded-lg border', gradeStyle)}>{item.grade}</span>
              <StarRow count={item.stars} />
            </div>
            <p className="text-sm font-bold text-white">{item.totalScore}<span className="text-gray-600 text-xs">/{item.maxScore}</span></p>
          </div>
        </div>

        {/* Score bar */}
        <ScoreBar score={item.totalScore} max={item.maxScore} />

        {/* Round mini badges */}
        <div className="flex gap-1.5 mt-2.5">
          {item.roundResults.map((r) => (
            <div key={r.round} className={cn(
              'flex-1 text-center py-1 rounded-lg border text-[10px] font-black',
              GRADE_STYLES[r.grade] ?? GRADE_STYLES.C
            )}>
              <span>{r.emoji}</span>
              <span className="block">{r.score}점</span>
            </div>
          ))}
        </div>

        {/* 파도 정확도 (wave only) */}
        {item.wave3Accuracy !== undefined && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-bold">3파 {item.wave3Accuracy}%</span>
            </div>
            {item.correctionAccuracy !== undefined && (
              <span className="text-xs text-gray-400">조정 {item.correctionAccuracy}%</span>
            )}
          </div>
        )}

        <p className={cn(
          'text-xs mt-2 font-semibold',
          isHighScore ? 'text-yellow-300/70' : 'text-gray-400'
        )}>
          {item.highlight}
        </p>
      </div>
    </Link>
  );
}

// ── Rank Trend Chart ────────────────────────────────────────

function RankTrendChart({ data }: { data: RankTrendItem[] }) {
  const minRank = Math.min(...data.map((d) => d.rank));
  const maxRank = Math.max(...data.map((d) => d.rank));

  return (
    <div className="bg-[#0d0d1a] rounded-xl p-4 mb-4 border border-white/5">
      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        실전 순위 변화 추이
        <span className="ml-auto text-xs text-gray-500">(실전만 해당)</span>
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rankGradH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis
            reversed
            domain={[minRank - 30, maxRank + 30]}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}위`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: 11 }}
            formatter={(value: number) => [`${value}위`, '순위']}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Area
            type="monotone"
            dataKey="rank"
            stroke="#eab308"
            strokeWidth={2.5}
            fill="url(#rankGradH)"
            dot={{ fill: '#eab308', r: 4, strokeWidth: 2, stroke: '#0d0d1a' }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Accordion Section ───────────────────────────────────────

interface AccordionConfig {
  key: 'simulation' | 'stock' | 'wave';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  accentClass: string;
  borderClass: string;
  badgeText?: string;
  badgeClass?: string;
}

function AccordionSection({
  config,
  open,
  onToggle,
  children,
}: {
  config: AccordionConfig;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border overflow-hidden', config.borderClass)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[#1a1a1a] hover:bg-[#202020] active:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', config.accentClass)}>
            {config.icon}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{config.title}</span>
              {config.badgeText && (
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border', config.badgeClass)}>
                  {config.badgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{config.subtitle} · 최근 {config.count}개</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{open ? '닫기' : '열기'}</span>
          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-300', open && 'rotate-180')} />
        </div>
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-400',
        open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="bg-[#141414] px-4 pt-3 pb-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function HistorySection({ simulations, stockPractice, wavePractice, rankTrend }: HistorySectionProps) {
  const [openSection, setOpenSection] = useState<'simulation' | 'stock' | 'wave' | null>('simulation');

  const toggle = (key: 'simulation' | 'stock' | 'wave') =>
    setOpenSection((prev) => (prev === key ? null : key));

  const simTop3 = simulations.slice(0, 3);
  const stockTop3 = stockPractice.slice(0, 3);
  const waveTop3 = wavePractice.slice(0, 3);

  const sections: AccordionConfig[] = [
    {
      key: 'simulation',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      title: '실전 시뮬레이션',
      subtitle: '랭킹 적용',
      count: simTop3.length,
      accentClass: 'bg-yellow-500/15',
      borderClass: 'border-yellow-500/20',
      badgeText: '🏆 랭킹',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    {
      key: 'stock',
      icon: <Sword className="w-5 h-5 text-purple-400" />,
      title: '한종목 연습',
      subtitle: '점수 기반',
      count: stockTop3.length,
      accentClass: 'bg-purple-500/15',
      borderClass: 'border-purple-500/20',
    },
    {
      key: 'wave',
      icon: <Waves className="w-5 h-5 text-cyan-400" />,
      title: '파도 연습',
      subtitle: '파동 분석',
      count: waveTop3.length,
      accentClass: 'bg-cyan-500/15',
      borderClass: 'border-cyan-500/20',
    },
  ];

  return (
    <section className="mt-6">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">나의 역대 기록</h3>
        <p className="text-sm text-gray-400">투자 패턴 히스토리 · 클릭하면 상세 결과 확인</p>
      </div>

      {/* 순위 추이 차트 (실전만) */}
      <RankTrendChart data={rankTrend} />

      {/* 3섹션 아코디언 */}
      <div className="space-y-3">
        {sections.map((sec) => (
          <AccordionSection
            key={sec.key}
            config={sec}
            open={openSection === sec.key}
            onToggle={() => toggle(sec.key)}
          >
            {sec.key === 'simulation' &&
              simTop3.map((item) => <SimulationCard key={item.id} item={item} />)
            }
            {sec.key === 'stock' &&
              stockTop3.map((item) => <PracticeCard key={item.id} item={item} type="stock" />)
            }
            {sec.key === 'wave' &&
              waveTop3.map((item) => <PracticeCard key={item.id} item={item} type="wave" />)
            }
          </AccordionSection>
        ))}
      </div>

      {/* 랭킹 적용 안내 */}
      <div className="mt-3 bg-[#1a1a1a] rounded-xl p-3 border border-white/5 flex items-start gap-2">
        <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-yellow-400 font-bold">실전 시뮬레이션</span>만 글로벌 랭킹에 반영됩니다.
          한종목 연습과 파도 연습은 점수/패턴 분석 전용입니다.
        </p>
      </div>
    </section>
  );
}
