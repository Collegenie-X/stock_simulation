'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { INVESTMENT_STYLES } from '../compete/config';
import { ProfileHero } from './components/ProfileHero';
import { ActivityCountSection } from './components/ActivityCountSection';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { ACHIEVEMENTS } from './config';
import competeHistory from '@/data/compete-history.json';

export default function ProfilePage() {
  const { myProfile, simulations, stockPractice, wavePractice } = competeHistory as any;

  const styleInfo = INVESTMENT_STYLES[myProfile.investmentStyle] ?? INVESTMENT_STYLES.aggressive;
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#191919] pb-28">
      <MobileHeader title="MY" showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 프로필 */}
        <ProfileHero
          nickname={myProfile.nickname}
          level={myProfile.level}
          exp={800}
          badges={[...myProfile.badges]}
          styleEmoji={styleInfo.emoji}
          styleLabel={styleInfo.label}
        />

        {/* 활동 횟수 현황 */}
        <ActivityCountSection
          counts={{
            simulations:   simulations.length,
            stockPractice: stockPractice.length,
            wavePractice:  wavePractice.length,
            learnChapters: 5,
            totalTrades:   myProfile.totalTrades,
            achievements:  unlockedCount,
          }}
        />

        {/* 개인 정보 */}
        <PersonalInfoSection
          userId={myProfile.userId}
          email={myProfile.email}
          phone={myProfile.phone}
          joinDate={myProfile.joinDate}
          lastLogin={myProfile.lastLogin}
        />
      </main>

      <MobileNav />
    </div>
  );
}
