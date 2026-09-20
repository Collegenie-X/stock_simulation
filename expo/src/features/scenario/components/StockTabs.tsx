import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { GameScenario } from "@/data/game-scenarios/types"
import type { GameState, TurnSnapshot } from "@/lib/scenario/engine"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/** 종목 선택 (탭) */
export function StockTabs({ scenario, state, snapshot, selectedStockId, onSelect }: { scenario: GameScenario; state: GameState; snapshot: TurnSnapshot; selectedStockId: string; onSelect: (id: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.row}>
      {scenario.stocks.map((s) => {
        const p = snapshot.prices[s.id]
        const isSel = s.id === selectedStockId
        const myHold = state.holdings[s.id] || 0
        return (
          <Pressable key={s.id} onPress={() => onSelect(s.id)} style={[styles.tab, isSel ? styles.tabSel : styles.tabIdle]}>
            <Text style={{ fontSize: 10, color: palette.gray[500] }}>
              {s.market === "KR" ? "🇰🇷" : "🇺🇸"} {s.character}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>{s.name}</Text>
            <Text style={{ fontSize: 11, color: palette.gray[300] }}>{s.currency === "KRW" ? `${formatNumber(p.native)}원` : `$${p.native.toFixed(2)}`}</Text>
            {myHold > 0 && <Text style={{ fontSize: 10, color: palette.yellow[400], marginTop: 2 }}>보유 {myHold}주</Text>}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  tabSel: { borderColor: palette.blue[500], backgroundColor: alpha(palette.blue[500], 0.1) },
  tabIdle: { borderColor: palette.gray[800], backgroundColor: palette.gray[900] },
})
