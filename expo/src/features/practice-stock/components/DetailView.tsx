import React, { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Bell, Heart, MoreHorizontal, Search } from "lucide-react-native"
import { FadeUp, Ping } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { LABELS, CHART_PERIOD_MAP, DAYS_PER_WEEK, DECISIONS_PER_DAY } from "@/features/practice-stock/config"
import { StockChart } from "./StockChart"
import { WeeklyReportModal } from "./WeeklyReportModal"
import { DatePopup } from "./DatePopup"
import { FloatingExitButton } from "./FloatingExitButton"
import { DailyNewsCard } from "./detail-view/DailyNewsCard"
import { PastNewsCard } from "./detail-view/PastNewsCard"
import { MyStockInfoCard } from "./detail-view/MyStockInfoCard"
import { PendingOrdersList, type PendingOrder } from "./detail-view/PendingOrdersList"
import { TradeButtons } from "./detail-view/TradeButtons"
import { generateDailyEvents } from "./detail-view/generateDailyEvents"

// ── 타입 ──────────────────────────────────────────────────────
interface ChartPoint {
  index: number
  price: number
  date?: string
}

export interface DetailViewProps {
  // 주식 기본 정보
  stockName: string
  currentPrice: number
  /** 뉴스용 등락(턴 기준). 실시간 틱에 뉴스가 깜빡이지 않게 따로 받는다 */
  newsChange?: string
  newsIsUp?: boolean
  prevPrice: number
  change: string
  isUp: boolean

  // 내 주식 정보
  currentHoldings: number
  myAvg: number
  myReturn: string
  isProfit: boolean

  // 차트
  chartData: ChartPoint[]
  chartPeriod: "1D" | "1W" | "1M" | "1Y"
  onChartPeriodChange: (period: "1D" | "1W" | "1M" | "1Y") => void

  // 현금
  cash: number

  // 관심/탭
  selectedStockId: string
  favorites: string[]
  onToggleFavorite: (id: string) => void

  // 날짜/상태
  showDatePopup: boolean
  turnDate: string
  currentDayNumber: number
  currentWeekNumber: number
  currentDayName: string
  currentDayPhase: string
  isPlaying: boolean

  // 주간 리포트
  showWeeklyReport: boolean
  weeklyReturn: number
  profitRate: number
  weeklyHistory: { turn: number; value: number }[]
  onCloseReport: () => void

  // 알림 피드백
  feedback: { text: string; type: "success" | "error" | "neutral" } | null

  // 예약 주문
  pendingOrders: PendingOrder[]
  onCancelOrder: (order: PendingOrder) => void

  // 종목 뉴스/이벤트 (전일 기반 - 뉴스는 한발 늦게 도착)
  stockNews?: string
  stockCategory?: string
  prevDayChange?: number
  prevDayIsUp?: boolean
  prevDayNews?: string

  // 네비게이션/액션
  onBack: () => void
  onBuy: () => void
  onSell: () => void
  onShowHint: () => void
  onExitClick: () => void
}

const FEEDBACK_STYLE = {
  success: { bg: "#1b2b22", border: alpha(palette.green[500], 0.25), text: palette.green[100] },
  error: { bg: "#2e1c1e", border: alpha(palette.red[500], 0.25), text: palette.red[100] },
  neutral: { bg: alpha(palette.gray[700], 0.95), border: alpha(palette.gray[600], 0.4), text: palette.gray[100] },
} as const

