'use client';

import { type ProfitScenario as ProfitScenarioType } from '@/data/chart-patterns';
import { TrendingUp, TrendingDown, DollarSign, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatKRW, formatPrice } from '@/lib/format';

interface ProfitScenarioProps {
  scenario: ProfitScenarioType;
}

export function ProfitScenario({ scenario }: ProfitScenarioProps) {
  const { stock, entryPrice, shares, targetPrice, stopLoss, entryNote, signalType } = scenario;

  const investAmount = entryPrice * shares;
  const isBuy = signalType === 'buy';

  const profit = isBuy
    ? (targetPrice - entryPrice) * shares
    : (entryPrice - targetPrice) * shares;
  const loss = isBuy
    ? (entryPrice - stopLoss) * shares
    : (stopLoss - entryPrice) * shares;

  const profitPct = isBuy
    ? ((targetPrice - entryPrice) / entryPrice) * 100
    : ((entryPrice - targetPrice) / entryPrice) * 100;
  const lossPct = isBuy
    ? ((entryPrice - stopLoss) / entryPrice) * 100
    : ((stopLoss - entryPrice) / entryPrice) * 100;

  const riskReward = loss > 0 ? (profit / loss).toFixed(1) : '-';

  const rewardBarWidth = Math.min((profit / (profit + loss)) * 100, 100);

  return (
    <div className="space-y-3">
      {/* 매매 진입 정보 */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="text-xs font-bold text-indigo-400">투자 시나리오 — {stock}</p>
        </div>

        {/* 진입 조건 */}
        <div className="bg-black/30 rounded-lg px-3 py-2 mb-3">
          <p className="text-[9px] text-gray-500 mb-0.5">진입 조건</p>
          <p className="text-xs text-white font-medium">{entryNote}</p>
        </div>

        {/* 3열 정보 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-500 mb-0.5">{isBuy ? '매수가' : '매도가'}</p>
            <p className="text-xs font-bold text-white">{formatPrice(entryPrice)}</p>
          </div>
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-500 mb-0.5">수량</p>
            <p className="text-xs font-bold text-white">{shares}주</p>
          </div>
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-500 mb-0.5">투자금</p>
            <p className="text-xs font-bold text-white">{formatKRW(investAmount)}</p>
          </div>
        </div>

        {/* 목표가 & 손절가 */}
        <div className="grid grid-cols-2 gap-2">
          <div className={cn(
            'rounded-xl p-3 border',
            isBuy ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30',
          )}>
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingUp className={cn('w-3 h-3', isBuy ? 'text-green-400' : 'text-red-400')} />
              <p className={cn('text-[9px] font-bold', isBuy ? 'text-green-400' : 'text-red-400')}>
                목표가 달성 시
              </p>
            </div>
            <p className={cn('text-sm font-bold', isBuy ? 'text-green-400' : 'text-red-400')}>
              +{formatKRW(profit)}
            </p>
            <p className={cn('text-[10px] mt-0.5', isBuy ? 'text-green-400' : 'text-red-400')}>
              {formatPrice(targetPrice)} (+{profitPct.toFixed(1)}%)
            </p>
          </div>

          <div className="bg-red-500/5 rounded-xl p-3 border border-red-900/30">
            <div className="flex items-center gap-1 mb-1.5">
              <ShieldAlert className="w-3 h-3 text-red-400/70" />
              <p className="text-[9px] font-bold text-red-400/70">손절가 도달 시</p>
            </div>
            <p className="text-sm font-bold text-red-400/80">
              -{formatKRW(loss)}
            </p>
            <p className="text-[10px] text-red-400/70 mt-0.5">
              {formatPrice(stopLoss)} (-{lossPct.toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      {/* 리스크/리워드 비율 */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-400">리스크 대비 수익 비율</p>
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            Number(riskReward) >= 2
              ? 'bg-green-500/15 text-green-400'
              : Number(riskReward) >= 1.5
              ? 'bg-yellow-500/15 text-yellow-400'
              : 'bg-red-500/15 text-red-400',
          )}>
            1 : {riskReward}
          </span>
        </div>

        {/* 바 시각화 */}
        <div className="h-3 rounded-full overflow-hidden bg-red-900/30 flex">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
            style={{ width: `${rewardBarWidth}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-red-400">손실 {lossPct.toFixed(1)}%</span>
          <span className={cn('text-[9px]', isBuy ? 'text-green-400' : 'text-red-400')}>
            수익 {profitPct.toFixed(1)}%
          </span>
        </div>

        {/* 조언 */}
        <div className={cn(
          'mt-3 rounded-lg p-2.5 border',
          Number(riskReward) >= 2
            ? 'bg-green-500/5 border-green-500/15'
            : 'bg-yellow-500/5 border-yellow-500/15',
        )}>
          <p className={cn(
            'text-[10px] leading-relaxed',
            Number(riskReward) >= 2 ? 'text-green-400' : 'text-yellow-400',
          )}>
            {Number(riskReward) >= 2
              ? `✅ 리스크 1에 수익 ${riskReward}! 좋은 비율이에요. 손절가를 지키면 기댓값이 플러스예요.`
              : `⚠️ 리스크 1에 수익 ${riskReward}. 손절가를 반드시 지켜야 해요.`}
          </p>
        </div>
      </div>

      {/* 실제 사례 해설 */}
      <div className="bg-[#1a1a2e] rounded-xl p-3.5 border border-white/5">
        <p className="text-[9px] text-gray-500 mb-2">📖 어떻게 수익이 나는 걸까요?</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-indigo-400 shrink-0 mt-0.5">①</span>
            <p className="text-[10px] text-gray-300">
              {isBuy
                ? `패턴 완성 시 ${formatPrice(entryPrice)}에 ${shares}주 매수 → 투자금 ${formatKRW(investAmount)}`
                : `패턴 완성 시 ${formatPrice(entryPrice)}에 ${shares}주 매도 → 투자금 ${formatKRW(investAmount)}`}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-indigo-400 shrink-0 mt-0.5">②</span>
            <p className="text-[10px] text-gray-300">
              {isBuy
                ? `목표가 ${formatPrice(targetPrice)} 도달 시 매도 → 수익 +${formatKRW(profit)}`
                : `목표가 ${formatPrice(targetPrice)} 도달 시 매수 → 수익 +${formatKRW(profit)}`}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-red-400 shrink-0 mt-0.5">③</span>
            <p className="text-[10px] text-gray-300">
              반대로 가면 손절가 {formatPrice(stopLoss)} 에서 손절 → 최대 손실 -{formatKRW(loss)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
