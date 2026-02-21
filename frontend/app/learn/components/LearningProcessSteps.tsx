'use client';

import { useState } from 'react';
import { LEARNING_PROCESS_STEPS } from '@/data/legendary-scenarios';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_COLORS = [
  'border-purple-500/30 bg-purple-500/8',
  'border-orange-500/30 bg-orange-500/8',
  'border-cyan-500/30 bg-cyan-500/8',
  'border-green-500/30 bg-green-500/8',
];

export function LearningProcessSteps() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-sm font-bold text-white">
          🎯 학습 프로세스 <span className="text-gray-500 font-normal text-xs">({LEARNING_PROCESS_STEPS.length}단계)</span>
        </h3>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {LEARNING_PROCESS_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                STEP_COLORS[idx] || 'border-white/10 bg-white/5'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base shrink-0">
                {step.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{step.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{step.description}</p>
              </div>
              <span className="text-[10px] font-bold text-gray-600 shrink-0">0{idx + 1}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
