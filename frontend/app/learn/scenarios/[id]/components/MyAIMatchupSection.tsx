'use client';

import { cn } from '@/lib/utils';
import { Swords } from 'lucide-react';
import {
  INVESTOR_DNA_MAP,
  getMatchedAI,
  getOtherAIs,
  type AIStrategy,
  type InvestorPersonality,
} from '@/data/legendary-scenarios';

export function MyAIMatchupSection({
  aiStrategies,
  userPersonality,
}: {
  aiStrategies: AIStrategy[]
  userPersonality: InvestorPersonality
}) {
  const myDNA = INVESTOR_DNA_MAP[userPersonality];
  const matchedAI = getMatchedAI(aiStrategies, userPersonality);
  const otherAIs = getOtherAIs(aiStrategies, userPersonality);

  if (!matchedAI) return null;

  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Swords className="w-4 h-4 text-cyan-400" />
        나의 성향 AI 대결
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        당신과 같은 <span className="text-cyan-400 font-bold">{myDNA.label}</span> 성향의 AI는
        이 상황에서 어떻게 대처했을까요?
      </p>

      {/* 대결 매치업 카드 */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          {/* VS 매치업 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center flex-1">
              <div className="w-14 h-14 bg-cyan-500/20 border-2 border-cyan-400/40 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                👤
              </div>
              <p className="text-sm font-bold text-white">나</p>
              <p className="text-[10px] text-cyan-400">{myDNA.label} 투자자</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Swords className="w-6 h-6 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">VS</span>
            </div>

            <div className="text-center flex-1">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 border-2",
                myDNA.borderColor,
                `bg-gradient-to-br ${myDNA.bgGradient}`
              )}>
                {matchedAI.emoji}
              </div>
              <p className="text-sm font-bold text-white">{matchedAI.name}</p>
              <p className={cn("text-[10px] font-bold", myDNA.color)}>AI {myDNA.label}</p>
            </div>
          </div>

          {/* 매칭 AI 전략 */}
          <div className={cn(
            "rounded-xl p-3 border mb-3",
            myDNA.borderColor,
            "bg-white/5"
          )}>
            <p className="text-[10px] font-bold text-gray-400 mb-2">
              {myDNA.label} AI의 대처 전략
            </p>
            {matchedAI.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs mb-1.5 last:mb-0">
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  myDNA.color, "bg-white/10"
                )}>
                  {idx + 1}
                </div>
                <span className="text-gray-300">{action}</span>
              </div>
            ))}
          </div>

          {/* 결과 */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div>
              <p className="text-[10px] text-gray-400">AI {myDNA.label}의 최종 결과</p>
              <p className="text-xs text-gray-300 mt-0.5">{matchedAI.result}</p>
            </div>
            <div className={cn(
              "text-lg font-bold px-3 py-1 rounded-xl",
              matchedAI.returnRate.startsWith("+") ? "text-green-400 bg-green-500/10" :
              matchedAI.returnRate.startsWith("-") ? "text-red-400 bg-red-500/10" : "text-gray-400"
            )}>
              {matchedAI.returnRate}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
