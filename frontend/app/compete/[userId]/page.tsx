'use client';

import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import leaderboardData from '@/data/leaderboard.json';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, Lightbulb, Activity, Zap, Waves } from 'lucide-react';
import { formatNumber } from "@/lib/format"
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, ComposedChart, Bar, Dot } from 'recharts';

export default function CompeteDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [wavePeriod, setWavePeriod] = useState<'1D' | '1W' | '1M'>('1W');
  
  const user = leaderboardData.rankings.find((r) => r.userId === userId);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">사용자를 찾을 수 없습니다</p>
          <Link href="/compete">
            <Button className="mt-4">돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const waveDayData = [
    { time: '9시', price: 68000, action: null },
    { time: '10시', price: 69500, action: null },
    { time: '11시', price: 71000, action: 'buy' },
    { time: '12시', price: 73000, action: null },
    { time: '13시', price: 72000, action: null },
    { time: '14시', price: 74500, action: null },
    { time: '15시', price: 76000, action: 'sell' },
    { time: '16시', price: 75500, action: null },
  ];

  const waveWeekData = [
    { time: '월', price: 65000, action: null },
    { time: '화', price: 67000, action: null },
    { time: '수', price: 72000, action: 'buy' },
    { time: '목', price: 68000, action: null },
    { time: '금', price: 75000, action: null },
    { time: '토', price: 85000, action: 'sell' },
    { time: '일', price: 80000, action: null },
  ];

  const waveMonthData = [
    { time: '1주', price: 65000, action: null },
    { time: '2주', price: 72000, action: 'buy' },
    { time: '3주', price: 85000, action: 'sell' },
    { time: '4주', price: 88000, action: 'buy' },
  ];

  const waveData = wavePeriod === '1D' ? waveDayData : wavePeriod === '1W' ? waveWeekData : waveMonthData;

  const dailyProfitData = [
    { day: '1일', profit: 2.5, type: 'profit' },
    { day: '2일', profit: -1.2, type: 'loss' },
    { day: '3일', profit: 3.8, type: 'profit' },
    { day: '4일', profit: -0.5, type: 'loss' },
    { day: '5일', profit: 5.2, type: 'profit' },
    { day: '6일', profit: 1.3, type: 'profit' },
    { day: '7일', profit: -2.1, type: 'loss' },
    { day: '8일', profit: 4.6, type: 'profit' },
    { day: '9일', profit: 2.9, type: 'profit' },
    { day: '10일', profit: -1.8, type: 'loss' },
    { day: '11일', profit: 6.1, type: 'profit' },
    { day: '12일', profit: 3.2, type: 'profit' },
    { day: '13일', profit: -0.9, type: 'loss' },
    { day: '14일', profit: 4.8, type: 'profit' },
  ];

  const tradeAnalysis = [
    { date: '1월 3일', action: 'buy', price: 72000, wavePoint: '파도가 올라가기 시작할 때', result: '+18%', timing: '완벽', desc: '가격이 낮을 때 샀어요' },
    { date: '1월 9일', action: 'sell', price: 85000, wavePoint: '파도가 가장 높을 때', result: '+18%', timing: '우수', desc: '가격이 높을 때 팔았어요' },
    { date: '1월 13일', action: 'buy', price: 88000, wavePoint: '파도가 다시 올라가기 전', result: '+27%', timing: '완벽', desc: '파도가 내려온 후 다시 탔어요' },
    { date: '1월 15일', action: 'sell', price: 95000, wavePoint: '파도 꼭대기', result: '+8%', timing: '양호', desc: '적당한 높이에서 내렸어요' },
  ];

  const isTopThree = user.rank <= 3;

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.action === 'buy') {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#FF3D00" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy - 15} textAnchor="middle" fill="#FF3D00" fontSize={11} fontWeight="bold">
            🏄 매수
          </text>
        </g>
      );
    }
    if (payload.action === 'sell') {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#00C853" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy - 15} textAnchor="middle" fill="#00C853" fontSize={11} fontWeight="bold">
            🎯 매도
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 pb-20">
      <MobileHeader title={`${user.nickname} 파도 타기 보고서`} showBack />

      <main className="pt-14 px-5 max-w-md mx-auto">
        {/* Summary Card */}
        <section className="mt-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-10">🌊</div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <p className="text-blue-100 text-sm mb-1">총 수익</p>
              <p className="text-5xl font-bold">+{user.profitRate}%</p>
            </div>
            <div className="text-right">
              <div className="text-6xl mb-2">{user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '🏆'}</div>
              <p className="text-blue-100 text-sm">랭킹 {user.rank}위</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4 relative z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-100 mb-1">이긴 횟수</p>
              <p className="text-lg font-bold">10번</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-100 mb-1">진 횟수</p>
              <p className="text-lg font-bold">2번</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-blue-100 mb-1">레벨</p>
              <p className="text-lg font-bold">{user.level}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Waves className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-bold text-gray-900">파도 타기 분석</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setWavePeriod('1D')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  wavePeriod === '1D'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                1일
              </button>
              <button
                onClick={() => setWavePeriod('1W')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  wavePeriod === '1W'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                1주
              </button>
              <button
                onClick={() => setWavePeriod('1M')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  wavePeriod === '1M'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                1달
              </button>
            </div>
          </div>

          <div className="mb-4 bg-gradient-to-b from-cyan-50 to-blue-50 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={waveData}>
                <defs>
                  <linearGradient id="oceanWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis 
                  dataKey="time" 
                  stroke="#0891b2"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#0891b2"
                  tick={{ fontSize: 11 }}
                  domain={[60000, 90000]}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    padding: '12px'
                  }}
                  formatter={(value: any) => [`${formatNumber(value)}원`, '주가']}
                />
                <Area 
                  type="natural" 
                  dataKey="price" 
                  stroke="#0891b2" 
                  strokeWidth={4}
                  fill="url(#oceanWave)" 
                  dot={<CustomDot />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🏄‍♂️</div>
              <p className="font-bold text-gray-900">파도 타는 법</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-xl">🔴</span>
                <div>
                  <p className="font-semibold text-gray-800">매수 = 파도에 올라타기</p>
                  <p className="text-gray-600 text-xs">가격이 낮을 때 주식을 사요</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">🟢</span>
                <div>
                  <p className="font-semibold text-gray-800">매도 = 파도에서 내리기</p>
                  <p className="text-gray-600 text-xs">가격이 높을 때 주식을 팔아요</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">🌊</span>
                <div>
                  <p className="font-semibold text-gray-800">파도의 흐름을 읽어요</p>
                  <p className="text-gray-600 text-xs">언제 오르고 내릴지 예측해요</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">매일 얼마나 벌었나요?</h3>
          <p className="text-sm text-gray-500 mb-4">매일 수익과 손실이 다르게 나타나요</p>
          
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={dailyProfitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#999"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#999"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [`${value}%`, value > 0 ? '수익' : '손실']}
              />
              <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                {dailyProfitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center border-2 border-green-200">
              <p className="text-xs text-green-700 mb-1">이긴 날</p>
              <p className="text-2xl font-bold text-green-800">10일</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border-2 border-red-200">
              <p className="text-xs text-red-700 mb-1">진 날</p>
              <p className="text-2xl font-bold text-red-800">4일</p>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">언제 사고 팔았나요?</h3>
          <p className="text-sm text-gray-500 mb-4">파도의 어느 부분에서 결정했는지 볼까요?</p>
          
          <div className="space-y-3">
            {tradeAnalysis.map((trade, idx) => {
              const isBuy = trade.action === 'buy';

              return (
                <div key={idx} className="bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 rounded-2xl p-4 border-l-4 border-l-cyan-400 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {isBuy ? '🏄' : '🎯'}
                      </div>
                      <div>
                        <p className={`font-bold ${isBuy ? 'text-red-600' : 'text-green-600'}`}>
                          {isBuy ? '매수 (사기)' : '매도 (팔기)'}
                        </p>
                        <p className="text-xs text-gray-500">{trade.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{trade.result}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">파도 위치</span>
                      <span className="text-sm font-bold text-purple-600">{trade.wavePoint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">한 마디로</span>
                      <span className="text-sm font-semibold text-blue-600">{trade.desc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">평가</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        trade.timing === '완벽' ? 'bg-green-100 text-green-700' :
                        trade.timing === '우수' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {trade.timing}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wave Pattern Chart */}
        <section className="mt-6 bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">파도 패턴 분석</h3>
          </div>
          
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={waveData}>
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A6BFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A6BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#999"
                  tick={{ fontSize: 11 }}
                  label={{ value: '일', position: 'insideBottomRight', offset: -5, fontSize: 12 }}
                />
                <YAxis 
                  stroke="#999"
                  tick={{ fontSize: 11 }}
                  domain={[60000, 115000]}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'price') return [`${formatNumber(value)}원`, '주가'];
                    return [value, name];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#4A6BFF" 
                  strokeWidth={3}
                  fill="url(#waveGradient)" 
                />
                {waveData.map((entry, index) => {
                  if (entry.action === 'buy') {
                    return (
                      <ReferenceLine 
                        key={`buy-${index}`}
                        x={entry.day} 
                        stroke="#FF3D00" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ 
                          value: '매수', 
                          fill: '#FF3D00', 
                          fontSize: 10, 
                          position: 'top' 
                        }}
                      />
                    );
                  }
                  if (entry.action === 'sell') {
                    return (
                      <ReferenceLine 
                        key={`sell-${index}`}
                        x={entry.day} 
                        stroke="#00C853" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ 
                          value: '매도', 
                          fill: '#00C853', 
                          fontSize: 10, 
                          position: 'top' 
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <p className="font-bold text-gray-900">파동 해석</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">1-2파 포착률</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">3파 활용</span>
                <span className="font-bold text-blue-600">완벽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">조정파 대응</span>
                <span className="font-bold text-purple-600">우수</span>
              </div>
            </div>
          </div>
        </section>

        {/* Profit Trend */}
        <section className="mt-6 bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">수익률 추이</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyProfitData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C853" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" tick={{ fontSize: 11 }} />
              <YAxis stroke="#999" tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [`${value}%`, '수익률']}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#00C853" 
                strokeWidth={3}
                fill="url(#profitGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-700 mb-1">평균 수익</p>
              <p className="text-xl font-bold text-green-800">+{(user.profitRate / 6).toFixed(1)}%</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-700 mb-1">최대 수익</p>
              <p className="text-xl font-bold text-blue-800">+27%</p>
            </div>
          </div>
        </section>

        {/* Investment Strategy (Top 3 only) */}
        {isTopThree && (
          <section className="mt-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">핵심 투자 전략</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">엘리엇 파동 활용</p>
                <p className="text-gray-600 text-sm">
                  3파 상승 구간에서 집중 매수, 5파 완성 시점에 목표가 도달하여 매도하는 전략으로 안정적인 수익 실현
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">조정파 대응</p>
                <p className="text-gray-600 text-sm">
                  2파, 4파 조정 구간에서 관망하며, C파 완료 시점에 재진입하여 신규 상승 사이클 포착
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">리스크 관리</p>
                <p className="text-gray-600 text-sm">
                  매 거래마다 손절선 5% 설정, 목표 수익 15% 도달 시 분할 매도로 리스크 최소화
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
