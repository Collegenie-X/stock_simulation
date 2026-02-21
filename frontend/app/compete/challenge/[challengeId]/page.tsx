'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Target, Trophy, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { formatNumber } from "@/lib/format"
import { useState } from 'react';

// 도전 과제 더미 데이터
const challenges = {
  '1': {
    id: '1',
    title: '3종목 분산 투자',
    icon: '🎯',
    description: '서로 다른 업종의 주식 3개를 골라서 투자해보세요. 계란을 한 바구니에 담지 마세요!',
    difficulty: '쉬움',
    reward: {
      xp: 100,
      coins: 5000,
      badge: '분산왕'
    },
    requirements: [
      '최소 3개의 다른 업종 선택',
      '각 종목에 최소 10% 이상 투자',
      '24시간 안에 완료'
    ],
    participants: 1247,
    completionRate: 78,
    timeLimit: '24시간',
    tips: [
      'IT, 금융, 바이오처럼 전혀 다른 업종을 선택하세요',
      '한 업종이 떨어져도 다른 업종이 올라갈 수 있어요',
      '균형있게 나누는 것이 중요해요'
    ]
  },
  '2': {
    id: '2',
    title: '수익률 +5% 달성',
    icon: '📈',
    description: '파도를 잘 타서 5% 수익을 만들어보세요. 큰 파도에 올라타는 타이밍이 중요해요!',
    difficulty: '보통',
    reward: {
      xp: 200,
      coins: 10000,
      badge: '서퍼'
    },
    requirements: [
      '수익률 +5% 이상 달성',
      '최소 3번 이상 거래',
      '48시간 안에 완료'
    ],
    participants: 892,
    completionRate: 45,
    timeLimit: '48시간',
    tips: [
      '파도가 올라가는 시작점에서 매수하세요',
      '너무 욕심내지 말고 5%면 충분해요',
      '파도가 꺾이기 전에 내려오세요'
    ]
  }
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;
  const challenge = challenges[challengeId as keyof typeof challenges];
  const [isStarting, setIsStarting] = useState(false);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">도전 과제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      router.push('/practice/stock/scenario-1');
    }, 500);
  };

  const difficultyColors = {
    '쉬움': 'bg-green-100 text-green-700',
    '보통': 'bg-yellow-100 text-yellow-700',
    '어려움': 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <MobileHeader title="도전 과제" />
      
      <main className="pt-14 px-5 max-w-md mx-auto">
        {/* Challenge Header */}
        <section className="mt-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
                {challenge.icon}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
                {challenge.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
            <p className="text-white/90 leading-relaxed">{challenge.description}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatNumber(challenge.participants)}</p>
            <p className="text-xs text-gray-500 mt-1">도전 중</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{challenge.completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">성공률</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{challenge.timeLimit}</p>
            <p className="text-xs text-gray-500 mt-1">제한시간</p>
          </div>
        </section>

        {/* Rewards */}
        <section className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            보상
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">
                  ⭐
                </div>
                <span className="font-semibold text-gray-900">경험치</span>
              </div>
              <span className="text-lg font-bold text-blue-600">+{challenge.reward.xp} XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl">
                  💰
                </div>
                <span className="font-semibold text-gray-900">게임 머니</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">+{formatNumber(challenge.reward.coins)}원</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-xl">
                  🏅
                </div>
                <span className="font-semibold text-gray-900">뱃지</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{challenge.reward.badge}</span>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            달성 조건
          </h3>
          <div className="space-y-2">
            {challenge.requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-gray-700 text-sm">{req}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            💡 성공 팁
          </h3>
          <div className="space-y-2">
            {challenge.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <section className="mt-8 mb-6">
          <Button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-lg disabled:opacity-50"
          >
            {isStarting ? '시작 중...' : '도전 시작하기'}
          </Button>
          <p className="text-center text-sm text-gray-500 mt-3">
            언제든 중단하고 나중에 다시 시작할 수 있어요
          </p>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
