'use client';

import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import { getAIPersonality, type AIStrategy, type InvestorPersonality } from '@/data/legendary-scenarios';

export function ReturnComparisonChart({ aiStrategies, userPersonality }: {
  aiStrategies: AIStrategy[]
  userPersonality: InvestorPersonality
}) {
  const parseRate = (rate: string): number => {
    return parseFloat(rate.replace('%', '').replace('+', ''));
  };

  const maxAbs = Math.max(...aiStrategies.map(ai => Math.abs(parseRate(ai.returnRate))), 1);

  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        성향별 수익률 비교
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        같은 상황에서 성향에 따라 결과가 이렇게 달라집니다
      </p>

      <div className="bg-[#252525] rounded-xl p-4 border border-white/5 space-y-4">
        {aiStrategies.map((ai) => {
          const rate = parseRate(ai.returnRate);
          const isPositive = rate >= 0;
          const barWidth = Math.min(Math.abs(rate) / maxAbs * 100, 100);
          const isMyType = getAIPersonality(ai.type) === userPersonality;

          return (
            <div key={ai.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ai.emoji}</span>
                  <span className="text-xs font-bold text-white">{ai.type}</span>
                  {isMyType && (
                    <span className="text-[8px] font-bold bg-cyan-500 text-white px-1.5 py-0.5 rounded-full">
                      나의 성향
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {ai.returnRate}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isPositive ? "bg-gradient-to-r from-green-500 to-green-400" : "bg-gradient-to-r from-red-600 to-red-400",
                    isMyType && "ring-1 ring-cyan-400/50"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* 핵심 인사이트 */}
        <div className="pt-3 border-t border-white/5">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-[10px] font-bold text-yellow-400 mb-1">인사이트</p>
            <p className="text-[10px] text-gray-300 leading-relaxed">
              {(() => {
                const sorted = [...aiStrategies].sort(
                  (a, b) => parseRate(b.returnRate) - parseRate(a.returnRate)
                );
                const best = sorted[0];
                const worst = sorted[sorted.length - 1];
                return `${best.type}(${best.returnRate})이 가장 높은 수익을, ${worst.type}(${worst.returnRate})이 가장 낮은 결과를 기록했습니다. 성향에 따라 같은 상황에서도 큰 차이가 발생합니다.`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
