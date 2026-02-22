'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/mobile-nav';
import { PROFILE_LABELS } from '../../config';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import competeHistory from '@/data/compete-history.json';

const L = PROFILE_LABELS.simulationDetail;

interface Trade {
  date: string;
  action: 'buy' | 'sell';
  stock: string;
  price: number;
  shares: number;
  amount: number;
  profit?: number;
  wavePoint: string;
}

interface Simulation {
  id: string;
  date: string;
  weekLabel: string;
  scenarioName: string;
  stocks: string[];
  profitRate: number;
  profitAmount: number;
  finalAssets: number;
  startAssets: number;
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
  trades: Trade[];
  dailyReturns: number[];
}

function DailyReturnBar({ returns }: { returns: number[] }) {
  const maxAbs = Math.max(...returns.map(Math.abs), 1);
  return (
    <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
      <h4 className="text-sm font-semibold text-gray-400 mb-3">{L.dailyReturnsTitle}</h4>
      <div className="flex items-end gap-1 h-20">
        {returns.map((r, i) => {
          const heightPct = Math.max(5, (Math.abs(r) / maxAbs) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className={cn("text-xs font-bold", r >= 0 ? "text-red-400" : "text-blue-400")}>
                {r >= 0 ? "+" : ""}{r}
              </span>
              <div
                className={cn("w-full rounded-t-sm", r >= 0 ? "bg-red-400" : "bg-blue-400")}
                style={{ height: `${heightPct * 0.6}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>1일</span>
        <span>{returns.length}일</span>
      </div>
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.action === 'buy';
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5",
        isBuy ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
      )}>
        {isBuy ? L.buyLabel : L.sellLabel}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-bold text-white">{trade.stock}</span>
          <span className="text-xs text-gray-400">{trade.date}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{trade.shares}주 × {formatNumber(trade.price)}원</span>
          {trade.profit != null && (
            <span className={cn("font-semibold", trade.profit >= 0 ? "text-red-400" : "text-blue-400")}>
              {trade.profit >= 0 ? "+" : ""}{formatNumber(trade.profit)}원
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-cyan-400">{trade.wavePoint}</span>
        </div>
      </div>
    </div>
  );
}

export default function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const sim = (competeHistory.simulations as Simulation[]).find((s) => s.id === id);

  if (!sim) {
    return (
      <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">시뮬레이션을 찾을 수 없습니다.</p>
        <Button variant="ghost" onClick={() => router.back()} className="text-blue-400">
          돌아가기
        </Button>
      </div>
    );
  }

  const isProfit = sim.result === 'profit';

  return (
    <div className="min-h-screen bg-[#191919] pb-24">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#191919]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white flex-1 truncate">{L.pageTitle}</h1>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-semibold",
            isProfit ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
          )}>
            {sim.weekLabel}
          </span>
        </div>
      </header>

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 결과 헤더 카드 */}
        <section className={cn(
          "mt-4 rounded-3xl p-6 relative overflow-hidden border shadow-2xl",
          isProfit
            ? "bg-gradient-to-br from-red-900/50 to-orange-900/30 border-red-500/20"
            : "bg-gradient-to-br from-blue-900/50 to-indigo-900/30 border-blue-500/20"
        )}>
          <div className="absolute top-0 right-0 text-8xl opacity-5 select-none font-bold">
            {isProfit ? "↑" : "↓"}
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">{sim.scenarioName}</p>
            <h2 className={cn("text-4xl font-bold mb-1", isProfit ? "text-red-400" : "text-blue-400")}>
              {isProfit ? "+" : ""}{sim.profitRate}%
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              {formatNumber(sim.profitAmount)}원 수익 · 최종 {formatNumber(sim.finalAssets)}원
            </p>

            {/* 하이라이트 */}
            <div className="bg-white/10 rounded-xl p-3 flex items-start gap-2">
              <span className="text-lg">✨</span>
              <p className="text-sm text-white font-medium">{sim.highlight}</p>
            </div>
          </div>
        </section>

        {/* 핵심 수치 */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-gray-400">{L.waveAccuracyLabel}</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{sim.waveAccuracy}%</p>
          </div>
          <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">{L.rankLabel}</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {sim.rank}위
              <span className="text-xs text-gray-500 ml-1">/ {sim.totalUsers.toLocaleString()}명</span>
            </p>
          </div>
          <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">수익일 / 손실일</p>
            </div>
            <p className="text-lg font-bold text-white">
              <span className="text-red-400">{sim.winDays}일</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-blue-400">{sim.loseDays}일</span>
            </p>
          </div>
          <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400">상위 퍼센타일</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">상위 {(100 - sim.percentile).toFixed(1)}%</p>
          </div>
        </section>

        {/* 종목 */}
        <section className="mt-4">
          <p className="text-xs text-gray-500 mb-2 px-1">거래 종목</p>
          <div className="flex gap-2">
            {sim.stocks.map((s) => (
              <span key={s} className="bg-[#252525] text-sm font-semibold text-white rounded-xl px-3 py-2 border border-white/5">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* 일별 수익률 차트 */}
        <section className="mt-4">
          <DailyReturnBar returns={sim.dailyReturns} />
        </section>

        {/* 거래 내역 */}
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">{L.tradesTitle}</h3>
          <div className="bg-[#252525] rounded-2xl px-4 border border-white/5">
            {sim.trades.map((trade, i) => (
              <TradeRow key={i} trade={trade} />
            ))}
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
