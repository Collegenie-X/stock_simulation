'use client';

import { useRef, useEffect } from 'react';

const CHART_DATA = [35, 40, 50, 45, 55, 60, 52, 65, 70, 68, 75, 72, 80, 78, 82, 88];
const COLORS = {
  stroke: '#06b6d4',
  fill1: 'rgba(6,182,212,0.25)',
  fill2: 'rgba(6,182,212,0)',
  dot: 'rgba(6,182,212,0.2)',
};

const STOCKS = [
  { name: '레인보우로보틱스', pct: '+18.5%', color: 'text-green-400' },
  { name: '두산로보틱스', pct: '+12.3%', color: 'text-green-400' },
  { name: '엔비디아(NVDA)', pct: '+45.2%', color: 'text-green-400' },
];

export function RealDataPreview({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 300;
    const H = 90;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const pts = CHART_DATA;
    const total = pts.length;
    const xStep = W / (total - 1);
    const norm = (v: number) => H - (v / 100) * H * 0.85 - H * 0.05;

    let drawn = 0;
    let raf: number;

    function frame() {
      drawn += 0.25;
      ctx!.clearRect(0, 0, W, H);
      const count = Math.min(Math.floor(drawn), total);
      if (count < 2) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, COLORS.fill1);
      grad.addColorStop(1, COLORS.fill2);
      ctx!.beginPath();
      ctx!.moveTo(0, norm(pts[0]));
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(pts[i]));
      ctx!.lineTo((count - 1) * xStep, H);
      ctx!.lineTo(0, H);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(0, norm(pts[0]));
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(pts[i]));
      ctx!.strokeStyle = COLORS.stroke;
      ctx!.lineWidth = 2;
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';
      ctx!.stroke();

      const lx = (count - 1) * xStep;
      const ly = norm(pts[count - 1]);
      ctx!.beginPath();
      ctx!.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx!.fillStyle = COLORS.stroke;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx!.fillStyle = COLORS.dot;
      ctx!.fill();

      if (drawn < total) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="h-28 p-2">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="px-3 pb-3 space-y-1.5">
        {STOCKS.map((s) => (
          <div key={s.name} className="flex items-center justify-between py-1 px-1">
            <span className="text-[10px] text-gray-300 font-bold">{s.name}</span>
            <span className={`text-[10px] font-black ${s.color}`}>{s.pct}</span>
          </div>
        ))}
        <p className="text-[9px] text-gray-600 text-center pt-1">실제 1년 데이터 기반 시뮬레이션</p>
      </div>
    </div>
  );
}
