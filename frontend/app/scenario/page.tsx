"use client"

import Link from "next/link"
import { listScenarios } from "@/lib/scenario/loader"

export default function ScenarioListPage() {
  const index = listScenarios()

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">🎬 시나리오</h1>
        <p className="text-sm text-gray-400 mb-6">
          실제 사건으로 만들어진 한 판. 차트 감각을 키우세요.
        </p>

        {/* 플레이 가능 */}
        <div className="space-y-3">
          {index.scenarios
            .filter((s) => s.available !== false)
            .map((s) => (
              <Link
                key={s.id}
                href={`/scenario/${s.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{s.era}</div>
                    <h2 className="text-lg font-bold mb-1">{s.title}</h2>
                    <div className="text-xs text-gray-400">{s.subtitle}</div>
                  </div>
                  <div className="text-2xl ml-3">{s.thumbnail}</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{s.period}</div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-black/40 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500">소요</div>
                    <div className="text-xs font-bold">
                      ~{s.estimatedPlayTimeMin}분
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500">종목</div>
                    <div className="text-xs font-bold">{s.stockCount}종</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500">블랙스완</div>
                    <div className="text-xs font-bold">
                      {s.blackswanCount}회
                    </div>
                  </div>
                </div>

                {s.highlights && (
                  <div className="mt-3 pt-3 border-t border-gray-800/50 space-y-1">
                    {s.highlights.map((h, i) => (
                      <div key={i} className="text-[11px] text-gray-400">
                        • {h}
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
        </div>

        {/* Coming Soon */}
        {index.comingSoon && index.comingSoon.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3">
              🔒 곧 공개
            </h3>
            <div className="space-y-2">
              {index.comingSoon.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 opacity-60"
                >
                  <div className="text-xs text-gray-500 mb-1">{s.era}</div>
                  <div className="text-sm font-bold">{s.title}</div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {s.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
