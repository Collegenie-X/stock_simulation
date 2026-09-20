import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, Shield, TrendingUp, Trophy, X, Zap } from "lucide-react-native"
import aiCompetitorsData from "@/data/ai-competitors.json"
import { CenterModal, Gradient, PressableScale, Pulse, SlideIn } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/** AI와 사용자를 합쳐서 순위 계산 */
function useRankings(userProfit: number, userName: string) {
  const [rankings, setRankings] = useState<any[]>([])
  const [userRank, setUserRank] = useState(0)

  useEffect(() => {
    const competitors = aiCompetitorsData.competitors.map((ai) => ({
      ...ai,
      isAI: true,
      profitRate: ai.stats.profitRate,
    }))

    const user = {
      id: "user",
      name: userName,
      emoji: "👤",
      nickname: "Player",
      profitRate: userProfit,
      isAI: false,
    }

    const allCompetitors = [...competitors, user].sort((a: any, b: any) => b.profitRate - a.profitRate)

    setRankings(allCompetitors)
    setUserRank(allCompetitors.findIndex((c: any) => c.id === "user") + 1)
  }, [userProfit, userName])

  return { rankings, userRank }
}

// 순위 이모지
const getRankEmoji = (rank: number) => {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return `${rank}위`
}

// AI 전략 아이콘
const getStrategyIcon = (ai: any) => {
  if (!ai.isAI) return null
  if (ai.strategy.type === "conservative") return <Shield size={16} color={palette.blue[400]} />
  if (ai.strategy.type === "aggressive") return <Zap size={16} color={palette.yellow[500]} />
  if (ai.strategy.type === "ultra_aggressive") return <Zap size={16} color={palette.red[500]} />
  return <TrendingUp size={16} color={palette.green[500]} />
}

function RankingRow({
  competitor,
  index,
  rankings,
  userRank,
  userProfit,
  pulse,
  rankMinWidth,
}: {
  competitor: any
  index: number
  rankings: any[]
  userRank: number
  userProfit: number
  pulse?: boolean
  rankMinWidth?: number
}) {
  const isUser = !competitor.isAI
  const rank = index + 1
  const isTop3 = rank <= 3
  const isProfit = competitor.profitRate >= 0

  const row = (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI, isTop3 && styles.rowShadow]}>
      {/* 순위 */}
      <Text
        style={[
          styles.rank,
          rankMinWidth ? { minWidth: rankMinWidth } : null,
          { color: isUser ? palette.blue[400] : isTop3 ? palette.yellow[500] : palette.gray[400] },
        ]}
      >
        {getRankEmoji(rank)}
      </Text>

      {/* 아바타 */}
      <View style={[styles.avatar, { backgroundColor: isUser ? alpha(palette.blue[500], 0.2) : alpha(palette.gray[700], 0.5) }]}>
        <Text style={styles.avatarEmoji}>{competitor.emoji}</Text>
      </View>

      {/* 이름 & 정보 */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.name, { color: isUser ? palette.blue[400] : palette.gray[200] }]}>
            {competitor.name}
          </Text>
          {competitor.isAI ? getStrategyIcon(competitor) : null}
        </View>
        {competitor.isAI ? (
          <Text numberOfLines={1} style={styles.desc}>
            {competitor.strategy?.description}
          </Text>
        ) : null}
        {isUser && userRank === 1 ? <Text style={styles.keepFirst}>🏆 1위 유지 중!</Text> : null}
      </View>

      {/* 수익률 */}
      <View style={styles.profitBox}>
        <Text style={[styles.profit, { color: isProfit ? palette.red[500] : palette.blue[500] }, isUser && { fontSize: 18 }]}>
          {isProfit ? "+" : ""}
          {competitor.profitRate.toFixed(1)}%
        </Text>
        {isUser && userRank > 1 && rankings[userRank - 2] ? (
          <Text style={styles.diff}>{(rankings[userRank - 2].profitRate - userProfit).toFixed(1)}%p 차이</Text>
        ) : null}
      </View>
    </View>
  )

  return pulse && isUser ? <Pulse min={0.6}>{row}</Pulse> : row
}

function footerText(rankings: any[], userRank: number, userProfit: number) {
  if (!rankings.length) return ""
  if (userRank === 1) return "🎉 현재 1위를 유지하고 있습니다!"
  if (userRank === 2) return `💪 1위와 ${(rankings[0].profitRate - userProfit).toFixed(1)}%p 차이입니다!`
  if (userRank >= 3) return `📈 ${userRank}위! ${rankings[0].name}을(를) 추격 중입니다.`
  return ""
}

