'use client';

import { LEARNING_PROCESS_STEPS } from '@/data/legendary-scenarios';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LearningProcessSteps() {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-bold text-white mb-3">
        🎯 사고 대처 능력 학습 프로세스
      </h3>
      <div className="space-y-2">
        {LEARNING_PROCESS_STEPS.map((step, idx) => (
          <div
            key={step.step}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all',
              idx === 0 && 'bg-purple-500/10 border-purple-500/20',
              idx === 1 && 'bg-orange-500/10 border-orange-500/20',
              idx === 2 && 'bg-cyan-500/10 border-cyan-500/20',
              idx === 3 && 'bg-green-500/10 border-green-500/20'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
              {step.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{step.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{step.description}</p>
            </div>
            {idx < LEARNING_PROCESS_STEPS.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
