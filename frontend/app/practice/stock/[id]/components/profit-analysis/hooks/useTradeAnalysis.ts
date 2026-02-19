"use client"

import { useState, useCallback, useMemo } from "react"
import { storage } from "@/lib/storage"
import companyData from "@/data/company-investment-profiles.json"
import type { TradeRecord, ProfitPeriod } from "../../../types"
import type { CompanyProfile } from "../CompanyCard"

interface UseTradeAnalysisProps {
  scenarioId: string
  currentDay: number
  currentPrices?: Record<string, number>
  holdings?: Record<string, number>
  averagePrices?: Record<string, number>
}

export interface GroupedTrades {
  dateKey: string
  dateLabel: string
  trades: (TradeRecord & { investmentNote?: string })[]
}

const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"] as const

/** "2010.01.04" 또는 "2010-01-04" 포맷 날짜를 레이블로 변환 */
function formatDateLabel(dateStr: string): string {
  const normalized = dateStr.replace(/\./g, "-")
  const parts = normalized.split("-")
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    const date = new Date(normalized)
    if (!isNaN(date.getTime())) {
      const dayName = DAY_NAMES_KO[date.getDay()]
      return `${month}월 ${day}일 (${dayName})`
    }
    return `${month}월 ${day}일`
  }
  return dateStr
}

function getWeekNumber(day: number): number {
  return Math.ceil(day / 7)
}

function getMonthFromDay(day: number): number {
  return Math.ceil(day / 30)
}

/** 백엔드 JSON 데이터 파싱 - 기업 프로파일 맵 반환 */
function parseCompanyProfiles(): Record<string, CompanyProfile> {
  return companyData.companyProfiles as unknown as Record<string, CompanyProfile>
}

/** 백엔드 JSON 거래내역을 TradeRecord 형태로 파싱 */
function parseMockTrades(): (TradeRecord & { investmentNote?: string })[] {
  return companyData.mockTradeHistory.map((t) => ({
    id: t.id,
    stockId: t.stockId,
    stockName: t.stockName,
    action: t.action as "buy" | "sell",
    price: t.price,
    quantity: t.quantity,
    totalAmount: t.totalAmount,
    avgBuyPrice: (t as any).avgBuyPrice,
    profit: (t as any).profit,
    profitRate: (t as any).profitRate,
    date: t.date,
    turn: t.turn,
    day: t.day,
    investmentNote: t.investmentNote,
  }))
}

