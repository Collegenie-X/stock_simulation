'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { LegendaryScenario } from '@/data/legendary-scenarios';

export function EventTimeline({ scenario }: { scenario: LegendaryScenario }) {
  const [expanded, setExpanded] = useState(false);
  const visibleEvents = expanded ? scenario.events : scenario.events.slice(0, 4);

  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-yellow-400" />
        10턴 이벤트 타임라인
      </h3>
      <div className="space-y-2">
        {visibleEvents.map((event) => (
          <div
            key={event.turn}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-all",
              event.sentiment === "shock" && "bg-red-500/10 border-red-500/20",
              event.sentiment === "negative" && "bg-orange-500/5 border-orange-500/10",
              event.sentiment === "positive" && "bg-green-500/5 border-green-500/10",
              event.sentiment === "neutral" && "bg-[#252525] border-white/5"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              event.sentiment === "shock" && "bg-red-500/30 text-red-300",
              event.sentiment === "negative" && "bg-orange-500/20 text-orange-300",
              event.sentiment === "positive" && "bg-green-500/20 text-green-300",
              event.sentiment === "neutral" && "bg-gray-600 text-gray-300"
            )}>
              {event.turn}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-bold text-white">{event.title}</p>
                <span className={cn(
                  "text-xs font-bold",
                  event.priceChange.startsWith("+") ? "text-green-400" :
                  event.priceChange.startsWith("-") ? "text-red-400" : "text-gray-400"
                )}>
                  {event.priceChange}
                </span>
              </div>
              <p className="text-xs text-gray-400">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
      {scenario.events.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-2 text-xs text-gray-400 flex items-center justify-center gap-1 hover:text-white transition-colors"
        >
          {expanded ? (
            <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>나머지 {scenario.events.length - 4}개 이벤트 보기 <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </section>
  );
}
