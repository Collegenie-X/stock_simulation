'use client';

import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/mobile-nav';
import scenariosData from '@/data/game-scenarios.json';
import { storage } from '@/lib/storage';
import { Star, Lock, Trophy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameLobbyPage() {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    setProgress(storage.getProgress());
  }, []);

  if (!progress) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 safe-top sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <h1 className="text-2xl font-black text-gray-900">투자 여정 🌊</h1>
        </div>
      </div>
      
      <main className="pt-8 px-5 max-w-md mx-auto flex flex-col items-center">
        {/* Roadmap Path */}
        <div className="space-y-6 w-full max-w-[300px] relative pb-8">
          {/* Connecting Dotted Line */}
          <div className="absolute left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent -translate-x-1/2 -z-10" 
               style={{ backgroundImage: 'repeating-linear-gradient(0deg, #e5e7eb, #e5e7eb 10px, transparent 10px, transparent 20px)' }} 
          />

          {scenariosData.scenarios.map((scenario, index) => {
            const isLocked = index > progress.level - 1;
            const isCompleted = progress.level > index + 1;
            const isCurrent = progress.level === index + 1;
            
            return (
              <div 
                key={scenario.id}
                className="flex flex-col items-center relative"
              >
                <button
                  onClick={() => !isLocked && (window.location.href = `/practice/stock/${scenario.id}`)}
                  disabled={isLocked}
                  className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-[0_8px_0_rgba(0,0,0,0.15)] transition-all relative",
                    isLocked ? "bg-gray-200 cursor-not-allowed" : 
                    isCompleted ? "bg-[#FFC800] active:translate-y-2 active:shadow-[0_4px_0_rgba(0,0,0,0.15)]" :
                    "bg-[#58CC02] active:translate-y-2 active:shadow-[0_4px_0_rgba(0,0,0,0.15)] animate-pulse"
                  )}
                >
                  {isLocked ? <Lock className="w-10 h-10 text-gray-400" /> : 
                   isCompleted ? <Trophy className="w-12 h-12 text-white stroke-[2.5]" /> :
                   <Star className="w-12 h-12 text-white fill-white stroke-white stroke-[1.5]" />}
                   
                   {/* Star Badge for Completed */}
                   {isCompleted && (
                     <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-400">
                       <span className="text-xl">⭐</span>
                     </div>
                   )}
                </button>
                
                <div className="mt-4 text-center px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 min-w-[200px]">
                  <p className="font-black text-gray-900 text-base mb-0.5">{scenario.title}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                    {scenario.difficulty} · {scenario.totalTurns}턴
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-600 font-black mt-1">✓ 완료</p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-black mt-1 animate-pulse">← 진행 중</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Coming Soon */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300">
              <span className="text-3xl">🚧</span>
            </div>
            <p className="mt-4 font-black text-gray-400">곧 출시...</p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
