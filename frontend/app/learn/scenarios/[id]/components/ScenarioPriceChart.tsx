'use client';

import type { LegendaryScenario } from '@/data/legendary-scenarios';

interface Props {
  scenario: LegendaryScenario;
}

const VB_W = 300;
const VB_H = 100;
const PAD_X = 12;
const PAD_Y = 14;
const CHART_W = VB_W - PAD_X * 2;
const CHART_H = VB_H - PAD_Y * 2;

function parseRate(s: string): number {
  return parseFloat(s.replace('%', '').replace('+', '')) / 100;
}

export function ScenarioPriceChart({ scenario }: Props) {
  // 누적 수익률 계산 (100 시작)
  const prices: number[] = [100];
  scenario.events.forEach((ev) => {
    const r = parseRate(ev.priceChange);
    prices.push(prices[prices.length - 1] * (1 + r));
  });

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const toSVG = (idx: number, price: number) => ({
    sx: PAD_X + (idx / (prices.length - 1)) * CHART_W,
    sy: PAD_Y + ((maxP - price) / range) * CHART_H,
  });

  // 선 경로
  const pts = prices.map((p, i) => toSVG(i, p));
  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
      const prev = pts[i - 1];
      const cpx = (prev.sx + p.sx) / 2;
      return `C ${cpx.toFixed(1)},${prev.sy.toFixed(1)} ${cpx.toFixed(1)},${p.sy.toFixed(1)} ${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
    })
    .join(' ');

  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const bottomY = PAD_Y + CHART_H;
  const areaPath = `${linePath} L ${lastPt.sx.toFixed(1)},${bottomY} L ${firstPt.sx.toFixed(1)},${bottomY} Z`;

  const finalPrice = prices[prices.length - 1];
  const totalReturn = ((finalPrice - 100) / 100) * 100;
  const isPositive = totalReturn >= 0;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const gradId = `grad-${scenario.id}`;

  // 최저/최고점 인덱스
  const minIdx = prices.indexOf(minP);
  const maxIdx = prices.indexOf(maxP);

  return (
    <div className="bg-[#12121a] rounded-xl border border-white/8 overflow-hidden">
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <p className="text-[10px] text-gray-500">10턴 가격 흐름</p>
        <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{totalReturn.toFixed(1)}%
        </span>
      </div>

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 그리드 */}
        {[0, 50, 100].map((pct) => {
          const sy = PAD_Y + (pct / 100) * CHART_H;
          return (
            <line key={pct} x1={PAD_X} y1={sy} x2={VB_W - PAD_X} y2={sy}
              stroke="white" strokeOpacity="0.04" strokeWidth="1" />
          );
        })}

        {/* 시작선 (기준) */}
        {(() => {
          const basePt = toSVG(0, 100);
          return (
            <line x1={PAD_X} y1={basePt.sy} x2={VB_W - PAD_X} y2={basePt.sy}
              stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3,3" />
          );
        })()}

        {/* 에리어 */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* 가격선 */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* 최저점 마커 */}
        {minIdx !== 0 && (
          <g>
            <circle cx={pts[minIdx].sx} cy={pts[minIdx].sy} r="3.5" fill="#ef4444" stroke="#12121a" strokeWidth="1.5" />
            <text x={pts[minIdx].sx} y={pts[minIdx].sy + 13} textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="bold">
              바닥
            </text>
          </g>
        )}

        {/* 최고점 마커 (마지막 점이 최고점이면 표시) */}
        {maxIdx !== 0 && maxIdx !== minIdx && (
          <g>
            <circle cx={pts[maxIdx].sx} cy={pts[maxIdx].sy} r="3.5" fill="#22c55e" stroke="#12121a" strokeWidth="1.5" />
            <text x={pts[maxIdx].sx} y={pts[maxIdx].sy - 6} textAnchor="middle" fill="#22c55e" fontSize="7" fontWeight="bold">
              고점
            </text>
          </g>
        )}

        {/* 턴 눈금 */}
        {prices.map((_, i) => {
          if (i === 0) return null;
          const pt = toSVG(i, prices[i]);
          return (
            <text key={i} x={pt.sx} y={bottomY + 9} textAnchor="middle" fill="#374151" fontSize="6">
              {i}
            </text>
          );
        })}

        {/* 시작 레이블 */}
        <text x={PAD_X} y={bottomY + 9} textAnchor="start" fill="#374151" fontSize="6">시작</text>
      </svg>

      {/* 이벤트 감성 바 */}
      <div className="flex gap-px px-3 pb-2.5 mt-0.5">
        {scenario.events.map((ev, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              ev.sentiment === 'shock' ? 'bg-red-500' :
              ev.sentiment === 'negative' ? 'bg-orange-400' :
              ev.sentiment === 'positive' ? 'bg-green-500' : 'bg-gray-600'
            }`}
            title={`턴 ${i + 1}: ${ev.priceChange}`}
          />
        ))}
      </div>
    </div>
  );
}
