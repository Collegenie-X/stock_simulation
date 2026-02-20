'use client';

import { cn } from '@/lib/utils';

interface Props {
  value: number;
  max?: number;
  label: string;
}

export function DifficultyBar({ value, max = 5, label }: Props) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] font-bold text-white">{value}/{max}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < value ? "bg-blue-500" : "bg-gray-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}
