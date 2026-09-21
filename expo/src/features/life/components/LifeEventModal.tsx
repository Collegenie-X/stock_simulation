/**
 * 생활 사건 — 급하게 돈이 나가거나, 생각 못 한 돈이 들어온다.
 * 현금이 모자라면 어떤 주식이 얼마에 팔리는지 미리 보여준다.
 */
import { StyleSheet, Text, View } from "react-native"
import { CenterModal, Gradient, Pop, PressableScale } from "@/components/ui"
import { formatKRW } from "@/lib/format"
import { alpha, palette, stockColor } from "@/theme"
import { EVENT_LINES, LABELS, inLifeUnits, signedKRW } from "../config"
import type { ForcedSale, PendingLifeEvent } from "../hooks/useLifeEvents"

interface LifeEventModalProps {
  pending: PendingLifeEvent | null
  cash: number
  forcedSales: ForcedSale[]
  stockNames: { [stockId: string]: string }
  onResolve: () => void
}

export function LifeEventModal({ pending, cash, forcedSales, stockNames, onResolve }: LifeEventModalProps) {
  if (!pending) return null
  const { event, amount, character } = pending
  const isGain = event.kind === "gain"
  const mustSell = forcedSales.length > 0
  const sellLoss = forcedSales.reduce((sum, s) => sum + s.profit, 0)
  const accent = isGain ? palette.emerald : palette.amber
  const units = inLifeUnits(amount, character)
  const line = isGain ? EVENT_LINES.gain : !mustSell ? EVENT_LINES.paidCash : sellLoss < 0 ? EVENT_LINES.forcedSellLoss : EVENT_LINES.forcedSell
  const cta = isGain ? LABELS.eventReceive : mustSell ? LABELS.eventPaySell : LABELS.eventPayCash

  return (
    <CenterModal visible dismissable={false} style={[styles.dialog, { borderColor: alpha(accent[400], 0.4) }]}>
      <Text style={[styles.kicker, { color: accent[300] }]}>{isGain ? LABELS.eventGain : LABELS.eventNeed}</Text>
      <Pop>
        <Text style={styles.emoji}>{event.emoji}</Text>
      </Pop>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.desc}>{event.desc}</Text>

      <Text style={[styles.amount, { color: stockColor(isGain ? 1 : -1) }]}>{signedKRW(isGain ? amount : -amount)}</Text>
      {units && <Text style={styles.units}>= {units}</Text>}

      {!isGain && (
        <View style={styles.box}>
          <Row label={LABELS.eventCashLeft} value={formatKRW(cash)} />
          {mustSell && <Text style={styles.short}>{LABELS.eventShort(formatKRW(amount - cash))}</Text>}
          {forcedSales.map((s) => (
            <Row
              key={s.stockId}
              label={`${stockNames[s.stockId] ?? s.stockId} ${s.quantity}주 팔기`}
              value={signedKRW(s.profit)}
              valueColor={stockColor(s.profit)}
            />
          ))}
        </View>
      )}

      <Text style={styles.line}>{line}</Text>

      <PressableScale onPress={onResolve} scaleTo={0.98} style={{ alignSelf: "stretch" }}>
        <Gradient dir="r" colors={[accent[600], accent[500]]} style={styles.cta}>
          <Text style={styles.ctaText}>{cta}</Text>
        </Gradient>
      </PressableScale>
    </CenterModal>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  dialog: { alignItems: "center", padding: 22, borderRadius: 24, borderWidth: 1, backgroundColor: palette.gray[900], maxWidth: 360, width: "100%" },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
  emoji: { fontSize: 52, marginTop: 10, color: "#ffffff" },
  title: { fontSize: 18, fontWeight: "900", letterSpacing: -0.3, color: "#ffffff", marginTop: 8, textAlign: "center" },
  desc: { fontSize: 13, color: palette.gray[400], marginTop: 4, textAlign: "center" },
  amount: { fontSize: 30, fontWeight: "900", letterSpacing: -0.6, marginTop: 14, fontVariant: ["tabular-nums"] },
  units: { fontSize: 12, fontWeight: "700", color: palette.gray[400], marginTop: 2 },
  box: { alignSelf: "stretch", marginTop: 14, padding: 12, gap: 6, borderRadius: 14, backgroundColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  rowLabel: { flex: 1, fontSize: 12, color: palette.gray[400] },
  rowValue: { fontSize: 13, fontWeight: "800", color: "#ffffff", fontVariant: ["tabular-nums"] },
  short: { fontSize: 12, fontWeight: "800", color: palette.amber[400] },
  line: { fontSize: 12, lineHeight: 18, color: palette.gray[300], marginTop: 14, textAlign: "center" },
  cta: { marginTop: 16, paddingVertical: 15, borderRadius: 16, alignItems: "center" },
  ctaText: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
})
