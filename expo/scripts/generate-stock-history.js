// 종목별 "게임 시작 전 3개월" 가상 주가 + 이벤트 생성기
// 실행: node scripts/generate-stock-history.js
// 결과: src/data/stock-history/<종목ID>.json (종목당 파일 1개: 가격 + 이벤트) + index.ts
//
// 실제 시장의 움직임을 본떠서 만든다:
//  - 하루 등락 = 시장 전체(코스피) + 업종 + 종목 고유 움직임  → 같은 업종끼리 비슷하게 움직임
//  - 업종별 변동성/베타는 실제 한국 시장 수준으로 맞춤 (금융은 잔잔, 바이오·AI 는 크게)
//  - 이벤트(뉴스)가 난 날 주가가 실제로 크게 움직임 → 뉴스와 차트가 서로 맞음
//  - 시드 고정 난수 → 다시 돌려도 같은 데이터
//  - 마지막 가격 = 종목의 initialPrice → 게임 첫 턴과 끊김 없이 이어짐
const fs = require("fs")
const path = require("path")

const DATA = path.join(__dirname, "../src/data")
const OUT = path.join(DATA, "stock-history")
const TRADING_DAYS = 65 // 약 3개월
const DAILY_LIMIT = 0.15 // 하루 최대 등락
const HOLIDAYS = ["01-01", "03-01", "05-05", "06-06", "08-15", "10-03", "10-09", "12-25"] // 휴장일 (양력 공휴일)

const EVENT_POOL = JSON.parse(fs.readFileSync(path.join(DATA, "stock-market-events.json"), "utf8"))

// 시나리오 JSON 에 없는 종목 — 이름·시작가는 여기서 정하고, 게임 가격은 실행 때 만든다
const AI_NAMES = ["OpenAI", "Anthropic", "DeepMind", "Cohere", "Hugging Face", "Stability AI", "Midjourney", "Character.AI", "Jasper", "Copy.ai"]
const ROBOT_NAMES = ["Tesla", "Rivian", "Lucid Motors", "NIO", "XPeng", "BYD", "Boston Dynamics", "ABB Robotics", "FANUC", "KUKA"]

// 업종 성격 (일간 기준): vol = 종목 고유 변동성, beta = 시장 민감도, pool = 뉴스 문구 묶음
const SECTORS = {
  "IT/테크": { vol: 0.013, beta: 1.1, pool: "IT" },
  "바이오/헬스": { vol: 0.02, beta: 0.9, pool: "바이오" },
  "금융": { vol: 0.008, beta: 0.7, pool: "금융" },
  "소비재/유통": { vol: 0.01, beta: 0.8, pool: "유통" },
  "자동차/화학": { vol: 0.013, beta: 1.1, pool: "자동차" },
  "엔터/콘텐츠": { vol: 0.018, beta: 1.0, pool: "엔터" },
  "건설/중공업": { vol: 0.014, beta: 1.0, pool: "기본" },
  "AI/테크": { vol: 0.022, beta: 1.4, pool: "IT" },
  "로봇/자동차": { vol: 0.018, beta: 1.3, pool: "자동차" },
}
const DEFAULT_SECTOR = { vol: 0.013, beta: 1.0, pool: "기본" }
// 이름으로 업종을 더 정확히 고르는 경우
const NAME_POOL = [
  [/삼성전자|하이닉스|디스플레이/, "반도체"],
  [/에너지|SDI|이노베이션|LG화학|두산/, "에너지"],
]
const MARKET_VOL = 0.008
const SECTOR_VOL = 0.006

// 시장 전체 이벤트 (모든 종목이 같은 날 함께 영향받음)
const MARKET_EVENTS = [
  { day: 9, move: -0.024, emoji: "🌐", headline: "미국 증시 급락, 코스피도 동반 하락", detail: "미국 금리 인상 걱정에 외국인이 주식을 많이 팔았어요" },
  { day: 24, move: 0.021, emoji: "🏦", headline: "한국은행 기준금리 동결, 시장 안도", detail: "금리가 더 오르지 않는다는 기대에 매수세가 들어왔어요" },
  { day: 41, move: -0.018, emoji: "💱", headline: "원/달러 환율 급등, 외국인 매도 확대", detail: "환율이 오르면 외국인 투자자가 빠져나가기 쉬워요" },
  { day: 56, move: 0.019, emoji: "📦", headline: "수출 지표 깜짝 개선, 경기 회복 기대", detail: "수출이 예상보다 좋아서 시장 분위기가 밝아졌어요" },
]

