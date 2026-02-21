"use client"

import { Database, Waves, Banknote, BookOpen } from "lucide-react"

const REASONS = [
  {
    icon: Database,
    color: "#3182F6",
    title: "실전 데이터, 실전 차트",
    desc: "AI·반도체·로봇·바이오 등 핫한 종목의 실제 1년치 주가 데이터를 수집하여 시뮬레이션합니다. 가짜 데이터가 아닌 진짜 시장의 흐름입니다.",
  },
  {
    icon: Waves,
    color: "#8B5CF6",
    title: "종목별 파도 유형 분석",
    desc: "종목마다 고유한 차트 패턴과 파도 유형이 있습니다. 각 종목의 특징을 파악하고 매수·매도 타이밍의 정확도를 높여보세요.",
  },
  {
    icon: Banknote,
    color: "#F04452",
    title: "5억원도 경험하는 시뮬레이터",
    desc: "500만원부터 최대 10억원까지 설정 가능. 큰 금액의 매매 심리와 리스크 관리를 실제 돈 없이 체험할 수 있습니다.",
  },
  {
    icon: BookOpen,
    color: "#10B981",
    title: "한 종목씩 패턴 직접 학습",
    desc: "학습 모드에서 종목별 차트 패턴을 하나씩 분석하고 직접 연습합니다. 이론이 아닌 실전 반복으로 차트 읽는 눈을 키웁니다.",
  },
]

export default function WhySimulation() {
  return (
    <div className="mx-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-1">
          Why Simulation?
        </h3>
        <p className="text-[11px] text-gray-600">
          왜 실전 전에 시뮬레이션이 필요할까요?
        </p>
      </div>

      <div className="space-y-2.5">
        {REASONS.map((reason) => {
          const Icon = reason.icon
          return (
            <div
              key={reason.title}
              className="flex gap-3 p-3.5 bg-[#1e1e2e] rounded-2xl border border-white/5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${reason.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: reason.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-white leading-tight mb-1">
                  {reason.title}
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
