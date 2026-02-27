'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import onboardingData from '../data.json';

export function AIBattlePreview() {
  const { data, finalReturns, insight } = onboardingData.comparisonChart;

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
      {/* 차트 영역 */}
      <div className="h-[160px] p-3 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="topGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis 
              dataKey="turn" 
              tick={{ fontSize: 9, fill: '#6b7280' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => `${v}턴`}
            />
            <YAxis 
              domain={[98, 125]}
              tick={{ fontSize: 9, fill: '#6b7280' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#111', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: 10,
                padding: '6px 8px'
              }}
              formatter={(value: number) => [`${value}%`, '']}
              labelStyle={{ color: '#9ca3af', fontSize: 9 }}
              labelFormatter={(label) => `${label}턴`}
            />
            <Line
              type="monotone"
              dataKey="topPerformer"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: '#eab308', r: 2.5 }}
              activeDot={{ r: 4 }}
              name="최고 수익"
            />
            <Line
              type="monotone"
              dataKey="similarAI"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 2.5 }}
              activeDot={{ r: 4 }}
              name="유사 AI"
            />
            <Line
              type="monotone"
              dataKey="user"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 2.5 }}
              activeDot={{ r: 4 }}
              name="나"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 정보 */}
      <div className="px-3 pb-3 space-y-2">
        {/* 3개 수익률 비교 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className="text-base mb-0.5">🧑</div>
            <p className="text-[9px] font-bold text-gray-400">나</p>
            <p className="text-xs font-black text-green-400">{finalReturns.user}</p>
          </div>
          <div className="flex-1 text-center">
            <div className="text-base mb-0.5">👑</div>
            <p className="text-[9px] font-bold text-gray-400">최고 수익</p>
            <p className="text-xs font-black text-yellow-400">{finalReturns.topPerformer}</p>
          </div>
          <div className="flex-1 text-center">
            <div className="text-base mb-0.5">🤖</div>
            <p className="text-[9px] font-bold text-gray-400">유사 AI</p>
            <p className="text-xs font-black text-indigo-400">{finalReturns.similarAI}</p>
          </div>
        </div>

        {/* AI 피드백 */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5">
          <p className="text-[9px] text-indigo-300 leading-snug">
            💬 &quot;{insight}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
