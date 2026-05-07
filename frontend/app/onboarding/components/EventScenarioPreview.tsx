'use client';

import { useEffect, useState } from 'react';

const NEWS_FEED = [
  { icon: '🚨', tag: '긴급', tagColor: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', title: '테슬라 실적 쇼크, 예상치 30% 하회' },
  { icon: '⚡', tag: '속보', tagColor: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', title: '엔비디아 신규 AI칩 발표 — 시간외 +8%' },
  { icon: '📉', tag: '경고', tagColor: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', title: 'SK하이닉스, HBM 공급 차질 우려' },
];

export function EventScenarioPreview({ trigger }: { trigger: number }) {
  const W = 300, H = 80;
  const [newsIdx, setNewsIdx] = useState(0);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    setNewsIdx(0);
    setCountdown(15);
    const newsTimer = setInterval(() => setNewsIdx(i => (i + 1) % NEWS_FEED.length), 2400);
    const cdTimer = setInterval(() => setCountdown(c => (c <= 1 ? 15 : c - 1)), 1000);
    return () => { clearInterval(newsTimer); clearInterval(cdTimer); };
  }, [trigger]);

  const news = NEWS_FEED[newsIdx];

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-2xl border border-white/5 overflow-hidden">
      {/* 충격 차트 */}
      <div className="relative h-20">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="es-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,30 L40,28 L70,32 L100,38 L130,35 L150,40 L165,55 L180,68 L200,62 L230,58 L260,52 L300,48 L300,80 L0,80 Z"
            fill="url(#es-fill)"
          />
          <path
            d="M0,30 L40,28 L70,32 L100,38 L130,35 L150,40 L165,55 L180,68 L200,62 L230,58 L260,52 L300,48"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="500"
            strokeDashoffset="500"
          >
            <animate attributeName="stroke-dashoffset" from="500" to="0" dur="1s" fill="freeze" />
          </path>
          {/* 폭락 화살표 */}
          <g transform="translate(170,50)">
            <circle r="14" fill="#ef4444" opacity="0.2">
              <animate attributeName="r" values="10;18;10" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <text textAnchor="middle" y="4" fontSize="14">⚠️</text>
          </g>
        </svg>

        {/* 카운트다운 배지 */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[9px] font-black text-white tabular-nums">{countdown}s</span>
        </div>

        {/* 가격 변동 */}
        <div className="absolute top-2 left-2">
          <p className="text-[8px] text-gray-500">실시간</p>
          <p className="text-[11px] font-black text-red-400">-7.42%</p>
        </div>
      </div>

      {/* 뉴스 카드 */}
      <div className="px-3 pt-2">
        <div
          key={newsIdx}
          className={`${news.bg} border rounded-xl px-2.5 py-2 animate-news-in`}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{news.icon}</span>
            <span className={`text-[9px] font-black ${news.tagColor}`}>{news.tag}</span>
            <span className="ml-auto text-[8px] text-gray-500">방금 전</span>
          </div>
          <p className="text-[10px] text-gray-200 leading-snug font-bold">{news.title}</p>
        </div>
      </div>

      {/* 선택지 */}
      <div className="px-3 pt-2 pb-3">
        <div className="grid grid-cols-3 gap-1.5">
          <button className="h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex flex-col items-center justify-center active:scale-95 transition">
            <span className="text-[9px]">💥</span>
            <span className="text-[9px] font-black text-red-400">즉시 매도</span>
          </button>
          <button className="h-9 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex flex-col items-center justify-center active:scale-95 transition">
            <span className="text-[9px]">✂️</span>
            <span className="text-[9px] font-black text-yellow-400">일부 매도</span>
          </button>
          <button className="h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex flex-col items-center justify-center active:scale-95 transition">
            <span className="text-[9px]">💎</span>
            <span className="text-[9px] font-black text-blue-400">홀딩</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes newsIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-news-in { animation: newsIn 0.35s ease-out; }
      `}</style>
    </div>
  );
}
