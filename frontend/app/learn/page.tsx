'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import coursesData from '@/data/courses.json';
import { storage } from '@/lib/storage';
import { Brain, BookMarked, MessageCircle } from 'lucide-react';

export default function LearnPage() {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
  }, []);

  if (!progress) return null;

  const courses = coursesData.courses;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="학습" />
      
      <main className="pt-14 px-5 max-w-md mx-auto">
        {/* Level Banner */}
        <section className="mt-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-blue-100 mb-1">현재 레벨</p>
              <h2 className="text-3xl font-bold">Level {progress.level}</h2>
              <p className="text-sm text-blue-100 mt-1">기초 과정</p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
              📚
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>경험치</span>
              <span className="font-bold">{progress.exp} / {progress.totalExp} XP</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(progress.exp / progress.totalExp) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <Tabs defaultValue="courses" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="courses">강의</TabsTrigger>
            <TabsTrigger value="patterns">패턴</TabsTrigger>
            <TabsTrigger value="ai">AI 멘토</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {courses.map((course, idx) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">
                    {course.title}
                  </h3>
                  {course.locked && (
                    <span className="text-xs text-gray-400">
                      🔒 잠김
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {course.chapters.map((chapter) => {
                    const completed = progress.completedChapters.includes(chapter.id);
                    const chapterProgress = completed ? 100 : 
                      chapter.id === progress.currentChapter ? 65 : 0;
                    
                    return (
                      <CourseCard
                        key={chapter.id}
                        title={chapter.title}
                        description={`${chapter.description} • ${chapter.duration}`}
                        progress={chapterProgress}
                        locked={course.locked}
                        onClick={() => {
                          if (!course.locked) {
                            window.location.href = `/learn/chapter/${chapter.id}`;
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">패턴 도감</h3>
              <p className="text-sm text-gray-500 mb-4">
                35가지 차트 패턴을 학습하고<br/>
                실전에서 활용해보세요
              </p>
              <Button className="w-full bg-[#4A6BFF]">
                패턴 도감 보기
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-green-100">안정형</p>
                    <h3 className="text-xl font-bold">김철수 멘토</h3>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    🛡️
                  </div>
                </div>
                <p className="text-sm text-green-100 mb-3">
                  "천천히, 그러나 확실하게"
                </p>
                <Button className="w-full bg-white text-green-600 hover:bg-gray-50">
                  멘토 만나기
                </Button>
              </div>

              <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-red-100">공격형</p>
                    <h3 className="text-xl font-bold">박영희 멘토</h3>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    ⚡
                  </div>
                </div>
                <p className="text-sm text-red-100 mb-3">
                  "빠르게 움직이고 선점하라"
                </p>
                <Button className="w-full bg-white text-red-600 hover:bg-gray-50">
                  멘토 만나기
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-100">기술형</p>
                    <h3 className="text-xl font-bold">이분석 멘토</h3>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    🧠
                  </div>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  "데이터가 답을 알려준다"
                </p>
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-50">
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
