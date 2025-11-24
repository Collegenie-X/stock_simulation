/**
 * 주식 데이터 생성 유틸리티
 * 
 * 실제 주식 시장의 변동 패턴을 반영하여 시뮬레이션용 데이터를 생성합니다.
 */

export interface StockTurn {
  turn: number
  date: string
  price: number
  volume: number
  news: string
}

export interface StockGeneratorOptions {
  /** 주식 이름 */
  name: string
  /** 시작 가격 */
  initialPrice: number
  /** 생성할 일수 */
  days: number
  /** 변동성 (0.01 = 1%, 0.05 = 5%) */
  volatility: number
  /** 전반적인 추세 (양수: 상승, 음수: 하락, 0: 횡보) */
  trend: number
  /** 시작 날짜 */
  startDate: Date
  /** 기본 거래량 */
  baseVolume: number
  /** 뉴스 생성 여부 */
  generateNews?: boolean
}

/**
 * 주식 가격 변동을 생성합니다.
 * GBM (Geometric Brownian Motion) 모델을 사용하여 현실적인 가격 변동을 생성합니다.
 */
export function generateStockPriceMovement(
  initialPrice: number,
  days: number,
  volatility: number,
  trend: number,
): number[] {
  const prices: number[] = [initialPrice]
  let currentPrice = initialPrice

  for (let i = 1; i < days; i++) {
    // 랜덤 워크: 정규분포를 따르는 랜덤 값
    const randomShock = (Math.random() - 0.5) * 2 * volatility
    
    // 추세 + 랜덤 변동
    const dailyReturn = trend / days + randomShock
    
    // 가격 업데이트 (음수 방지)
    currentPrice = Math.max(currentPrice * (1 + dailyReturn), 1000)
    prices.push(Math.round(currentPrice))
  }

  return prices
}

/**
 * 거래량을 생성합니다.
 * 가격 변동이 클수록 거래량이 증가하는 경향을 반영합니다.
 */
export function generateVolume(
  baseVolume: number,
  priceChanges: number[],
): number[] {
  return priceChanges.map((change, index) => {
    // 가격 변동률에 따라 거래량 변동
    const volumeMultiplier = 1 + Math.abs(change) * 10
    const randomFactor = 0.8 + Math.random() * 0.4 // 80% ~ 120%
    const volume = Math.round(baseVolume * volumeMultiplier * randomFactor)
    return volume
  })
}

/**
 * 날짜 배열을 생성합니다 (주말 제외).
 */
