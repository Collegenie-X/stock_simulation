import { TrendingUp, TrendingDown } from 'lucide-react';

export function StockCard({
  name,
  type,
  currentPrice,
  change,
  onClick
}: {
  name: string;
  type: string;
  currentPrice: number;
  change: number;
  onClick?: () => void;
}) {
  const isPositive = change >= 0;
  const typeColors = {
    '안정형': 'bg-green-100 text-green-700',
    '변동형': 'bg-yellow-100 text-yellow-700',
    '고변동형': 'bg-red-100 text-red-700'
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm text-left transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'}`}>
            {type}
          </span>
        </div>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-green-600" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-600" />
        )}
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {currentPrice.toLocaleString()}원
          </p>
          <p className={`text-sm font-semibold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </p>
        </div>
        <div className="w-20 h-12 flex items-end gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${isPositive ? 'bg-green-200' : 'bg-red-200'}`}
              style={{ height: `${30 + i * 10}%` }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
