import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import type { DecisionTimelineEntry } from "@/features/practice-stock/types"

type TimelineAction = "buy" | "sell" | "skip" | "hold"
type Judge = "win" | "lose" | "neutral"

// ── 선택 타임라인 ──────────────────────────────────────────
function actionLabel(a: TimelineAction): { label: string; color: string; bg: string } {
  if (a === "buy") return { label: "매수", color: palette.red[400], bg: alpha(palette.red[500], 0.15) }
  if (a === "sell") return { label: "매도", color: palette.blue[400], bg: alpha(palette.blue[500], 0.15) }
  return { label: "관망", color: palette.gray[400], bg: alpha(palette.gray[700], 0.4) }
}

// 결과 평가: 가격이 올랐을 때 매수가 정답, 내렸을 때 매도가 정답
function judgeAction(action: TimelineAction, changePct: number): Judge {
  if (action === "buy") return changePct > 0 ? "win" : changePct < 0 ? "lose" : "neutral"
  if (action === "sell") return changePct < 0 ? "win" : changePct > 0 ? "lose" : "neutral"
  // skip/hold: 변동 작으면 정답, 크게 움직였으면 기회 놓침
  return Math.abs(changePct) < 1 ? "win" : "lose"
}

const JUDGE_STYLE: Record<Judge, string> = {
  win: palette.green[400],
  lose: palette.rose[400],
  neutral: palette.gray[500],
}
const JUDGE_ICON: Record<Judge, string> = {
  win: "✓", lose: "✗", neutral: "·",
}

function SummaryCell({ label, wins, total, base }: { label: string; wins: number; total: number; base: string }) {
  return (
    <View style={[styles.summaryCell, { backgroundColor: alpha(base, 0.1), borderColor: alpha(base, 0.2) }]}>
      <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.summaryValue}>{wins}/{total}</Text>
      <Text style={styles.summaryPct}>{total > 0 ? Math.round((wins / total) * 100) : 0}%</Text>
    </View>
  )
}

function ActionCell({ title, action, changePct }: { title: string; action: TimelineAction; changePct: number }) {
  const info = actionLabel(action)
  const judge = judgeAction(action, changePct)
  return (
    <View style={styles.actionCell}>
      <Text style={styles.actionTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.actionBadge, { backgroundColor: info.bg }]}>
        <Text style={[styles.actionText, { color: info.color }]}>
          {info.label} <Text style={{ color: JUDGE_STYLE[judge] }}>{JUDGE_ICON[judge]}</Text>
        </Text>
      </View>
    </View>
  )
}

export function DecisionTimelineSection({
  entries, aiSimilarName, aiSimilarEmoji, aiBestName, aiBestEmoji,
}: {
  entries: DecisionTimelineEntry[]
  aiSimilarName: string; aiSimilarEmoji: string
  aiBestName: string; aiBestEmoji: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(true)

  // 승률 집계
  const totals = entries.reduce(
    (acc, e) => {
      const ch = e.changePct ?? 0
      const u = judgeAction(e.userAction, ch)
      const s = judgeAction(e.similarAction, ch)
      const b = judgeAction(e.bestAction, ch)
      if (u === "win") acc.user++
      if (s === "win") acc.sim++
      if (b === "win") acc.best++
      return acc
    },
    { user: 0, sim: 0, best: 0 },
  )
  const total = entries.length

  const shown = expanded ? entries : entries.slice(0, 5)

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setVisible((v) => !v)} style={styles.header}>
        <View style={styles.headerLeft}>
          <BarChart3 size={16} color={palette.cyan[400]} />
          <Text style={styles.title}>선택 타임라인</Text>
          <Text style={styles.count}>{total}건</Text>
        </View>
        {visible ? <ChevronUp size={14} color={palette.gray[500]} /> : <ChevronDown size={14} color={palette.gray[500]} />}
      </Pressable>

      {visible && (
        <>
          {/* 정답률 요약 */}
          <View style={styles.summaryRow}>
            <SummaryCell label="나" wins={totals.user} total={total} base={palette.blue[500]} />
            <SummaryCell label={`${aiSimilarEmoji} ${aiSimilarName}`} wins={totals.sim} total={total} base={palette.purple[500]} />
            <SummaryCell label={`${aiBestEmoji} ${aiBestName}`} wins={totals.best} total={total} base={palette.yellow[500]} />
          </View>

          {/* 결정별 상세 */}
          <View style={{ gap: 8 }}>
            {shown.map((e, i) => {
              const ch = e.changePct ?? 0
              return (
                <View key={i} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryLeft}>
                      <Text style={styles.entryDay}>D{e.day ?? "-"}</Text>
                      <Text style={styles.entryName} numberOfLines={1}>{e.stockName}</Text>
                    </View>
                    <Text style={[styles.entryChange, { color: ch > 0 ? palette.red[400] : ch < 0 ? palette.blue[400] : palette.gray[500] }]}>
                      {ch > 0 ? "+" : ""}{ch.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.actionRow}>
                    <ActionCell title="나" action={e.userAction} changePct={ch} />
                    <ActionCell title={aiSimilarEmoji} action={e.similarAction} changePct={ch} />
                    <ActionCell title={aiBestEmoji} action={e.bestAction} changePct={ch} />
                  </View>
                </View>
              )
            })}
          </View>

          {entries.length > 5 && (
            <Pressable onPress={() => setExpanded((v) => !v)} style={styles.more} hitSlop={6}>
              <Text style={styles.moreText}>{expanded ? "접기" : `+${entries.length - 5}건 더보기`}</Text>
              {expanded ? <ChevronUp size={12} color={palette.gray[500]} /> : <ChevronDown size={12} color={palette.gray[500]} />}
            </Pressable>
          )}
        </>
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
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  count: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  summaryRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  summaryCell: { flex: 1, borderRadius: 8, padding: 8, alignItems: "center", borderWidth: 1 },
  summaryLabel: { fontSize: 8, color: palette.gray[500], marginBottom: 2 },
  summaryValue: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  summaryPct: { fontSize: 8, color: palette.gray[500] },
  entry: {
    backgroundColor: alpha(palette.gray[900], 0.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
    padding: 10,
  },
  entryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 },
  entryLeft: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  entryDay: { fontSize: 9, fontWeight: "700", color: palette.gray[500] },
  entryName: { fontSize: 11, fontWeight: "800", color: "#ffffff", flexShrink: 1 },
  entryChange: { fontSize: 10, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 4 },
  actionCell: { flex: 1, alignItems: "center" },
  actionTitle: { fontSize: 8, color: palette.gray[600], marginBottom: 2 },
  actionBadge: { alignSelf: "stretch", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actionText: { fontSize: 10, fontWeight: "800" },
  more: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  moreText: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
})