/**
 * AI 경쟁자 실시간 순위 카드 컴포넌트
 * README의 실시간 AI 대결 기능 구현
 */
export function AIRankingCard({
  userProfit,
  userName = "당신",
  isVisible = true,
  style,
  compact = false,
  onShowDetail,
}: {
  userProfit: number
  userName?: string
  isVisible?: boolean
  /** 웹 호환용 (사용되지 않음) */
  className?: string
  style?: StyleProp<ViewStyle>
  compact?: boolean
  onShowDetail?: () => void
}) {
  const { rankings, userRank } = useRankings(userProfit, userName)

  if (!isVisible) return null

  // Compact 모드 - 간단한 요약만 표시
  if (compact) {
    const topCompetitor = rankings[0]

    return (
      <PressableScale style={[styles.compactCard, style]} onPress={onShowDetail}>
        <View style={styles.between}>
          <View style={styles.rowGap3}>
            <View style={styles.trophyCircle}>
              <Trophy size={20} color={palette.yellow[500]} />
            </View>
            <View>
              <Text style={styles.smallLabel}>실시간 순위</Text>
              <Text style={styles.compactRank}>
                {userRank}위{userRank === 1 ? <Text style={{ color: palette.yellow[500] }}>  🏆</Text> : null}
              </Text>
            </View>
          </View>

          <View style={styles.rowGap3}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.smallLabel}>내 수익률</Text>
              <Text style={[styles.compactProfit, { color: userProfit >= 0 ? palette.red[500] : palette.blue[500] }]}>
                {userProfit >= 0 ? "+" : ""}
                {userProfit.toFixed(1)}%
              </Text>
            </View>
            <ChevronRight size={20} color={palette.gray[500]} />
          </View>
        </View>

        {userRank > 1 && topCompetitor ? (
          <View style={styles.compactFooter}>
            <Text style={styles.footerText}>
              1위 {topCompetitor.name}과(와) {(topCompetitor.profitRate - userProfit).toFixed(1)}%p 차이
            </Text>
          </View>
        ) : null}
      </PressableScale>
    )
  }

  return (
    <View style={[styles.card, style]}>
      {/* 헤더 */}
      <View style={[styles.between, { marginBottom: 16 }]}>
        <View style={styles.rowGap2}>
          <Trophy size={20} color={palette.yellow[500]} />
          <Text style={styles.title}>실시간 순위</Text>
        </View>
        <Text style={styles.footerText}>1초마다 갱신</Text>
      </View>

      {/* 순위 목록 */}
      <View style={{ gap: 8 }}>
        {rankings.slice(0, 6).map((competitor, index) => (
          <RankingRow key={competitor.id} competitor={competitor} index={index} rankings={rankings} userRank={userRank} userProfit={userProfit} pulse />
        ))}
      </View>

      {/* 하단 정보 */}
      <View style={styles.bottomInfo}>
        <Text style={[styles.footerText, { textAlign: "center" }]}>{footerText(rankings, userRank, userProfit)}</Text>
      </View>
    </View>
  )
}

/**
 * AI 랭킹 상세 다이얼로그
 * 전체 순위와 통계를 보여주는 모달
 */
export function AIRankingDetailModal({
  isOpen,
  onClose,
  userProfit,
  userName = "당신",
}: {
  isOpen: boolean
  onClose: () => void
  userProfit: number
  userName?: string
}) {
  const { rankings, userRank } = useRankings(userProfit, userName)
  const { height } = useWindowDimensions()

  return (
    <CenterModal visible={isOpen} onClose={onClose} backdropColor="rgba(0,0,0,0.8)" style={[styles.modal, { maxHeight: height * 0.85 }]}>
      {/* 헤더 */}
      <Gradient dir="b" colors={[alpha(palette.gray[800], 0.5), "transparent"]} style={styles.modalHeader}>
        <View style={styles.rowGap3}>
          <Trophy size={24} color={palette.yellow[500]} />
          <View>
            <Text style={styles.modalTitle}>실시간 순위</Text>
            <Text style={styles.footerText}>1초마다 갱신</Text>
          </View>
        </View>
        <PressableScale onPress={onClose} style={styles.closeBtn}>
          <X size={20} color={palette.gray[400]} />
        </PressableScale>
      </Gradient>

      {/* 순위 목록 */}
      <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }} showsVerticalScrollIndicator={false}>
        {rankings.map((competitor, index) => (
          <RankingRow key={competitor.id} competitor={competitor} index={index} rankings={rankings} userRank={userRank} userProfit={userProfit} rankMinWidth={50} />
        ))}
      </ScrollView>

      {/* 하단 정보 */}
      <View style={styles.modalFooter}>
        <Text style={[styles.footerText, { textAlign: "center" }]}>{footerText(rankings, userRank, userProfit)}</Text>
      </View>
    </CenterModal>
  )
}

