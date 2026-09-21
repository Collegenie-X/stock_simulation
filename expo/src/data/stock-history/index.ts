// 자동 생성 파일 — 직접 고치지 마세요. (node scripts/generate-stock-history.js)
// 가격·이벤트를 바꾸고 싶으면 각 종목 JSON 을 고치면 됩니다.
import h_stock_1 from "./stock-1.json"
import h_stock_2 from "./stock-2.json"
import h_stock_3 from "./stock-3.json"
import h_stock_4 from "./stock-4.json"
import h_stock_5 from "./stock-5.json"
import h_stock_6 from "./stock-6.json"
import h_stock_7 from "./stock-7.json"
import h_stock_8 from "./stock-8.json"
import h_stock_9 from "./stock-9.json"
import h_stock_10 from "./stock-10.json"
import h_stock_11 from "./stock-11.json"
import h_stock_12 from "./stock-12.json"
import h_stock_13 from "./stock-13.json"
import h_stock_14 from "./stock-14.json"
import h_stock_15 from "./stock-15.json"
import h_stock_16 from "./stock-16.json"
import h_stock_17 from "./stock-17.json"
import h_stock_18 from "./stock-18.json"
import h_stock_19 from "./stock-19.json"
import h_stock_20 from "./stock-20.json"
import h_stock_21 from "./stock-21.json"
import h_stock_22 from "./stock-22.json"
import h_stock_23 from "./stock-23.json"
import h_stock_24 from "./stock-24.json"
import h_stock_25 from "./stock-25.json"
import h_stock_26 from "./stock-26.json"
import h_stock_27 from "./stock-27.json"
import h_stock_28 from "./stock-28.json"
import h_stock_29 from "./stock-29.json"
import h_stock_30 from "./stock-30.json"
import h_stock_31 from "./stock-31.json"
import h_stock_32 from "./stock-32.json"
import h_stock_33 from "./stock-33.json"
import h_stock_34 from "./stock-34.json"
import h_stock_35 from "./stock-35.json"
import h_stock_36 from "./stock-36.json"
import h_stock_37 from "./stock-37.json"
import h_stock_38 from "./stock-38.json"
import h_stock_39 from "./stock-39.json"
import h_stock_40 from "./stock-40.json"
import h_stock_41 from "./stock-41.json"
import h_stock_42 from "./stock-42.json"
import h_stock_43 from "./stock-43.json"
import h_stock_44 from "./stock-44.json"
import h_stock_45 from "./stock-45.json"
import h_stock_46 from "./stock-46.json"
import h_stock_47 from "./stock-47.json"
import h_stock_48 from "./stock-48.json"
import h_stock_49 from "./stock-49.json"
import h_stock_50 from "./stock-50.json"
import h_KAKAO from "./KAKAO.json"
import h_SAMSUNG from "./SAMSUNG.json"
import h_NAVER from "./NAVER.json"
import h_TSLA from "./TSLA.json"
import h_HYUNDAI from "./HYUNDAI.json"
import h_LG_ENERGY from "./LG_ENERGY.json"
import h_ai_stock_1 from "./ai-stock-1.json"
import h_ai_stock_2 from "./ai-stock-2.json"
import h_ai_stock_3 from "./ai-stock-3.json"
import h_ai_stock_4 from "./ai-stock-4.json"
import h_ai_stock_5 from "./ai-stock-5.json"
import h_ai_stock_6 from "./ai-stock-6.json"
import h_ai_stock_7 from "./ai-stock-7.json"
import h_ai_stock_8 from "./ai-stock-8.json"
import h_ai_stock_9 from "./ai-stock-9.json"
import h_ai_stock_10 from "./ai-stock-10.json"
import h_robot_auto_1 from "./robot-auto-1.json"
import h_robot_auto_2 from "./robot-auto-2.json"
import h_robot_auto_3 from "./robot-auto-3.json"
import h_robot_auto_4 from "./robot-auto-4.json"
import h_robot_auto_5 from "./robot-auto-5.json"
import h_robot_auto_6 from "./robot-auto-6.json"
import h_robot_auto_7 from "./robot-auto-7.json"
import h_robot_auto_8 from "./robot-auto-8.json"
import h_robot_auto_9 from "./robot-auto-9.json"
import h_robot_auto_10 from "./robot-auto-10.json"
import h_extra_1 from "./extra-1.json"
import h_extra_2 from "./extra-2.json"
import h_extra_3 from "./extra-3.json"
import h_extra_4 from "./extra-4.json"
import h_extra_5 from "./extra-5.json"
import h_extra_6 from "./extra-6.json"
import h_extra_7 from "./extra-7.json"
import h_extra_8 from "./extra-8.json"
import h_extra_9 from "./extra-9.json"
import h_extra_10 from "./extra-10.json"
import h_extra_11 from "./extra-11.json"
import h_extra_12 from "./extra-12.json"
import h_extra_13 from "./extra-13.json"
import h_extra_14 from "./extra-14.json"
import h_extra_15 from "./extra-15.json"
import h_extra_16 from "./extra-16.json"
import h_extra_17 from "./extra-17.json"
import h_extra_18 from "./extra-18.json"
import h_extra_19 from "./extra-19.json"
import h_extra_20 from "./extra-20.json"
import h_extra_21 from "./extra-21.json"
import h_extra_22 from "./extra-22.json"
import h_extra_23 from "./extra-23.json"
import h_extra_24 from "./extra-24.json"

export interface StockHistoryPoint {
  date: string
  price: number
}

