import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, Minus, TrendingDown, TrendingUp, Waves, Zap } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

// ─── 공통 타입 ────────────────────────────────────────────────

/**
 * 시나리오 플레이 (/learn/scenarios/[id]/play) 에서 사용하는 거래 항목
 */
export interface TradeAccountingItem {
  turn: number
  action: "buy" | "sell" | "hold"
  quantity: number
  price: number
  eventTitle: string
  amount: number
  pnl: number
  pnlRate: number
  sentiment?: string
}

/**
 * 패턴 연습 (/learn/patterns/[id]/practice) 에서 사용하는 거래 항목
 * TradeLog 기반으로 TradeAccountingItem 형태로 변환 가능
 */
export interface PatternTradeItem {
  turn: number
  action: "buy" | "sell" | "skip" | "timeout"
  shares: number
  price: number
  amount: number
  /** 해당 턴 손익 (TurnEval.turnPnl) */
  turnPnl?: number
  /** 점수 (TurnEval.score) */
  score?: number
  /** 판정 문구 (TurnEval.verdict) */
  verdict?: string
}

/**
 * 공통 AI 결과 타입
 */
export interface AIResult {
  name: string
  emoji: string
  type: string
  returnRate: string
  returnNum: number
  actions?: string[]
  result?: string
}

export interface TurnData {
  turn: number
  endPrice: number
  change: number
}

// ─── AI 액션 파서 ─────────────────────────────────────────────

function classifyAction(text: string): { type: "buy" | "sell" | "hold"; percent: number } | null {
  const pct = text.match(/(\d+)%/)
  const percent = pct ? parseInt(pct[1]) : 0

  if (text.includes('매수') || text.includes('추가') || text.includes('재매수') || text.includes('진입')) {
    return { type: "buy", percent }
  }
  if (text.includes('매도') || text.includes('익절') || text.includes('손절') ||
      text.includes('차익실현') || text.includes('청산') || text.includes('실현')) {
    return { type: "sell", percent }
  }
  if (text.includes('관망') || text.includes('홀딩') || text.includes('유지') ||
      text.includes('보유') || text.includes('신중') || text.includes('버티기') ||
      text.includes('풀 홀딩') || text.includes('대기') || text.includes('손실')) {
    return { type: "hold", percent: 0 }
  }
  return null
}

/** actions 배열에서 해당 턴(1-based)의 행동을 파싱.
 *  구체적인 턴 지정(단일/범위)이 전체(전체/전 구간)보다 우선합니다. */
export function parseAITurnAction(actions: string[] = [], turnIndex: number): {
  type: "buy" | "sell" | "hold"
  percent: number
  label: string
} {
  const turnNum = turnIndex + 1
  let fallback: { type: "buy" | "sell" | "hold"; percent: number } | null = null

  for (const action of actions) {
    const rangeMatch = action.match(/(\d+)~(\d+)턴/)
    const singleMatch = action.match(/(\d+)턴/)
    const isWholeGame = action.startsWith('전체') || action.startsWith('전 구간')

    let matches = false
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1])
      const to = parseInt(rangeMatch[2])
      matches = turnNum >= from && turnNum <= to
    } else if (singleMatch) {
      matches = parseInt(singleMatch[1]) === turnNum
    } else if (isWholeGame) {
      // 전체 항목은 구체적 매칭이 없을 때 fallback으로만 사용
      if (!fallback) fallback = classifyAction(action)
      continue
    }

    if (!matches) continue

    const classified = classifyAction(action)
    if (classified) {
      const { type, percent } = classified
      const label = type === "buy"
        ? (percent ? `살래 ${percent}%` : "살래")
        : type === "sell"
        ? (percent ? `팔래 ${percent}%` : "팔래")
        : "기다릴게"
      return { type, percent, label }
    }
  }

  // 구체적 매칭 없으면 전체 항목 fallback 사용
  if (fallback) {
    const { type, percent } = fallback
    const label = type === "buy"
      ? (percent ? `살래 ${percent}%` : "살래")
      : type === "sell"
      ? (percent ? `팔래 ${percent}%` : "팔래")
      : "기다릴게"
    return { type, percent, label }
  }

  return { type: "hold", percent: 0, label: "기다릴게" }
}

// ─── 공통 Props ───────────────────────────────────────────────

