'use client';

import { type ChartData } from '@/data/chart-patterns';

interface PatternChartSVGProps {
  chartData: ChartData;
  signal: '매수' | '매도' | '양방향';
  patternName: string;
}

const VB_W = 300;
const VB_H = 160;
const PAD_X = 24;
const PAD_Y = 28;
const CHART_W = VB_W - PAD_X * 2;
const CHART_H = VB_H - PAD_Y * 2;

function toSVG(x: number, y: number) {
  return {
    sx: PAD_X + (x / 100) * CHART_W,
    sy: PAD_Y + (y / 100) * CHART_H,
  };
}

function buildPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  const svgPts = points.map(([x, y]) => toSVG(x, y));

  let d = `M ${svgPts[0].sx.toFixed(1)},${svgPts[0].sy.toFixed(1)}`;

  for (let i = 1; i < svgPts.length; i++) {
    const prev = svgPts[i - 1];
    const curr = svgPts[i];
    const cpx = (prev.sx + curr.sx) / 2;
    d += ` C ${cpx.toFixed(1)},${prev.sy.toFixed(1)} ${cpx.toFixed(1)},${curr.sy.toFixed(1)} ${curr.sx.toFixed(1)},${curr.sy.toFixed(1)}`;
  }

  return d;
}

function buildAreaPath(points: [number, number][]): string {
  const linePath = buildPath(points);
  if (!linePath) return '';

  const lastPt = toSVG(points[points.length - 1][0], points[points.length - 1][1]);
  const firstPt = toSVG(points[0][0], points[0][1]);
  const bottomY = PAD_Y + CHART_H;

  return `${linePath} L ${lastPt.sx.toFixed(1)},${bottomY} L ${firstPt.sx.toFixed(1)},${bottomY} Z`;
}

export function PatternChartSVG({ chartData, signal, patternName }: PatternChartSVGProps) {
  const { points, necklineY, highlights } = chartData;
  const gradId = `grad-${signal}`;
  const areaGradId = `area-${signal}`;

  const lineColor = signal === '매도' ? '#ef4444' : signal === '매수' ? '#22c55e' : '#f59e0b';
  const lineColorStart = '#818cf8';

  const linePath = buildPath(points);
  const areaPath = buildAreaPath(points);

  const necklineSY = necklineY != null ? toSVG(0, necklineY).sy : null;

  return (
    <div className="relative">
      <div className="text-[10px] text-gray-500 mb-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
        실전 차트 — {patternName} 패턴
      </div>
      <div className="bg-[#12121a] rounded-xl border border-white/8 overflow-hidden">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={lineColorStart} />
              <stop offset="65%" stopColor={lineColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor={lineColor} />
            </linearGradient>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 가로 그리드 */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const sy = PAD_Y + (pct / 100) * CHART_H;
            return (
              <line
                key={pct}
                x1={PAD_X}
                y1={sy}
                x2={VB_W - PAD_X}
                y2={sy}
                stroke="white"
                strokeOpacity="0.04"
                strokeWidth="1"
              />
            );
          })}

          {/* 넥라인 점선 */}
          {necklineSY != null && (
            <g>
              <line
                x1={PAD_X}
                y1={necklineSY}
                x2={VB_W - PAD_X}
                y2={necklineSY}
                stroke="#818cf8"
                strokeWidth="1.2"
                strokeDasharray="4,3"
                strokeOpacity="0.8"
              />
              <rect
                x={PAD_X}
                y={necklineSY - 8}
                width={34}
                height={10}
                rx="3"
                fill="#312e81"
                fillOpacity="0.85"
              />
              <text
                x={PAD_X + 3}
                y={necklineSY - 1}
                fill="#a5b4fc"
                fontSize="7"
                fontWeight="bold"
              >
                넥라인
              </text>
            </g>
          )}

          {/* 에리어 채우기 */}
          <path d={areaPath} fill={`url(#${areaGradId})`} />

          {/* 가격 선 */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 하이라이트 포인트 */}
          {highlights.map((h, i) => {
            const { sx, sy } = toSVG(h.x, h.y);
            const dotColor =
              h.type === 'buy'
                ? '#22c55e'
                : h.type === 'sell'
                ? '#ef4444'
                : h.type === 'danger'
                ? '#f97316'
                : '#94a3b8';
            const labelAbove = h.position === 'above';
            const textY = labelAbove ? sy - 8 : sy + 14;
            const isAction = h.type === 'buy' || h.type === 'sell';

            return (
              <g key={i}>
                {isAction && (
                  <circle cx={sx} cy={sy} r="9" fill={dotColor} fillOpacity="0.15" />
                )}
                <circle
                  cx={sx}
                  cy={sy}
                  r={isAction ? 4.5 : 3}
                  fill={dotColor}
                  stroke="#12121a"
                  strokeWidth="1.5"
                />
                <text
                  x={sx}
                  y={textY}
                  textAnchor="middle"
                  fill={dotColor}
                  fontSize={isAction ? '9' : '8'}
                  fontWeight={isAction ? 'bold' : 'normal'}
                >
                  {h.label}
                </text>
              </g>
            );
          })}

          {/* 시작/끝 가격 레이블 (상대적 위치) */}
          {points.length > 0 && (() => {
            const startPt = toSVG(points[0][0], points[0][1]);
            const endPt = toSVG(points[points.length - 1][0], points[points.length - 1][1]);
            const endIsUp = points[points.length - 1][1] < points[0][1];
            return (
              <>
                <text
                  x={startPt.sx + 4}
                  y={startPt.sy - 5}
                  fill="#64748b"
                  fontSize="7"
                >
                  시작
                </text>
                <text
                  x={endPt.sx - 2}
                  y={endIsUp ? endPt.sy - 5 : endPt.sy + 12}
                  textAnchor="end"
                  fill={endIsUp ? '#22c55e' : '#ef4444'}
                  fontSize="7"
                  fontWeight="bold"
                >
                  {endIsUp ? '▲ 상승' : '▼ 하락'}
                </text>
              </>
            );
          })()}
        </svg>

        {/* 하단 범례 */}
        <div className="flex items-center gap-3 px-3 pb-2.5 pt-0.5">
          {necklineY != null && (
            <div className="flex items-center gap-1">
              <svg width="18" height="6">
                <line x1="0" y1="3" x2="18" y2="3" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,2" />
              </svg>
              <span className="text-[9px] text-indigo-400">넥라인</span>
            </div>
          )}
          {highlights.filter(h => h.type === 'buy').length > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-[9px] text-green-400">매수 포인트</span>
            </div>
          )}
          {highlights.filter(h => h.type === 'sell').length > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span className="text-[9px] text-red-400">매도 포인트</span>
            </div>
          )}
          {highlights.filter(h => h.type === 'info').length > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span className="text-[9px] text-slate-400">주요 지점</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
