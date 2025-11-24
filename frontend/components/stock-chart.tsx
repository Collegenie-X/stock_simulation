'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockChartProps {
  data: any[];
  height?: number;
  color?: 'red' | 'blue';
  dataKey?: string;
}

export function StockChart({ 
  data, 
  height = 200, 
  color = 'red',
  dataKey = 'price'
}: StockChartProps) {
  const colorMap = {
    red: '#F04452', // Toss Red
    blue: '#3182F6'  // Toss Blue
  };

  const chartColor = colorMap[color];
  const gradientId = `gradient-${color}`;

  const { min, max } = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 0 };
    const values = data.map(d => d[dataKey]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = (maxVal - minVal) * 0.2; // Add 20% padding
    return { 
      min: Math.floor(minVal - padding), 
      max: Math.ceil(maxVal + padding) 
    };
  }, [data, dataKey]);

  return (
    <div className="w-full select-none" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis 
            hide 
            domain={[min, max]} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded-lg shadow-xl">
                    {payload[0].value?.toLocaleString()}원
                  </div>
                );
              }
              return null;
            }}
            cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={chartColor}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            animationDuration={1000}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
