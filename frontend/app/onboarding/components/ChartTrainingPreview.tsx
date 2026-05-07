'use client';

import { useEffect, useState } from 'react';

const PRICE_PATH = [40, 38, 45, 42, 50, 55, 52, 60, 65, 62, 72, 78, 75, 85, 92, 98];

function buildSmoothPath(values: number[], w: number, h: number) {
  const step = w / (values.length - 1);
  const norm = (v: number) => h - (v / 100) * h * 0.85 - h * 0.05;
  const pts = values.map((v, i) => [i * step, norm(v)] as const);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` Q ${cx},${y0} ${cx},${(y0 + y1) / 2} T ${x1},${y1}`;
  }
  return { d, pts };
}

export function ChartTrainingPreview({ trigger }: { trigger: number }) {
  const W = 300, H = 110;
  const { d, pts } = buildSmoothPath(PRICE_PATH, W, H);
  const last = pts[pts.length - 1];
  const buyIdx = 3;
  const sellIdx = 11;

  const [price, setPrice] = useState(132.4);
  useEffect(() => {
    let raf: number;
    let t = 0;
    const animate = () => {
      t += 0.06;
      setPrice(132.4 + Math.sin(t) * 0.8 + Math.cos(t * 1.7) * 0.4);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-2xl border border-white/5 overflow-hidden">
      {/* 종목 헤더 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <span className="text-[9px] font-black text-black">N</span>
          </div>
          <div>
            <p className="text-[11px] font-black text-white leading-none">엔비디아</p>
            <p className="text-[8px] text-gray-500 mt-0.5">NVDA · NASDAQ</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-white tabular-nums leading-none">
            ${price.toFixed(2)}
          </p>
          <p className="text-[8px] font-black text-green-400 mt-0.5">▲ +4.85%</p>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-[110px] px-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ct-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ct-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* 그리드 */}
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1="0" y1={H * p} x2={W} y2={H * p} stroke="#ffffff08" strokeDasharray="2 4" />
          ))}

          {/* 영역 */}
          <path d={`${d} L ${W},${H} L 0,${H} Z`} fill="url(#ct-fill)">
            <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
          </path>

          {/* 라인 */}
          <path
            d={d}
            fill="none"
            stroke="url(#ct-stroke)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset="600"
          >
            <animate attributeName="stroke-dashoffset" from="600" to="0" dur="1.2s" fill="freeze" />
          </path>

          {/* 매수 시그널 */}
          <g transform={`translate(${pts[buyIdx][0]},${pts[buyIdx][1]})`}>
            <circle r="9" fill="#22c55e" opacity="0.15">
              <animate attributeName="r" values="6;14;6" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r="4" fill="#22c55e" stroke="#0a0a0a" strokeWidth="1.5" />
            <text y="-10" textAnchor="middle" fontSize="8" fontWeight="900" fill="#22c55e">BUY</text>
          </g>

          {/* 매도 시그널 */}
          <g transform={`translate(${pts[sellIdx][0]},${pts[sellIdx][1]})`}>
            <circle r="4" fill="#ef4444" stroke="#0a0a0a" strokeWidth="1.5" />
            <text y="-10" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ef4444">SELL?</text>
          </g>

          {/* 현재 점 */}
          <circle cx={last[0]} cy={last[1]} r="9" fill="#22c55e" opacity="0.2">
            <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={last[0]} cy={last[1]} r="3.5" fill="#22c55e" stroke="#fff" strokeWidth="1" />
        </svg>
      </div>

      {/* 액션 버튼 */}
      <div className="px-3 pb-3 pt-1">
        <div className="grid grid-cols-3 gap-1.5">
          <button className="h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center gap-1 active:scale-95 transition">
            <span className="text-[10px] font-black text-green-400">살래</span>
          </button>
          <button className="h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center gap-1 active:scale-95 transition">
            <span className="text-[10px] font-black text-red-400">팔래</span>
          </button>
          <button className="h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition">
            <span className="text-[10px] font-black text-gray-400">기다릴게</span>
          </button>
        </div>
      </div>
    </div>
  );
}