export function generateTradingDates(startDate: Date, days: number): string[] {
  const dates: string[] = []
  let currentDate = new Date(startDate)
  let tradingDays = 0

  while (tradingDays < days) {
    const dayOfWeek = currentDate.getDay()
    
    // 주말 제외 (0: 일요일, 6: 토요일)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      dates.push(`${year}.${month}.${day}`)
      tradingDays++
    }
    
    // 다음 날로 이동
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * 뉴스를 생성합니다.
 */
export function generateNews(
  turn: number,
  priceChange: number,
  stockName: string,
): string {
  const newsTemplates = {
    // 상승 뉴스
    positive: [
      `${stockName} 실적 개선 기대감`,
      `외국인 투자자 ${stockName} 순매수`,
      `${stockName} 신규 사업 호재`,
      `증권사 ${stockName} 목표가 상향`,
      `${stockName} 거래량 급증`,
      `기관 투자자 ${stockName} 매수 강화`,
      `${stockName} 신기술 개발 소식`,
      `${stockName} 해외 진출 확대`,
      `${stockName} 분기 실적 서프라이즈`,
      `${stockName} 신규 계약 체결`,
    ],
    // 하락 뉴스
    negative: [
      `${stockName} 차익 실현 매물 출현`,
      `시장 전반 조정에 ${stockName} 동반 하락`,
      `${stockName} 단기 과열 우려`,
      `${stockName} 경쟁 심화 우려`,
      `외국인 ${stockName} 매도세`,
      `${stockName} 규제 이슈 제기`,
      `${stockName} 원가 부담 증가`,
      `${stockName} 실적 우려 부각`,
      `${stockName} 고점 부담 조정`,
      `${stockName} 매물대 저항`,
    ],
    // 중립 뉴스
    neutral: [
      `${stockName} 보합권 등락`,
      `${stockName} 관망세 지속`,
      `${stockName} 안정적 거래`,
      `${stockName} 횡보 장세`,
      `${stockName} 거래 한산`,
      `${stockName} 변동성 축소`,
      `주말 앞두고 ${stockName} 관망`,
      `${stockName} 박스권 등락`,
      `${stockName} 소폭 등락`,
      `${stockName} 변동 제한적`,
    ],
  }

  // 가격 변동에 따라 뉴스 선택
  let selectedNews: string
  if (priceChange > 0.02) {
    // 2% 이상 상승
    selectedNews = newsTemplates.positive[Math.floor(Math.random() * newsTemplates.positive.length)]
  } else if (priceChange < -0.02) {
    // 2% 이상 하락
    selectedNews = newsTemplates.negative[Math.floor(Math.random() * newsTemplates.negative.length)]
  } else {
    // 중립
    selectedNews = newsTemplates.neutral[Math.floor(Math.random() * newsTemplates.neutral.length)]
  }

  // 특별 이벤트 (10일마다)
  if (turn % 10 === 0 && turn > 0) {
    const milestones = [
      `${turn}일차 도달`,
      `${turn}일 거래 기록`,
      `투자 ${turn}일 달성`,
    ]
    selectedNews = milestones[Math.floor(Math.random() * milestones.length)]
  }

  return selectedNews
}

/**
 * 완전한 주식 데이터를 생성합니다.
 */
export function generateStockData(options: StockGeneratorOptions): StockTurn[] {
  const {
    name,
    initialPrice,
    days,
    volatility,
    trend,
    startDate,
    baseVolume,
    generateNews: shouldGenerateNews = true,
  } = options

  // 가격 생성
  const prices = generateStockPriceMovement(initialPrice, days, volatility, trend)
  
  // 가격 변동률 계산
  const priceChanges = prices.map((price, index) => {
    if (index === 0) return 0
    return (price - prices[index - 1]) / prices[index - 1]
  })
  
  // 거래량 생성
  const volumes = generateVolume(baseVolume, priceChanges)
  
  // 날짜 생성
  const dates = generateTradingDates(startDate, days)

  // 최종 데이터 조합
  const stockData: StockTurn[] = []
  for (let i = 0; i < days; i++) {
    stockData.push({
      turn: i + 1,
      date: dates[i],
      price: prices[i],
      volume: volumes[i],
      news: shouldGenerateNews ? generateNews(i + 1, priceChanges[i], name) : '',
    })
  }

  return stockData
}

/**
 * 여러 종목의 주식 데이터를 일괄 생성합니다.
 */
export function generateMultipleStocks(
  stockConfigs: Array<{
    id: string
    name: string
    category: string
    initialPrice: number
    volatility: number
    trend: number
    baseVolume: number
  }>,
  days: number,
  startDate: Date,
) {
  return stockConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    category: config.category,
    initialPrice: config.initialPrice,
    turns: generateStockData({
      name: config.name,
      initialPrice: config.initialPrice,
      days,
      volatility: config.volatility,
      trend: config.trend,
      startDate,
      baseVolume: config.baseVolume,
      generateNews: true,
    }),
  }))
}

/**
 * 주식 유형별 기본 설정
 */
export const STOCK_PRESETS = {
  // 안정형 대형주
  stable: {
    volatility: 0.015, // 1.5%
    trend: 0.001, // 0.1% 상승
  },
  // 변동형 중형주
  moderate: {
    volatility: 0.03, // 3%
    trend: 0.002, // 0.2% 상승
  },
  // 고변동 성장주
  volatile: {
    volatility: 0.05, // 5%
    trend: 0.005, // 0.5% 상승
  },
  // 하락주
  declining: {
    volatility: 0.03, // 3%
    trend: -0.002, // 0.2% 하락
  },
}

/**
 * 사용 예시:
 * 
 * const kakaoData = generateStockData({
 *   name: '카카오',
 *   initialPrice: 50000,
 *   days: 100,
 *   volatility: 0.03,
 *   trend: 0.005,
 *   startDate: new Date('2024-01-02'),
 *   baseVolume: 1200000,
 *   generateNews: true,
 * });
 */

