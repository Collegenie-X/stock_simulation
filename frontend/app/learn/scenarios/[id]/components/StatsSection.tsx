'use client';

import { BarChart3, Trophy } from 'lucide-react';
import type { LegendaryScenario } from '@/data/legendary-scenarios';

export function StatsSection({ scenario }: { scenario: LegendaryScenario }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        시나리오 통계
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
          <div className="text-2xl font-bold text-white mb-1">{scenario.stats.avgClearRate}%</div>
          <p className="text-[10px] text-gray-400">평균 클리어율</p>
        </div>
        <div className="bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
          <div className="text-2xl font-bold text-white mb-1">{scenario.stats.avgSurvivalRate}%</div>
          <p className="text-[10px] text-gray-400">생존율</p>
        </div>
        <div className="bg-[#252525] rounded-xl p-3 border border-white/5 text-center">
          <div className="text-lg font-bold text-yellow-400 mb-1">
            <Trophy className="w-5 h-5 mx-auto" />
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">{scenario.stats.bestStrategy}</p>
        </div>
      </div>
    </section>
  );
}