export function useTradeAnalysis({
  scenarioId,
  currentDay,
  currentPrices = {},
  holdings = {},
  averagePrices = {},
}: UseTradeAnalysisProps) {
  const [activePeriod, setActivePeriod] = useState<ProfitPeriod>("일")
  const [periodOffset, setPeriodOffset] = useState(0)

  // 백엔드 JSON 데이터 파싱
  const companyProfiles = useMemo(() => parseCompanyProfiles(), [])
  const mockTrades = useMemo(() => parseMockTrades(), [])

  // 실제 게임 거래 내역 (localStorage)
  const localTrades = useMemo(
    () => storage.getTradeHistory(scenarioId),
    [scenarioId],
  )

  // 백엔드 mock + 실제 거래를 병합 (id 중복 제거)
  const allTrades = useMemo<(TradeRecord & { investmentNote?: string })[]>(() => {
    const localIds = new Set(localTrades.map((t) => t.id))
    const filteredMock = mockTrades.filter((t) => !localIds.has(t.id))
    return [...filteredMock, ...localTrades].sort((a, b) => a.day - b.day || a.turn - b.turn)
  }, [mockTrades, localTrades])

  // 현재 기간 최대 인덱스
  const maxPeriodIndex = useMemo(() => {
    if (activePeriod === "일") return currentDay
    if (activePeriod === "주") return getWeekNumber(currentDay)
    return getMonthFromDay(currentDay)
  }, [activePeriod, currentDay])

  const currentPeriodIndex = Math.max(1, maxPeriodIndex + periodOffset)

  const filteredTrades = useMemo(() => {
    if (activePeriod === "일") {
      return allTrades.filter((t) => t.day === currentPeriodIndex)
    }
    if (activePeriod === "주") {
      return allTrades.filter((t) => getWeekNumber(t.day) === currentPeriodIndex)
    }
    return allTrades.filter((t) => getMonthFromDay(t.day) === currentPeriodIndex)
  }, [allTrades, activePeriod, currentPeriodIndex])

  // 기간 레이블 (예: "1월 4일 (월)")
  const periodLabel = useMemo(() => {
    if (activePeriod === "일") {
      const sample = allTrades.find((t) => t.day === currentPeriodIndex)
      if (sample?.date) return formatDateLabel(sample.date)
      return `${currentPeriodIndex}일차`
    }
    if (activePeriod === "주") return `${currentPeriodIndex}주차`
    return `${currentPeriodIndex}개월차`
  }, [activePeriod, currentPeriodIndex, allTrades])

  // 날짜별 그룹화 (거래 상세 탭용)
  const groupedByDate = useMemo<GroupedTrades[]>(() => {
    const groups: Record<string, (TradeRecord & { investmentNote?: string })[]> = {}
    filteredTrades.forEach((trade) => {
      const key = trade.date || `day-${trade.day}`
      if (!groups[key]) groups[key] = []
      groups[key].push(trade)
    })
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, trades]) => ({
        dateKey,
        dateLabel: formatDateLabel(dateKey),
        trades,
      }))
  }, [filteredTrades])

  // 요약 통계
  const summary = useMemo(() => {
    const buyTrades = filteredTrades.filter((t) => t.action === "buy")
    const sellTrades = filteredTrades.filter((t) => t.action === "sell")
    const totalProfit = sellTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
    const totalInvested = sellTrades.reduce(
      (sum, t) => sum + t.quantity * (t.avgBuyPrice ?? t.price),
      0,
    )
    const totalProfitRate = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
    return {
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalProfit: Math.round(totalProfit),
      totalProfitRate: Math.round(totalProfitRate * 10) / 10,
    }
  }, [filteredTrades])

  const canGoPrev = currentPeriodIndex > 1
  const canGoNext = periodOffset < 0

  const handleChangePeriod = useCallback((period: ProfitPeriod) => {
    setActivePeriod(period)
    setPeriodOffset(0)
  }, [])

  // "해당 기간에 거래 없음" 다이얼로그 표시 여부
  const [showEmptyAlert, setShowEmptyAlert] = useState(false)

  const dismissEmptyAlert = useCallback(() => setShowEmptyAlert(false), [])

  /** 이동 후 거래 내역이 있는지 확인하여 없으면 다이얼로그 표시 */
  const checkAndMove = useCallback((nextOffset: number) => {
    const nextIndex = Math.max(1, maxPeriodIndex + nextOffset)
    const hasTrades = allTrades.some((t) => {
      if (activePeriod === "일") return t.day === nextIndex
      if (activePeriod === "주") return getWeekNumber(t.day) === nextIndex
      return getMonthFromDay(t.day) === nextIndex
    })
    setPeriodOffset(nextOffset)
    if (!hasTrades) setShowEmptyAlert(true)
  }, [maxPeriodIndex, allTrades, activePeriod])

  const handlePrev = useCallback(() => {
    if (canGoPrev) checkAndMove(periodOffset - 1)
  }, [canGoPrev, periodOffset, checkAndMove])

  const handleNext = useCallback(() => {
    if (canGoNext) checkAndMove(periodOffset + 1)
  }, [canGoNext, periodOffset, checkAndMove])

  return {
    activePeriod,
    currentPeriodIndex,
    periodLabel,
    filteredTrades,
    groupedByDate,
    summary,
    allTrades,
    companyProfiles,
    canGoPrev,
    canGoNext,
    showEmptyAlert,
    dismissEmptyAlert,
    handleChangePeriod,
    handlePrev,
    handleNext,
  }
}
