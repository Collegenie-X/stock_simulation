'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import leaderboardData from '@/data/leaderboard.json';
import { Trophy, Medal, Award, Eye } from 'lucide-react';
import Link from 'next/link';

export default function CompetePage() {
  const rankings = leaderboardData.rankings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <MobileHeader title="경쟁" />
      
      <main className="pt-14 px-5 max-w-md mx-auto">
        {/* Prize Pool */}
        <section className="mt-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
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
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex justify-between text-sm mb-1">
              <span>마감까지</span>
              <span className="font-bold">12일 5시간 남음</span>
            </div>
          </div>
        </section>

        {/* My Rank */}
        <section className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">내 순위</h3>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                42
              </div>
              <div>
                <p className="font-bold text-gray-900">나</p>
                <p className="text-sm text-gray-500">Level 5</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">+15.2%</p>
              <p className="text-sm text-gray-500">11,520,000원</p>
            </div>
          </div>
        </section>

        {/* Rankings */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">리더보드</h3>
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </div>

          <div className="space-y-3">
            {rankings.map((rank, idx) => {
              const medalColors = {
                0: 'from-yellow-400 to-yellow-600',
                1: 'from-gray-300 to-gray-500',
                2: 'from-orange-400 to-orange-600'
              };

              const isTopThree = idx < 3;

              return (
                <Link key={rank.userId} href={`/compete/${rank.userId}`}>
                  <div
                    className={`rounded-2xl p-4 cursor-pointer transition-transform active:scale-95 ${
                      isTopThree
                        ? `bg-gradient-to-r ${medalColors[idx as keyof typeof medalColors]} text-white shadow-lg`
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isTopThree ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isTopThree ? (
                            <span className="text-2xl">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            rank.rank
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-bold ${isTopThree ? 'text-white' : 'text-gray-900'}`}>
                              {rank.nickname}
                            </p>
                            <div className="flex gap-1">
                              {rank.badges.map((badge, i) => (
                                <span key={i} className="text-sm">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className={`text-sm ${isTopThree ? 'text-white/80' : 'text-gray-500'}`}>
                            Level {rank.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isTopThree ? 'text-white' : 'text-green-600'}`}>
                          +{rank.profitRate}%
                        </p>
                        <p className={`text-sm ${isTopThree ? 'text-white/80' : 'text-gray-500'}`}>
                          {rank.totalAssets.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                    {isTopThree && (
                      <div className="w-full mt-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-lg p-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
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

        {/* Daily Challenge */}
        <section className="mt-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">오늘의 도전</h3>
          <div className="space-y-3">
            <Link href="/compete/challenge/1">
              <div className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-transform active:scale-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      🎯
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">3종목 분산 투자</p>
                      <p className="text-sm text-gray-500">보상: 100XP</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    도전
                  </Button>
                </div>
              </div>
            </Link>
            <Link href="/compete/challenge/2">
              <div className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-transform active:scale-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      📈
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">수익률 +5% 달성</p>
                      <p className="text-sm text-gray-500">보상: 200XP</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    도전
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