// 흐름 패턴: shape(t) 는 t=0(3개월 전) → t=1(게임 시작) 의 로그 가격 곡선
const PATTERNS = [
  { key: "uptrend", label: "꾸준히 오름", shape: (t) => 0.2 * t },
  { key: "downtrend", label: "꾸준히 내림", shape: (t) => -0.18 * t },
  { key: "v-rebound", label: "떨어졌다 회복", shape: (t) => -0.17 * Math.sin(Math.PI * t) },
  { key: "peak-fall", label: "올랐다 꺾임", shape: (t) => 0.18 * Math.sin(Math.PI * t) },
  { key: "box", label: "박스권 횡보", shape: (t) => 0.05 * Math.sin(t * Math.PI * 5) },
  { key: "stairs-up", label: "계단식 상승", shape: (t) => 0.06 * Math.floor(t * 4) },
  { key: "late-surge", label: "최근 급등", shape: (t) => (t < 0.75 ? 0 : 0.2 * ((t - 0.75) / 0.25)) },
  { key: "late-drop", label: "최근 급락", shape: (t) => (t < 0.8 ? 0 : -0.17 * ((t - 0.8) / 0.2)) },
  { key: "volatile", label: "크게 출렁임", shape: (t) => 0.09 * Math.sin(t * Math.PI * 3) },
]

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 정규분포 난수 (Box-Muller) */
const gauss = (rand) => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand())

/** 같은 키면 항상 같은 일간 수익률 배열 (시장/업종 공통 움직임용) */
const factorCache = {}
function factor(key, vol) {
  if (!factorCache[key]) {
    const rand = mulberry32(hash(key))
    factorCache[key] = Array.from({ length: TRADING_DAYS }, () => gauss(rand) * vol)
    // 마지막 날(게임 첫 화면의 "어제 대비")은 공통 움직임 없이 → 오른 종목·내린 종목이 고르게 섞임
    factorCache[key][TRADING_DAYS - 1] = 0
  }
  return factorCache[key]
}

