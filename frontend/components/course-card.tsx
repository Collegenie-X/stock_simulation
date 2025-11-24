import { ChevronRight, Lock } from 'lucide-react';

export function CourseCard({
  title,
  description,
  progress,
  locked = false,
  onClick
}: {
  title: string;
  description: string;
  progress?: number;
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="w-full bg-white rounded-2xl p-5 shadow-sm text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {locked ? (
          <Lock className="w-5 h-5 text-gray-400 ml-3" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#4A6BFF] ml-3" />
        )}
      </div>
      {!locked && progress !== undefined && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4A6BFF] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}
