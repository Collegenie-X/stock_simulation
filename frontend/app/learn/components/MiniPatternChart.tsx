'use client';

import { type ChartData } from '@/data/chart-patterns';

interface MiniPatternChartProps {
  chartData: ChartData;
  signal: '매수' | '매도' | '양방향';
}

const VB_W = 80;
const VB_H = 44;
const PAD_X = 4;
const PAD_Y = 6;
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

export function MiniPatternChart({ chartData, signal }: MiniPatternChartProps) {
  const lineColor =
    signal === '매도' ? '#ef4444' : signal === '매수' ? '#22c55e' : '#f59e0b';
  const gradId = `mini-grad-${signal}-${Math.random().toString(36).slice(2, 6)}`;
  const linePath = buildPath(chartData.points);
  const areaPath = buildAreaPath(chartData.points);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      className="shrink-0 rounded-lg overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
