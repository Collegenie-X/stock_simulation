'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPETE_LABELS } from '../config';

interface WeeklyChallenge {
  title: string;
  goal: string;
  participants: number;
  timeRemaining: string;
  progressPercent: number;
  reward: string;
}

interface WeeklyChallengeSectionProps {
  challenge: WeeklyChallenge;
}

const L = COMPETE_LABELS.challenge;
const ITEMS = L.items;

export function WeeklyChallengeSection({ challenge }: WeeklyChallengeSectionProps) {
  return (
    <>
      {/* 챌린지 배너 */}
      <section className="mt-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl -ml-8 -mb-8" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-yellow-100 mb-1">이번 주 챌린지</p>
              <h2 className="text-3xl font-bold">{challenge.title}</h2>
              <p className="text-sm text-yellow-100 mt-1">
                목표: {challenge.goal} · {challenge.participants.toLocaleString()}{L.participants}
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
              🏆
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-200" />
                <span className="text-sm text-yellow-100">{L.timeRemaining}</span>
              </div>
              <span className="font-bold">{challenge.timeRemaining}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${challenge.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm">
            <span className="text-yellow-100">🎁 이번 주 보상: </span>
            <span className="font-bold">{challenge.reward}</span>
          </div>
        </div>
      </section>

      {/* 챌린지 리스트 */}
      <section className="mt-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          🎯 {L.title}
        </h3>
        <div className="space-y-3">
          {ITEMS.map((item) => (
            <Link key={item.id} href={`/compete/challenge/${item.id}`}>
              <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer active:bg-[#2a2a2a] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      item.active ? 'bg-blue-500/20' : 'bg-white/5'
                    }`}>
                      {item.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl border-0'
                        : 'border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700 rounded-xl border'
                    }
                  >
                    {L.challengeBtn}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">{L.reward}:</span>
                    <span className="text-white font-bold">{item.reward}</span>
                  </div>
                  {'progress' in item && item.progress && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">{L.progress}:</span>
                      <span className="text-white font-bold">{item.progress}</span>
                    </div>
                  )}
                  {'difficulty' in item && item.difficulty && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">{L.difficulty}:</span>
                      <span className="text-yellow-400 font-bold">{item.difficulty}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
