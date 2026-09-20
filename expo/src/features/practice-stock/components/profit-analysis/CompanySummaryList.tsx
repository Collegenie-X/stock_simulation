import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"
import type { TradeRecord } from "@/features/practice-stock/types"
import type { CompanyProfile } from "./CompanyCard"
import { CompanyCard } from "./CompanyCard"
import labelsData from "@/data/profit-analysis-labels.json"

interface CompanyStats {
  profile: CompanyProfile
  trades: TradeRecord[]
  buyCount: number
  sellCount: number
  totalBuyAmount: number
  totalSellAmount: number
  totalProfit: number
  avgBuyPrice: number
  currentHoldings: number
}

interface CompanySummaryListProps {
  trades: TradeRecord[]
  profiles: Record<string, CompanyProfile>
  currentPrices?: Record<string, number>
  currentHoldings?: Record<string, number>
  avgPrices?: Record<string, number>
}

function buildCompanyStats(
  trades: TradeRecord[],
  profiles: Record<string, CompanyProfile>,
  currentHoldings: Record<string, number>,
  avgPrices: Record<string, number>,
): CompanyStats[] {
  const map: Record<string, CompanyStats> = {}

  trades.forEach((trade) => {
    if (!map[trade.stockId]) {
      map[trade.stockId] = {
        profile: profiles[trade.stockId] ?? {
          stockId: trade.stockId,
          name: trade.stockName,
          emoji: "📈",
          sector: "-",
          subSector: "-",
          ticker: "-",
          exchange: "-",
          description: "",
          businessModel: "",
          investmentThesis: "",
          initialInvestmentNote: "",
          keyStrengths: [],
          riskFactors: [],
          targetPrice: 0,
          riskLevel: "중간",
          analystRating: "-",
          dividendYield: 0,
          per: "-",
          pbr: "-",
        },
        trades: [],
        buyCount: 0,
        sellCount: 0,
        totalBuyAmount: 0,
        totalSellAmount: 0,
        totalProfit: 0,
        avgBuyPrice: 0,
        currentHoldings: currentHoldings[trade.stockId] ?? 0,
      }
    }
    const stats = map[trade.stockId]
    stats.trades.push(trade)
    if (trade.action === "buy") {
      stats.buyCount++
      stats.totalBuyAmount += trade.totalAmount
    } else {
      stats.sellCount++
      stats.totalSellAmount += trade.totalAmount
      stats.totalProfit += trade.profit ?? 0
    }
  })

  // avgBuyPrice를 avgPrices에서 보완
  Object.values(map).forEach((stats) => {
    stats.avgBuyPrice = avgPrices[stats.profile.stockId] ?? 0
    stats.currentHoldings = currentHoldings[stats.profile.stockId] ?? 0
  })

  return Object.values(map).sort((a, b) => b.totalBuyAmount - a.totalBuyAmount)
}

export const CompanySummaryList = ({
  trades,
  profiles,
  currentPrices = {},
  currentHoldings = {},
  avgPrices = {},
}: CompanySummaryListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const companyStats = buildCompanyStats(trades, profiles, currentHoldings, avgPrices)

  if (companyStats.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>{labelsData.emptyState.icon}</Text>
        <Text style={styles.emptyMessage}>{labelsData.emptyState.message}</Text>
        <Text style={styles.emptySub}>{labelsData.emptyState.subMessage}</Text>
      </View>
    )
  }

  return (
    <View style={styles.list}>
      {companyStats.map((stats) => {
        const myQty = stats.currentHoldings
        const myAvgPrice = stats.avgBuyPrice
        const currentPrice = currentPrices[stats.profile.stockId]
        const unrealizedProfit =
          myQty > 0 && currentPrice
            ? (currentPrice - myAvgPrice) * myQty
            : 0
        const unrealizedRate =
          myQty > 0 && myAvgPrice > 0 && currentPrice
            ? ((currentPrice - myAvgPrice) / myAvgPrice) * 100
            : 0
        const displayProfit = stats.totalProfit + unrealizedProfit
        const displayRate =
          stats.totalBuyAmount > 0
            ? (displayProfit / stats.totalBuyAmount) * 100
            : unrealizedRate

        return (
          <CompanyCard
            key={stats.profile.stockId}
            profile={stats.profile}
            currentPrice={currentPrice}
            myQty={myQty}
            myAvgPrice={myAvgPrice}
            totalProfit={Math.round(displayProfit)}
            totalProfitRate={Math.round(displayRate * 10) / 10}
            isExpanded={expandedId === stats.profile.stockId}
            onToggle={() =>
              setExpandedId(
                expandedId === stats.profile.stockId ? null : stats.profile.stockId,
              )
            }
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 12, color: "#ffffff" },
  emptyMessage: { fontSize: 16, fontWeight: "500", color: palette.gray[400], textAlign: "center" },
  emptySub: { fontSize: 14, color: palette.gray[600], marginTop: 4, textAlign: "center" },
})
