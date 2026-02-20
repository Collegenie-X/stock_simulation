'use client';

import { SIGNAL_COLORS, type ChartPattern } from '@/data/chart-patterns';
import { cn } from '@/lib/utils';

interface Props {
  signal: ChartPattern['signal'];
}

export function SignalBadge({ signal }: Props) {
  const config = SIGNAL_COLORS[signal];
  return (
    <span className={cn(
      "text-xs font-bold px-2.5 py-1 rounded-lg border",
      config.bg, config.color, config.border
    )}>
      {signal === "매수" && "↑ 매수 신호"}
      {signal === "매도" && "↓ 매도 신호"}
      {signal === "양방향" && "↕ 양방향 신호"}
    </span>
  );
}
