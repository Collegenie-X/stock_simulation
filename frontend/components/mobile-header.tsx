'use client';

import { Bell, Settings, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/**
 * 모바일 헤더 컴포넌트
 * - 다크 테마 기반
 * - Safe area 지원
 * - 뒤로가기 버튼 옵션
 */

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNotification?: boolean;
  showMore?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function MobileHeader({ 
  title,
  showBack = false,
  showSettings = false,
  showNotification = true,
  showMore = false,
  onBack,
  rightAction,
  transparent = false,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "pt-safe-top",
        transparent 
          ? "bg-transparent" 
          : "bg-[#191919]/95 backdrop-blur-lg border-b border-white/5",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        {/* 좌측 영역 */}
        <div className="flex items-center gap-2 flex-1">
          {showBack ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="text-white hover:bg-white/10 -ml-2 touch-feedback"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌊</span>
            </div>
          )}
          
          <h1 className={cn(
            "font-bold truncate",
            showBack ? "text-lg text-white" : "text-xl text-blue-400"
          )}>
            {title || '파도를 타라'}
          </h1>
        </div>
        
        {/* 우측 영역 */}
        <div className="flex items-center gap-1">
          {rightAction}
          
          {showNotification && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-gray-400 hover:text-white hover:bg-white/10 touch-feedback"
            >
              <Bell className="w-5 h-5" />
              {/* 알림 배지 */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          )}
          
          {showSettings && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 touch-feedback"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
          
          {showMore && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 touch-feedback"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * 투명 헤더용 래퍼
 * 스크롤 시 배경색 변경 효과 적용
 */
export function TransparentHeader(props: MobileHeaderProps) {
  return <MobileHeader {...props} transparent />;
}
