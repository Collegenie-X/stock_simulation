'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Award, BookOpen, TrendingUp, Settings, Gift, BarChart3, Crown } from 'lucide-react';

export default function ProfilePage() {
  const [progress, setProgress] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
    setPortfolio(storage.getPortfolio());
  }, []);

  if (!progress || !portfolio) return null;

  const achievements = [
    { id: 1, name: '첫 거래 완료', icon: '✅', unlocked: true },
    { id: 2, name: '10거래 달성', icon: '🎯', unlocked: true },
    { id: 3, name: 'TOP 100 진입', icon: '🏆', unlocked: true },
    { id: 4, name: '파도 초보자', icon: '🌊', unlocked: true },
    { id: 5, name: '100거래 달성', icon: '💯', unlocked: false },
    { id: 6, name: 'TOP 10 진입', icon: '👑', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="MY" />
      
      <main className="pt-14 px-5 max-w-md mx-auto">
        {/* Profile Header */}
        <section className="mt-6 bg-gradient-to-br from-[#4A6BFF] to-[#6B8FFF] rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl">
              😊
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">나</h2>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">Level {progress.level}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>다음 레벨까지</span>
              <span className="font-bold">{progress.totalExp - progress.exp} XP</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${(progress.exp / progress.totalExp) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{progress.completedChapters.length}</p>
            <p className="text-xs text-gray-500 mt-1">완료 강의</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {((portfolio.totalAssets - 10000000) / 10000000 * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">수익률</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {achievements.filter(a => a.unlocked).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">업적</p>
          </div>
        </section>

        {/* Quick Menu */}
        <section className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-14 text-base">
              <BarChart3 className="w-5 h-5 mr-3 text-gray-500" />
              학습 진도
            </Button>
            <Button variant="ghost" className="w-full justify-start h-14 text-base">
              <Award className="w-5 h-5 mr-3 text-gray-500" />
              업적
            </Button>
            <Button variant="ghost" className="w-full justify-start h-14 text-base">
              <Gift className="w-5 h-5 mr-3 text-gray-500" />
              보상함
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                3
              </span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-14 text-base">
              <Settings className="w-5 h-5 mr-3 text-gray-500" />
              설정
            </Button>
          </nav>
        </section>

        {/* Achievements */}
        <section className="mt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">최근 업적</h3>
            <Button variant="ghost" size="sm">전체보기</Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-2xl p-4 text-center shadow-sm ${
                  !achievement.unlocked && 'opacity-40'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-xs text-gray-600 font-medium leading-tight">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Points */}
        <section className="mt-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-yellow-100">보유 포인트</p>
                <h3 className="text-3xl font-bold">3,850P</h3>
              </div>
              <div className="text-5xl">💎</div>
            </div>
            <Button className="w-full bg-white text-orange-600 hover:bg-gray-50 font-bold">
              포인트 상점
            </Button>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
