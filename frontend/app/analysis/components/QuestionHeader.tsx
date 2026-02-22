"use client";

import { LABELS } from "../config";

interface QuestionHeaderProps {
  current: number;
  total: number;
  score: number;
  isChart: boolean;
}

export default function QuestionHeader({
  current,
  total,
  score,
  isChart,
}: QuestionHeaderProps) {
  const pct = (current / total) * 100;

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isChart
                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                : "border-purple-500/50 text-purple-400 bg-purple-500/10"
            }`}
          >
            {isChart ? LABELS.chartBadge : LABELS.theoryBadge}
          </span>
          <span className="text-white/50 text-xs font-bold">
            {current} / {total}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-white font-black text-sm">{score}</span>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isChart
              ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"
              : "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
