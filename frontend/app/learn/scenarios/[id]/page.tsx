'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import {
  LEGENDARY_SCENARIOS,
  DIFFICULTY_CONFIG,
  getPersonalityFromCharacter,
  type LegendaryScenario,
  type InvestorPersonality,
} from '@/data/legendary-scenarios';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import {
  Target,
  Shield,
  Lightbulb,
  Play,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  EventTimeline,
  StrategyCard,
  MyAIMatchupSection,
  ReturnComparisonChart,
  LearnFromOthersSection,
  StatsSection,
} from './components';

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState<LegendaryScenario | null>(null);
  const [userPersonality, setUserPersonality] = useState<InvestorPersonality>("balanced");

  useEffect(() => {
    const found = LEGENDARY_SCENARIOS.find(s => s.id === params.id);
    setScenario(found || null);

    const character = storage.getCharacter();
    if (character) {
      setUserPersonality(getPersonalityFromCharacter(character.type));
    }
  }, [params.id]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    );
  }

  const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <div className="min-h-screen bg-[#191919] pb-32">
      <MobileHeader title={scenario.title} showBack showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 히어로 섹션 */}
        <section className={cn(
          "mt-4 rounded-2xl p-5 text-white relative overflow-hidden bg-gradient-to-br",
          scenario.gradientFrom, scenario.gradientTo
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl -ml-6 -mb-6" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/20 border-white/30"
              )}>
                #{scenario.order} {scenario.category}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 border border-white/30">
                {diffConfig.label} {'⭐'.repeat(scenario.difficulty)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold">{scenario.emoji} {scenario.title}</h2>
                <p className="text-sm opacity-80 mt-1">{scenario.subtitle}</p>
              </div>
            </div>

            <p className="text-sm opacity-90 leading-relaxed mb-3">
              {scenario.description}
            </p>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {scenario.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-white/15 rounded-full px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 핵심 교훈 & 생존 팁 */}
        <section className="mt-4 space-y-3">
          <div className="bg-[#252525] rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-400 mb-1">핵심 교훈</p>
                <p className="text-xs text-gray-300 leading-relaxed">{scenario.keyLesson}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-400 mb-1">생존 팁</p>
                <p className="text-xs text-gray-300 leading-relaxed">{scenario.survivalTip}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 */}
        <div className="mt-6">
          <StatsSection scenario={scenario} />
        </div>

        {/* 이벤트 타임라인 */}
        <div className="mt-6">
          <EventTimeline scenario={scenario} />
        </div>

        {/* ===== 나의 성향 AI 대결 (핵심 섹션) ===== */}
        <div className="mt-6">
          <MyAIMatchupSection
            aiStrategies={scenario.aiStrategies}
            userPersonality={userPersonality}
          />
        </div>

        {/* ===== 성향별 수익률 비교 차트 ===== */}
        <div className="mt-6">
          <ReturnComparisonChart
            aiStrategies={scenario.aiStrategies}
            userPersonality={userPersonality}
          />
        </div>

        {/* 대처 전략 */}
        <section className="mt-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            대처 전략 ({scenario.strategies.length}가지)
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            같은 상황에도 <span className="text-green-400 font-bold">다양한 해결책</span>이 있습니다.
            자신의 성향에 맞는 전략을 찾되, 다른 전략도 알아두면 유연성이 커집니다.
          </p>
          <div className="space-y-2">
            {scenario.strategies.map(strategy => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
        </section>

        {/* ===== 다른 성향에서 배우기 ===== */}
        <div className="mt-6">
          <LearnFromOthersSection
            aiStrategies={scenario.aiStrategies}
            userPersonality={userPersonality}
          />
        </div>

        {/* 핵심 메시지 */}
        <section className="mt-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-cyan-400 mb-1">사고 대처 능력의 핵심</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  주식 시장에서 예측 불가능한 상황은 반드시 발생합니다.
                  중요한 것은 <span className="text-white font-bold">나의 성향을 이해</span>하고,
                  <span className="text-white font-bold"> 다양한 대처법을 알아두는 것</span>입니다.
                  같은 성향의 AI와 비교하며 부족한 점을 찾고,
                  다른 성향의 강점을 배워 더 유연한 투자자로 성장하세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 실전 주의사항 */}
        <section className="mt-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-orange-400 mb-1">실전 주의사항</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  시나리오는 학습 목적입니다. 실제 투자에서는 더 많은 변수가 존재하며,
                  한 가지 전략이 항상 정답이 아닙니다. 상황에 따라 유연하게 대응하는 능력을 키우세요.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-12 rounded-xl bg-[#252525] border-white/10 text-white hover:bg-[#333]"
          >
            목록으로
          </Button>
          <Button
            onClick={() => router.push(`/learn/scenarios/${scenario.id}/play`)}
            className={cn(
              "flex-[2] h-12 rounded-xl font-bold text-white bg-gradient-to-r",
              scenario.gradientFrom, scenario.gradientTo,
              "hover:opacity-90"
            )}
          >
            <Play className="w-4 h-4 mr-2" />
            시나리오 플레이
          </Button>
        </div>
      </div>
    </div>
  );
}
