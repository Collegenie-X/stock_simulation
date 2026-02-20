'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storage } from '@/lib/storage';
import {
  getPersonalityFromCharacter,
  type InvestorPersonality,
} from '@/data/legendary-scenarios';
import { InvestorDNAHero } from './components/InvestorDNAHero';
import { LearningProcessSteps } from './components/LearningProcessSteps';
import { ScenarioTab } from './components/ScenarioTab';
import { PatternTab } from './components/PatternTab';

/**
 * 학습 페이지
 * - 다크 테마 모바일 최적화
 * - 강의, 패턴, AI 멘토 탭
 */
export default function LearnPage() {
  const [progress, setProgress] = useState<any>(null);
  const [userPersonality, setUserPersonality] =
    useState<InvestorPersonality>('balanced');

  useEffect(() => {
    setProgress(storage.getProgress());
    const character = storage.getCharacter();
    if (character) {
      setUserPersonality(getPersonalityFromCharacter(character.type));
    }
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen-mobile bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">📚</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-mobile bg-[#191919] pb-24">
      <MobileHeader title="학습" showBack showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        <InvestorDNAHero userPersonality={userPersonality} progress={progress} />

        <LearningProcessSteps />

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="scenarios" className="mt-6">
          <TabsList className="w-full bg-[#252525] border border-white/10 rounded-2xl p-1 grid grid-cols-2 mb-6">
            <TabsTrigger
              value="scenarios"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-sm"
            >
              시나리오
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-sm"
            >
              패턴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="mt-0">
            <ScenarioTab userPersonality={userPersonality} />
          </TabsContent>

          <TabsContent value="patterns" className="mt-0">
            <PatternTab />
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
