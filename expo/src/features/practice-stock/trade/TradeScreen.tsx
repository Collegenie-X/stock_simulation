import { useEffect, useState } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, ChevronDown } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { FadeUp } from "@/components/ui"
import { storage } from "@/lib/storage"
import { palette } from "@/theme"
import { useTradeScenario } from "./hooks/useTradeScenario"
import { executeTrade } from "./utils/executeTrade"
import ConditionalOrderView from "./components/ConditionalOrderView"
import MarketOrderView from "./components/MarketOrderView"
import OrderTypeSheet from "./components/OrderTypeSheet"
import TradeFallback from "./components/TradeFallback"

export default function TradeScreen() {
  const params = useLocalSearchParams<{ id: string; type?: string }>()
  const router = useRouter()
  const scenarioId = params.id as string
  const type = (params.type as "buy" | "sell") || "buy"
  const isBuy = type === "buy"

  const [session, setSession] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [inputValue, setInputValue] = useState<string>("")
  const [orderType, setOrderType] = useState<"market" | "conditional">("market")
  const [showOrderTypeSheet, setShowOrderTypeSheet] = useState(false)
  const [tradingMode, setTradingMode] = useState<"price" | "percent">("percent")
  const [takeProfit, setTakeProfit] = useState<number | null>(null)
  const [stopLoss, setStopLoss] = useState<number | null>(null)
  const [, setUserLevel] = useState(1)

  useEffect(() => {
    const savedSessionWrapper: any = storage.getGameSession(scenarioId)

    // JSON API 응답 형식에서 data 추출
    const savedSession = savedSessionWrapper?.data || savedSessionWrapper

    // 세션이 유효한지 확인
    if (!savedSession || typeof savedSession !== "object") {
      console.error("❌ 세션이 유효하지 않음:", savedSession)
      Alert.alert("세션 정보가 없습니다. 메인 페이지에서 다시 시작해주세요.")
      router.replace(`/practice/stock/${scenarioId}`)
      return
    }

    // 필수 데이터가 있는지 확인
    const hasRequiredData = savedSession.cash !== undefined && savedSession.holdings !== undefined

    if (!hasRequiredData) {
      console.error("❌ 필수 세션 데이터 없음")
      Alert.alert("세션 데이터가 불완전합니다. 메인 페이지에서 다시 시작해주세요.")
      router.replace(`/practice/stock/${scenarioId}`)
      return
    }

    setSession(savedSession)

    const character = storage.getCharacter()
    if (character) {
      setUserLevel(character.level || 1)
    }
  }, [scenarioId, router])

  // 시나리오 및 주식 정보 확인 (100일 데이터 포함 + AI/로봇 주식 동적 생성)
  const scenario = useTradeScenario(scenarioId)

  if (!scenario) {
    return <TradeFallback emoji="❌" message="시나리오를 찾을 수 없습니다" />
  }

  if (!session) {
    return <TradeFallback emoji="⏳" message="로딩 중..." />
  }

  const selectedStockId: string = session.selectedStockId || scenario.stocks[0]?.id
  const stock = scenario.stocks.find((s: any) => s.id === selectedStockId)

  if (!stock) {
    console.error("❌ 주식을 찾을 수 없음:", selectedStockId)
    return <TradeFallback emoji="❌" message="주식 정보를 찾을 수 없습니다" onBack={() => router.back()} />
  }

  const currentTurn = Math.min(session.currentTurn ?? 0, stock.turns.length - 1)
  const currentTurnData = stock.turns[currentTurn]
  const currentPrice: number = currentTurnData?.price ?? stock.initialPrice ?? 0
  const prevPrice: number = currentTurn > 0 ? (stock.turns[currentTurn - 1]?.price ?? stock.initialPrice ?? 0) : (stock.initialPrice ?? 0)
  const change = (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)
  const isUp = Number.parseFloat(change) >= 0

  const cash: number = session.cash
  const holdings = session.holdings || {}
  const averagePrices = session.averagePrices || {}
  const myQty: number = holdings[selectedStockId] || 0
  const myAvg: number = averagePrices[selectedStockId] || 0
  const myReturn = myAvg > 0 ? (((currentPrice - myAvg) / myAvg) * 100).toFixed(1) : "0.0"
  const isProfit = Number.parseFloat(myReturn) >= 0
  const canUseConditional = true // Unlocking conditional orders for all users as requested

  const percentToPrice = (pct: number | null) => {
    if (pct === null) return null
    return Math.round(currentPrice * (1 + pct / 100))
  }

  const priceToPercent = (price: number | null) => {
    if (price === null) return null
    return Number.parseFloat((((price - currentPrice) / currentPrice) * 100).toFixed(1))
  }

  const handleAction = () => {
    const result = executeTrade({
      scenarioId,
      session,
      stock,
      selectedStockId,
      type,
      orderType,
      tradingMode,
      quantity,
      currentPrice,
      currentTurn,
      takeProfit,
      stopLoss,
    })

    if (!result.ok) {
      Alert.alert(result.message)
      return
    }

    // 바로 리스트 화면으로 이동 (스택에 남아 있는 게임 화면으로 되돌아가며 refresh 파라미터 전달)
    router.dismissTo(`/practice/stock/${scenarioId}?refresh=${Date.now()}`)
  }

  const handleNumberInput = (val: string) => {
    if (inputValue.length >= 10) return
    const next = inputValue + val
    setInputValue(next)
    if (orderType === "market") {
      setQuantity(Number.parseInt(next) || 0)
    }
  }

  const handleDelete = () => {
    const next = inputValue.slice(0, -1)
    setInputValue(next)
    if (orderType === "market") {
      setQuantity(Number.parseInt(next) || 0)
    }
  }

  const handleSelectPercent = (pct: number) => {
    const max = isBuy ? Math.floor(cash / currentPrice) : myQty
    const val = Math.floor(max * (pct / 100))
    setQuantity(val)
    setInputValue(val.toString())
  }

  const handleChangeMode = (mode: "price" | "percent") => {
    if (mode === tradingMode) return
    if (mode === "price") {
      setTakeProfit(percentToPrice(takeProfit))
      setStopLoss(percentToPrice(stopLoss))
    } else {
      setTakeProfit(priceToPercent(takeProfit))
      setStopLoss(priceToPercent(stopLoss))
    }
    setTradingMode(mode)
  }

  return (
    <Screen
      bg="#191919"
      contentStyle={styles.content}
      fixed={
        <OrderTypeSheet
          visible={showOrderTypeSheet}
          orderType={orderType}
          canUseConditional={canUseConditional}
          onClose={() => setShowOrderTypeSheet(false)}
          onSelectMarket={() => {
            setOrderType("market")
            setShowOrderTypeSheet(false)
            setInputValue("")
            setQuantity(1)
          }}
          onSelectConditional={() => {
            setOrderType("conditional")
            setShowOrderTypeSheet(false)
            setTradingMode("percent")
            setTakeProfit(4.0)
            setStopLoss(-4.0)
          }}
        />
      }
    >
      <FadeUp distance={40} duration={300} style={styles.fill}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Pressable onPress={() => setShowOrderTypeSheet(true)} hitSlop={8} style={styles.orderTypeBtn}>
            <Text style={styles.orderTypeText}>주문 방법 바꾸기</Text>
            <ChevronDown size={16} color={palette.gray[400]} />
          </Pressable>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {orderType === "market" ? (
            <MarketOrderView
              isBuy={isBuy}
              stockName={stock.name}
              currentPrice={currentPrice}
              change={change}
              isUp={isUp}
              cash={cash}
              myQty={myQty}
              myAvg={myAvg}
              myReturn={myReturn}
              isProfit={isProfit}
              quantity={quantity}
              inputValue={inputValue}
              onNumberInput={handleNumberInput}
              onDelete={handleDelete}
              onSelectPercent={handleSelectPercent}
              onAction={handleAction}
            />
          ) : (
            <ConditionalOrderView
              isBuy={isBuy}
              currentPrice={currentPrice}
              cash={cash}
              myQty={myQty}
              myReturn={myReturn}
              isProfit={isProfit}
              quantity={quantity}
              setQuantity={setQuantity}
              tradingMode={tradingMode}
              onChangeMode={handleChangeMode}
              takeProfit={takeProfit}
              stopLoss={stopLoss}
              setTakeProfit={setTakeProfit}
              setStopLoss={setStopLoss}
              onAction={handleAction}
            />
          )}
        </View>
      </FadeUp>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  fill: { flexGrow: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#191919" },
  orderTypeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  orderTypeText: { fontSize: 14, fontWeight: "500", color: palette.gray[400] },
  main: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 16 },
})
