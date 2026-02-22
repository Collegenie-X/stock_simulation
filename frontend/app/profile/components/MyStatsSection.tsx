'use client';

import { PROFILE_LABELS } from '../config';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';

const L = PROFILE_LABELS.myStats;

interface MyStatsSectionProps {
  profitRate: number;
  winRate: number;
  rank: number;
  bestRank: number;
  totalAssets: number;
}

interface StatRowProps {
  label: string;
  value: React.ReactNode;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export function MyStatsSection({ profitRate, winRate, rank, bestRank, totalAssets }: MyStatsSectionProps) {
  const profitPos = profitRate >= 0;

  return (
    <section className="mt-5">
      <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">{L.title}</p>
      <div className="bg-[#252525] rounded-2xl px-4 border border-white/5">
        <StatRow
          label={L.profitRate}
          value={
            <span className={profitPos ? "text-red-400" : "text-blue-400"}>
              {profitPos ? "+" : ""}{profitRate}%
            </span>
          }
        />
        <StatRow
          label={L.winRate}
          value={<span className="text-green-400">{winRate}%</span>}
        />
        <StatRow
          label={L.rank}
          value={`${rank.toLocaleString()} ${L.rankUnit}`}
        />
        <StatRow
          label={L.bestRank}
          value={<span className="text-yellow-400">{bestRank} {L.rankUnit}</span>}
        />
        <StatRow
          label={L.totalAssets}
          value={formatKRW(totalAssets)}
        />
      </div>
    </section>
  );
}
