'use client';

import { Users, Trophy } from 'lucide-react';
import { COMPETE_LABELS } from '../config';

interface LevelDistribution {
  level: string;
  count: number;
  color: string;
}

interface RealtimeStats {
  totalParticipants: number;
  todayNew: number;
  weeklyAvgReturn: number;
  topReturnThisWeek: number;
}

interface StatsSectionProps {
  stats: RealtimeStats;
  levelDistribution: LevelDistribution[];
}

const L = COMPETE_LABELS.stats;

export function StatsSection({ stats, levelDistribution }: StatsSectionProps) {
  const totalCount = levelDistribution.reduce((sum, l) => sum + l.count, 0);

  return (
    <section className="mt-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-3">{L.title}</h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">{L.participants}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalParticipants.toLocaleString()}명</p>
          <p className="text-xs text-green-400 mt-1">+{stats.todayNew}명 ({L.todayNew})</p>
        </div>

        <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-400">{L.avgReturn}</span>
          </div>
          <p className="text-2xl font-bold text-red-400">+{stats.weeklyAvgReturn}%</p>
          <p className="text-xs text-gray-400 mt-1">{L.weeklyAvg}</p>
        </div>
      </div>

      <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
        <h4 className="text-sm font-bold text-white mb-3">{L.levelDistribution}</h4>
        <div className="space-y-2.5">
          {levelDistribution.map((item) => (
            <div key={item.level} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-12 shrink-0">{item.level}</span>
              <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700`}
                  style={{ width: `${(item.count / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white font-bold w-14 text-right shrink-0">
                {item.count.toLocaleString()}{L.levelUnit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