interface TradeHistoryCardBaseProps {
  index: number
  /** 턴 이모지 (없으면 T{n} 표시) */
  turnEmoji?: string
  /** 다음 턴 주가 변동률 */
  nextTurnChange?: number
  /** AI 비교 데이터 (없으면 AI 섹션 숨김) */
  aiResults?: AIResult[]
  /** 전체 턴 데이터 */
  turns?: TurnData[]
  /** 시작 총 자산 (AI 손익 계산용) */
  initTotal?: number
  /** 나의 최종 수익률 (AI 갭 계산용) */
  userRate?: number
  /** 현재 턴 주가 */
  currentPrice?: number
  /** 점수 표시 여부 (패턴 연습 전용) */
  showScore?: boolean
}

// 시나리오 플레이용
interface ScenarioTradeProps extends TradeHistoryCardBaseProps {
  mode: "scenario"
  trade: TradeAccountingItem
}

// 패턴 연습용
interface PatternTradeProps extends TradeHistoryCardBaseProps {
  mode: "pattern"
  trade: PatternTradeItem
}

type TradeHistoryCardProps = ScenarioTradeProps | PatternTradeProps

// ─── 메인 컴포넌트 ────────────────────────────────────────────

const ACTION_BADGE = {
  buy: { bg: alpha(palette.red[500], 0.15), text: palette.red[400] },
  sell: { bg: alpha(palette.blue[500], 0.15), text: palette.blue[400] },
  hold: { bg: alpha(palette.gray[700], 0.3), text: palette.gray[400] },
} as const

