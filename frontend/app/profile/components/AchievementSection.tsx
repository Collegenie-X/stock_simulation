'use client';

import { ACHIEVEMENTS } from '../config';
import { cn } from '@/lib/utils';

export function AchievementSection() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked);
  const locked   = ACHIEVEMENTS.filter((a) => !a.unlocked);

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <p className="text-xs text-gray-500 font-medium">
          업적 <span className="text-white font-bold">{unlocked.length}</span> / {ACHIEVEMENTS.length}
        </p>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.id}
            className={cn(
              "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5",
              a.unlocked ? "bg-[#252525] border border-white/10" : "bg-[#1e1e1e] opacity-30"
            )}
          >
            <span className="text-xl">{a.icon}</span>
          </div>
        ))}
      </div>
      {/* 설명 */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ACHIEVEMENTS.map((a) => (
          a.unlocked && (
            <span key={a.id} className="text-xs text-gray-400 bg-white/5 rounded-lg px-2 py-1">
              {a.name}
            </span>
          )
        ))}
      </div>
    </section>
  );
}