// ── 컴포넌트 ──────────────────────────────────────────────────
export const DetailView = ({
  stockName,
  currentPrice,
  newsChange,
  newsIsUp,
  prevPrice,
  change,
  isUp,
  currentHoldings,
  myAvg,
  myReturn,
  isProfit,
  chartData,
  chartPeriod,
  onChartPeriodChange,
  cash,
  selectedStockId,
  favorites,
  onToggleFavorite,
  showDatePopup,
  turnDate,
  currentDayNumber,
  currentWeekNumber,
  currentDayPhase,
  isPlaying,
  showWeeklyReport,
  weeklyReturn,
  profitRate,
  weeklyHistory,
  onCloseReport,
  feedback,
  pendingOrders,
  onCancelOrder,
  stockNews = "",
  stockCategory = "",
  prevDayChange,
  prevDayIsUp,
  prevDayNews = "",
  onBack,
  onBuy,
  onSell,
  onShowHint,
  onExitClick,
}: DetailViewProps) => {
  const insets = useSafeAreaInsets()
  const profitAmt = currentHoldings > 0 ? Math.round((currentPrice - myAvg) * currentHoldings) : 0
  const totalStockValue = currentHoldings > 0 ? Math.round(currentPrice * currentHoldings) : 0
  const estimatedTax = Math.round(totalStockValue * 0.002)
  const myPendingOrders = pendingOrders.filter((o) => o.stockId === selectedStockId)

  const dailyEvents = useMemo(() => {
    return generateDailyEvents({
      currentIsUp: newsIsUp ?? isUp,
      currentChange: Number(newsChange ?? change),
      stockNews,
      stockCategory,
      stockName,
      prevDayChange,
      prevDayIsUp,
      prevDayNews,
    })
  }, [newsIsUp ?? isUp, newsChange ?? change, stockNews, stockCategory, stockName, prevDayChange, prevDayIsUp, prevDayNews])

  // 가격 변동 시 플래시 (웹: flash-up / flash-down 배경 + animate-ticker-pulse)
  const prevPriceRef = useRef(currentPrice)
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null)
  const flashBg = useRef(new Animated.Value(0)).current
  const tickerPulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (currentPrice !== prevPriceRef.current) {
      setPriceFlash(currentPrice > prevPriceRef.current ? "up" : "down")
      prevPriceRef.current = currentPrice
      flashBg.setValue(0)
      tickerPulse.setValue(0)
      Animated.timing(flashBg, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: false }).start()
      Animated.timing(tickerPulse, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()
      const t = setTimeout(() => setPriceFlash(null), 600)
      return () => clearTimeout(t)
    }
  }, [currentPrice, flashBg, tickerPulse])

  const flashRgb = priceFlash === "down" ? "59,130,246" : "239,68,68"
  const flashBackground = priceFlash
    ? flashBg.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [`rgba(${flashRgb},0)`, `rgba(${flashRgb},0.25)`, `rgba(${flashRgb},0)`],
      })
    : "transparent"

  const isFavorite = favorites.includes(selectedStockId)
  const fb = feedback ? FEEDBACK_STYLE[feedback.type] : null

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WeeklyReportModal
        isOpen={showWeeklyReport}
        onClose={onCloseReport}
        weekNumber={currentWeekNumber}
        weeklyReturn={weeklyReturn}
        totalReturn={profitRate}
        chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))}
      />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <ArrowLeft size={24} color={palette.gray[300]} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={onShowHint}
              style={({ pressed }) => [styles.hintBtn, pressed && { backgroundColor: alpha(palette.yellow[500], 0.2), transform: [{ scale: 0.95 }] }]}
            >
              <Text style={styles.hintEmoji}>💡</Text>
              <Text style={styles.hintText}>심층분석</Text>
            </Pressable>
            <Pressable onPress={() => onToggleFavorite(selectedStockId)} hitSlop={6}>
              <Heart
                size={24}
                color={isFavorite ? palette.red[500] : palette.gray[400]}
                fill={isFavorite ? palette.red[500] : "none"}
              />
            </Pressable>
            <Bell size={24} color={palette.gray[400]} />
            <MoreHorizontal size={24} color={palette.gray[400]} />
          </View>
        </View>

        {/* 날짜 / 주차 */}
        <View style={styles.dateRow}>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>D{currentDayNumber} · W{currentWeekNumber}</Text>
          </View>
          <Text style={styles.phaseText}>{currentDayPhase}</Text>
          {isPlaying && (
            <View style={styles.liveRow}>
              <View style={styles.liveDotWrap}>
                <Ping duration={1600} scaleTo={3} style={styles.liveRing} />
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 가격 정보 */}
        <Animated.View style={[styles.priceBox, { backgroundColor: flashBackground }]}>
          <View style={styles.nameRow}>
            <Text style={styles.trendEmoji}>
              {isUp ? (Number(change) >= 3 ? "🚀" : "📈") : (Number(change) <= -3 ? "💥" : "📉")}
            </Text>
            <Text style={styles.stockName} numberOfLines={1}>{stockName}</Text>
            <View style={styles.searchIcon}>
              <Search size={12} color={palette.gray[400]} />
            </View>
          </View>
          <Animated.View
            style={[
              styles.priceWrap,
              { transform: [{ scale: tickerPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] }) }] },
            ]}
          >
            <Text style={styles.price}>{formatNumber(currentPrice)}원</Text>
          </Animated.View>
          <View style={styles.changeRow}>
            <Text style={[styles.changeText, { color: isUp ? palette.red[500] : palette.blue[500] }]}>{isUp ? "▲" : "▼"}</Text>
            <Text style={[styles.changeText, { color: isUp ? palette.red[500] : palette.blue[500] }]}>
              {formatNumber(Math.abs(currentPrice - prevPrice))}원
            </Text>
            <Text style={[styles.changeText, { color: alpha(isUp ? palette.red[500] : palette.blue[500], 0.8) }]}>
              ({isUp ? "+" : ""}{change}%)
            </Text>
          </View>
        </Animated.View>

        {/* 상세 탭 */}
        <View style={styles.tabsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {LABELS.stockDetailTabs.map((tab) => (
              <Pressable key={tab} style={styles.tab}>
                <Text style={[styles.tabText, { color: tab === "차트" ? "#ffffff" : palette.gray[500] }]}>{tab}</Text>
                {tab === "차트" && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 차트 */}
        <View style={styles.chartBox}>
          <StockChart
            data={chartData}
            height={360}
            color={isUp ? "red" : "blue"}
            showXAxis
            chartPeriod={chartPeriod}
          />
        </View>

        {/* 차트 기간 선택 */}
        <View style={styles.periodWrap}>
          <View style={styles.periodRow}>
            {(LABELS.chartPeriods as readonly string[]).map((period) => {
              const mappedPeriod = CHART_PERIOD_MAP[period] as "1D" | "1W" | "1M" | "1Y"
              const isActive = chartPeriod === mappedPeriod
              return (
                <Pressable
                  key={period}
                  onPress={() => onChartPeriodChange(mappedPeriod)}
                  style={[styles.periodBtn, isActive && styles.periodBtnActive]}
                >
                  <Text style={[styles.periodText, { color: isActive ? "#ffffff" : palette.gray[500] }]}>{period}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* 오늘의 이벤트/뉴스 */}
        {dailyEvents.length > 0 && (
          <DailyNewsCard events={dailyEvents} isUp={newsIsUp ?? isUp} showDelayNotice={prevDayChange !== undefined} />
        )}

        {/* 게임 시작 전 3개월 흐름·뉴스 (접힘) */}
        <PastNewsCard stockId={selectedStockId} />

        {/* 내 주식 정보 카드 */}
        {currentHoldings > 0 && (
          <MyStockInfoCard
            myAvg={myAvg}
            currentHoldings={currentHoldings}
            totalStockValue={totalStockValue}
            profitAmt={profitAmt}
            myReturn={myReturn}
            isProfit={isProfit}
            estimatedTax={estimatedTax}
          />
        )}

        {/* 미체결 주문 */}
        {myPendingOrders.length > 0 && (
          <PendingOrdersList orders={myPendingOrders} onCancelOrder={onCancelOrder} />
        )}
      </ScrollView>

      {/* 하단 매매 버튼 */}
      <TradeButtons
        canSell={currentHoldings !== 0}
        canBuy={cash >= currentPrice}
        onSell={onSell}
        onBuy={onBuy}
      />

      {/* 플로팅 종료 버튼 (항상 표시) */}
      <FloatingExitButton onClick={onExitClick} />

      <DatePopup isVisible={showDatePopup} date={turnDate} />

      {/* 피드백 토스트 (작은 인라인 스타일) */}
      {!!feedback && !!fb && (
        <View pointerEvents="none" style={[styles.toastWrap, { top: insets.top + 16 }]}>
          <FadeUp key={feedback.text} duration={200} distance={-8}>
            <View style={[styles.toast, { backgroundColor: fb.bg, borderColor: fb.border }]}>
              <Text style={[styles.toastIcon, { color: fb.text }]}>
                {feedback.type === "success" ? "✓" : feedback.type === "error" ? "✕" : "ℹ"}
              </Text>
              <Text style={[styles.toastText, { color: fb.text }]} numberOfLines={1}>{feedback.text}</Text>
            </View>
          </FadeUp>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191919" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#191919",
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backBtn: { padding: 4 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: alpha(palette.yellow[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.3),
    borderRadius: 12,
  },
  hintEmoji: { fontSize: 14, color: "#ffffff" },
  hintText: { fontSize: 12, fontWeight: "700", color: palette.yellow[400] },
  dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 8 },
  dayPill: { backgroundColor: alpha(palette.blue[500], 0.1), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  dayPillText: { fontSize: 12, color: palette.blue[400], fontWeight: "700" },
  phaseText: { fontSize: 12, color: palette.gray[500] },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDotWrap: { width: 8, height: 8, alignItems: "center", justifyContent: "center" },
  liveRing: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: alpha(palette.green[500], 0.55) },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green[400] },
  liveText: { fontSize: 12, color: palette.green[400], fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  priceBox: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderRadius: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  trendEmoji: { fontSize: 20, color: "#ffffff" },
  stockName: { fontWeight: "700", fontSize: 20, color: "#ffffff", flexShrink: 1 },
  searchIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.gray[800], alignItems: "center", justifyContent: "center" },
  priceWrap: { alignSelf: "flex-start", marginBottom: 8 },
  price: { fontSize: 36, fontWeight: "700", color: "#ffffff" },
  changeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  changeText: { fontSize: 14, fontWeight: "700" },
  tabsWrap: { borderBottomWidth: 1, borderBottomColor: palette.gray[800], marginBottom: 24 },
  tabs: { paddingHorizontal: 20 },
  tab: { paddingBottom: 12, marginRight: 24 },
  tabText: { fontSize: 14, fontWeight: "700" },
  tabUnderline: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#ffffff" },
  chartBox: { height: 360, width: "100%", marginBottom: 16, backgroundColor: palette.gray[900], borderRadius: 12, overflow: "hidden" },
  periodWrap: { paddingHorizontal: 20, marginBottom: 16 },
  periodRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: alpha(palette.gray[800], 0.3), borderRadius: 8, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: "center" },
  periodBtnActive: { backgroundColor: palette.gray[700], boxShadow: "0 1px 2px rgba(0,0,0,0.3)" },
  periodText: { fontSize: 14, fontWeight: "500" },
  toastWrap: { position: "absolute", left: 16, right: 16 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
  },
  toastIcon: { fontSize: 14, flexShrink: 0 },
  toastText: { fontSize: 12, fontWeight: "700", flexShrink: 1 },
})
