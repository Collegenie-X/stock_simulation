'use client';

import { Pencil } from 'lucide-react';
import { PROFILE_LABELS, LEVEL_NAMES, LEVEL_EXP } from '../config';

const L = PROFILE_LABELS.hero;

interface ProfileHeroProps {
  nickname: string;
  level: number;
  exp: number;
  badges: string[];
  styleEmoji: string;
  styleLabel: string;
}

export function ProfileHero({ nickname, level, exp, badges, styleEmoji, styleLabel }: ProfileHeroProps) {
  const maxExp = LEVEL_EXP[level] ?? 1000;
  const levelName = LEVEL_NAMES[level] ?? `${level}단계`;
  const expPct = Math.min(100, Math.round((exp / maxExp) * 100));

  return (
    <section className="mt-4 bg-[#252525] rounded-3xl p-5 border border-white/5">
      <div className="flex items-center gap-4">
        {/* 아바타 */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            🌊
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#252525]">
            {level}
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-lg font-bold text-white truncate">{nickname}</h2>
            <button className="text-gray-500 hover:text-white p-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-yellow-400 font-medium">{L.levelUnit} {level} · {levelName}</span>
            <span className="text-sm">{styleEmoji}</span>
            <span className="text-xs text-gray-400">{styleLabel}</span>
          </div>
          {/* 배지 */}
          <div className="flex gap-1 mb-2">
            {badges.map((b, i) => <span key={i} className="text-base">{b}</span>)}
          </div>
          {/* XP 바 */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{L.toNextLevel}</span>
              <span>{exp} / {maxExp} {L.xpUnit}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                style={{ width: `${expPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
