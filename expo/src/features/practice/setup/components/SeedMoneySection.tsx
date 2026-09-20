import { StyleSheet, Text, View } from "react-native"
import { Coins, Trophy } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { CoinStack } from "../illustrations"
import { type SpeedMode, MONEY_OPTIONS, LABELS, SPRINT_MAX_CAPITAL } from "../config"
import { SectionHeader } from "./SectionHeader"

const MONEY_TIER_VISUAL = (value: number, premium: boolean): "small" | "medium" | "large" => {
  if (premium) return "large"
  if (value >= 50000000) return "large"
  if (value >= 10000000) return "medium"
  return "small"
}

const MONEY_TAGLINE: Record<number, string> = {
  5000000: "부담없이 체험",
  10000000: "직장인 첫 투자",
  50000000: "본격 입문가",
  100000000: "1억 만들기 도전",
  300000000: "자산가 체험",
  500000000: "전업 투자자",
}

const COLUMNS = 3

interface SeedMoneySectionProps {
  seedMoney: number
  mode: SpeedMode
  onSelect: (v: number) => void
  onModeChange: (m: SpeedMode) => void
}

export function SeedMoneySection({ seedMoney, mode, onSelect, onModeChange }: SeedMoneySectionProps) {
  // grid-cols-3 → 3개씩 행으로 분할
  const rows: (typeof MONEY_OPTIONS)[] = []
  for (let i = 0; i < MONEY_OPTIONS.length; i += COLUMNS) rows.push(MONEY_OPTIONS.slice(i, i + COLUMNS))

  return (
    <View>
      <SectionHeader
        icon={<Coins size={16} color={palette.yellow[300]} />}
        title={LABELS.seedMoneyTitle}
        accentBg={alpha(palette.yellow[500], 0.2)}
        accentBorder={alpha(palette.yellow[400], 0.3)}
        hint={LABELS.seedMoneyHint}
      />
      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((opt) => {
              const isSelected = seedMoney === opt.value
              const isAdvanced = opt.tier === "advanced"
              const tagline = MONEY_TAGLINE[opt.value]
              const accent = isAdvanced ? palette.purple : palette.yellow

              const bubbleColors = isSelected
                ? { backgroundColor: alpha(accent[500], 0.25), borderColor: alpha(accent[400], 0.5) }
                : { backgroundColor: "#2a2a2a", borderColor: "#3a3a3a" }

              return (
                <PressableScale
                  key={opt.value}
                  scaleTo={0.97}
                  pressedOpacity={1}
                  onPress={() => {
                    onSelect(opt.value)
                    if (opt.value > SPRINT_MAX_CAPITAL && mode === "sprint") {
                      onModeChange("standard")
                    }
                  }}
                  style={[
                    styles.card,
                    isSelected
                      ? {
                          borderColor: accent[500],
                          boxShadow: isAdvanced ? "0 0 18px rgba(168,85,247,0.45)" : "0 0 18px rgba(234,179,8,0.45)",
                        }
                      : { backgroundColor: "#1f1f1f", borderColor: "#2a2a2a" },
                  ]}
                >
                  {/* Gradient bg layer (clipped) */}
                  <View style={styles.bgLayer} pointerEvents="none">
                    {isSelected && (
                      <Gradient
                        dir="br"
                        colors={
                          isAdvanced
                            ? [alpha(palette.purple[500], 0.3), alpha(palette.fuchsia[500], 0.15), alpha(palette.fuchsia[500], 0)]
                            : [alpha(palette.yellow[500], 0.3), alpha(palette.amber[500], 0.15), alpha(palette.amber[500], 0)]
                        }
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                  </View>

                  {/* Premium badge — 카드 밖으로 살짝 나오도록 배치 */}
                  {isAdvanced && (
                    <View style={styles.premiumBadge}>
                      <Trophy size={8} color="#ffffff" />
                      <Text style={styles.premiumBadgeText}>{LABELS.advancedBadge}</Text>
                    </View>
                  )}

                  <View style={styles.content}>
                    {/* Speech bubble tagline */}
                    {!!tagline && (
                      <View style={styles.bubbleWrap}>
                        <View style={[styles.bubble, bubbleColors]}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.bubbleText,
                              { color: isSelected ? (isAdvanced ? palette.purple[100] : palette.yellow[100]) : palette.gray[400] },
                            ]}
                          >
                            {tagline}
                          </Text>
                        </View>
                        {/* Bubble tail */}
                        <View style={[styles.bubbleTail, bubbleColors]} />
                      </View>
                    )}

                    <View style={styles.coinArea}>
                      <View style={{ width: 48, height: 36 }}>
                        <CoinStack size={MONEY_TIER_VISUAL(opt.value, isAdvanced)} premium={isAdvanced} active={isSelected} />
                      </View>
                    </View>
                    <Text style={[styles.label, { color: isSelected ? accent[300] : palette.gray[300] }]}>{opt.label}</Text>
                    {isAdvanced && <Text style={styles.subLabel}>{LABELS.advancedSubLabel}</Text>}
                  </View>
                </PressableScale>
              )
            })}
          </View>
        ))}
      </View>
      <Gradient
        dir="r"
        colors={[alpha(palette.blue[500], 0.1), alpha(palette.purple[500], 0.1), alpha(palette.blue[500], 0.1)]}
        style={styles.guide}
      >
        <Text style={styles.guideText}>
          💡 <Text style={[styles.guideStrong, { color: LABELS.capitalGuideBasicColor }]}>5천만원 이하</Text>: 모든 모드 선택 가능 ·{" "}
          <Text style={[styles.guideStrong, { color: LABELS.capitalGuideAdvancedColor }]}>5천만원 초과</Text>: 스탠다드/마라톤만 가능
        </Text>
      </Gradient>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { gap: 10, paddingTop: 8 },
  gridRow: { flexDirection: "row", gap: 10 },
  card: { flex: 1, borderRadius: 12, borderWidth: 2 },
  bgLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, overflow: "hidden" },
  premiumBadge: {
    position: "absolute",
    top: -8,
    right: -4,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: palette.purple[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
  },
  premiumBadgeText: { fontSize: 8, fontWeight: "900", color: "#ffffff" },
  content: { paddingVertical: 12, paddingHorizontal: 6, alignItems: "center" },
  bubbleWrap: { marginBottom: 6, alignItems: "center", maxWidth: "100%" },
  bubble: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1, maxWidth: "100%" },
  bubbleText: { fontSize: 9, fontWeight: "700" },
  bubbleTail: {
    position: "absolute",
    bottom: -3,
    width: 6,
    height: 6,
    transform: [{ rotate: "45deg" }],
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  coinArea: { height: 36, marginBottom: 4, alignItems: "center", justifyContent: "flex-end" },
  label: { fontSize: 14, fontWeight: "900", fontVariant: ["tabular-nums"], textAlign: "center" },
  subLabel: { fontSize: 9, color: palette.gray[500], marginTop: 2, textAlign: "center" },
  guide: { marginTop: 12, borderWidth: 1, borderColor: alpha(palette.blue[500], 0.2), borderRadius: 12, padding: 12 },
  guideText: { fontSize: 12, lineHeight: 18, color: palette.gray[400] },
  guideStrong: { fontWeight: "700" },
})
