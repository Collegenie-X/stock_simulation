'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import onboardingData from '../data.json';

const RANK = [
  { emoji: '👑', label: '최고 수익', who: 'topPerformer', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/5', border: 'border-yellow-500/30' },
  { emoji: '🤖', label: '유사 AI', who: 'similarAI', color: 'text-indigo-400', bg: 'from-indigo-500/20 to-purple-500/5', border: 'border-indigo-500/30' },
  { emoji: '🧑', label: '나', who: 'user', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/5', border: 'border-green-500/30' },
] as const;

export function AIBattlePreview() {
  const { data, finalReturns, insight } = onboardingData.comparisonChart;

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-2xl border border-white/5 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">⚔️</span>
          <span className="text-[9px] font-black text-indigo-300 tracking-wider">8-TURN BATTLE</span>
        </div>
        <span className="text-[8px] text-gray-500">FINAL</span>
      </div>

      {/* 차트 */}
      <div className="h-[130px] px-2 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="ai-top" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#ffffff08" />
            <XAxis dataKey="turn" tick={{ fontSize: 8, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}턴`} />
            <YAxis domain={[95, 140]} tick={{ fontSize: 8, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={32} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 10, padding: '4px 8px' }}
              formatter={(v: number) => [`${v}%`, '']}
              labelStyle={{ color: '#9ca3af', fontSize: 9 }}
              labelFormatter={l => `${l}턴`}
            />
            <Line type="monotone" dataKey="topPerformer" stroke="url(#ai-top)" strokeWidth={2.2} dot={{ fill: '#eab308', r: 2.5 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="similarAI" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 2 }} activeDot={{ r: 4 }} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="user" stroke="#22c55e" strokeWidth={2.4} dot={{ fill: '#22c55e', r: 2.5 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 랭킹 카드 */}
      <div className="px-3 pt-1.5 pb-2">
        <div className="grid grid-cols-3 gap-1.5">
          {RANK.map((r, i) => (
            <div
              key={r.who}
              className={`relative bg-gradient-to-b ${r.bg} border ${r.border} rounded-lg px-1 py-1.5 text-center`}
            >
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <span className="text-[7px] font-black text-gray-400">{i + 1}</span>
              </div>
              <div className="text-sm leading-none mb-0.5">{r.emoji}</div>
              <p className="text-[8px] font-bold text-gray-400">{r.label}</p>
              <p className={`text-[11px] font-black ${r.color} tabular-nums leading-none mt-0.5`}>
                {finalReturns[r.who as keyof typeof finalReturns]}
              </p>
            </div>
          ))}
        </div>

        {/* AI 코멘트 */}
        <div className="mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1.5 flex gap-1.5">
          <span className="text-xs leading-none">💬</span>
          <p className="text-[9px] text-indigo-200 leading-snug flex-1">{insight}</p>
        </div>
      </div>
    </div>
  );
}
