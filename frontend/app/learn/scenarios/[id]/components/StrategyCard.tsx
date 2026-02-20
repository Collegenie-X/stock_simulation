'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SolutionStrategy } from '@/data/legendary-scenarios';

export function StrategyCard({ strategy }: { strategy: SolutionStrategy }) {
  const [open, setOpen] = useState(false);

  const riskColors = {
    "낮음": "text-green-400 bg-green-500/10 border-green-500/20",
    "보통": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    "높음": "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "bg-[#252525] rounded-xl border border-white/5 overflow-hidden transition-all",
        open && "border-white/10"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{strategy.emoji}</div>
          <div>
            <p className="font-bold text-white text-sm">{strategy.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{strategy.description}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div className="flex gap-2">
            <span className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-md border",
              riskColors[strategy.risk]
            )}>
              리스크: {strategy.risk}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              예상 수익: {strategy.expectedReturn}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              난이도 {'⭐'.repeat(strategy.difficulty)}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-300">실행 단계</p>
            {strategy.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