/** 기준일 직전 영업일 n개 (오래된 순) */
function businessDaysBefore(firstTurnDate, n) {
  const [y, m, d] = firstTurnDate.split(" ")[0].split(/[.-]/).map(Number)
  const cur = new Date(y, m - 1, d)
  const days = []
  while (days.length < n) {
    cur.setDate(cur.getDate() - 1)
    const dow = cur.getDay()
    if (dow === 0 || dow === 6) continue
    const mmdd = `${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`
    if (HOLIDAYS.includes(mmdd)) continue
    days.unshift(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`)
  }
  return days
}

function pickPool(name, sector) {
  const byName = NAME_POOL.find(([re]) => re.test(name))
  return byName ? byName[1] : sector.pool
}

function buildStock(target, patternIdx) {
  const { id, name, category, basePrice, firstDate, scenarioId, source } = target
  const rand = mulberry32(hash(id))
  const sector = SECTORS[category] || DEFAULT_SECTOR
  const pattern = PATTERNS[patternIdx % PATTERNS.length]
  const strength = 0.7 + rand() * 0.6 // 종목마다 패턴 세기 다르게
  const dates = businessDaysBefore(firstDate, TRADING_DAYS)
  const market = factor("market", MARKET_VOL)
  const sectorMove = factor(`sector:${category}`, SECTOR_VOL)
  const drift = (i) => (pattern.shape(i / (TRADING_DAYS - 1)) - pattern.shape((i - 1) / (TRADING_DAYS - 1))) * strength

  // ── 종목 이벤트 날짜 고르기 (4~6개, 마지막 1개는 최근 1주일 안) ──
  const marketDays = new Set(MARKET_EVENTS.map((e) => e.day))
  const eventDays = new Set()
  const eventCount = 4 + Math.floor(rand() * 3)
  eventDays.add(TRADING_DAYS - 2 - Math.floor(rand() * 4))
  while (eventDays.size < eventCount) {
    const day = 2 + Math.floor(rand() * (TRADING_DAYS - 8))
    if (!marketDays.has(day) && !eventDays.has(day - 1) && !eventDays.has(day + 1)) eventDays.add(day)
  }

  // ── 일간 수익률 만들기 ──
  const returns = [0]
  const jumps = {}
  for (let i = 1; i < TRADING_DAYS; i++) {
    // 뉴스가 난 날은 뉴스가 주가를 이끈다 → 다른 잡음은 줄임
    const calm = eventDays.has(i) ? 0.4 : 1
    let r = drift(i) + calm * (sector.beta * market[i] + sectorMove[i] + gauss(rand) * sector.vol)
    const marketEvent = MARKET_EVENTS.find((e) => e.day === i)
    if (marketEvent) r += marketEvent.move * sector.beta
    if (eventDays.has(i)) {
      // 뉴스 방향은 70% 확률로 그 시기의 큰 흐름을 따라감 → 뉴스가 추세를 설명
      const trendUp = drift(i) !== 0 ? drift(i) > 0 : rand() > 0.5
      const up = rand() < 0.7 ? trendUp : !trendUp
      jumps[i] = (up ? 1 : -1) * (0.03 + rand() * 0.045) * (sector.vol / 0.013) ** 0.5
      r += jumps[i]
    }
    returns.push(Math.max(-DAILY_LIMIT, Math.min(DAILY_LIMIT, r)))
  }

  // ── 가격: 끝 가격을 basePrice 에 맞추고 거꾸로 계산 (모양 왜곡 없음) ──
  const logs = []
  returns.reduce((acc, r, i) => (logs[i] = acc + r), 0)
  const last = logs[TRADING_DAYS - 1]
  const history = dates.map((date, i) => ({ date, price: Math.max(100, Math.round(basePrice * Math.exp(logs[i] - last))) }))
  history[TRADING_DAYS - 1].price = basePrice
  const dayChange = (i) => Number((((history[i].price - history[i - 1].price) / history[i - 1].price) * 100).toFixed(1))

  // ── 이벤트 기록 (실제 그날 등락률과 함께) ──
  const poolKey = pickPool(name, sector)
  const used = { positive: new Set(), negative: new Set() }
  const events = []
  for (const i of [...eventDays].sort((a, b) => a - b)) {
    const type = dayChange(i) >= 0 ? "positive" : "negative" // 실제 그날 등락과 뉴스 방향을 맞춤
    const pool = EVENT_POOL[type][poolKey] || EVENT_POOL[type]["기본"]
    let idx = Math.floor(rand() * pool.headlines.length)
    while (used[type].has(idx) && used[type].size < pool.headlines.length) idx = (idx + 1) % pool.headlines.length
    used[type].add(idx)
    events.push({
      date: dates[i],
      scope: "stock",
      type,
      emoji: type === "positive" ? "📈" : "📉",
      headline: pool.headlines[idx],
      detail: pool.details[idx],
      changeRate: dayChange(i),
    })
  }
  for (const e of MARKET_EVENTS) {
    events.push({
      date: dates[e.day],
      scope: "market",
      type: e.move >= 0 ? "positive" : "negative",
      emoji: e.emoji,
      headline: e.headline,
      detail: e.detail,
      changeRate: dayChange(e.day),
    })
  }
  events.sort((a, b) => a.date.localeCompare(b.date))

  const prices = history.map((h) => h.price)
  return {
    id,
    name,
    category,
    market: id === "TSLA" || /^[A-Za-z]/.test(name) && !/^(SK|LG|KB|KT|CJ|GS|HD|HMM|JYP|POSCO|BGF|DB|HLB)/.test(name) ? "US" : "KR",
    scenarioId,
    source,
    basePrice,
    volatility: sector.vol >= 0.018 ? "high" : sector.vol >= 0.012 ? "mid" : "low",
    dailyVol: sector.vol,
    pattern: pattern.key,
    patternLabel: pattern.label,
    high: Math.max(...prices),
    low: Math.min(...prices),
    changeRate: Number((((basePrice - prices[0]) / prices[0]) * 100).toFixed(1)),
    history,
    events,
  }
}

// ── 대상 종목 모으기 (총 100개) ────────────────────────────────
// 90일 시나리오 종목은 원본에 카테고리가 없어서 여기서 채운다
const DAYS100_CATEGORY = { KAKAO: "IT/테크", SAMSUNG: "IT/테크", NAVER: "IT/테크", TSLA: "로봇/자동차", HYUNDAI: "자동차/화학", LG_ENERGY: "자동차/화학" }

// 기본 시나리오에 더하는 종목 (게임 가격은 실행 때 basePrice 에서 출발)
const EXTRA_STOCKS = [
  ["SK하이닉스", "IT/테크", 120000], ["삼성전기", "IT/테크", 140000], ["LG전자", "IT/테크", 95000], ["카카오게임즈", "IT/테크", 22000],
  ["현대모비스", "자동차/화학", 230000], ["롯데케미칼", "자동차/화학", 110000], ["한화솔루션", "자동차/화학", 28000], ["금호석유", "자동차/화학", 130000],
  ["삼성생명", "금융", 85000], ["미래에셋증권", "금융", 8000], ["키움증권", "금융", 125000], ["DB손해보험", "금융", 98000],
  ["녹십자", "바이오/헬스", 120000], ["종근당", "바이오/헬스", 105000], ["알테오젠", "바이오/헬스", 180000], ["HLB", "바이오/헬스", 60000],
  ["CJ제일제당", "소비재/유통", 300000], ["오리온", "소비재/유통", 100000], ["BGF리테일", "소비재/유통", 130000], ["농심", "소비재/유통", 400000],
  ["CJ CGV", "엔터/콘텐츠", 6000], ["콘텐트리중앙", "엔터/콘텐츠", 12000],
  ["대우건설", "건설/중공업", 4000], ["한국조선해양", "건설/중공업", 170000],
]

const targets = []
const gameScenarios = JSON.parse(fs.readFileSync(path.join(DATA, "game-scenarios.json"), "utf8"))
const days100 = JSON.parse(fs.readFileSync(path.join(DATA, "stock-100days-data.json"), "utf8"))
const BASE_SCENARIO = gameScenarios.scenarios[0]
const BASE_FIRST_DATE = BASE_SCENARIO.stocks[0].turns[0].date
for (const scenario of [...gameScenarios.scenarios, days100]) {
  for (const s of scenario.stocks) {
    if (targets.some((t) => t.id === s.id)) continue
    targets.push({
      id: s.id,
      name: s.name,
      category: s.category || DAYS100_CATEGORY[s.id] || "기타",
      basePrice: s.initialPrice,
      firstDate: s.turns[0].date,
      scenarioId: scenario.id,
      source: "scenario", // 게임 가격(turns)이 시나리오 JSON 에 있음
    })
  }
}
const generated = (id, name, category, basePrice) =>
  targets.push({ id, name, category, basePrice, firstDate: BASE_FIRST_DATE, scenarioId: BASE_SCENARIO.id, source: "generated" }) // 게임 가격은 실행 때 만듦
AI_NAMES.forEach((name, i) => generated(`ai-stock-${i + 1}`, name, "AI/테크", 30000 + ((hash(name) % 9) * 5000)))
ROBOT_NAMES.forEach((name, i) => generated(`robot-auto-${i + 1}`, name, "로봇/자동차", 20000 + ((hash(name) % 9) * 3000)))
EXTRA_STOCKS.forEach(([name, category, basePrice], i) => generated(`extra-${i + 1}`, name, category, basePrice))

// ── 파일 쓰기 ───────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true })
targets.forEach((t, i) => {
  // 4칸씩 건너뛰며 돌려서 같은 카테고리 안에서도 패턴이 고르게 섞이도록
  const json = buildStock(t, i * 4)
  fs.writeFileSync(path.join(OUT, `${t.id}.json`), JSON.stringify(json, null, 2) + "\n")
})

// ── 형식 검증: 모든 파일의 모양이 같아야 필터링·유지보수가 쉽다 ──
const KEYS = "id,name,category,market,scenarioId,source,basePrice,volatility,dailyVol,pattern,patternLabel,high,low,changeRate,history,events"
const EVENT_KEYS = "date,scope,type,emoji,headline,detail,changeRate"
const problems = []
for (const t of targets) {
  const j = JSON.parse(fs.readFileSync(path.join(OUT, `${t.id}.json`), "utf8"))
  if (Object.keys(j).join(",") !== KEYS) problems.push(`${t.id}: 필드가 다름`)
  if (!j.category || j.category === "기타" || !j.name) problems.push(`${t.id}: 이름/카테고리 비어 있음`)
  if (j.history.length !== TRADING_DAYS) problems.push(`${t.id}: history ${j.history.length}일`)
  if (j.history[TRADING_DAYS - 1].price !== j.basePrice) problems.push(`${t.id}: 마지막 가격 ≠ basePrice`)
  if (j.history.some((h) => Object.keys(h).join(",") !== "date,price" || !(h.price > 0))) problems.push(`${t.id}: history 항목 이상`)
  if (j.events.some((e) => Object.keys(e).join(",") !== EVENT_KEYS)) problems.push(`${t.id}: events 항목 이상`)
}
// 목록에 없는 옛 파일 지우기
const valid = new Set(targets.map((t) => `${t.id}.json`))
fs.readdirSync(OUT).filter((f) => f.endsWith(".json") && !valid.has(f)).forEach((f) => fs.unlinkSync(path.join(OUT, f)))
if (problems.length) {
  console.error("❌ 형식 오류:\n" + problems.join("\n"))
  process.exit(1)
}

const varName = (id) => "h_" + id.replace(/[^a-zA-Z0-9]/g, "_")
const index = [
  "// 자동 생성 파일 — 직접 고치지 마세요. (node scripts/generate-stock-history.js)",
  "// 가격·이벤트를 바꾸고 싶으면 각 종목 JSON 을 고치면 됩니다.",
  ...targets.map((t) => `import ${varName(t.id)} from "./${t.id}.json"`),
  "",
  "export interface StockHistoryPoint {",
  "  date: string",
  "  price: number",
  "}",
  "",
  "export interface StockHistoryEvent {",
  "  date: string",
  "  /** stock = 이 종목 뉴스, market = 시장 전체 뉴스 */",
  "  scope: string",
  "  type: string",
  "  emoji: string",
  "  headline: string",
  "  detail: string",
  "  /** 그날 이 종목의 등락률 (%) */",
  "  changeRate: number",
  "}",
  "",
  "export interface StockHistoryFile {",
  "  id: string",
  "  name: string",
  "  category: string",
  "  /** KR = 국내, US = 해외 */",
  "  market: string",
  "  /** 이 종목이 나오는 시나리오 */",
  "  scenarioId: string",
  "  /** scenario = 게임 가격이 시나리오 JSON 에 있음, generated = 실행 때 만듦 */",
  "  source: string",
  "  /** history 마지막 가격 (= 게임 시작가) */",
  "  basePrice: number",
  "  /** low | mid | high */",
  "  volatility: string",
  "  /** 하루 변동성 (게임 가격을 만들 때도 씀) */",
  "  dailyVol: number",
  "  pattern: string",
  "  patternLabel: string",
  "  high: number",
  "  low: number",
  "  /** 3개월 등락률 (%) */",
  "  changeRate: number",
  "  history: StockHistoryPoint[]",
  "  events: StockHistoryEvent[]",
  "}",
  "",
  "export const STOCK_HISTORY: Record<string, StockHistoryFile> = {",
  ...targets.map((t) => `  ${JSON.stringify(t.id)}: ${varName(t.id)},`),
  "}",
  "",
  "/** 필터링용 전체 목록 (예: STOCK_HISTORY_LIST.filter((s) => s.category === \"금융\")) */",
  "export const STOCK_HISTORY_LIST: StockHistoryFile[] = Object.values(STOCK_HISTORY)",
  "",
].join("\n")
fs.writeFileSync(path.join(OUT, "index.ts"), index)

console.log(`✅ ${targets.length}개 종목 × ${TRADING_DAYS}일 (+이벤트) → ${path.relative(process.cwd(), OUT)}`)
