"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, Target, Lock, ArrowRight, MoreHorizontal, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"

export default function TradePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scenarioId = params.id as string
  const type = (searchParams.get("type") as "buy" | "sell") || "buy"
  const isBuy = type === "buy"

  const [session, setSession] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [inputValue, setInputValue] = useState<string>("")
  const [orderType, setOrderType] = useState<"market" | "conditional">("market")
  const [showOrderTypeSheet, setShowOrderTypeSheet] = useState(false)
  const [tradingMode, setTradingMode] = useState<"price" | "percent">("percent")
  const [takeProfit, setTakeProfit] = useState<number | null>(null)
  const [stopLoss, setStopLoss] = useState<number | null>(null)
  const [userLevel, setUserLevel] = useState(1)

  useEffect(() => {
    console.log("=== Trade 페이지: 세션 로드 시작 ===")
    console.log("시나리오 ID:", scenarioId)
    
    const savedSessionWrapper = storage.getGameSession(scenarioId)
    console.log("savedSessionWrapper:", savedSessionWrapper)
    
    // JSON API 응답 형식에서 data 추출
    const savedSession = savedSessionWrapper?.data || savedSessionWrapper
    console.log("추출된 savedSession:", savedSession)
    console.log("savedSession 타입:", typeof savedSession)
    console.log("savedSession 키들:", savedSession ? Object.keys(savedSession) : "null")
    
    // 세션이 유효한지 확인
    if (!savedSession || typeof savedSession !== 'object') {
      console.error("❌ 세션이 유효하지 않음:", savedSession)
      alert("세션 정보가 없습니다. 메인 페이지에서 다시 시작해주세요.")
      router.replace(`/practice/stock/${scenarioId}`)
      return
    }
    
    // 필수 데이터가 있는지 확인
    const hasRequiredData = savedSession.cash !== undefined && savedSession.holdings !== undefined
    console.log("필수 데이터 확인:", { 
      cash: savedSession.cash, 
      holdings: savedSession.holdings,
      hasRequiredData 
    })
    
    if (!hasRequiredData) {
      console.error("❌ 필수 세션 데이터 없음")
      alert("세션 데이터가 불완전합니다. 메인 페이지에서 다시 시작해주세요.")
      router.replace(`/practice/stock/${scenarioId}`)
      return
    }
    
    console.log("✅ 세션 로드 성공")
    setSession(savedSession)

    const character = storage.getCharacter()
    if (character) {
      setUserLevel(character.level || 1)
    }
  }, [scenarioId, router])

  // 시나리오 및 주식 정보 확인 (100일 데이터 포함)
  const allScenarios = [...scenariosData.scenarios, scenarios100DaysData]
  const scenario = allScenarios.find((s) => s.id === scenarioId)
  
  console.log("🔍 시나리오 검색:", {
    scenarioId,
    allScenariosCount: allScenarios.length,
    found: !!scenario,
    scenarioIds: allScenarios.map(s => s.id)
  })
  
  if (!scenario) {
    console.error("❌ 시나리오를 찾을 수 없음:", scenarioId)
    return <div className="min-h-screen bg-[#191919] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-4">❌</div>
        <div>시나리오를 찾을 수 없습니다</div>
      </div>
    </div>
  }
  
  if (!session) {
    console.log("세션 로딩 중...")
    return <div className="min-h-screen bg-[#191919] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-4">⏳</div>
        <div>로딩 중...</div>
      </div>
    </div>
  }
  
  const selectedStockId = session.selectedStockId || scenario.stocks[0]?.id
  const stock = scenario.stocks.find((s) => s.id === selectedStockId)

  console.log("Trade 페이지 기본 정보:", {
    scenarioId,
    selectedStockId,
    stockName: stock?.name,
    sessionExists: !!session,
    stockExists: !!stock,
    sessionCash: session.cash,
    sessionHoldings: session.holdings,
  })

  if (!stock) {
    console.error("❌ 주식을 찾을 수 없음:", selectedStockId)
    return <div className="min-h-screen bg-[#191919] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-4">❌</div>
        <div>주식 정보를 찾을 수 없습니다</div>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
        >
          돌아가기
        </button>
      </div>
    </div>
  }

  const currentTurn = session.currentTurn
  const currentPrice = stock.turns[currentTurn].price
  const prevPrice = currentTurn > 0 ? stock.turns[currentTurn - 1].price : stock.initialPrice
  const change = (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)
  const isUp = Number.parseFloat(change) >= 0

  const cash = session.cash
  const holdings = session.holdings || {}
  const averagePrices = session.averagePrices || {}
  const myQty = holdings[selectedStockId] || 0
  const myAvg = averagePrices[selectedStockId] || 0
  const myReturn = myAvg > 0 ? (((currentPrice - myAvg) / myAvg) * 100).toFixed(1) : "0.0"
  const isProfit = Number.parseFloat(myReturn) >= 0
  const effectiveCurrentPrice = currentPrice || 1
  const canUseConditional = true // Unlocking conditional orders for all users as requested

  const percentToPrice = (pct: number | null) => {
    if (pct === null) return null
    return Math.round(currentPrice * (1 + pct / 100))
  }

  const priceToPercent = (price: number | null) => {
    if (price === null) return null
    return Number.parseFloat((((price - currentPrice) / currentPrice) * 100).toFixed(1))
  }

  const getExpectedValue = (val: number | null, type: "price" | "percent") => {
    if (val === null) return "설정되지 않음"

    const targetPrice = type === "price" ? val : Math.round(currentPrice * (1 + val / 100))
    const diff = targetPrice - currentPrice
    const totalProfit = diff * quantity
    const profitText = `${totalProfit > 0 ? "+" : ""}${totalProfit.toLocaleString()}원`

    if (type === "percent") {
      return `${targetPrice.toLocaleString()}원 예상 (${profitText})`
    }
    const percent = (((targetPrice - currentPrice) / currentPrice) * 100).toFixed(1)
    return `${percent}% 예상 (${profitText})`
  }

  const handleAction = () => {
    console.log("=== handleAction 시작 ===")
    console.log("초기 상태:", { orderType, isBuy, quantity, currentPrice, session })

    // 수량 검증
    if (quantity < 1) {
      console.error("수량이 0입니다!")
      alert("구매할 수량을 입력해주세요.")
      return
    }

    const newSession = { ...session }
    const newHoldings = { ...(newSession.holdings || {}) }
    const newAvgPrices = { ...(newSession.averagePrices || {}) }
    let newCash = newSession.cash || 0

    console.log("거래 시작:", { 
      orderType, 
      isBuy, 
      quantity, 
      selectedStockId,
      currentPrice, 
      newCash, 
      holdings: newHoldings 
    })

    if (orderType === "market") {
      if (isBuy) {
        // 구매 로직
        const cost = quantity * currentPrice
        console.log("구매 비용 계산:", { quantity, currentPrice, cost, 보유현금: newCash })
        
        if (cost > newCash) {
          console.log("❌ 구매 실패: 잔액 부족", { cost, newCash })
          alert(`잔액이 부족합니다. 필요: ${cost.toLocaleString()}원, 보유: ${newCash.toLocaleString()}원`)
          return
        }

        const oldQty = newHoldings[selectedStockId] || 0
        const oldAvg = newAvgPrices[selectedStockId] || 0
        const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + quantity) : currentPrice

        newCash -= cost
        newHoldings[selectedStockId] = oldQty + quantity
        newAvgPrices[selectedStockId] = newAvg

        console.log("✅ 구매 완료:", { 
          종목ID: selectedStockId,
          구매수량: quantity,
          구매가격: currentPrice,
          총비용: cost,
          이전보유: oldQty,
          새로운보유: newHoldings[selectedStockId],
          평균가격: newAvg,
          남은현금: newCash,
          newHoldings,
          newAvgPrices
        })
        
        const tradeRecordBuy = {
          id: `${Date.now()}-buy-${selectedStockId}`,
          stockId: selectedStockId,
          stockName: stock.name,
          action: "buy" as const,
          price: currentPrice,
          quantity,
          totalAmount: quantity * currentPrice,
          date: stock.turns[currentTurn]?.date || new Date().toISOString().split("T")[0],
          turn: currentTurn,
          day: session.currentDay || 1,
        }
        storage.addTradeRecord(scenarioId, tradeRecordBuy)
        newSession.feedback = { text: `${stock.name} ${quantity}주 구매 완료!`, type: "success" }
      } else {
        // 판매 로직
        const oldQty = newHoldings[selectedStockId] || 0
        console.log("판매 시도:", { quantity, oldQty })
        
        if (quantity > oldQty) {
          console.log("❌ 판매 실패: 보유 수량 부족", { quantity, oldQty })
          alert(`보유 수량이 부족합니다. 보유: ${oldQty}주`)
          return
        }

        const avgBuyPrice = newAvgPrices[selectedStockId] || currentPrice
        const revenue = quantity * currentPrice
        const tradeProfit = (currentPrice - avgBuyPrice) * quantity
        const tradeProfitRate = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0

        newCash += revenue
        newHoldings[selectedStockId] = oldQty - quantity

        // 보유량이 0이 되면 평균 가격도 초기화
        if (newHoldings[selectedStockId] === 0) {
          delete newHoldings[selectedStockId]
          delete newAvgPrices[selectedStockId]
        }

        console.log("✅ 판매 완료:", { 
          판매수량: quantity,
          판매가격: currentPrice,
          총수익: revenue,
          남은수량: newHoldings[selectedStockId] || 0,
          남은현금: newCash,
          newHoldings, 
          newAvgPrices 
        })

        const tradeRecordSell = {
          id: `${Date.now()}-sell-${selectedStockId}`,
          stockId: selectedStockId,
          stockName: stock.name,
          action: "sell" as const,
          price: currentPrice,
          quantity,
          totalAmount: revenue,
          avgBuyPrice,
          profit: Math.round(tradeProfit),
          profitRate: Math.round(tradeProfitRate * 10) / 10,
          date: stock.turns[currentTurn]?.date || new Date().toISOString().split("T")[0],
          turn: currentTurn,
          day: session.currentDay || 1,
        }
        storage.addTradeRecord(scenarioId, tradeRecordSell)
        newSession.feedback = { text: `${stock.name} ${quantity}주 판매 완료!`, type: "success" }
      }
    } else {
      // Conditional Order
      const newPendingOrders = [...(newSession.pendingOrders || [])]
      if (takeProfit !== null) {
        // Assuming the system can handle both or expects specific format.
        // For simplicity and consistency, let's store the target price calculated from whatever mode we are in.
        const targetPrice = tradingMode === "price" ? takeProfit : percentToPrice(takeProfit)!

        newPendingOrders.push({
          stockId: selectedStockId,
          type,
          targetPrice: targetPrice,
          condition: isBuy ? "le" : "ge", // Take profit logic
          quantity,
        })
      }
      if (stopLoss !== null) {
        const targetPrice = tradingMode === "price" ? stopLoss : percentToPrice(stopLoss)!

        newPendingOrders.push({
          stockId: selectedStockId,
          type,
          targetPrice: targetPrice,
          condition: isBuy ? "ge" : "le", // Stop loss logic
          quantity,
        })
      }
      newSession.pendingOrders = newPendingOrders
      newSession.feedback = { text: "예약 주문이 설정되었습니다", type: "success" }
    }

    // 세션 업데이트
    console.log("=== 세션 업데이트 시작 ===")
    console.log("업데이트 전 newSession:", newSession)
    console.log("업데이트할 값들:", {
      newCash,
      newHoldings,
      newAvgPrices,
      holdingsKeys: Object.keys(newHoldings),
    })

    newSession.cash = newCash
    newSession.holdings = newHoldings
    newSession.averagePrices = newAvgPrices
    newSession.currentTurn = session.currentTurn
    newSession.pendingOrders = session.pendingOrders || []
    newSession.weeklyHistory = session.weeklyHistory || []
    newSession.lastWeekValue = session.lastWeekValue || 0
    newSession.selectedStockId = selectedStockId

    console.log("업데이트 후 newSession:", newSession)
    console.log("업데이트 후 newSession.holdings:", newSession.holdings)
    console.log("업데이트 후 newSession.holdings 키 개수:", Object.keys(newSession.holdings).length)

    console.log("=== 거래 완료 후 세션 저장 ===")
    console.log("최종 저장할 데이터:", {
      scenarioId,
      cash: newSession.cash,
      holdings: newSession.holdings,
      averagePrices: newSession.averagePrices,
      feedback: newSession.feedback
    })
    
    // localStorage에 저장
    storage.setGameSession(scenarioId, newSession)
    
    // 저장 확인 (동기적으로 즉시 확인)
    const savedCheck = storage.getGameSession(scenarioId)
    const savedData = savedCheck?.data || savedCheck
    
    console.log("💾 localStorage 저장 확인:", {
      저장됨: savedCheck ? "✅" : "❌",
      holdings: savedData?.holdings,
      cash: savedData?.cash,
    })

    // 구매 시에만 holdings가 있어야 함, 판매 시에는 holdings가 비어있을 수 있음
    const expectedHoldings = isBuy ? newHoldings : savedData?.holdings
    const holdingsValid = isBuy 
      ? Object.keys(savedData?.holdings || {}).length > 0 
      : true // 판매는 항상 유효
      
    if (!savedCheck) {
      console.error("❌ 저장 실패! localStorage를 확인하세요.")
      alert("저장에 실패했습니다. 다시 시도해주세요.")
      return
    }
    
    if (isBuy && !holdingsValid) {
      console.error("❌ 구매 후 holdings가 비어있습니다!")
      console.error("저장된 데이터:", savedData)
      alert("구매가 제대로 저장되지 않았습니다. 다시 시도해주세요.")
      return
    }
    
    console.log("✅ 저장 성공, 메인 페이지로 이동")
    console.log("최종 확인 - 저장된 holdings:", savedData?.holdings)
    console.log("최종 확인 - 저장된 cash:", savedData?.cash)
    
    // 확실하게 저장 완료 후 이동
    setTimeout(() => {
      // 메인 페이지로 이동 (새로고침 파라미터 추가)
      router.push(`/practice/stock/${scenarioId}?refresh=${Date.now()}`)
    }, 50)
  }

  const Keypad = ({ onInput, onDelete }: { onInput: (val: string) => void; onDelete: () => void }) => (
    <div className="grid grid-cols-3 gap-y-6 mt-auto pb-8 px-8">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0].map((num) => (
        <button
          key={num}
          onClick={() => onInput(num.toString())}
          className="text-2xl font-medium text-white hover:text-gray-300 active:scale-95 transition-transform"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="flex items-center justify-center text-white hover:text-gray-300 active:scale-95 transition-transform"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
    </div>
  )

  const handleNumberInput = (val: string) => {
    if (inputValue.length >= 10) return
    setInputValue((prev) => {
      const next = prev + val
      if (orderType === "market") {
        const qty = Number.parseInt(next) || 0
        setQuantity(qty)
      }
      return next
    })
  }

  const handleDelete = () => {
    setInputValue((prev) => {
      const next = prev.slice(0, -1)
      if (orderType === "market") {
        const qty = Number.parseInt(next) || 0
        setQuantity(qty)
      }
      return next
    })
  }

  const totalAmount = quantity * currentPrice

  return (
    <div className="min-h-screen bg-[#191919] text-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#191919]">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setShowOrderTypeSheet(true)}
          className="flex items-center gap-1 text-gray-400 text-sm font-medium"
        >
          주문 방법 바꾸기 <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 pb-4">
        {orderType === "market" ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>{isBuy ? "구매할 가격" : "판매할 가격"}</span>
                <span className="text-gray-600">|</span>
                <span>현재가</span>
                <span className="text-gray-600">|</span>
                <span>시장가</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{currentPrice.toLocaleString()}원</div>
              <div className={cn("text-sm font-medium", isUp ? "text-red-500" : "text-blue-500")}>
                {stock.name} {isUp ? "+" : ""}
                {change}%
              </div>
            </div>

            <div className="bg-[#252525] rounded-3xl p-6 flex-1 flex flex-col relative mb-6">
              <div className="text-sm font-bold text-white mb-4">수량</div>

              <div className="flex-1 flex flex-col items-center justify-center">
                {inputValue ? (
                  <>
                    <div className={cn("text-7xl font-bold mb-4", isBuy ? "text-red-500" : "text-blue-500")}>
                      {Number.parseInt(inputValue).toLocaleString()}주
                    </div>
                    <div className="text-xl text-white font-medium mb-2">{totalAmount.toLocaleString()}원</div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-gray-600 text-center mb-4">
                    몇 주 {isBuy ? "구매" : "판매"}할까요?
                  </div>
                )}
                <div className="text-center text-sm text-gray-500">
                  {isBuy ? `구매가능 최대 ${Math.floor(cash / currentPrice)}주` : `판매가능 최대 ${myQty}주`}
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-6">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      const max = isBuy ? Math.floor(cash / currentPrice) : myQty
                      const val = Math.floor(max * (pct / 100))
                      setQuantity(val)
                      setInputValue(val.toString())
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#333333] text-gray-300 text-sm font-bold hover:bg-gray-700 transition-colors"
                  >
                    {pct === 100 ? "최대" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <Keypad onInput={handleNumberInput} onDelete={handleDelete} />

              <div className="flex gap-3 mt-4">
                <button className="flex items-center justify-center px-6 py-4 bg-[#252525] rounded-2xl text-gray-300 font-bold">
                  <MoreHorizontal className="w-6 h-6" />
                  <span className="sr-only">호가</span>
                </button>
                <Button
                  onClick={handleAction}
                  disabled={
                    orderType === "market" &&
                    (quantity < 1 || (isBuy ? cash < currentPrice * quantity : myQty < quantity))
                  }
                  className={cn(
                    "flex-1 h-16 text-xl font-bold rounded-2xl",
                    isBuy ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {isBuy ? "구매하기" : "판매하기"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                내 수익률이 얼마일 때<br />
                {isBuy ? "구매" : "판매"}를 시작할까요?
              </h2>
              <div className="flex items-center justify-between">
                <div className={cn("text-sm font-medium", isProfit ? "text-red-500" : "text-blue-500")}>
                  현재 수익률 {myReturn}%
                </div>
                <div className="text-sm font-medium text-gray-400">
                  현재가 <span className="text-white ml-1">{currentPrice.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="bg-gray-800 rounded-lg p-1 flex">
                <button
                  onClick={() => {
                    if (tradingMode !== "price") {
                      setTakeProfit(percentToPrice(takeProfit))
                      setStopLoss(percentToPrice(stopLoss))
                      setTradingMode("price")
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                    tradingMode === "price" ? "bg-gray-600 text-white" : "text-gray-400",
                  )}
                >
                  원
                </button>
                <button
                  onClick={() => {
                    if (tradingMode !== "percent") {
                      setTakeProfit(priceToPercent(takeProfit))
                      setStopLoss(priceToPercent(stopLoss))
                      setTradingMode("percent")
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                    tradingMode === "percent" ? "bg-gray-600 text-white" : "text-gray-400",
                  )}
                >
                  %
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {/* Quantity Input Card */}
              <div className="bg-[#252525] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-200">수량</span>
                  <span className="text-xs text-gray-500">
                    {isBuy ? `최대 ${Math.floor(cash / currentPrice)}주` : `최대 ${myQty}주`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white active:scale-95"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="text-2xl font-bold text-white">{quantity}주</div>
                  <button
                    onClick={() => {
                      const max = isBuy ? Math.floor(cash / currentPrice) : myQty
                      setQuantity(Math.min(max, quantity + 1))
                    }}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-[#252525] rounded-2xl p-5 relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-200">익절</span>
                  <button
                    onClick={() => setTakeProfit(null)}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full"
                  >
                    삭제
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-500">
                      {takeProfit !== null
                        ? tradingMode === "percent"
                          ? `${takeProfit >= 0 ? "+" : ""}${takeProfit.toFixed(1)}%`
                          : `${takeProfit.toLocaleString()}원`
                        : "-"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{getExpectedValue(takeProfit, tradingMode)}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const delta = tradingMode === "percent" ? 0.1 : Math.round(effectiveCurrentPrice * 0.01)
                        setTakeProfit((prev) => {
                          const currentVal = prev === null ? (isBuy ? 0 : 0) : prev
                          return Math.max(0, currentVal - delta)
                        })
                      }}
                      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const delta = tradingMode === "percent" ? 0.1 : Math.round(effectiveCurrentPrice * 0.01)
                        setTakeProfit((prev) => {
                          const currentVal = prev === null ? (isBuy ? 0 : 0) : prev
                          return tradingMode === "percent" ? Math.min(99.9, currentVal + delta) : currentVal + delta
                        })
                      }}
                      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#252525] rounded-2xl p-5 relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-200">손절</span>
                  <button
                    onClick={() => setStopLoss(null)}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full"
                  >
                    삭제
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-500">
                      {stopLoss !== null
                        ? tradingMode === "percent"
                          ? `${stopLoss.toFixed(1)}%`
                          : `${stopLoss.toLocaleString()}원`
                        : "-"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{getExpectedValue(stopLoss, tradingMode)}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const delta = tradingMode === "percent" ? 0.1 : Math.round(effectiveCurrentPrice * 0.01)
                        setStopLoss((prev) => {
                          const currentVal = prev === null ? (isBuy ? 0 : 0) : prev
                          return tradingMode === "percent"
                            ? Math.max(-99.9, currentVal - delta)
                            : Math.max(0, currentVal - delta)
                        })
                      }}
                      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const delta = tradingMode === "percent" ? 0.1 : Math.round(effectiveCurrentPrice * 0.01)
                        setStopLoss((prev) => {
                          const currentVal = prev === null ? (isBuy ? 0 : 0) : prev
                          return tradingMode === "percent" ? Math.min(0, currentVal + delta) : currentVal + delta
                        })
                      }}
                      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <Button
                onClick={handleAction}
                disabled={takeProfit === null && stopLoss === null}
                className="w-full h-14 text-xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600"
              >
                설정하기
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Order Type Bottom Sheet */}
      {showOrderTypeSheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderTypeSheet(false)} />
          <div className="bg-[#252525] w-full rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

            <button
              onClick={() => {
                setOrderType("market")
                setShowOrderTypeSheet(false)
                setInputValue("")
                setQuantity(1)
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-800 mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">일반 주문</div>
                  <div className="text-sm text-gray-500">현재 가격으로 바로 주문</div>
                </div>
              </div>
              {orderType === "market" && <div className="text-blue-500">✓</div>}
            </button>

            <button
              onClick={() => {
                setOrderType("conditional")
                setShowOrderTypeSheet(false)
                setTradingMode("percent")
                setTakeProfit(4.0)
                setStopLoss(-4.0)
              }}
              disabled={!canUseConditional}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-800",
                !canUseConditional && "opacity-50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">조건 주문</div>
                  <div className="text-sm text-gray-500">가격, 수익률과 주문 기간을 설정하면 자동 주문</div>
                </div>
              </div>
              {orderType === "conditional" && <div className="text-blue-500">✓</div>}
              {!canUseConditional && <Lock className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
