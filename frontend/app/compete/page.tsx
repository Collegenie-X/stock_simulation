'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { COMPETE_LABELS } from './config';
import { HeroSection } from './components/HeroSection';
import { MyPatternSection } from './components/MyPatternSection';
import { HistorySection } from './components/HistorySection';

import historyData from '@/data/compete-history.json';

export default function CompetePage() {
  const { myProfile, stockPreferences, wavePatternStats, simulations, stockPractice, wavePractice, rankTrend } = historyData;

  return (
    <div className="min-h-screen-mobile bg-[#191919] pb-24">
      <MobileHeader title={COMPETE_LABELS.pageTitle} showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 1. 나의 도전자 카드 + AI 멘토 비교 + 공유 */}
        <HeroSection profile={myProfile} />

        {/* 2. 나의 투자 DNA (파도 패턴 + 관심 종목 + 다시 테스트) */}
        <MyPatternSection
          investmentStyle={myProfile.investmentStyle}
          wavePatternType={myProfile.wavePatternType}
          wavePatternStats={wavePatternStats}
          stockPreferences={stockPreferences}
        />

        {/* 3. 나의 역대 기록 + 순위 변화 추이 (히스토리) */}
        <HistorySection
          simulations={simulations as any}
          stockPractice={stockPractice as any}
          wavePractice={wavePractice as any}
          rankTrend={rankTrend}
        />
      </main>

      <MobileNav />
    </div>
  );
}
