'use client';

import { useState } from 'react';
import { ChevronDown, Waves, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const WAVE_READING_STEPS = [
  {
    step: 1,
    emoji: '🌊',
    icon: Waves,
    title: '파도 흐름 파악하기',
    description: '상승/하락의 큰 흐름을 먼저 읽어요',
    tip: '급등락에 흔들리지 말고 전체 방향성을 봐요',
    color: 'border-cyan-500/30 bg-cyan-500/8',
  },
  {
    step: 2,
    emoji: '📊',
    icon: TrendingUp,
    title: '전환점 포착하기',
    description: '파도가 바뀌는 순간을 감지해요',
    tip: '거래량과 패턴 변화에 주목하세요',
    color: 'border-purple-500/30 bg-purple-500/8',
  },
  {
    step: 3,
    emoji: '🎯',
    icon: Target,
    title: 'AI와 갭 비교하기',
    description: '유사 AI 대비 나의 판단을 점검해요',
    tip: '갭이 클수록 개선 포인트가 명확해요',
    color: 'border-orange-500/30 bg-orange-500/8',
  },
  {
    step: 4,
    emoji: '⚡',
    icon: Zap,
    title: '실전 감각 키우기',
    description: '반복 연습으로 파도 읽기 정확도를 높여요',
    tip: '70% 이상이면 실전 준비 완료!',
    color: 'border-green-500/30 bg-green-500/8',
  },
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
          🌊 파도 읽기 연습 프로세스 <span className="text-gray-500 font-normal text-xs">({WAVE_READING_STEPS.length}단계)</span>
        </h3>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {WAVE_READING_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className={cn(
                  'rounded-xl border overflow-hidden',
                  step.color
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{step.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 shrink-0">0{idx + 1}</span>
                </div>
                <div className="px-3 pb-2.5">
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5">
                    <span className="text-[10px]">💡</span>
                    <p className="text-[10px] text-gray-300">{step.tip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
