/**
 * 주식 데이터 생성 예시 스크립트
 * 
 * 이 스크립트를 실행하여 새로운 주식 시뮬레이션 데이터를 생성할 수 있습니다.
 * 
 * 실행 방법:
 * ts-node scripts/generate-stock-data-example.ts
 */

import { generateMultipleStocks, STOCK_PRESETS } from '../lib/stock-data-generator'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 새로운 시나리오 데이터 생성
 */
function generateNewScenario() {
  // 시작 날짜 설정
  const startDate = new Date('2024-01-02')
  
  // 생성할 일수
  const days = 100
  
  // 주식 설정
  const stockConfigs = [
    {
      id: 'stock-kakao',
      name: '카카오',
      category: 'IT/테크',
      initialPrice: 50000,
      volatility: STOCK_PRESETS.moderate.volatility,
      trend: STOCK_PRESETS.moderate.trend * 3, // 상승 추세
      baseVolume: 1200000,
    },
    {
      id: 'stock-samsung',
      name: '삼성전자',
      category: 'IT/테크',
      initialPrice: 70000,
      volatility: STOCK_PRESETS.stable.volatility,
      trend: STOCK_PRESETS.stable.trend * 5, // 안정적 상승
      baseVolume: 18000000,
    },
    {
      id: 'stock-naver',
      name: '네이버',
      category: 'IT/테크',
      initialPrice: 200000,
      volatility: STOCK_PRESETS.moderate.volatility,
      trend: STOCK_PRESETS.moderate.trend * 2.5,
      baseVolume: 800000,
    },
    {
      id: 'stock-lg-energy',
      name: 'LG에너지솔루션',
      category: '자동차/화학',
      initialPrice: 400000,
      volatility: STOCK_PRESETS.volatile.volatility,
      trend: STOCK_PRESETS.volatile.trend,
      baseVolume: 450000,
    },
    {
      id: 'stock-hyundai',
      name: '현대차',
      category: '자동차/화학',
      initialPrice: 200000,
      volatility: STOCK_PRESETS.stable.volatility,
      trend: STOCK_PRESETS.stable.trend,
      baseVolume: 620000,
    },
    {
      id: 'stock-hybe',
      name: '하이브',
      category: '엔터/콘텐츠',
      initialPrice: 180000,
      volatility: STOCK_PRESETS.volatile.volatility,
      trend: STOCK_PRESETS.declining.trend, // 하락 추세
      baseVolume: 320000,
    },
    {
      id: 'stock-celltrion',
      name: '셀트리온',
      category: '바이오/헬스',
      initialPrice: 160000,
      volatility: STOCK_PRESETS.volatile.volatility,
      trend: STOCK_PRESETS.volatile.trend * 2,
      baseVolume: 280000,
    },
    {
      id: 'stock-kb',
      name: 'KB금융',
      category: '금융',
      initialPrice: 55000,
      volatility: STOCK_PRESETS.stable.volatility,
      trend: STOCK_PRESETS.stable.trend * 2,
      baseVolume: 1200000,
    },
    {
      id: 'stock-posco',
      name: 'POSCO',
      category: '건설/중공업',
      initialPrice: 400000,
      volatility: STOCK_PRESETS.moderate.volatility,
      trend: 0, // 횡보
      baseVolume: 180000,
    },
    {
      id: 'stock-amorepacific',
      name: '아모레퍼시픽',
      category: '소비재/유통',
      initialPrice: 130000,
      volatility: STOCK_PRESETS.moderate.volatility,
      trend: STOCK_PRESETS.moderate.trend * 4,
      baseVolume: 210000,
    },
  ]

  // 주식 데이터 생성
  const stocks = generateMultipleStocks(stockConfigs, days, startDate)

  // 시나리오 객체 구성
  const scenario = {
    id: 'scenario-100days',
    title: '실전 100일 투자 시뮬레이션',
    description: '100일간의 실제 주식 시장 변동을 경험해보세요.',
    difficulty: '중급',
    totalTurns: days,
    updateInterval: 3000, // 3초
    stocks,
  }

  return scenario
}

/**
 * JSON 파일로 저장
 */
function saveToFile(scenario: any) {
  const outputData = {
    scenarios: [scenario],
  }

  const outputPath = path.join(__dirname, '../data/stock-100days-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8')
  
  console.log('✅ 주식 데이터 생성 완료!')
  console.log(`📁 저장 위치: ${outputPath}`)
  console.log(`📊 생성된 주식 수: ${scenario.stocks.length}`)
  console.log(`📅 거래일 수: ${scenario.totalTurns}`)
}

/**
 * 메인 실행
 */
function main() {
  console.log('🚀 주식 시뮬레이션 데이터 생성 시작...')
  
  try {
    const scenario = generateNewScenario()
    saveToFile(scenario)
    
    // 통계 출력
    console.log('\n📈 생성된 주식 정보:')
    scenario.stocks.forEach((stock: any) => {
      const firstPrice = stock.turns[0].price
      const lastPrice = stock.turns[stock.turns.length - 1].price
      const returnRate = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2)
      console.log(`  ${stock.name}: ${firstPrice.toLocaleString()}원 → ${lastPrice.toLocaleString()}원 (${returnRate}%)`)
    })
  } catch (error) {
    console.error('❌ 데이터 생성 중 오류 발생:', error)
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main()
}

export { generateNewScenario, saveToFile }

