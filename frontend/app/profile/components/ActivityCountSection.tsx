'use client';

import { PROFILE_LABELS } from '../config';

const L = PROFILE_LABELS.activityCount;

interface ActivityCounts {
  simulations: number;
  stockPractice: number;
  wavePractice: number;
  learnChapters: number;
  totalTrades: number;
  achievements: number;
}

interface ActivityCountSectionProps {
  counts: ActivityCounts;
}

export function ActivityCountSection({ counts }: ActivityCountSectionProps) {
  const values: Record<string, number> = {
    simulations:   counts.simulations,
    stockPractice: counts.stockPractice,
    wavePractice:  counts.wavePractice,
    learnChapters: counts.learnChapters,
    totalTrades:   counts.totalTrades,
    achievements:  counts.achievements,
  };

  return (
    <section className="mt-5">
      <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">{L.title}</p>
      <div className="grid grid-cols-3 gap-2">
        {L.items.map((item) => (
          <div
            key={item.key}
            className="bg-[#252525] rounded-2xl p-3 text-center border border-white/5"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xl font-bold text-white mt-1">
              {values[item.key] ?? 0}
              <span className="text-xs text-gray-500 ml-0.5 font-normal">{item.unit}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
