'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import leaderboardData from '@/data/leaderboard.json';
import { Trophy, Medal, Award, Eye, ChevronRight, Clock, Users } from 'lucide-react';
import { formatNumber } from "@/lib/format"
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
        {/* 주간 챌린지 배너 */}
        <section className="mt-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl -ml-8 -mb-8" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-yellow-100 mb-1">이번 주 챌린지</p>
                <h2 className="text-3xl font-bold">Week 3 완주</h2>
                <p className="text-sm text-yellow-100 mt-1">
                  목표: +8% 이상 • 2,847명 참가
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
                🏆
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-200" />
                  <span className="text-sm text-yellow-100">남은 시간</span>
                </div>
                <span className="font-bold">3일 12시간</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* AI 멘토 비교 */}
        <section className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            🤖 AI 멘토와 비교
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                  🛡️
                </div>
                <div>
                  <p className="text-xs font-semibold">김철수</p>
                  <p className="text-xs opacity-80">안정왕</p>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">+12.3%</div>
              <p className="text-xs opacity-80">주간 수익률</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-semibold">박영희</p>
                  <p className="text-xs opacity-80">공격왕</p>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">+18.5%</div>
              <p className="text-xs opacity-80">주간 수익률</p>
            </div>
          </div>
        </section>

        {/* 내 순위 */}
        <section className="mt-6 bg-[#252525] rounded-2xl p-5 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">내 순위</h3>
          <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                42
              </div>
              <div>
                <p className="font-bold text-white">나</p>
                <p className="text-sm text-gray-400">3단계 • 중급 투자자</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-red-400">+15.2%</p>
              <p className="text-sm text-gray-400">11,520,000원</p>
            </div>
          </div>
          
          {/* AI 멘토 비교 */}
          <div className="bg-[#1a1a1a] rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">AI 멘토 비교</span>
              <span className="text-blue-400 font-bold">김철수 추월! ⚡</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-500/20 rounded-lg p-2">
                <p className="text-xs text-gray-400">김철수</p>
                <p className="text-sm font-bold text-white">+12.3%</p>
              </div>
              <div className="flex-1 bg-red-500/20 rounded-lg p-2">
                <p className="text-xs text-gray-400">박영희</p>
                <p className="text-sm font-bold text-white">+18.5%</p>
              </div>
            </div>
          </div>
        </section>

        {/* 리더보드 */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              주간 리더보드
            </h3>
            <select className="bg-[#252525] border border-white/10 rounded-lg px-3 py-1 text-sm text-white">
              <option>전체 단계</option>
              <option>1단계 (500만원)</option>
              <option>2단계 (1,000만원)</option>
              <option>3단계 (5,000만원)</option>
              <option>4단계 (1억원)</option>
              <option>5단계 (5억원)</option>
              <option>6단계 (10억원)</option>
            </select>
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
                          {formatNumber(rank.totalAssets)}원
                        </p>
                      </div>
                    </div>
                    
                    {/* 상위 3명 투자 전략 엿보기 */}
                    {isTopThree && (
                      <div className="mt-3 space-y-2">
                        <div className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-xl p-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                          <Eye className="w-4 h-4" />
                          투자 전략 엿보기 (사용권 2개)
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/80">포트폴리오</p>
                            <p className="font-bold">5종목</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/80">전략</p>
                            <p className="font-bold">공격형</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/80">거래</p>
                            <p className="font-bold">23회</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 주간 챌린지 */}
        <section className="mt-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🎯 주간 챌린지
          </h3>
          <div className="space-y-3">
            <Link href="/compete/challenge/1">
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer transition-all touch-feedback">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                      🌅
                    </div>
                    <div>
                      <p className="font-bold text-white">조건부 주문 마스터</p>
                      <p className="text-sm text-gray-400">아침 타임에 완벽한 주문 설정</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
                    도전
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">보상:</span>
                    <span className="text-white font-bold">200XP + 사용권 2개</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">진행:</span>
                    <span className="text-white font-bold">3/5일</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/compete/challenge/2">
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer transition-all touch-feedback">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">
                      🤖
                    </div>
                    <div>
                      <p className="font-bold text-white">AI 멘토 추월하기</p>
                      <p className="text-sm text-gray-400">김철수 또는 박영희 수익률 넘기</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                    도전
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">보상:</span>
                    <span className="text-white font-bold">300XP + 특별 칭호</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">난이도:</span>
                    <span className="text-yellow-400 font-bold">⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/compete/challenge/3">
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer transition-all touch-feedback">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-2xl">
                      🌊
                    </div>
                    <div>
                      <p className="font-bold text-white">5턴 시나리오 완주</p>
                      <p className="text-sm text-gray-400">3개 시나리오 모두 4성 이상</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                    도전
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">보상:</span>
                    <span className="text-white font-bold">500XP + 레벨업</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">진행:</span>
                    <span className="text-white font-bold">1/3 완료</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 실시간 통계 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3">📊 실시간 통계</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">참가자</span>
              </div>
              <p className="text-2xl font-bold text-white">2,847명</p>
              <p className="text-xs text-green-400 mt-1">+142명 (오늘)</p>
            </div>
            
            <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-400">평균 수익률</span>
              </div>
              <p className="text-2xl font-bold text-red-400">+6.4%</p>
              <p className="text-xs text-gray-400 mt-1">주간 평균</p>
            </div>
          </div>

          <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
            <h4 className="text-sm font-bold text-white mb-3">단계별 분포</h4>
            <div className="space-y-2">
              {[
                { level: '1단계', count: 847, color: 'bg-green-500' },
                { level: '2단계', count: 652, color: 'bg-blue-500' },
                { level: '3단계', count: 521, color: 'bg-purple-500' },
                { level: '4단계', count: 432, color: 'bg-orange-500' },
                { level: '5단계', count: 285, color: 'bg-red-500' },
                { level: '6단계', count: 110, color: 'bg-yellow-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">{item.level}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.count / 2847) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-bold w-16 text-right">{item.count}명</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