export interface StockHistoryEvent {
  date: string
  /** stock = 이 종목 뉴스, market = 시장 전체 뉴스 */
  scope: string
  type: string
  emoji: string
  headline: string
  detail: string
  /** 그날 이 종목의 등락률 (%) */
  changeRate: number
}

export interface StockHistoryFile {
  id: string
  name: string
  category: string
  /** KR = 국내, US = 해외 */
  market: string
  /** 이 종목이 나오는 시나리오 */
  scenarioId: string
  /** scenario = 게임 가격이 시나리오 JSON 에 있음, generated = 실행 때 만듦 */
  source: string
  /** history 마지막 가격 (= 게임 시작가) */
  basePrice: number
  /** low | mid | high */
  volatility: string
  /** 하루 변동성 (게임 가격을 만들 때도 씀) */
  dailyVol: number
  pattern: string
  patternLabel: string
  high: number
  low: number
  /** 3개월 등락률 (%) */
  changeRate: number
  history: StockHistoryPoint[]
  events: StockHistoryEvent[]
}

export const STOCK_HISTORY: Record<string, StockHistoryFile> = {
  "stock-1": h_stock_1,
  "stock-2": h_stock_2,
  "stock-3": h_stock_3,
  "stock-4": h_stock_4,
  "stock-5": h_stock_5,
  "stock-6": h_stock_6,
  "stock-7": h_stock_7,
  "stock-8": h_stock_8,
  "stock-9": h_stock_9,
  "stock-10": h_stock_10,
  "stock-11": h_stock_11,
  "stock-12": h_stock_12,
  "stock-13": h_stock_13,
  "stock-14": h_stock_14,
  "stock-15": h_stock_15,
  "stock-16": h_stock_16,
  "stock-17": h_stock_17,
  "stock-18": h_stock_18,
  "stock-19": h_stock_19,
  "stock-20": h_stock_20,
  "stock-21": h_stock_21,
  "stock-22": h_stock_22,
  "stock-23": h_stock_23,
  "stock-24": h_stock_24,
  "stock-25": h_stock_25,
  "stock-26": h_stock_26,
  "stock-27": h_stock_27,
  "stock-28": h_stock_28,
  "stock-29": h_stock_29,
  "stock-30": h_stock_30,
  "stock-31": h_stock_31,
  "stock-32": h_stock_32,
  "stock-33": h_stock_33,
  "stock-34": h_stock_34,
  "stock-35": h_stock_35,
  "stock-36": h_stock_36,
  "stock-37": h_stock_37,
  "stock-38": h_stock_38,
  "stock-39": h_stock_39,
  "stock-40": h_stock_40,
  "stock-41": h_stock_41,
  "stock-42": h_stock_42,
  "stock-43": h_stock_43,
  "stock-44": h_stock_44,
  "stock-45": h_stock_45,
  "stock-46": h_stock_46,
  "stock-47": h_stock_47,
  "stock-48": h_stock_48,
  "stock-49": h_stock_49,
  "stock-50": h_stock_50,
  "KAKAO": h_KAKAO,
  "SAMSUNG": h_SAMSUNG,
  "NAVER": h_NAVER,
  "TSLA": h_TSLA,
  "HYUNDAI": h_HYUNDAI,
  "LG_ENERGY": h_LG_ENERGY,
  "ai-stock-1": h_ai_stock_1,
  "ai-stock-2": h_ai_stock_2,
  "ai-stock-3": h_ai_stock_3,
  "ai-stock-4": h_ai_stock_4,
  "ai-stock-5": h_ai_stock_5,
  "ai-stock-6": h_ai_stock_6,
  "ai-stock-7": h_ai_stock_7,
  "ai-stock-8": h_ai_stock_8,
  "ai-stock-9": h_ai_stock_9,
  "ai-stock-10": h_ai_stock_10,
  "robot-auto-1": h_robot_auto_1,
  "robot-auto-2": h_robot_auto_2,
  "robot-auto-3": h_robot_auto_3,
  "robot-auto-4": h_robot_auto_4,
  "robot-auto-5": h_robot_auto_5,
  "robot-auto-6": h_robot_auto_6,
  "robot-auto-7": h_robot_auto_7,
  "robot-auto-8": h_robot_auto_8,
  "robot-auto-9": h_robot_auto_9,
  "robot-auto-10": h_robot_auto_10,
  "extra-1": h_extra_1,
  "extra-2": h_extra_2,
  "extra-3": h_extra_3,
  "extra-4": h_extra_4,
  "extra-5": h_extra_5,
  "extra-6": h_extra_6,
  "extra-7": h_extra_7,
  "extra-8": h_extra_8,
  "extra-9": h_extra_9,
  "extra-10": h_extra_10,
  "extra-11": h_extra_11,
  "extra-12": h_extra_12,
  "extra-13": h_extra_13,
  "extra-14": h_extra_14,
  "extra-15": h_extra_15,
  "extra-16": h_extra_16,
  "extra-17": h_extra_17,
  "extra-18": h_extra_18,
  "extra-19": h_extra_19,
  "extra-20": h_extra_20,
  "extra-21": h_extra_21,
  "extra-22": h_extra_22,
  "extra-23": h_extra_23,
  "extra-24": h_extra_24,
}

/** 필터링용 전체 목록 (예: STOCK_HISTORY_LIST.filter((s) => s.category === "금융")) */
export const STOCK_HISTORY_LIST: StockHistoryFile[] = Object.values(STOCK_HISTORY)
