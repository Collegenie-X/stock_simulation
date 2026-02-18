'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Award, BookOpen, TrendingUp, Settings, Gift, BarChart3, Crown, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 프로필 페이지
 * - 다크 테마 모바일 최적화
 * - 사용자 정보 및 업적
 */
export default function ProfilePage() {
  const [progress, setProgress] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
    setPortfolio(storage.getPortfolio());
  }, []);

  if (!progress || !portfolio) {
    return (
      <div className="min-h-screen-mobile bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">👤</div>
      </div>
    );
  }

  const achievements = [
    { id: 1, name: '첫 거래 완료', icon: '✅', unlocked: true },
    { id: 2, name: '10거래 달성', icon: '🎯', unlocked: true },
    { id: 3, name: 'TOP 100 진입', icon: '🏆', unlocked: true },
    { id: 4, name: '파도 초보자', icon: '🌊', unlocked: true },
    { id: 5, name: '100거래 달성', icon: '💯', unlocked: false },
    { id: 6, name: 'TOP 10 진입', icon: '👑', unlocked: false },
  ];

  const profitRate = ((portfolio.totalAssets - 10000000) / 10000000 * 100).toFixed(1);

  return (
    <div className="min-h-screen-mobile bg-[#191919] pb-24">
      <MobileHeader title="MY" showSettings />
      
      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 프로필 헤더 */}
        <section className="mt-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-8 -mb-8" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                😊
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">나</h2>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold">Level {progress.level || 1}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-100">다음 레벨까지</span>
                <span className="font-bold">{(progress.totalExp || 1000) - (progress.exp || 0)} XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((progress.exp || 0) / (progress.totalExp || 1000)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 통계 */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-[#252525] rounded-2xl p-4 text-center border border-white/5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{(progress.completedChapters || []).length}</p>
            <p className="text-xs text-gray-400 mt-1">완료 강의</p>
          </div>
          
          <div className="bg-[#252525] rounded-2xl p-4 text-center border border-white/5">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className={cn(
              "text-2xl font-bold",
              Number(profitRate) >= 0 ? "text-red-400" : "text-blue-400"
            )}>
              {Number(profitRate) >= 0 ? "+" : ""}{profitRate}%
            </p>
            <p className="text-xs text-gray-400 mt-1">수익률</p>
          </div>
          
          <div className="bg-[#252525] rounded-2xl p-4 text-center border border-white/5">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {achievements.filter(a => a.unlocked).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">업적</p>
          </div>
        </section>

        {/* 퀵 메뉴 */}
        <section className="mt-6 bg-[#252525] rounded-2xl border border-white/5 overflow-hidden">
          <nav className="divide-y divide-white/5">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-14 text-base text-white hover:bg-white/5 rounded-none px-4"
            >
              <BarChart3 className="w-5 h-5 mr-3 text-gray-400" />
              학습 진도
              <ChevronRight className="w-5 h-5 ml-auto text-gray-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-14 text-base text-white hover:bg-white/5 rounded-none px-4"
            >
              <Award className="w-5 h-5 mr-3 text-gray-400" />
              업적
              <ChevronRight className="w-5 h-5 ml-auto text-gray-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-14 text-base text-white hover:bg-white/5 rounded-none px-4"
            >
              <Gift className="w-5 h-5 mr-3 text-gray-400" />
              보상함
              <span className="ml-auto mr-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                3
              </span>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-14 text-base text-white hover:bg-white/5 rounded-none px-4"
            >
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              설정
              <ChevronRight className="w-5 h-5 ml-auto text-gray-500" />
            </Button>
          </nav>
        </section>

        {/* 업적 */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">최근 업적</h3>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              전체보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "bg-[#252525] rounded-2xl p-4 text-center border border-white/5 transition-all",
                  !achievement.unlocked && 'opacity-40'
                )}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-xs text-gray-300 font-medium leading-tight">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 포인트 */}
        <section className="mt-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-yellow-100">보유 포인트</p>
                  <h3 className="text-3xl font-bold">3,850P</h3>
                </div>
                <div className="text-5xl">💎</div>
              </div>
              <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold rounded-xl h-11">
                포인트 상점
              </Button>
            </div>
          </div>
        </section>

        {/* 로그아웃 */}
        <section className="mb-6">
          <Button 
            variant="ghost" 
            className="w-full justify-center h-12 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </Button>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
