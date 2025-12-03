'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import leaderboardData from '@/data/leaderboard.json';
import { Trophy, Medal, Award, Eye, ChevronRight, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * 경쟁 페이지
 * - 다크 테마 모바일 최적화
 * - 리더보드 및 도전 과제
 */
export default function CompetePage() {
  const rankings = leaderboardData.rankings;

  return (
    <div className="min-h-screen-mobile bg-[#191919] pb-24">
      <MobileHeader title="경쟁" showBack showSettings />
      
      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 상금 풀 배너 */}
        <section className="mt-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl -ml-8 -mb-8" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-yellow-100 mb-1">이번 달 상금</p>
                <h2 className="text-3xl font-bold">5,000만원</h2>
                <p className="text-sm text-yellow-100 mt-1">상위 5명에게 지급</p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
                💰
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-200" />
                <span className="text-sm text-yellow-100">마감까지</span>
              </div>
              <span className="font-bold">12일 5시간 남음</span>
            </div>
          </div>
        </section>

        {/* 내 순위 */}
        <section className="mt-6 bg-[#252525] rounded-2xl p-5 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">내 순위</h3>
          <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                42
              </div>
              <div>
                <p className="font-bold text-white">나</p>
                <p className="text-sm text-gray-400">Level 5</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-red-400">+15.2%</p>
              <p className="text-sm text-gray-400">11,520,000원</p>
            </div>
          </div>
        </section>

        {/* 리더보드 */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              리더보드
            </h3>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              전체 보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3 stagger-animation">
            {rankings.map((rank, idx) => {
              const isTopThree = idx < 3;
              const gradients = {
                0: 'from-yellow-500 to-yellow-600',
                1: 'from-gray-400 to-gray-500',
                2: 'from-orange-500 to-orange-600'
              };
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <Link key={rank.userId} href={`/compete/${rank.userId}`}>
                  <div
                    className={cn(
                      "rounded-2xl p-4 cursor-pointer transition-all touch-feedback",
                      isTopThree
                        ? `bg-gradient-to-r ${gradients[idx as keyof typeof gradients]} text-white shadow-lg`
                        : 'bg-[#252525] border border-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                            isTopThree ? 'bg-white/20' : 'bg-gray-700 text-gray-400'
                          )}
                        >
                          {isTopThree ? (
                            <span className="text-2xl">{medals[idx]}</span>
                          ) : (
                            rank.rank
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className={cn("font-bold", isTopThree ? 'text-white' : 'text-white')}>
                              {rank.nickname}
                            </p>
                            <div className="flex gap-1">
                              {rank.badges.map((badge, i) => (
                                <span key={i} className="text-sm">{badge}</span>
                              ))}
                            </div>
                          </div>
                          <p className={cn("text-sm", isTopThree ? 'text-white/80' : 'text-gray-400')}>
                            Level {rank.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          isTopThree ? 'text-white' : 'text-red-400'
                        )}>
                          +{rank.profitRate}%
                        </p>
                        <p className={cn("text-sm", isTopThree ? 'text-white/80' : 'text-gray-400')}>
                          {rank.totalAssets.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                    
                    {/* 상위 3명 투자 전략 엿보기 */}
                    {isTopThree && (
                      <div className="w-full mt-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-xl p-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Eye className="w-4 h-4" />
                        투자 전략 엿보기
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 오늘의 도전 */}
        <section className="mt-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🎯 오늘의 도전
          </h3>
          <div className="space-y-3">
            <Link href="/compete/challenge/1">
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer transition-all touch-feedback">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                      🎯
                    </div>
                    <div>
                      <p className="font-bold text-white">3종목 분산 투자</p>
                      <p className="text-sm text-gray-400">보상: 100XP</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
                    도전
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link href="/compete/challenge/2">
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer transition-all touch-feedback">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">
                      📈
                    </div>
                    <div>
                      <p className="font-bold text-white">수익률 +5% 달성</p>
                      <p className="text-sm text-gray-400">보상: 200XP</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                    도전
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 참가자 수 */}
        <section className="mb-6">
          <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">현재 참가자</span>
            </div>
            <span className="font-bold text-white">2,847명</span>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
