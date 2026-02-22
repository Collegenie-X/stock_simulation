"use client";

import { useEffect, useRef } from "react";
import { CHART_VARIANTS, CHART_COLORS } from "../config";

interface AnimatedMiniChartProps {
  variant: number;
  accent: string;
  trigger?: number | boolean;
  className?: string;
}

export default function AnimatedMiniChart({
  variant,
  accent,
  trigger,
  className = "",
}: AnimatedMiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = CHART_VARIANTS[variant] ?? CHART_VARIANTS[0];
    const colors = CHART_COLORS[accent] ?? CHART_COLORS.green;

    const W = canvas.offsetWidth || 300;
    const H = canvas.offsetHeight || 100;
    canvas.width = W;
    canvas.height = H;

    const pad = { x: 8, y: 10 };
    const totalFrames = 80;
    let frame = 0;

    function toX(i: number, total: number) {
      return pad.x + (i / (total - 1)) * (W - pad.x * 2);
    }
    function toY(v: number) {
      return pad.y + ((100 - v) / 100) * (H - pad.y * 2);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      const progress = Math.min(frame / totalFrames, 1);
      const visibleCount = Math.max(
        2,
        Math.round(progress * (points.length - 1))
      );

      const visiblePts: { x: number; y: number }[] = [];
      for (let i = 0; i <= visibleCount; i++) {
        visiblePts.push({ x: toX(i, points.length), y: toY(points[i]) });
      }

      // gradient fill
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, colors.fill1);
      grad.addColorStop(1, colors.fill2);

      ctx!.beginPath();
      ctx!.moveTo(visiblePts[0].x, visiblePts[0].y);
      for (let i = 1; i < visiblePts.length; i++) {
        const cp = {
          x: (visiblePts[i - 1].x + visiblePts[i].x) / 2,
          y: (visiblePts[i - 1].y + visiblePts[i].y) / 2,
        };
        ctx!.quadraticCurveTo(visiblePts[i - 1].x, visiblePts[i - 1].y, cp.x, cp.y);
      }
      ctx!.lineTo(visiblePts[visiblePts.length - 1].x, H);
      ctx!.lineTo(visiblePts[0].x, H);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();

      // line
      ctx!.beginPath();
      ctx!.moveTo(visiblePts[0].x, visiblePts[0].y);
      for (let i = 1; i < visiblePts.length; i++) {
        const cp = {
          x: (visiblePts[i - 1].x + visiblePts[i].x) / 2,
          y: (visiblePts[i - 1].y + visiblePts[i].y) / 2,
        };
        ctx!.quadraticCurveTo(visiblePts[i - 1].x, visiblePts[i - 1].y, cp.x, cp.y);
      }
      const last = visiblePts[visiblePts.length - 1];
      ctx!.lineTo(last.x, last.y);
      ctx!.strokeStyle = colors.stroke;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // trailing dot
      const dotR = 3 + Math.sin(frame * 0.15) * 1.2;
      ctx!.beginPath();
      ctx!.arc(last.x, last.y, dotR + 4, 0, Math.PI * 2);
      ctx!.fillStyle = colors.dot.replace("0.8", "0.15");
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(last.x, last.y, dotR, 0, Math.PI * 2);
      ctx!.fillStyle = colors.dot;
      ctx!.fill();

      frame++;
      if (frame <= totalFrames + 40) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    cancelAnimationFrame(rafRef.current);
    frame = 0;
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [variant, accent, trigger]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
