'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { ChevronDown, Trophy, Waves, TrendingUp, TrendingDown, ArrowLeft, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import historyData from '@/data/compete-history.json';

// ── Helpers ──────────────────────────────────────────────────

function fmtPnl(n: number) { return `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}원`; }

function RankFlare({ rank, total }: { rank: number; total: number }) {
  const pct = (((total - rank) / total) * 100).toFixed(1);
  const isTop = rank <= 20;
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black border',
      isTop
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
        : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
    )}>
      {isTop && <span>👑</span>}
      <span>{rank}위</span>
      <span className="text-white/30">·</span>
      <span>상위 {pct}%</span>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function SimulationResultPage() {
  const params = useParams();
  const router = useRouter();
  const [tradesOpen, setTradesOpen] = useState(false);

  const record = historyData.simulations.find((s) => s.id === params.id);

  if (!record) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">기록을 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-blue-400 text-sm">← 돌아가기</button>
      </div>
    );
  }

  const isProfit = record.result === 'profit';
  const totalDays = record.winDays + record.loseDays;
  const profitAmount = record.profitAmount;

  // Daily return 차트 데이터
  const dailyData = record.dailyReturns.map((v, i) => ({
    day: `${i + 1}일`,
    value: v,
    type: v >= 0 ? 'profit' : 'loss',
  }));

  // 누적 수익 곡선 (dailyReturns 누적)
  const cumulativeData = record.dailyReturns.reduce<{ day: string; cumulative: number }[]>((acc, v, i) => {
    const prev = i === 0 ? 0 : acc[i - 1].cumulative;
    acc.push({ day: `${i + 1}일`, cumulative: parseFloat((prev + v).toFixed(2)) });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <span className="text-sm font-black text-white">실전 시뮬레이션 결과</span>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <main className="pt-14 px-4 max-w-md mx-auto">

        {/* Hero Card */}
        <section className="mt-5">
          <div className={cn(
            'rounded-3xl p-6 relative overflow-hidden',
            isProfit
              ? 'bg-gradient-to-br from-[#0a1f12] to-[#112918]'
              : 'bg-gradient-to-br from-[#1f0a0a] to-[#291112]'
          )}>
            <div className="absolute top-0 right-0 text-9xl opacity-5 select-none -mr-4 -mt-4">
              {isProfit ? '🏆' : '💪'}
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{record.weekLabel} · {record.scenarioName}</p>
                  <div className={cn('text-5xl font-black', isProfit ? 'text-red-400' : 'text-blue-400')}>
                    {isProfit ? '+' : ''}{record.profitRate}%
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {fmtPnl(profitAmount)} · 최종 {formatNumber(record.finalAssets)}원
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl mb-2">{isProfit ? '🏆' : '💪'}</div>
                  <RankFlare rank={record.rank} total={record.totalUsers} />
                </div>
              </div>

              {/* 스탯 그리드 */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '거래', value: `${record.tradeCount}회` },
                  { label: '승일', value: `${record.winDays}일`, color: 'text-green-400' },
                  { label: '패일', value: `${record.loseDays}일`, color: 'text-red-400' },
                  { label: '파도', value: `${record.waveAccuracy}%`, color: 'text-cyan-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-black/30 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-500 mb-0.5">{stat.label}</p>
                    <p className={cn('text-sm font-black text-white', stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 누적 수익률 곡선 */}
        <section className="mt-4 bg-[#0f0f0f] rounded-2xl border border-white/5 p-4">
          <p className="text-sm font-bold text-white mb-3">📈 누적 수익률 곡선</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="simCumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isProfit ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isProfit ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: 11 }}
                formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v}%`, '누적 수익률']}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={isProfit ? '#22c55e' : '#ef4444'}
                strokeWidth={2.5}
                fill="url(#simCumGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* 일별 수익/손실 막대 */}
        <section className="mt-3 bg-[#0f0f0f] rounded-2xl border border-white/5 p-4">
          <p className="text-sm font-bold text-white mb-3">📊 일별 수익/손실</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={dailyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: 11 }}
                formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v}%`, '수익률']}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={0} stroke="#ffffff20" />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell key={index} fill={entry.type === 'profit' ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 bg-green-500 rounded-sm" />
              <span className="text-xs text-gray-400">수익 {record.winDays}일</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 bg-red-500 rounded-sm" />
              <span className="text-xs text-gray-400">손실 {record.loseDays}일</span>
            </div>
          </div>
        </section>

        {/* 파도 정확도 */}
        <section className="mt-3 bg-[#0f0f0f] rounded-2xl border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Waves className="w-5 h-5 text-cyan-400" />
            <p className="text-sm font-bold text-white">파도 타기 정확도</p>
            <span className="ml-auto text-lg font-black text-cyan-400">{record.waveAccuracy}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              style={{ width: `${record.waveAccuracy}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {record.waveAccuracy >= 85 ? '🔥 매우 뛰어난 파도 감지 능력!' :
             record.waveAccuracy >= 70 ? '👍 파도 패턴을 잘 포착했어요' :
             '📈 파도 타이밍을 더 연습해 보세요'}
          </p>
        </section>

        {/* 거래 기록 (펼치기/닫기) */}
        <section className="mt-3 bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden">
          <button
            onClick={() => setTradesOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-sm font-bold text-white">📋 거래 기록</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{record.trades.length}건</span>
              <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-300', tradesOpen && 'rotate-180')} />
            </div>
          </button>

          {tradesOpen && (
            <div className="border-t border-white/5 divide-y divide-white/5">
              {record.trades.map((trade, i) => {
                const isBuy = trade.action === 'buy';
                const profit = 'profit' in trade ? (trade.profit as number) : undefined;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={cn(
                      'w-10 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0',
                      isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {isBuy ? '매수' : '매도'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">
                        {trade.stock}
                        <span className="text-xs text-gray-400 font-normal ml-2">
                          {trade.shares}주 × {formatNumber(trade.price)}원
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">{trade.date} · {trade.wavePoint}</p>
                    </div>
                    {profit !== undefined && (
                      <span className={cn('text-sm font-black shrink-0', profit >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {fmtPnl(profit)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 관심 종목 */}
        <section className="mt-3 bg-[#0f0f0f] rounded-2xl border border-white/5 p-4 mb-4">
          <p className="text-sm font-bold text-white mb-2">이번 시뮬레이션 종목</p>
          <div className="flex gap-2 flex-wrap">
            {record.stocks.map((s) => (
              <span key={s} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/10 font-semibold">
                {s}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-full h-14 rounded-2xl font-black text-base text-white bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg"
          >
            🏆 경쟁 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
