'use client';

import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileHeader({ title }: { title?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-14 px-5 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌊</span>
          <h1 className="text-xl font-bold text-[#4A6BFF]">
            {title || '파도를 타라'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
