'use client';

import { useRef, useEffect } from 'react';

const CHART_DATA = [70, 68, 65, 60, 40, 25, 30, 42, 38, 45, 50, 48, 55, 60, 58, 65];
const COLORS = {
  stroke: '#eab308',
  fill1: 'rgba(234,179,8,0.25)',
  fill2: 'rgba(234,179,8,0)',
  dot: 'rgba(234,179,8,0.2)',
};

export function EventScenarioPreview({ trigger }: { trigger: number }) {
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
      <div className="h-24 p-2">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="px-3 pb-3 space-y-2">
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🚨</span>
            <span className="text-[10px] font-black text-red-400">긴급 뉴스</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-snug">
            &quot;A사 실적 쇼크, 예상치 40% 하회&quot;
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-1">
            <span className="text-[10px] font-black text-red-400">즉시 매도</span>
          </div>
          <div className="flex-1 h-9 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center gap-1">
            <span className="text-[10px] font-black text-yellow-400">일부 매도</span>
          </div>
          <div className="flex-1 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center gap-1">
            <span className="text-[10px] font-black text-blue-400">홀딩</span>
          </div>
        </div>
      </div>
    </div>
  );
}
