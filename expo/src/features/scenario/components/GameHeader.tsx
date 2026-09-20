import { Pressable, StyleSheet, Text, View } from "react-native"
import { ArrowLeft } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import type { GameScenario } from "@/data/game-scenarios/types"
import type { GameState, TurnSnapshot } from "@/lib/scenario/engine"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

export function GameHeader({ scenario, state, snapshot, profitRate, onBack }: { scenario: GameScenario; state: GameState; snapshot: TurnSnapshot; profitRate: number; onBack: () => void }) {
  const pct = Math.max(0, Math.min(100, (snapshot.turn / scenario.totalTurns) * 100))
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <Pressable onPress={onBack} style={{ padding: 4 }} hitSlop={8} accessibilityLabel="뒤로가기">
          <ArrowLeft size={20} color="#ffffff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.tiny}>
            {snapshot.day}일차 · {Math.ceil(snapshot.day / 5)}주차 · {snapshot.weekday}요일 · {snapshot.time}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 14, fontWeight: "700", color: "#ffffff" }}>
              {scenario.title}
            </Text>
            <View style={styles.act}>
              <Text style={{ fontSize: 10, color: palette.blue[400] }}>Act {snapshot.act}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.tiny}>총자산</Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{formatNumber(state.totalAssetKrw)}원</Text>
          <Text style={{ fontSize: 10, color: profitRate >= 0 ? palette.red[400] : palette.blue[400] }}>
            {profitRate >= 0 ? "+" : ""}
            {profitRate.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* 진행률 + 환율 + 감각 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.track}>
          <Gradient dir="r" colors={[palette.blue[500], palette.purple[500]]} style={{ height: "100%", width: `${pct}%` }} />
        </View>
        <Text style={{ fontSize: 11, color: palette.gray[500] }}>
          {snapshot.turn}/{scenario.totalTurns}
        </Text>
        <Text style={{ fontSize: 11, color: palette.gray[400] }}>${snapshot.fxRate}</Text>
        <Text style={{ fontSize: 11, color: palette.purple[400], fontWeight: "700" }}>감각 {state.senseScore}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#000000", borderBottomWidth: 1, borderBottomColor: palette.gray[800], paddingHorizontal: 16, paddingVertical: 12, zIndex: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  tiny: { fontSize: 10, color: palette.gray[500] },
  act: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: alpha(palette.blue[500], 0.2) },
  track: { flex: 1, backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 9999, height: 6, overflow: "hidden" },
})
