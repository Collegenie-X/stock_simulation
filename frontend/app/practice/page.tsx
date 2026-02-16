'use client';

import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/mobile-nav';
import { storage } from '@/lib/storage';
import { ArrowLeft, Lock, Trophy, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const CAREER_STAGES = [
  {
    id: 1,
    icon: "🌱",
    title: "새싹 투자자",
    subtitle: "매수/매도/스킵의 감각",
    money: "500만원",
    period: "1개월",
    time: "~5분",
    decisions: "22회",
    features: "매수 · 매도 · 스킵",
    color: "from-emerald-600 to-emerald-500",
    bgColor: "bg-emerald-500",
  },
  {
    id: 2,
    icon: "🌿",
    title: "초보 투자자",
    subtitle: "조건부 주문 입문",
    money: "1,000만원",
    period: "2개월",
    time: "~8분",
    decisions: "30회",
    features: "+ 조건부 주문 해금",
    color: "from-green-600 to-green-500",
    bgColor: "bg-green-500",
  },
  {
    id: 3,
    icon: "🌳",
    title: "중급 투자자",
    subtitle: "분할매수 학습",
    money: "5,000만원",
    period: "3개월",
    time: "~10분",
    decisions: "33회",
    features: "+ 분할매수 · 10종목",
    color: "from-blue-600 to-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    id: 4,
    icon: "🏔️",
    title: "고급 투자자",
    subtitle: "추적손절 · 고급 전략",
    money: "1억원",
    period: "3개월",
    time: "~12분",
    decisions: "40회",
    features: "+ 추적손절 · 레버리지",
    color: "from-indigo-600 to-indigo-500",
    bgColor: "bg-indigo-500",
  },
  {
    id: 5,
    icon: "🏅",
    title: "프로 투자자",
    subtitle: "AI 감시 시작",
    money: "5억원",
    period: "6개월",
    time: "~18분",
    decisions: "48회",
    features: "+ AI 감시 · 무제한 종목",
    color: "from-violet-600 to-violet-500",
    bgColor: "bg-violet-500",
  },
  {
    id: 6,
    icon: "👑",
    title: "전설의 투자자",
    subtitle: "모든 기능 개방",
    money: "10억원",
    period: "12개월",
    time: "~28분",
    decisions: "60회",
    features: "완전 자유 · 선물/옵션",
    color: "from-amber-600 to-yellow-500",
    bgColor: "bg-yellow-500",
  },
];

export default function CareerModePage() {
  const [progress, setProgress] = useState<any>(null);
  const [character, setCharacter] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
    setCharacter(storage.getCharacter());
  }, []);

  // 무료 버전: 모든 단계 잠금 해제
  const currentStage = Math.max(progress?.level || 1, 6);

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-24">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex items-center gap-3 sticky top-0 z-10 bg-[#191919]/95 backdrop-blur-lg border-b border-white/5">
        <button
          onClick={() => window.location.href = '/'}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">커리어 모드 🎯 <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30 align-middle">ALL FREE</span></h1>
          <p className="text-xs text-gray-500">1~6단계 모두 무료 · 총 ~81분 · 233회 결정</p>
        </div>
      </div>

      <div className="px-5 mt-6">
        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">현재 진행</div>
              <div className="text-lg font-bold">
                {CAREER_STAGES[Math.min(currentStage - 1, 5)].icon} {CAREER_STAGES[Math.min(currentStage - 1, 5)].title}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">진행률</div>
              <div className="text-lg font-bold text-blue-400">{currentStage}/6 단계</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${((currentStage - 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Career Stages */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-800" />

          <div className="space-y-4">
            {CAREER_STAGES.map((stage) => {
              const isLocked = stage.id > currentStage;
              const isCompleted = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;

              return (
                <div key={stage.id} className="relative flex gap-4">
                  {/* Stage indicator */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 shrink-0 border-2",
                    isCompleted && "bg-emerald-500/20 border-emerald-500",
                    isCurrent && `${stage.bgColor}/20 border-white animate-pulse`,
                    isLocked && "bg-gray-800 border-gray-700"
                  )}>
                    {isLocked ? <Lock className="w-5 h-5 text-gray-600" /> :
                     isCompleted ? <Trophy className="w-5 h-5 text-emerald-400" /> :
                     <span>{stage.icon}</span>}
                  </div>

                  {/* Stage card */}
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        storage.setGameSettings({
                          speedMode: stage.id <= 2 ? "sprint" : stage.id <= 4 ? "standard" : "marathon",
                          timerSeconds: stage.id <= 2 ? 10 : stage.id <= 4 ? 15 : 20,
                          simulationMonths: stage.id === 1 ? 1 : stage.id === 2 ? 2 : stage.id <= 4 ? 3 : stage.id === 5 ? 6 : 12,
                          dailyOpportunities: stage.id <= 2 ? 2 : 3,
                          initialCash: parseInt(stage.money.replace(/[^0-9]/g, '')) * 10000,
                        });
                        window.location.href = `/practice/stock/scenario-${stage.id <= 2 ? '1' : '100days'}`;
                      }
                    }}
                    disabled={isLocked}
                    className={cn(
                      "flex-1 rounded-2xl p-4 border text-left transition-all",
                      isCompleted && "bg-emerald-500/5 border-emerald-500/30",
                      isCurrent && "bg-white/5 border-white/20 shadow-lg",
                      isLocked && "bg-[#1a1a1a] border-transparent opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm">{stage.title}</span>
                        {isCompleted && <span className="ml-2 text-xs text-emerald-400">✓ 완료</span>}
                        {isCurrent && <span className="ml-2 text-xs text-blue-400 animate-pulse">← 진행 중</span>}
                      </div>
                      <span className="text-xs text-gray-500">{stage.money}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{stage.subtitle}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stage.time}
                      </span>
                      <span>📅 {stage.period}</span>
                      <span>🎯 {stage.decisions}</span>
                    </div>
                    <div className="mt-2 text-[10px] px-2 py-0.5 bg-white/5 rounded-full inline-block text-gray-400">
                      {stage.features}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
