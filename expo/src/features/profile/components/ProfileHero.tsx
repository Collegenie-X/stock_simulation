import { Pressable, StyleSheet, Text, View } from "react-native"
import { Pencil } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS, LEVEL_NAMES, LEVEL_EXP } from "../config"

const L = PROFILE_LABELS.hero

interface ProfileHeroProps {
  nickname: string
  level: number
  exp: number
  badges: string[]
  styleEmoji: string
  styleLabel: string
}

export function ProfileHero({ nickname, level, exp, badges, styleEmoji, styleLabel }: ProfileHeroProps) {
  const maxExp = LEVEL_EXP[level] ?? 1000
  const levelName = LEVEL_NAMES[level] ?? `${level}단계`
  const expPct = Math.min(100, Math.round((exp / maxExp) * 100))

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {/* 아바타 */}
        <View>
          <Gradient dir="br" colors={[palette.blue[500], palette.purple[600]]} style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🌊</Text>
          </Gradient>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{level}</Text>
          </View>
        </View>

        {/* 정보 */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.nickname}>
              {nickname}
            </Text>
            <Pressable style={{ padding: 4 }} accessibilityLabel={L.editProfile} hitSlop={8}>
              <Pencil size={14} color={palette.gray[500]} />
            </Pressable>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>
              {L.levelUnit} {level} · {levelName}
            </Text>
            <Text style={styles.styleEmoji}>{styleEmoji}</Text>
            <Text style={styles.styleLabel}>{styleLabel}</Text>
          </View>
          {/* 배지 */}
          <View style={styles.badges}>
            {badges.map((b, i) => (
              <Text key={i} style={styles.badge}>
                {b}
              </Text>
            ))}
          </View>
          {/* XP 바 */}
          <View>
            <View style={styles.xpRow}>
              <Text style={styles.xpText}>{L.toNextLevel}</Text>
              <Text style={styles.xpText}>
                {exp} / {maxExp} {L.xpUnit}
              </Text>
            </View>
            <View style={styles.xpTrack}>
              <Gradient dir="r" colors={[palette.blue[400], palette.cyan[400]]} style={{ height: "100%", borderRadius: 9999, width: `${expPct}%` }} />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 16, backgroundColor: "#252525", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 30, color: "#ffffff" },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.yellow[500],
    borderWidth: 2,
    borderColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: { fontSize: 12, fontWeight: "700", color: "#000000" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  nickname: { fontSize: 18, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  levelText: { fontSize: 12, fontWeight: "500", color: palette.yellow[400] },
  styleEmoji: { fontSize: 14, color: "#ffffff" },
  styleLabel: { fontSize: 12, color: palette.gray[400] },
  badges: { flexDirection: "row", gap: 4, marginBottom: 8 },
  badge: { fontSize: 16, color: "#ffffff" },
  xpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpText: { fontSize: 12, color: palette.gray[500] },
  xpTrack: { height: 6, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
})