export function TradeHistoryCard(props: TradeHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { index, turnEmoji, nextTurnChange, aiResults = [], turns = [], initTotal = 0, userRate = 0, currentPrice, showScore = false } = props

  // 공통 필드 추출
  const action: "buy" | "sell" | "hold" =
    props.mode === "scenario" ? props.trade.action : props.trade.action === "buy" || props.trade.action === "sell" ? props.trade.action : "hold"

  const quantity = props.mode === "scenario" ? props.trade.quantity : props.trade.shares

  const price = props.trade.price
  const amount = props.trade.amount

  const pnl = props.mode === "scenario" ? props.trade.pnl : (props.trade.turnPnl ?? 0)

  const eventTitle = props.mode === "scenario" ? props.trade.eventTitle : undefined

  const score = props.mode === "pattern" ? props.trade.score : undefined
  const verdict = props.mode === "pattern" ? props.trade.verdict : undefined

  const isHold = action === "hold"
  const isBuy = action === "buy"
  const isSell = action === "sell"

  // AI 비교 데이터
  const similarAI = aiResults.find((ai) => ai.type.includes("안정") || ai.type.includes("균형")) || aiResults[0]
  const bestAI = aiResults.length > 0 ? aiResults.reduce((best, ai) => (ai.returnNum > best.returnNum ? ai : best), aiResults[0]) : null

  // 판단 평가
  const myTurnReturn = nextTurnChange ?? 0
  const isGoodDecision = (isBuy && myTurnReturn > 0) || (isSell && myTurnReturn < 0) || (isHold && Math.abs(myTurnReturn) < 1)

  const getDecisionScore = () => {
    if (isHold) return { label: "관망", color: palette.gray[400] }
    if (isGoodDecision) return { label: "적중!", color: palette.green[400] }
    return { label: "아쉬움", color: palette.orange[400] }
  }

  const decision = getDecisionScore()

  // 점수 바 색상 (패턴 연습)
  const scoreBarColor = score !== undefined ? (score >= 2.0 ? palette.green[500] : score >= 1.0 ? palette.yellow[500] : palette.red[500]) : palette.gray[700]
  const scoreTextColor = score !== undefined ? (score >= 2.0 ? palette.green[400] : score >= 1.0 ? palette.yellow[400] : palette.red[400]) : palette.gray[400]

  const hasAI = aiResults.length > 0 && initTotal > 0

  const nextColors =
    nextTurnChange === undefined
      ? null
      : nextTurnChange > 0
        ? { bg: alpha(palette.red[500], 0.15), text: palette.red[400] }
        : nextTurnChange < 0
          ? { bg: alpha(palette.blue[500], 0.15), text: palette.blue[400] }
          : { bg: alpha(palette.gray[700], 0.2), text: palette.gray[500] }

  const aiItems = [
    bestAI ? { ai: bestAI, border: alpha(palette.yellow[500], 0.2), bg: alpha(palette.yellow[500], 0.08), divider: alpha(palette.yellow[500], 0.1), name: palette.yellow[300] } : null,
    similarAI && similarAI !== bestAI
      ? { ai: similarAI, border: alpha(palette.cyan[500], 0.2), bg: alpha(palette.cyan[500], 0.08), divider: alpha(palette.cyan[500], 0.1), name: palette.cyan[300] }
      : null,
  ].filter((x): x is NonNullable<typeof x> => !!x)

  return (
    <View style={[styles.card, { borderColor: isOpen ? alpha(palette.cyan[500], 0.3) : alpha(palette.gray[800], 0.3) }]}>
      {/* ── 메인 행 ── */}
      <Pressable onPress={() => setIsOpen(!isOpen)} style={styles.mainRow}>
        {/* 턴 이모지 or 번호 */}
        <Text style={{ fontSize: 16, color: "#ffffff" }}>{turnEmoji ?? `T${index + 1}`}</Text>

        {/* 액션 배지 */}
        <View style={[styles.actionBadge, { backgroundColor: ACTION_BADGE[action].bg }]}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: ACTION_BADGE[action].text }}>{isBuy ? "살래" : isSell ? "팔래" : "기다릴게"}</Text>
        </View>

        {/* 수량 */}
        {!isHold && quantity > 0 ? (
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{quantity}주</Text>
        ) : (
          <Text style={{ fontSize: 12, color: palette.gray[600] }}>—</Text>
        )}

        {/* 다음 턴 변동률 */}
        {nextTurnChange !== undefined && nextColors && (
          <View style={[styles.nextBadge, { backgroundColor: nextColors.bg }]}>
            {nextTurnChange > 0 ? (
              <TrendingUp size={10} color={nextColors.text} />
            ) : nextTurnChange < 0 ? (
              <TrendingDown size={10} color={nextColors.text} />
            ) : (
              <Minus size={10} color={nextColors.text} />
            )}
            <Text style={{ fontSize: 10, fontWeight: "700", color: nextColors.text }}>
              {nextTurnChange > 0 ? "+" : ""}
              {nextTurnChange.toFixed(1)}%
            </Text>
          </View>
        )}

        {/* 판단 결과 */}
        {nextTurnChange !== undefined && <Text style={{ fontSize: 10, fontWeight: "700", color: decision.color }}>{decision.label}</Text>}

        {/* 패턴 연습: 점수 */}
        {showScore && score !== undefined && (
          <Text style={{ fontSize: 10, fontWeight: "900", color: scoreTextColor, fontVariant: ["tabular-nums"] }}>
            {score.toFixed(1)}
            <Text style={{ color: palette.gray[600], fontSize: 9 }}>/2.5</Text>
          </Text>
        )}

        {/* 매도 실현 손익 - 우측 정렬 */}
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
          {isSell && pnl !== 0 && (
            <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: pnl >= 0 ? palette.red[400] : palette.blue[400] }}>
              {pnl >= 0 ? "+" : ""}
              {formatNumber(Math.round(pnl))}원
            </Text>
          )}
        </View>

        {/* 펼치기 아이콘 */}
        <View style={isOpen ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={14} color={palette.gray[600]} />
        </View>
      </Pressable>

      {/* 패턴 연습: 점수 바 (항상 표시) */}
      {showScore && score !== undefined && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
          <View style={styles.scoreTrack}>
            <View style={{ height: "100%", borderRadius: 9999, backgroundColor: scoreBarColor, width: `${Math.max(0, Math.min(100, (score / 2.5) * 100))}%` }} />
          </View>
          {!!verdict && <Text style={{ fontSize: 9, color: palette.gray[600], marginTop: 2, lineHeight: 12 }}>{verdict}</Text>}
        </View>
      )}

      {/* ── 펼쳐진 상세 영역 ── */}
      {isOpen && (
        <View style={styles.detail}>
          {/* 이벤트 설명 (시나리오 전용) */}
          {!!eventTitle && (
            <View style={[styles.grayBox, { padding: 10 }]}>
              <Text style={styles.smallGray}>{eventTitle}</Text>
            </View>
          )}

          {/* 거래 상세 */}
          {!isHold && quantity > 0 && (
            <View style={[styles.grayBox, { padding: 12, flexDirection: "row", gap: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>{isBuy ? "매수가" : "매도가"}</Text>
                <Text style={styles.detailValue}>{formatNumber(Math.round(price))}원</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>수량</Text>
                <Text style={styles.detailValue}>{quantity}주</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>총 금액</Text>
                <Text style={styles.detailValue}>{formatNumber(Math.round(amount))}원</Text>
              </View>
            </View>
          )}

          {/* AI 갭 비교 섹션 */}
          {hasAI && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Waves size={12} color={palette.cyan[400]} />
                <Text style={{ fontSize: 10, fontWeight: "700", color: palette.gray[500] }}>
                  AI와 비교 <Text style={{ color: palette.gray[600] }}>(동일 조건)</Text>
                </Text>
              </View>

              {aiItems.map((item) => {
                const { ai } = item
                const aiProfit = Math.round((initTotal * ai.returnNum) / 100)
                const gap = Math.round((initTotal * userRate) / 100) - aiProfit
                const turnAction = parseAITurnAction(ai.actions, index)
                const turnPrice = currentPrice ?? turns[index]?.endPrice ?? 0
                const qty = turnAction.percent > 0 && turnPrice > 0 ? Math.floor((initTotal * turnAction.percent) / 100 / turnPrice) : 0

                return (
                  <View key={ai.name} style={[styles.aiBox, { backgroundColor: item.bg, borderColor: item.border }]}>
                    {/* 행 1: 이름 + 행동 + 수익률 */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text style={{ fontSize: 16, color: "#ffffff" }}>{ai.emoji}</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: item.name }}>{ai.name}</Text>

                      {/* 행동 배지 */}
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: ACTION_BADGE[turnAction.type].bg }}>
                        <Text style={{ fontSize: 9, fontWeight: "700", color: ACTION_BADGE[turnAction.type].text }}>
                          {turnAction.type !== "hold" && qty > 0 ? `${turnAction.type === "buy" ? "살래" : "팔래"} ${qty}주` : turnAction.label}
                        </Text>
                      </View>

                      {/* 퍼센트 */}
                      {turnAction.percent > 0 && <Text style={{ fontSize: 9, color: palette.gray[600] }}>({turnAction.percent}%)</Text>}

                      <View style={{ flex: 1 }} />

                      {/* 최종 수익률 + 손익금액 */}
                      <Text style={{ fontSize: 12, fontWeight: "700", color: ai.returnNum >= 0 ? palette.red[400] : palette.blue[400] }}>{ai.returnRate}</Text>
                      <Text style={{ fontSize: 9, color: palette.gray[500] }}>
                        ({aiProfit >= 0 ? "+" : ""}
                        {formatNumber(aiProfit)}원)
                      </Text>
                    </View>

                    {/* 행 2: 나와의 차이 */}
                    <View style={[styles.aiDiff, { borderTopColor: item.divider }]}>
                      <Text style={{ fontSize: 9, color: palette.gray[500] }}>나와의 차이</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: gap >= 0 ? palette.green[400] : palette.orange[400] }}>
                        {gap >= 0 ? "+" : ""}
                        {formatNumber(gap)}원 ({gap >= 0 ? "+" : ""}
                        {(userRate - ai.returnNum).toFixed(1)}%p)
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* 파도 읽기 피드백 (nextTurnChange 있을 때만) */}
          {nextTurnChange !== undefined && (
            <View
              style={[
                styles.feedback,
                isGoodDecision
                  ? { backgroundColor: alpha(palette.green[500], 0.1), borderColor: alpha(palette.green[500], 0.2) }
                  : { backgroundColor: alpha(palette.orange[500], 0.1), borderColor: alpha(palette.orange[500], 0.2) },
              ]}
            >
              <Zap size={14} color={isGoodDecision ? palette.green[400] : palette.orange[400]} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", marginBottom: 2, color: isGoodDecision ? palette.green[300] : palette.orange[300] }}>
                  {isGoodDecision ? "🎯 좋은 판단!" : "💡 개선 포인트"}
                </Text>
                <Text style={styles.smallGray}>
                  {isGoodDecision
                    ? `다음 턴 ${nextTurnChange > 0 ? "상승" : "하락"} 파도를 잘 읽었어요!`
                    : `다음 턴 ${nextTurnChange > 0 ? "상승" : "하락"}이 있었어요. 파도 전환점을 더 주의깊게 살펴보세요.`}
                </Text>
              </View>
            </View>
          )}

          {/* 패턴 연습: verdict 상세 (nextTurnChange 없을 때) */}
          {!!verdict && nextTurnChange === undefined && (
            <View style={[styles.grayBox, { padding: 10 }]}>
              <Text style={styles.smallGray}>{verdict}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", backgroundColor: "#1a1a1a" },
  mainRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  nextBadge: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  scoreTrack: { height: 4, backgroundColor: "#252525", borderRadius: 9999, overflow: "hidden" },
  detail: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05), gap: 12 },
  grayBox: { backgroundColor: "#252525", borderRadius: 12 },
  smallGray: { fontSize: 10, color: palette.gray[400], lineHeight: 16 },
  tinyLabel: { fontSize: 9, color: palette.gray[500] },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  aiBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  aiDiff: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  feedback: { borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1 },
})
