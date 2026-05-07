"use client";

import { useEffect, useState } from "react";
import { LABELS, PERSONALITY_META } from "../config";
import type { PersonalityType } from "../types";

interface QuestionHeaderProps {
  current: number;
  total: number;
  score: number;
  isChart: boolean;
  combo?: number;
  level?: number;
  leadingType?: PersonalityType | null;
}

function useCountUp(target: number, duration = 500) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    const start = val;
    const diff = target - start;
    if (diff === 0) return;
    const startTs = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(start + diff * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

export default function QuestionHeader({
  current,
  total,
  score,
  isChart,
  combo = 0,
  level = 1,
  leadingType = null,
}: QuestionHeaderProps) {
  const pct = (current / total) * 100;
  const animatedScore = useCountUp(score);
  const leadMeta = leadingType ? PERSONALITY_META[leadingType] : null;

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isChart
                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                : "border-purple-500/50 text-purple-400 bg-purple-500/10"
            }`}
          >
            {isChart ? LABELS.chartBadge : LABELS.theoryBadge}
          </span>
          <span className="text-[11px] font-black text-yellow-300 bg-yellow-500/10 border border-yellow-500/40 px-2 py-1 rounded-full">
            Lv.{level}
          </span>
          <span className="text-white/50 text-xs font-bold">
            {current}/{total}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {combo >= 2 && (
            <div className="flex items-center gap-1 bg-orange-500/15 border border-orange-500/50 rounded-full px-2 py-1 animate-bounceIn">
              <span className="text-sm animate-flameJitter inline-block">🔥</span>
              <span className="text-[11px] font-black text-orange-300">x{combo}</span>
            </div>
          )}
          {leadMeta && (
            <div
              className={`flex items-center gap-1 ${leadMeta.bg} border ${leadMeta.border} rounded-full px-2 py-1`}
              title={leadMeta.label}
            >
              <span className="text-sm">{leadMeta.emoji}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-white font-black text-sm tabular-nums">{animatedScore}</span>
          </div>
        </div>
      </div>

      {/* progress bar with segments */}
      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isChart
              ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"
              : "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            left: `calc(${pct}% - 32px)`,
            transition: "left 0.7s ease-out",
          }}
        />
      </div>
    </div>
  );
}
