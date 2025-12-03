'use client';

import { Map, BookOpen, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * 모바일 하단 네비게이션 바
 * - 다크 테마 기반
 * - Safe area 지원
 * - 터치 최적화 (최소 44px 터치 영역)
 */

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Map, label: '홈', href: '/' },
  { icon: BookOpen, label: '학습', href: '/learn' },
  { icon: Trophy, label: '랭킹', href: '/compete' },
  { icon: User, label: 'MY', href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-[#1a1a1a]/95 backdrop-blur-lg",
        "border-t border-white/5",
        "pb-safe-bottom"
      )}
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // 기본 스타일
                "flex flex-col items-center justify-center flex-1 h-full gap-1",
                "transition-all duration-200 touch-feedback",
                // 터치 영역 최소 크기
                "min-h-[44px] min-w-[44px]",
                // 활성 상태에 따른 색상
                isActive 
                  ? "text-white" 
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {/* 아이콘 컨테이너 */}
              <div 
                className={cn(
                  "relative p-2 rounded-xl transition-all duration-200",
                  isActive && "bg-white/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive ? "stroke-[2.5]" : "stroke-[2]"
                  )}
                />
                
                {/* 활성 인디케이터 */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </div>
              
              {/* 라벨 */}
              <span 
                className={cn(
                  "text-[10px] font-semibold tracking-tight",
                  isActive ? "text-white" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
