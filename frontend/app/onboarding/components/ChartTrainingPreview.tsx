'use client';

import { useRef, useEffect } from 'react';

const CHART_DATA = [30, 35, 28, 38, 45, 42, 50, 48, 55, 58, 52, 60, 65, 62, 70, 75];
const COLORS = {
  stroke: '#22c55e',
  fill1: 'rgba(34,197,94,0.3)',
  fill2: 'rgba(34,197,94,0)',
  dot: 'rgba(34,197,94,0.25)',
};

export function ChartTrainingPreview({ trigger }: { trigger: number }) {
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
      <div className="h-32 p-2">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="px-3 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-600">현재가</p>
            <p className="text-sm font-black text-white">56,200원</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-600">손익</p>
            <p className="text-sm font-black text-green-400">+3,200원</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <span className="text-[10px] font-black text-green-400">살래</span>
          </div>
          <div className="h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <span className="text-[10px] font-black text-red-400">팔래</span>
          </div>
          <div className="h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[10px] font-black text-gray-400">기다릴게</span>
          </div>
        </div>
      </div>
    </div>
  );
}
