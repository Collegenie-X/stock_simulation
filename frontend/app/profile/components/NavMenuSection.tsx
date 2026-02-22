'use client';

import Link from 'next/link';
import { ChevronRight, LogOut } from 'lucide-react';
import { PROFILE_LABELS } from '../config';

const L = PROFILE_LABELS.navMenu;

export function NavMenuSection() {
  return (
    <section className="mt-5">
      <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">{L.title}</p>
      <div className="bg-[#252525] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
        {L.items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <span className="text-xl w-8 text-center">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            {'badge' in item && item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-1">
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* 로그아웃 */}
      <button className="w-full flex items-center justify-center gap-2 mt-3 py-3 text-sm text-gray-500 hover:text-red-400 transition-colors">
        <LogOut className="w-4 h-4" />
        {PROFILE_LABELS.logout}
      </button>
    </section>
  );
}
