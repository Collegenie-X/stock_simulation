'use client';

import { type PatternStep } from '@/data/chart-patterns';
import { cn } from '@/lib/utils';

interface PatternStepsProps {
  steps: PatternStep[];
  signal: '매수' | '매도' | '양방향';
}

const PHASE_CONFIG = {
  before: {
    label: '배경',
    borderColor: 'border-slate-600',
    bgColor: 'bg-slate-600/10',
    dotColor: 'bg-slate-500',
    textColor: 'text-slate-400',
    lineColor: 'bg-slate-700',
  },
  forming: {
    label: '형성 중',
    borderColor: 'border-indigo-600',
    bgColor: 'bg-indigo-600/10',
    dotColor: 'bg-indigo-500',
    textColor: 'text-indigo-400',
    lineColor: 'bg-indigo-900',
  },
  signal: {
    label: '신호!',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-400',
    lineColor: 'bg-yellow-900',
  },
  after: {
    label: '결과',
    borderColor: 'border-emerald-600',
    bgColor: 'bg-emerald-600/10',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    lineColor: 'bg-emerald-900',
  },
} as const;

function getSignalStepColors(signal: '매수' | '매도' | '양방향') {
  if (signal === '매수') {
    return {
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500/10',
      dotColor: 'bg-green-400',
      textColor: 'text-green-400',
      glowClass: 'shadow-[0_0_12px_rgba(34,197,94,0.25)]',
    };
  }
  if (signal === '매도') {
    return {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-500/10',
      dotColor: 'bg-red-400',
      textColor: 'text-red-400',
      glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    };
  }
  return {
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-400',
    glowClass: 'shadow-[0_0_12px_rgba(234,179,8,0.25)]',
  };
}

export function PatternSteps({ steps, signal }: PatternStepsProps) {
  const signalColors = getSignalStepColors(signal);

  return (
    <div className="relative">
      {/* 세로 연결선 */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-slate-700 via-indigo-800 to-emerald-800 z-0" />

      <div className="space-y-2 relative z-10">
        {steps.map((step, idx) => {
          const isSignal = step.phase === 'signal';
          const config = PHASE_CONFIG[step.phase];
          const colors = isSignal ? signalColors : null;

          const borderColor = colors?.borderColor ?? config.borderColor;
          const bgColor = colors?.bgColor ?? config.bgColor;
          const dotColor = colors?.dotColor ?? config.dotColor;
          const textColor = colors?.textColor ?? config.textColor;
          const glowClass = isSignal ? (colors?.glowClass ?? '') : '';

          return (
            <div key={idx} className="flex gap-3">
              {/* 스텝 번호 & 점 */}
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-base',
                  'border-2 shrink-0',
                  bgColor,
                  borderColor,
                  isSignal && 'scale-110',
                )}>
                  {step.emoji}
                </div>
              </div>

              {/* 내용 */}
              <div className={cn(
                'flex-1 rounded-xl p-3 border mb-0.5',
                bgColor,
                borderColor,
                glowClass,
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border', bgColor, borderColor, textColor)}>
                    {isSignal ? '⚡ ' : ''}{config.label}
                  </span>
                  <span className="text-[9px] text-gray-500">STEP {idx + 1}</span>
                </div>

                <p className={cn(
                  'text-xs font-bold mb-1',
                  isSignal ? textColor : 'text-white',
                )}>
                  {step.title}
                </p>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {step.priceNote && (
                  <div className={cn(
                    'mt-2 px-2 py-1.5 rounded-lg flex items-center gap-1.5',
                    isSignal ? 'bg-black/30' : 'bg-black/20',
                  )}>
                    <span className="text-[9px]">💰</span>
                    <p className={cn('text-[10px] font-medium', textColor)}>
                      {step.priceNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
