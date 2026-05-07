'use client';

import { useEffect, useState } from 'react';

type Stock = {
  ticker: string;
  name: string;
  price: number;
  pct: number;
  spark: number[];
  logoBg: string;
  logoText: string;
};

const STOCKS: Stock[] = [
  {
    ticker: 'NVDA',
    name: '엔비디아',
    price: 1284.5,
    pct: 6.42,
    spark: [40, 45, 42, 50, 55, 52, 60, 68, 65, 75, 82, 88],
    logoBg: 'from-green-400 to-emerald-600',
    logoText: 'N',
  },
  {
    ticker: '005930',
    name: '삼성전자',
    price: 78400,
    pct: 2.15,
    spark: [50, 52, 48, 55, 58, 56, 60, 62, 64, 68, 65, 70],
    logoBg: 'from-blue-400 to-blue-700',
    logoText: '삼',
  },
  {
    ticker: '000660',
    name: 'SK하이닉스',
    price: 235500,
    pct: 4.83,
    spark: [42, 48, 45, 52, 58, 55, 65, 70, 68, 75, 80, 85],
    logoBg: 'from-red-400 to-rose-600',
    logoText: 'SK',
  },
  {
    ticker: 'TSLA',
    name: '테슬라',
    price: 248.32,
    pct: -1.84,
    spark: [70, 65, 68, 60, 62, 55, 58, 52, 55, 50, 48, 52],
    logoBg: 'from-red-500 to-red-800',
    logoText: 'T',
  },
  {
    ticker: '005380',
    name: '현대차',
    price: 245000,
    pct: 3.27,
    spark: [45, 48, 46, 52, 55, 58, 56, 62, 65, 68, 66, 72],
    logoBg: 'from-indigo-400 to-blue-700',
    logoText: '현',
  },
  {
    ticker: '454910',
    name: '레인보우로보틱스',
    price: 187300,
    pct: 8.91,
    spark: [30, 38, 35, 45, 52, 50, 60, 68, 72, 78, 85, 92],
    logoBg: 'from-cyan-400 to-teal-600',
    logoText: 'R',
  },
];

function buildSpark(values: number[], w: number, h: number) {
  const step = w / (values.length - 1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const norm = (v: number) => h - ((v - min) / range) * h * 0.85 - h * 0.075;
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${norm(v)}`).join(' ');
}

function fmtPrice(ticker: string, p: number) {
  if (/^\d/.test(ticker)) return `₩${Math.round(p).toLocaleString()}`;
  return `$${p.toFixed(2)}`;
}

export function RealDataPreview({ trigger }: { trigger: number }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    const timer = setInterval(() => setTick(t => t + 1), 1800);
    return () => clearInterval(timer);
  }, [trigger]);

  // 0~3번 인덱스 노출 (스크롤처럼 변경)
  const visible = [0, 1, 2, 3].map(i => STOCKS[(tick + i) % STOCKS.length]);

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-2xl border border-white/5 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[9px] font-black text-cyan-300 tracking-wider">LIVE · AI / ROBOT</span>
        </div>
        <span className="text-[8px] text-gray-500">{STOCKS.length}종목</span>
      </div>

      {/* 종목 리스트 */}
      <div className="px-2 py-1.5 space-y-1">
        {visible.map((s, i) => {
          const up = s.pct >= 0;
          return (
            <div
              key={`${s.ticker}-${tick}-${i}`}
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-white/[0.02] animate-row-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* 로고 */}
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.logoBg} flex items-center justify-center shrink-0 shadow-lg`}>
                <span className="text-[9px] font-black text-white">{s.logoText}</span>
              </div>

              {/* 이름·티커 */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate leading-none">{s.name}</p>
                <p className="text-[8px] text-gray-500 mt-0.5">{s.ticker}</p>
              </div>

              {/* 미니 스파크라인 */}
              <svg width="40" height="18" className="shrink-0">
                <path
                  d={buildSpark(s.spark, 40, 18)}
                  fill="none"
                  stroke={up ? '#22c55e' : '#ef4444'}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* 가격 */}
              <div className="text-right shrink-0 w-[68px]">
                <p className="text-[10px] font-black text-white tabular-nums leading-none">
                  {fmtPrice(s.ticker, s.price)}
                </p>
                <p className={`text-[9px] font-black tabular-nums mt-0.5 ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(s.pct).toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 푸터 */}
      <div className="px-3 pb-2 pt-1 border-t border-white/5">
        <p className="text-[8.5px] text-gray-600 text-center">실제 1년 데이터 · 매일 업데이트</p>
      </div>

      <style jsx>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-row-in { animation: rowIn 0.4s ease-out backwards; }
      `}</style>
    </div>
  );
}
