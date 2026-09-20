import React, { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { Bot, ChevronDown, ChevronUp } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import { StockRow } from "./StockRow"
import type { StockListSectionProps, StockListItem } from "@/features/practice-stock/types"

const AI_DEFAULT_VISIBLE = 2

export const StockListSection = ({
  allStocksData,
  currentTurn,
  favorites,
  stockViewTab,
  livePrices,
  tickUps,
  aiHoldings,
  aiName,
  onChangeViewTab,
  onSelectStock,
  onToggleFavorite,
}: StockListSectionProps) => {
  // 섹션별 데이터 분리
  const myStocks = allStocksData.filter((s) => s.myHoldings > 0)
  const watchlistStocks = allStocksData.filter(
    (s) => favorites.includes(s.id) && s.myHoldings === 0
  )
  const stocksByCategory = allStocksData.reduce(
    (acc, stock) => {
      const category = (stock as any).category || "기타"
      if (!acc[category]) acc[category] = []
      acc[category].push(stock)
      return acc
    },
    {} as Record<string, StockListItem[]>
  )

  // AI가 보유한 주식 (사용자가 보유하지 않은 것만 별도 표시)
  const aiOnlyStocks = allStocksData.filter(
    (s) => (aiHoldings[s.id] || 0) > 0 && s.myHoldings === 0
  )

  // 내 주식 헤더: 라이브 가격 기반 총수익 계산
  const totalLiveProfit = myStocks.reduce((sum, s) => {
    const lp = livePrices[s.id] ?? s.currentPrice
    return sum + Math.round((lp - s.myAvg) * s.myHoldings)
  }, 0)
  const totalCost = myStocks.reduce(
    (sum, s) => sum + Math.round(s.myAvg * s.myHoldings), 0
  )
  const totalProfitRate =
    totalCost > 0 ? ((totalLiveProfit / totalCost) * 100).toFixed(1) : "0.0"
  const isTotalProfit = totalLiveProfit >= 0
  const totalColor = isTotalProfit ? palette.red[400] : palette.blue[400]

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 내 주식 ── */}
        {myStocks.length > 0 && (
          <View style={styles.myCard}>
            {/* 헤더: 레이블 + 총수익 + 탭 */}
            <View style={styles.myHeader}>
              <View style={styles.myHeaderTop}>
                <View style={styles.myTitleRow}>
                  <Text style={styles.myTitle}>{isTotalProfit ? "🔥" : "💧"}</Text>
                  <Text style={styles.myTitle}>{LABELS.sections.myStocks.replace("💼 ", "")}</Text>
                </View>
                <Text style={[styles.totalProfit, { color: totalColor }]}>
                  {isTotalProfit ? "+" : ""}{formatNumber(totalLiveProfit)}원
                  <Text style={[styles.totalRate, { color: alpha(totalColor, 0.7) }]}>
                    {" "}({isTotalProfit ? "+" : ""}{totalProfitRate}%)
                  </Text>
                </Text>
              </View>
              <View style={styles.tabRowWrap}>
                <View style={styles.tabRow}>
                  {(["현재가", "평가금"] as const).map((tab) => (
                    <Pressable
                      key={tab}
                      onPress={() => onChangeViewTab(tab)}
                      style={[styles.tabBtn, stockViewTab === tab && { backgroundColor: palette.gray[600] }]}
                    >
                      <Text style={[styles.tabText, { color: stockViewTab === tab ? "#ffffff" : palette.gray[500] }]}>
                        {tab === "현재가" ? "💹" : "💰"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            {/* 종목 리스트 */}
            <View>
              {myStocks.map((stock, i) => (
                <View key={stock.id} style={[styles.myRow, i > 0 && styles.divider]}>
                  <StockRow
                    stock={stock}
                    currentTurn={currentTurn}
                    stockViewTab={stockViewTab}
                    showInvestmentInfo
                    livePrice={livePrices[stock.id] ?? stock.currentPrice}
                    tickUp={tickUps[stock.id] ?? true}
                    isFavorite={favorites.includes(stock.id)}
                    isAIHolding={(aiHoldings[stock.id] || 0) > 0}
                    onSelect={() => onSelectStock(stock.id)}
                    onToggleFavorite={() => onToggleFavorite(stock.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── AI 포트폴리오 (접기/펼치기) ── */}
        {aiOnlyStocks.length > 0 && (
          <AIHoldingsSection
            stocks={aiOnlyStocks}
            aiName={aiName}
            currentTurn={currentTurn}
            stockViewTab={stockViewTab}
            livePrices={livePrices}
            tickUps={tickUps}
            favorites={favorites}
            aiHoldings={aiHoldings}
            onSelectStock={onSelectStock}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {/* ── 관심 주식 ── */}
        {watchlistStocks.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>{LABELS.sections.watchlist}</Text>
            <View>
              {watchlistStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  currentTurn={currentTurn}
                  stockViewTab={stockViewTab}
                  livePrice={livePrices[stock.id] ?? stock.currentPrice}
                  tickUp={tickUps[stock.id] ?? true}
                  isFavorite
                  isAIHolding={(aiHoldings[stock.id] || 0) > 0}
                  onSelect={() => onSelectStock(stock.id)}
                  onToggleFavorite={() => onToggleFavorite(stock.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── 전체 주식 (카테고리별 아코디언) ── */}
        <View>
          <Text style={styles.sectionTitle}>
            {LABELS.sections.allStocks}
            <Text style={styles.sectionMeta}>
              {"  "}· {Object.keys(stocksByCategory).length}개 카테고리 / {allStocksData.length}종목
            </Text>
          </Text>
          <View style={{ gap: 8 }}>
            {Object.entries(stocksByCategory).map(([category, stocks]) => (
              <CategoryAccordion
                key={category}
                category={category}
                stocks={stocks}
                currentTurn={currentTurn}
                stockViewTab={stockViewTab}
                livePrices={livePrices}
                tickUps={tickUps}
                favorites={favorites}
                aiHoldings={aiHoldings}
                onSelectStock={onSelectStock}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

interface SubSectionProps {
  stocks: StockListItem[]
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  livePrices: Record<string, number>
  tickUps: Record<string, boolean>
  favorites: string[]
  aiHoldings: Record<string, number>
  onSelectStock: (id: string) => void
  onToggleFavorite: (id: string) => void
}

// ── 카테고리별 아코디언 서브 컴포넌트 ──────────────────────
function CategoryAccordion({
  category,
  stocks,
  currentTurn,
  stockViewTab,
  livePrices,
  tickUps,
  favorites,
  aiHoldings,
  onSelectStock,
  onToggleFavorite,
}: SubSectionProps & { category: string }) {
  const [open, setOpen] = useState(true)

  return (
    <View style={styles.accordion}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.accordionHeader, pressed && { backgroundColor: alpha(palette.gray[800], 0.3) }]}
      >
        <View style={styles.accordionTitleRow}>
          <Text style={styles.accordionTitle}>{category}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{stocks.length}</Text>
          </View>
        </View>
        {open ? (
          <ChevronUp size={14} color={palette.gray[500]} />
        ) : (
          <ChevronDown size={14} color={palette.gray[500]} />
        )}
      </Pressable>
      {open && (
        <View style={styles.accordionBody}>
          {stocks.map((stock) => (
            <StockRow
              key={stock.id}
              stock={stock}
              currentTurn={currentTurn}
              stockViewTab={stockViewTab}
              livePrice={livePrices[stock.id] ?? stock.currentPrice}
              tickUp={tickUps[stock.id] ?? true}
              isFavorite={favorites.includes(stock.id)}
              isAIHolding={(aiHoldings[stock.id] || 0) > 0}
              onSelect={() => onSelectStock(stock.id)}
              onToggleFavorite={() => onToggleFavorite(stock.id)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

// ── AI 보유 종목 접기/펼치기 서브 컴포넌트 ──────────────────
function AIHoldingsSection({
  stocks,
  aiName,
  currentTurn,
  stockViewTab,
  livePrices,
  tickUps,
  favorites,
  onSelectStock,
  onToggleFavorite,
}: SubSectionProps & { aiName: string }) {
  const [expanded, setExpanded] = useState(false)
  const visibleStocks = expanded ? stocks : stocks.slice(0, AI_DEFAULT_VISIBLE)
  const hasMore = stocks.length > AI_DEFAULT_VISIBLE

  return (
    <View>
      {/* 헤더 */}
      <View style={styles.aiHeader}>
        <View style={styles.aiIcon}>
          <Bot size={10} color={palette.purple[400]} />
        </View>
        <Text style={styles.aiTitle}>🤖 {aiName} 보유 종목</Text>
        <Text style={styles.aiCount}>{stocks.length}종목</Text>
      </View>

      {/* 종목 리스트 */}
      <View>
        {visibleStocks.map((stock) => (
          <StockRow
            key={stock.id}
            stock={stock}
            currentTurn={currentTurn}
            stockViewTab={stockViewTab}
            livePrice={livePrices[stock.id] ?? stock.currentPrice}
            tickUp={tickUps[stock.id] ?? true}
            isFavorite={favorites.includes(stock.id)}
            isAIHolding
            onSelect={() => onSelectStock(stock.id)}
            onToggleFavorite={() => onToggleFavorite(stock.id)}
          />
        ))}
      </View>

      {/* 더보기 / 접기 버튼 */}
      {hasMore && (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.moreBtn}>
          {({ pressed }) => {
            const c = pressed ? palette.purple[400] : alpha(palette.purple[400], 0.7)
            return (
              <>
                <Text style={[styles.moreText, { color: c }]}>
                  {expanded ? "접기" : `+${stocks.length - AI_DEFAULT_VISIBLE}종목 더보기`}
                </Text>
                {expanded ? <ChevronUp size={14} color={c} /> : <ChevronDown size={14} color={c} />}
              </>
            )
          }}
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 144, gap: 16 },
  myCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[800], 0.4),
    overflow: "hidden",
  },
  myHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  myHeaderTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  myTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  myTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  totalProfit: { fontSize: 14, fontWeight: "700" },
  totalRate: { fontSize: 11, fontWeight: "700" },
  tabRowWrap: { flexDirection: "row", justifyContent: "flex-end" },
  tabRow: { flexDirection: "row", backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 8, padding: 2, gap: 2 },
  tabBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tabText: { fontSize: 10, fontWeight: "700" },
  myRow: { paddingHorizontal: 8 },
  divider: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.3) },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: palette.gray[400], marginBottom: 8 },
  sectionMeta: { fontSize: 10, fontWeight: "500", color: palette.gray[500] },
  accordion: {
    backgroundColor: alpha("#1a1a1a", 0.6),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[800], 0.4),
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accordionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  accordionTitle: { fontSize: 12, fontWeight: "700", color: palette.gray[200] },
  countPill: { backgroundColor: alpha(palette.gray[800], 0.6), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  countText: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  accordionBody: { paddingHorizontal: 4, paddingBottom: 4 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  aiIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: alpha(palette.purple[500], 0.2),
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { fontSize: 12, fontWeight: "700", color: palette.purple[400] },
  aiCount: { fontSize: 10, fontWeight: "700", color: palette.gray[500], marginLeft: "auto" },
  moreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  moreText: { fontSize: 11, fontWeight: "700" },
})
