'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import coursesData from '@/data/courses.json';
import { storage } from '@/lib/storage';
import { Brain, BookMarked, MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 학습 페이지
 * - 다크 테마 모바일 최적화
 * - 강의, 패턴, AI 멘토 탭
 */
export default function LearnPage() {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen-mobile bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">📚</div>
      </div>
    );
  }

  const courses = coursesData.courses;

  return (
    <div className="min-h-screen-mobile bg-[#191919] pb-24">
      <MobileHeader title="학습" showBack showSettings />
      
      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 레벨 배너 - 다크 스타일 */}
        <section className="mt-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-8 -mb-8" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-blue-200 mb-1">투자 단계</p>
                <h2 className="text-3xl font-bold">🌱 {progress.level || 1}단계</h2>
                <p className="text-sm text-blue-200 mt-1">
                  {(progress.level || 1) === 1 && "새싹 투자자 • 500만원"}
                  {(progress.level || 1) === 2 && "초보 투자자 • 1,000만원"}
                  {(progress.level || 1) === 3 && "중급 투자자 • 5,000만원"}
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
                🌊
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-100">다음 단계까지</span>
                <span className="font-bold">{progress.exp || 0} / {progress.totalExp || 1000} XP</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((progress.exp || 0) / (progress.totalExp || 1000)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3타임 시스템 학습 */}
        <section className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            ⏰ 3타임 시스템
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
              <div className="text-2xl mb-2">🌅</div>
              <p className="text-xs font-bold text-white mb-1">아침 타임</p>
              <p className="text-xs text-gray-400">조건부 주문</p>
            </div>
            <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
              <div className="text-2xl mb-2">🌞</div>
              <p className="text-xs font-bold text-white mb-1">점심 타임</p>
              <p className="text-xs text-gray-400">지연 알림 확인</p>
            </div>
            <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
              <div className="text-2xl mb-2">🌙</div>
              <p className="text-xs font-bold text-white mb-1">저녁 타임</p>
              <p className="text-xs text-gray-400">결과 분석</p>
            </div>
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="scenarios" className="mt-6">
          <TabsList className="w-full bg-[#252525] border border-white/10 rounded-2xl p-1 grid grid-cols-4 mb-6">
            <TabsTrigger 
              value="scenarios"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-xs"
            >
              시나리오
            </TabsTrigger>
            <TabsTrigger 
              value="courses"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-xs"
            >
              강의
            </TabsTrigger>
            <TabsTrigger 
              value="patterns"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-xs"
            >
              패턴
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl text-xs"
            >
              AI 멘토
            </TabsTrigger>
          </TabsList>

          {/* 5턴 시나리오 탭 */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-yellow-200">전설의 5턴</p>
                    <h3 className="text-xl font-bold">실전 시나리오 학습</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    🎯
                  </div>
                </div>
                <p className="text-sm text-yellow-100 mb-3">
                  5턴 안에 최선의 선택을 찾아라
                </p>
                <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  시나리오 시작하기
                </Button>
              </div>
            </div>

            {/* 시나리오 리스트 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400">학습 시나리오</h4>
              
              {[
                { id: 1, title: '급등주의 유혹', difficulty: 2, emoji: '🔥', desc: 'RSI 과열 구간 대응' },
                { id: 2, title: '실적 발표의 함정', difficulty: 3, emoji: '📊', desc: '선반영 vs 후반영' },
                { id: 3, title: '하락장의 선택', difficulty: 4, emoji: '📉', desc: '손절 vs 물타기' },
                { id: 4, title: '분할 매수 마스터', difficulty: 2, emoji: '📈', desc: '평균 단가 관리' },
                { id: 5, title: '조건부 주문 훈련', difficulty: 3, emoji: '⚡', desc: '지연 정보 대응' }
              ].map((scenario) => (
                <div 
                  key={scenario.id}
                  className="bg-[#252525] rounded-xl p-4 border border-white/5 flex items-center justify-between touch-feedback cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center text-lg">
                      {scenario.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-white">{scenario.title}</p>
                      <p className="text-xs text-gray-400">
                        {scenario.desc} • {'⭐'.repeat(scenario.difficulty)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 강의 탭 */}
          <TabsContent value="courses" className="space-y-6 stagger-animation">
            {courses.map((course, idx) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                    {course.title}
                  </h3>
                  {course.locked && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      🔒 레벨 {idx + 1} 필요
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {course.chapters.map((chapter) => {
                    const completedChapters = progress.completedChapters || [];
                    const completed = completedChapters.includes(chapter.id);
                    const chapterProgress = completed ? 100 : 
                      chapter.id === (progress.currentChapter || 1) ? 65 : 0;
                    
                    return (
                      <div
                        key={chapter.id}
                        onClick={() => {
                          if (!course.locked) {
                            window.location.href = `/learn/chapter/${chapter.id}`;
                          }
                        }}
                        className={cn(
                          "bg-[#252525] rounded-2xl p-4 border border-white/5",
                          "transition-all touch-feedback",
                          course.locked 
                            ? "opacity-50 cursor-not-allowed" 
                            : "cursor-pointer hover:bg-[#2a2a2a]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-white mb-1 truncate">{chapter.title}</h4>
                            <p className="text-sm text-gray-400 truncate">
                              {chapter.description} • {chapter.duration}
                            </p>
                          </div>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            completed 
                              ? "bg-green-500/20 text-green-400" 
                              : chapterProgress > 0 
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-700 text-gray-400"
                          )}>
                            {completed ? "✓" : chapterProgress > 0 ? "▶" : "📖"}
                          </div>
                        </div>
                        
                        {/* 진행률 바 */}
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              completed ? "bg-green-500" : "bg-blue-500"
                            )}
                            style={{ width: `${chapterProgress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 패턴 탭 */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="bg-[#252525] rounded-2xl p-6 text-center border border-white/5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">패턴 도감</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                35가지 차트 패턴을 학습하고<br/>
                실전에서 활용해보세요
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12">
                패턴 도감 보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* 추천 패턴 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400">추천 패턴</h4>
              {['헤드앤숄더', '더블바텀', '트리플탑'].map((pattern, idx) => (
                <div 
                  key={pattern}
                  className="bg-[#252525] rounded-xl p-4 border border-white/5 flex items-center justify-between touch-feedback cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-lg">
                      📈
                    </div>
                    <div>
                      <p className="font-bold text-white">{pattern}</p>
                      <p className="text-xs text-gray-400">추세 반전 패턴</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* AI 멘토 탭 */}
          <TabsContent value="ai" className="space-y-4">
            {/* 멘토 비교 배너 */}
            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-3">🤖 AI 멘토 비교 학습</h3>
              <p className="text-sm text-gray-400 mb-4">
                2명의 AI 멘토와 함께 투자하며 전략을 비교하고 학습하세요
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-xs text-blue-300">
                  💡 당신의 선택 → AI 멘토 전략 공개 → 3일 후 결과 비교
                </p>
              </div>
            </div>

            {/* 안정형 멘토 */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-green-200">안정왕 • 수익률 +8~12%</p>
                    <h3 className="text-xl font-bold">🛡️ 김철수 멘토</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                </div>
                <p className="text-sm text-green-100 mb-2 italic">
                  "천천히, 확실하게"
                </p>
                <div className="bg-white/20 rounded-lg p-2 mb-3 text-xs space-y-1">
                  <p>• 지지선 확인 후에만 매수</p>
                  <p>• 무조건 분할 매수 (3단계)</p>
                  <p>• 손절 -5% 엄격 준수</p>
                </div>
                <Button className="w-full bg-white text-green-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  전략 배우기
                </Button>
              </div>
            </div>

            {/* 공격형 멘토 */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-red-200">공격왕 • 수익률 +15~30%</p>
                    <h3 className="text-xl font-bold">⚡ 박영희 멘토</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                </div>
                <p className="text-sm text-red-100 mb-2 italic">
                  "리스크를 관리하며 공격하라"
                </p>
                <div className="bg-white/20 rounded-lg p-2 mb-3 text-xs space-y-1">
                  <p>• 3파 상승 초기 적극 진입</p>
                  <p>• 거래량 폭발 시 큰 비중</p>
                  <p>• 목표 수익 +25~40%</p>
                </div>
                <Button className="w-full bg-white text-red-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  전략 배우기
                </Button>
              </div>
            </div>

            {/* 비교 통계 */}
            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <h4 className="text-sm font-bold text-white mb-3">📊 나의 학습 통계</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">김철수 멘토 추월</span>
                  <span className="text-white font-bold">3회 / 10회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">박영희 멘토 추월</span>
                  <span className="text-white font-bold">1회 / 10회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">평균 추월 시점</span>
                  <span className="text-white font-bold">Week 8</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
