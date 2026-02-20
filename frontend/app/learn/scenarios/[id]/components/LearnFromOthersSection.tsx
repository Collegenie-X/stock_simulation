'use client';

import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import {
  INVESTOR_DNA_MAP,
  getOtherAIs,
  getAIPersonality,
  type AIStrategy,
  type InvestorPersonality,
} from '@/data/legendary-scenarios';

export function LearnFromOthersSection({
  aiStrategies,
  userPersonality,
}: {
  aiStrategies: AIStrategy[]
  userPersonality: InvestorPersonality
}) {
  const otherAIs = getOtherAIs(aiStrategies, userPersonality);
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

  const bgColors: Record<string, string> = {
    green: "from-green-600 to-green-700",
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-amber-400" />
        다른 성향에서 배우기
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        나의 <span className="text-cyan-400 font-bold">{myDNA.label}</span> 성향에는 없는,
        다른 성향의 장점을 배워보세요
      </p>

      <div className="space-y-3">
        {otherAIs.map((ai) => (
            <div
              key={ai.name}
              className={cn(
                "rounded-xl p-4 text-white relative overflow-hidden bg-gradient-to-br",
                bgColors[ai.color as keyof typeof bgColors]
              )}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-4 -mt-4" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ai.emoji}</span>
                    <div>
                      <p className="text-sm font-bold">{ai.name}</p>
                      <p className="text-[10px] opacity-70">{ai.type} 전략</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-2 py-1 rounded-lg",
                    ai.returnRate.startsWith("+") ? "bg-white/20" : "bg-red-900/40"
                  )}>
                    {ai.returnRate}
                  </span>
                </div>

                <div className="bg-white/10 rounded-lg p-2.5 space-y-1.5 mb-2">
                  {ai.actions.map((action, idx) => (
                    <p key={idx} className="text-[10px] opacity-80">• {action}</p>
                  ))}
                </div>

                <div className="bg-white/10 rounded-lg p-2.5">
                  <p className="text-[10px] opacity-70 mb-0.5">
                    {myDNA.label} 성향인 내가 배울 점
                  </p>
                  <p className="text-xs font-bold">
                    {getAIPersonality(ai.type) === "aggressive"
                      ? "과감한 진입 타이밍과 빠른 판단력을 참고하되, 리스크 관리는 나의 방식을 유지하세요"
                      : getAIPersonality(ai.type) === "conservative"
                      ? "손절 기준의 철저함과 인내심을 배우되, 기회를 놓치지 않는 유연성을 더하세요"
                      : "상황에 따른 유연한 전환 능력과 분산 투자의 지혜를 참고하세요"
                    }
                  </p>
                </div>
              </div>
            </div>
        ))}
      </div>
    </section>
  );
}
