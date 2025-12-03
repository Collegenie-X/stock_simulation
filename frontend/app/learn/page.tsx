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
                <p className="text-sm font-semibold text-blue-200 mb-1">현재 레벨</p>
                <h2 className="text-3xl font-bold">Level {progress.level}</h2>
                <p className="text-sm text-blue-200 mt-1">기초 과정</p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
                📚
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-100">경험치</span>
                <span className="font-bold">{progress.exp} / {progress.totalExp} XP</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(progress.exp / progress.totalExp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="courses" className="mt-6">
          <TabsList className="w-full bg-[#252525] border border-white/10 rounded-2xl p-1 grid grid-cols-3 mb-6">
            <TabsTrigger 
              value="courses"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl"
            >
              강의
            </TabsTrigger>
            <TabsTrigger 
              value="patterns"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl"
            >
              패턴
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-[#333] data-[state=active]:text-white text-gray-400 rounded-xl"
            >
              AI 멘토
            </TabsTrigger>
          </TabsList>

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
                    const completed = progress.completedChapters.includes(chapter.id);
                    const chapterProgress = completed ? 100 : 
                      chapter.id === progress.currentChapter ? 65 : 0;
                    
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
            {/* 안정형 멘토 */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-green-200">안정형</p>
                    <h3 className="text-xl font-bold">김철수 멘토</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                </div>
                <p className="text-sm text-green-100 mb-3 italic">
                  "천천히, 그러나 확실하게"
                </p>
                <Button className="w-full bg-white text-green-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  멘토 만나기
                </Button>
              </div>
            </div>

            {/* 공격형 멘토 */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-red-200">공격형</p>
                    <h3 className="text-xl font-bold">박영희 멘토</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                </div>
                <p className="text-sm text-red-100 mb-3 italic">
                  "빠르게 움직이고 선점하라"
                </p>
                <Button className="w-full bg-white text-red-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  멘토 만나기
                </Button>
              </div>
            </div>

            {/* 기술형 멘토 */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-200">기술형</p>
                    <h3 className="text-xl font-bold">이분석 멘토</h3>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl">
                    🧠
                  </div>
                </div>
                <p className="text-sm text-purple-100 mb-3 italic">
                  "데이터가 답을 알려준다"
                </p>
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
                  멘토 만나기
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
