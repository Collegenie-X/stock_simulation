import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Bot, ChevronDown, ChevronUp } from "lucide-react-native"
import { FadeUp } from "@/components/ui"
import { alpha, palette } from "@/theme"
import type { AIAction, InvestStyle } from "@/features/practice-stock/hooks/useAICompetitor"
import { STYLE_LABELS } from "./helpers"

interface AIStrategyCardProps {
  aiName: string
  aiStyle: InvestStyle
  aiDescription: string
  aiMotto: string
  aiTodayActions: AIAction[]
}

function ActionRow({ action, kind }: { action: AIAction; kind: "buy" | "sell" }) {
  const base = kind === "buy" ? palette.red[500] : palette.blue[500]
  return (
    <View style={[styles.actionRow, { backgroundColor: alpha(base, 0.1) }]}>
      <View style={[styles.actionBadge, { backgroundColor: alpha(base, 0.2) }]}>
        <Text style={[styles.actionBadgeText, { color: kind === "buy" ? palette.red[400] : palette.blue[400] }]}>
          {kind === "buy" ? "매수" : "매도"}
        </Text>
      </View>
      <Text style={styles.actionName} numberOfLines={1}>{action.stockName}</Text>
      <Text style={styles.actionQty}>{action.quantity}주</Text>
    </View>
  )
}

// ── AI 전략 & 오늘의 행동 ──
export function AIStrategyCard({ aiName, aiStyle, aiDescription, aiMotto, aiTodayActions }: AIStrategyCardProps) {
  const [showAIDetail, setShowAIDetail] = useState(false)
  const styleInfo = STYLE_LABELS[aiStyle]

  const buyActions = aiTodayActions.filter((a) => a.type === "buy")
  const sellActions = aiTodayActions.filter((a) => a.type === "sell")
  const holdActions = aiTodayActions.filter((a) => a.type === "hold")

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setShowAIDetail(!showAIDetail)}
        style={({ pressed }) => [styles.toggle, pressed && { backgroundColor: alpha(palette.gray[700], 0.2) }]}
      >
        <View style={styles.toggleLeft}>
          <Bot size={16} color={palette.purple[400]} />
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{aiName}의 투자 전략</Text>
              <View style={[styles.styleBadge, { backgroundColor: styleInfo.bg }]}>
                <Text style={[styles.styleBadgeText, { color: styleInfo.color }]}>{styleInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.motto}>"{aiMotto}"</Text>
          </View>
        </View>
        {showAIDetail ? <ChevronUp size={16} color={palette.gray[500]} /> : <ChevronDown size={16} color={palette.gray[500]} />}
      </Pressable>

      {showAIDetail && (
        <FadeUp duration={200} distance={-8} style={styles.detail}>
          <View style={styles.principle}>
            <Text style={[styles.label, { marginBottom: 4 }]}>투자 원칙</Text>
            <Text style={styles.principleText}>{aiDescription}</Text>
          </View>

          <View>
            <Text style={[styles.label, { marginBottom: 8 }]}>오늘의 거래 내역</Text>
            <View style={{ gap: 6 }}>
              {buyActions.map((a, i) => <ActionRow key={`buy-${i}`} action={a} kind="buy" />)}
              {sellActions.map((a, i) => <ActionRow key={`sell-${i}`} action={a} kind="sell" />)}
              {holdActions.length > 0 && buyActions.length === 0 && sellActions.length === 0 && (
                <View style={[styles.actionRow, { backgroundColor: alpha(palette.gray[700], 0.3) }]}>
                  <View style={[styles.actionBadge, { backgroundColor: alpha(palette.gray[600], 0.3) }]}>
                    <Text style={[styles.actionBadgeText, { color: palette.gray[400] }]}>관망</Text>
                  </View>
                  <Text style={[styles.actionName, { color: palette.gray[400], fontWeight: "400" }]}>{holdActions[0].reason}</Text>
                </View>
              )}
            </View>
          </View>

          {(buyActions.length > 0 || sellActions.length > 0) && (
            <View>
              <Text style={[styles.label, { marginBottom: 6 }]}>AI 판단 근거</Text>
              <View style={{ gap: 4 }}>
                {[...buyActions, ...sellActions].slice(0, 3).map((a, i) => (
                  <View key={`reason-${i}`} style={styles.reasonRow}>
                    <View style={styles.reasonDot} />
                    <Text style={styles.reasonText}>{a.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </FadeUp>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    marginBottom: 12,
    overflow: "hidden",
  },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 8 },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flexShrink: 1, fontSize: 12, fontWeight: "700", color: "#ffffff" },
  styleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  styleBadgeText: { fontSize: 10, fontWeight: "700" },
  motto: { fontSize: 10, color: palette.gray[500], marginTop: 2 },
  detail: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  principle: { backgroundColor: alpha(palette.gray[900], 0.5), borderRadius: 12, padding: 12 },
  label: { fontSize: 11, color: palette.gray[500] },
  principleText: { fontSize: 12, color: palette.gray[300] },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  actionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actionBadgeText: { fontSize: 10, fontWeight: "700" },
  actionName: { flex: 1, fontSize: 11, fontWeight: "500", color: palette.gray[300] },
  actionQty: { fontSize: 10, color: palette.gray[400] },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  reasonDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.purple[400], marginTop: 6 },
  reasonText: { flex: 1, fontSize: 11, color: palette.gray[400] },
})
