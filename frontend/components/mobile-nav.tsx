'use client';

import { Map, BookOpen, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Map, label: '홈', href: '/' },
  { icon: BookOpen, label: '학습', href: '/learn' },
  { icon: Trophy, label: '랭킹', href: '/compete' },
  { icon: User, label: 'MY', href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-bottom pb-2 pt-1">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-2xl transition-all active:scale-90 ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative p-1 ${isActive ? 'bg-gray-100 rounded-xl' : ''}`}>
                <Icon
                  className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
                />
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