/**
 * AI 알림 팝업 컴포넌트
 * AI가 매수/매도할 때 표시되는 실시간 알림
 */
export function AINotification({
  aiName,
  action,
  stockName,
  price,
  isVisible,
  onClose,
}: {
  aiName: string
  action: "buy" | "sell"
  stockName: string
  price: number
  isVisible: boolean
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <View pointerEvents="none" style={[styles.notiWrap, { top: insets.top + 96 }]}>
      <SlideIn from={40} duration={300}>
        <View style={styles.notiShadow}>
          <Gradient dir="r" colors={["#2a2140", "#1f2745"]} style={styles.noti}>
            <Text style={styles.notiEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.notiTitle}>AI 움직임 감지!</Text>
              <Text style={styles.notiBody}>
                <Text style={{ fontWeight: "700", color: palette.purple[400] }}>{aiName}</Text>가{" "}
                <Text style={{ fontWeight: "700", color: action === "buy" ? palette.red[500] : palette.blue[500] }}>
                  {action === "buy" ? "매수" : "매도"}
                </Text>
                했습니다
              </Text>
              <Text style={[styles.footerText, { marginTop: 4 }]}>
                {stockName} @ {formatNumber(price)}원
              </Text>
            </View>
          </Gradient>
        </View>
      </SlideIn>
    </View>
  )
}

const styles = StyleSheet.create({
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowGap2: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowGap3: { flexDirection: "row", alignItems: "center", gap: 12 },

  compactCard: { backgroundColor: "#1E1E1E", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: palette.gray[800] },
  trophyCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: alpha(palette.blue[500], 0.2), alignItems: "center", justifyContent: "center" },
  smallLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 2 },
  compactRank: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  compactProfit: { fontSize: 16, fontWeight: "700" },
  compactFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.gray[800] },

  card: { backgroundColor: "#1E1E1E", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: palette.gray[800] },
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  footerText: { fontSize: 12, color: palette.gray[400] },
  bottomInfo: { marginTop: 16, padding: 12, backgroundColor: alpha(palette.gray[800], 0.3), borderRadius: 12 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16 },
  rowUser: { backgroundColor: alpha(palette.blue[500], 0.1), borderWidth: 2, borderColor: alpha(palette.blue[500], 0.5) },
  rowAI: { backgroundColor: alpha(palette.gray[800], 0.5), borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5) },
  rowShadow: { boxShadow: "0 10px 15px rgba(0,0,0,0.2)" },
  rank: { fontSize: 14, fontWeight: "700", flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarEmoji: { fontSize: 20, color: "#ffffff" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  desc: { fontSize: 12, color: palette.gray[500] },
  keepFirst: { fontSize: 12, fontWeight: "700", color: palette.yellow[500] },
  profitBox: { alignItems: "flex-end", flexShrink: 0 },
  profit: { fontSize: 16, fontWeight: "700" },
  diff: { fontSize: 12, color: palette.gray[400] },

  modal: { maxWidth: 448, backgroundColor: "#1E1E1E", borderRadius: 24, borderWidth: 1, borderColor: palette.gray[800] },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: palette.gray[800], flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.gray[800], alignItems: "center", justifyContent: "center" },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: palette.gray[800], backgroundColor: alpha(palette.gray[800], 0.3) },

  notiWrap: { position: "absolute", right: 16, zIndex: 150 },
  notiShadow: { borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" },
  noti: { flexDirection: "row", alignItems: "flex-start", gap: 12, minWidth: 280, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.purple[500], 0.5) },
  notiEmoji: { fontSize: 30, color: "#ffffff" },
  notiTitle: { fontWeight: "700", fontSize: 16, color: "#ffffff", marginBottom: 4 },
  notiBody: { fontSize: 14, color: palette.gray[300] },
})
