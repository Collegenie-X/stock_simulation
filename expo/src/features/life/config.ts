/**
 * 캐릭터와 삶 (설계 문서 10장)
 * - 삶(집)은 자산을 따르고, 지혜는 과정을 따른다. 집은 줄어들 수 있지만 지혜는 줄지 않는다.
 * - 집은 턴마다 바뀌지 않고 계절(한 판)이 끝날 때만 바뀐다.
 */
import lifeData from "@/data/life.json"
import { formatKRW } from "@/lib/format"

// ============================================================
// Types
// ============================================================
export interface LifeCharacter {
  id: string
  emoji: string
  name: string
  age: number
  scene: string
  startCash: number
  goal: string
  recover: string
  minus10: string
  lesson: string
  startStage: number
  /** 돈을 삶의 단위로 바꿔 부르기 위한 기준 (예: 월세 한 달 = 50만원) */
  unit: LifeUnit
  /** 돈의 성격 (여윳돈, 생계형 …). 나이와 합쳐진 캐릭터에만 있다 */
  moneyType?: MoneyType
}

export interface LifeUnit {
  label: string
  counter: string
  amount: number
}

/** 같은 나이라도 어떤 돈이냐에 따라 무게가 다르다. null 은 나이 쪽 값을 그대로 쓴다 */
export interface MoneyType {
  id: string
  emoji: string
  name: string
  desc: string
  cashMult: number
  goal: string | null
  ifLost: string
  lesson: string | null
  unit: LifeUnit | null
  /** 금액이 아니라 시작 자금 대비 비율로 정하는 단위 (예: 대출 이자 = 원금의 월 0.5%) */
  unitRate?: { label: string; counter: string; rate: number }
}

export interface House {
  stage: number
  name: string
  emoji: string
  sign: string
  minRatio: number
}

/** 생활 사건 — 급하게 돈이 나가거나(need) 생각 못 한 돈이 들어온다(gain) */
export interface LifeEvent {
  id: string
  emoji: string
  kind: "need" | "gain"
  title: string
  desc: string
  /** 시작 자금 대비 비율 */
  rate: number
  onlyTypes: string[] | null
  /** [최소 나이, 최대 나이] */
  ages: [number, number] | null
}

/** 이번 계절에 이미 겪은 사건. amount 는 부호가 있다 (나간 돈은 −) */
export interface SeasonEventRecord {
  day: number
  eventId: string
  amount: number
  forcedSell: boolean
}

export type SeasonKind = "goodUp" | "badUp" | "goodDown" | "badDown"

export interface SeasonOutcome {
  kind: SeasonKind
  message: string
  profitAmount: number
  assetsBefore: number
  assetsAfter: number
  stageBefore: number
  stageAfter: number
  wisdomBefore: number
  wisdomAfter: number
  panicSells: number
  overtraded: boolean
  /** 생활 사건으로 들어오고 나간 돈의 합. profitAmount 에 이미 들어 있다 */
  eventNet?: number
}

export interface LifeState {
  characterId: string
  assets: number
  houseStage: number
  wisdom: number
  seasons: number
  createdAt: string
  lastSeason?: SeasonOutcome
  seasonEvents?: SeasonEventRecord[]
  /** 산 꾸미기 아이템 id 들 */
  decor?: string[]
}

/** 꾸미기 — 집은 돈을 따라가지만, 꾸미기는 내가 직접 사고판다 */
export interface DecorItem {
  id: string
  emoji: string
  name: string
  group: "room" | "joy"
  /** 시작 자금 대비 값 */
  rate: number
  /** 이 집 단계부터 살 수 있다 */
  minStage: number
  line: string
}

export type LineTag = keyof typeof lifeData.lines

// ============================================================
// Data (from JSON)
// ============================================================
export const LIFE_CHARACTERS = lifeData.characters as LifeCharacter[]
export const MONEY_TYPES = lifeData.moneyTypes as MoneyType[]
export const DEFAULT_MONEY_TYPE = MONEY_TYPES[0]
export const LIFE_EVENTS = lifeData.events as LifeEvent[]
export const EVENT_LINES = lifeData.eventLines
export const HOUSES = lifeData.houses as House[]
export const DECOR_ITEMS = lifeData.decor as DecorItem[]
export const MAX_STAGE = HOUSES.length

// ============================================================
// Business rules (초기 안 — 문서 17장에서 확정 예정)
// ============================================================
/** 기준 표(10.3)는 4단계(원룸)에서 시작하는 캐릭터 기준이라, 시작 단계 차이만큼 밀어서 쓴다 */
const BASE_START_STAGE = 4
/** 시작 자금의 이 비율 아래로 떨어지면 시작 단계와 상관없이 쪽방(1단계) */
const ROCK_BOTTOM_RATIO = HOUSES[1].minRatio
/** 이보다 크게 잃고 판 매도를 "급락 손절"로 센다 */
const PANIC_SELL_RATE = -5
/** 하루 평균 이 횟수를 넘겨 매매하면 과잉 매매로 본다 */
const OVERTRADE_PER_DAY = 1.5
/** 첫날은 조용히. 그 뒤로 평균 이 날수마다 한 번 사건이 난다 */
const EVENT_FIRST_DAY = 2
const EVENT_EVERY_DAYS = 5
/** 사건 금액은 10만원 단위로 끊는다 (작은 돈은 1만원 단위) */
const EVENT_ROUND = 100000
const WISDOM_PER_SEASON = 1
/** 꾸미기를 되팔면 산 값의 이만큼만 돌아온다 */
const DECOR_RESELL_RATIO = 0.5
/** 계절 기록에서 꾸미기 거래를 구분하는 머리말 */
const DECOR_EVENT_PREFIX = "decor:"
const WISDOM_GOOD_PROCESS = 2

export const LABELS = {
  homeTitle: "나의 삶",
  createTitle: "누구의 돈을 굴려 볼까요?",
  createHint: "나이와 돈의 성격이 다르면 같은 −10%의 뜻이 달라요",
  pickAge: "나이",
  pickMoneyType: "어떤 돈인가요?",
  createCta: "내 캐릭터 만들기",
  createDesc: "가짜 돈에 무게를 실어 봐요. 결과에 따라 집이 넓어지고, 줄어듭니다.",
  startSeason: "이번 계절 시작",
  changeCharacter: "다른 사람으로 살아 보기",
  confirmPick: (name: string) => `${name}(으)로 시작`,
  resetWarning: "캐릭터를 바꾸면 집과 자산이 처음부터 다시 시작돼요. 지혜는 그대로 남아요.",
  seedFromLife: (name: string) => `${name}의 돈으로 시작`,
  seedFromLifeHint: "결과가 집에 반영돼요",
  seedCustom: "다른 금액으로 연습",
  seedCustomHint: "집에는 반영되지 않아요",
  seasonTitle: "한 계절이 끝났어요",
  otherPaths: "다른 길들의 집",
  practiceOnly: "연습 판이라 집은 그대로예요",
  eventNeed: "급하게 돈이 필요해요",
  eventGain: "돈이 생겼어요",
  eventPayCash: "현금으로 내기",
  eventPaySell: "주식 팔아서 내기",
  eventReceive: "받기",
  eventCashLeft: "지금 현금",
  eventShort: (amount: string) => `현금이 ${amount} 모자라요`,
  eventNetLine: "생활에서 들어오고 나간 돈",
  growTitle: "삶 키우기",
  growHint: "번 돈으로 집을 넓히고 방을 꾸며요",
  growMove: "이사하기",
  growMoveReady: (name: string) => `${name}(으)로 이사할 수 있어요!`,
  growMoved: (name: string) => `${name}(으)로 이사했어요`,
  growShop: "꾸미기 상점",
  growMine: "내 방",
  growEmpty: "아직 아무것도 없어요",
  growBuy: "사기",
  growSell: "되팔기",
  growLocked: (house: string) => `${house}부터`,
  growNoCash: "현금 부족",
  growKeepHouse: "집이 줄어요",
  growCashOnly: "주식은 그대로 두고, 남은 현금으로만 살 수 있어요",
  growGroups: { room: "🏠 집 꾸미기", joy: "🎈 즐거움" } as Record<DecorItem["group"], string>,
} as const

// ============================================================
// Helpers
// ============================================================
/** 저장되는 id 는 "나이:돈의성격" (예: "doyun:living"). 예전 저장값("doyun")은 여윳돈으로 읽는다 */
export function getLifeCharacter(id?: string | null): LifeCharacter | null {
  const [baseId, typeId] = (id ?? "").split(":")
  const base = LIFE_CHARACTERS.find((c) => c.id === baseId)
  if (!base) return null
  return withMoneyType(base, MONEY_TYPES.find((t) => t.id === typeId) ?? DEFAULT_MONEY_TYPE)
}

/** 나이 캐릭터에 돈의 성격을 입힌다 — 시작 자금, 목적, −10%의 뜻이 달라진다 */
export function withMoneyType(base: LifeCharacter, type: MoneyType): LifeCharacter {
  if (type.id === DEFAULT_MONEY_TYPE.id) return { ...base, moneyType: type }
  const startCash = Math.round(base.startCash * type.cashMult)
  const merged: LifeCharacter = {
    ...base,
    id: `${base.id}:${type.id}`,
    startCash,
    goal: type.goal ?? base.goal,
    lesson: type.lesson ?? base.lesson,
    unit: type.unitRate
      ? { label: type.unitRate.label, counter: type.unitRate.counter, amount: Math.round(startCash * type.unitRate.rate) }
      : (type.unit ?? base.unit),
    moneyType: type,
  }
  return { ...merged, minus10: inLifeUnits(startCash * 0.1, merged) ?? base.minus10 }
}

export function getHouse(stage: number): House {
  return HOUSES[Math.min(MAX_STAGE, Math.max(1, stage)) - 1]
}

/** 자산 → 집 단계. 시작 자금 대비 비율로 정한다 */
export function stageForAssets(assets: number, character: LifeCharacter): number {
  const ratio = assets / character.startCash
  // 거의 다 잃으면 누구든 쪽방이다 — 큰 집에서 시작했어도 바닥은 같다
  if (ratio < ROCK_BOTTOM_RATIO) return 1
  let base = 1
  for (const h of HOUSES) if (ratio >= h.minRatio) base = h.stage
  const shifted = base + (character.startStage - BASE_START_STAGE)
  return Math.min(MAX_STAGE, Math.max(1, shifted))
}

/** 이 집에 머무는 자산 구간. 아래로 내려가면 좁은 집, 위를 넘으면 넓은 집 (끝 단계는 null) */
export function stageBounds(stage: number, character: LifeCharacter): { lower: number | null; upper: number | null } {
  const base = stage - (character.startStage - BASE_START_STAGE)
  const here = HOUSES.find((h) => h.stage === base)
  const next = HOUSES.find((h) => h.stage === base + 1)
  if (stage === 1) return { lower: null, upper: ROCK_BOTTOM_RATIO * character.startCash }
  return {
    lower: stage > 1 && here ? Math.max(here.minRatio, ROCK_BOTTOM_RATIO) * character.startCash : null,
    upper: stage < MAX_STAGE && next ? next.minRatio * character.startCash : null,
  }
}

/** 다음 집까지 남은 돈 (최고 단계면 null) */
export function amountToNextStage(assets: number, stage: number, character: LifeCharacter): number | null {
  const { upper } = stageBounds(stage, character)
  return upper === null ? null : Math.max(0, Math.ceil(upper - assets))
}

/** 집 게이지 0~1 — 이 집 구간 안에서 지금 돈이 어디쯤인지 */
export function houseGauge(assets: number, stage: number, character: LifeCharacter): number {
  const { lower, upper } = stageBounds(stage, character)
  const lo = lower ?? 0
  const hi = upper ?? Math.max(assets, lo * 1.5, 1)
  return Math.min(1, Math.max(0, (assets - lo) / (hi - lo)))
}

export function wisdomTitle(wisdom: number): string {
  let title = lifeData.wisdomTitles[0].title
  for (const w of lifeData.wisdomTitles) if (wisdom >= w.min) title = w.title
  return title
}

/** 금액을 삶의 단위로 번역: −1,500,000 → "월세 3달치" */
export function inLifeUnits(amount: number, character: LifeCharacter): string | null {
  const count = Math.abs(amount) / character.unit.amount
  if (count < 0.5) return null
  const rounded = count >= 10 ? Math.round(count) : Math.round(count * 2) / 2
  return `${character.unit.label} ${rounded}${character.unit.counter}`
}

export function moodEmoji(profitRate: number): string {
  if (profitRate >= 10) return "🤩"
  if (profitRate >= 3) return "😊"
  if (profitRate > -3) return "🙂"
  if (profitRate > -10) return "😰"
  return "😱"
}

export function lineTagFor(profitRate: number): LineTag {
  if (profitRate >= 10) return "bigUp"
  if (profitRate >= 3) return "up"
  if (profitRate > -3) return "calm"
  if (profitRate > -10) return "down"
  return "bigDown"
}

/** 같은 시드면 같은 한마디가 나온다 (랜덤 없음) */
export function pickLine(tag: LineTag, seed: number): string {
  const lines = lifeData.lines[tag]
  return lines[Math.abs(Math.floor(seed)) % lines.length]
}

function hash(n: number): number {
  let x = Math.abs(Math.floor(n)) | 0
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  return (x ^ (x >>> 16)) >>> 0
}

/** 이 날 일어날 사건 (없으면 null). 같은 계절·같은 날이면 늘 같은 사건이다 (랜덤 없음) */
export function eventForDay(life: LifeState, character: LifeCharacter, day: number): { event: LifeEvent; amount: number } | null {
  if (day < EVENT_FIRST_DAY || life.seasonEvents?.some((e) => e.day === day)) return null
  const seed = new Date(life.createdAt).getTime() / 1000 + life.seasons * 9973
  if (hash(seed + day * 31) % EVENT_EVERY_DAYS !== 0) return null

  const typeId = character.moneyType?.id ?? DEFAULT_MONEY_TYPE.id
  const seen = new Set(life.seasonEvents?.map((e) => e.eventId))
  const pool = LIFE_EVENTS.filter(
    (e) =>
      !seen.has(e.id) &&
      (!e.onlyTypes || e.onlyTypes.includes(typeId)) &&
      (!e.ages || (character.age >= e.ages[0] && character.age <= e.ages[1])),
  )
  if (pool.length === 0) return null
  const event = pool[hash(seed + day * 131 + 7) % pool.length]
  const raw = character.startCash * event.rate
  const step = raw >= EVENT_ROUND * 5 ? EVENT_ROUND : EVENT_ROUND / 10
  return { event, amount: Math.max(step, Math.round(raw / step) * step) }
}

export function recordSeasonEvent(life: LifeState, record: SeasonEventRecord): LifeState {
  return { ...life, seasonEvents: [...(life.seasonEvents ?? []), record] }
}

export function newLife(character: LifeCharacter, keepWisdom = 0): LifeState {
  return {
    characterId: character.id,
    assets: character.startCash,
    houseStage: character.startStage,
    wisdom: keepWisdom,
    seasons: 0,
    createdAt: new Date().toISOString(),
  }
}

interface SeasonInput {
  totalValue: number
  initialValue: number
  days: number
  trades: { action: "buy" | "sell"; profitRate?: number }[]
}

/**
 * 계절 정산 — 집은 결과(자산)로, 지혜는 과정으로 매긴다.
 * 과정 판정은 기록에서 바로 셀 수 있는 두 가지(급락 손절, 과잉 매매)만 쓴다.
 */
export function settleSeason(life: LifeState, character: LifeCharacter, input: SeasonInput): { life: LifeState; outcome: SeasonOutcome } {
  const profitAmount = Math.round(input.totalValue - input.initialValue)
  // 병원비로 나간 돈은 실력이 아니다 — 과정 판정은 매매로 번 돈만 본다
  const eventNet = (life.seasonEvents ?? []).reduce((sum, e) => sum + e.amount, 0)
  const tradingProfit = profitAmount - eventNet
  const assetsAfter = Math.max(0, life.assets + profitAmount)

  const panicSells = input.trades.filter((t) => t.action === "sell" && (t.profitRate ?? 0) <= PANIC_SELL_RATE).length
  const overtraded = input.trades.length > Math.max(1, input.days) * OVERTRADE_PER_DAY
  const goodProcess = input.trades.length > 0 && panicSells <= 1 && !overtraded

  const kind: SeasonKind = tradingProfit >= 0 ? (goodProcess ? "goodUp" : "badUp") : goodProcess ? "goodDown" : "badDown"
  const wisdomAfter = life.wisdom + WISDOM_PER_SEASON + (goodProcess ? WISDOM_GOOD_PROCESS : 0)

  const outcome: SeasonOutcome = {
    kind,
    message: lifeData.seasonMessages[kind],
    profitAmount,
    assetsBefore: life.assets,
    assetsAfter,
    stageBefore: life.houseStage,
    stageAfter: stageForAssets(assetsAfter, character),
    wisdomBefore: life.wisdom,
    wisdomAfter,
    panicSells,
    overtraded,
    eventNet,
  }

  return {
    life: { ...life, seasonEvents: [], assets: assetsAfter, houseStage: outcome.stageAfter, wisdom: wisdomAfter, seasons: life.seasons + 1, lastSeason: outcome },
    outcome,
  }
}

// ============================================================
// 꾸미기 · 이사
// ============================================================
export function decorPrice(item: DecorItem, character: LifeCharacter): number {
  const raw = character.startCash * item.rate
  const step = raw >= EVENT_ROUND * 5 ? EVENT_ROUND : EVENT_ROUND / 10
  return Math.max(step, Math.round(raw / step) * step)
}

export function decorResellPrice(item: DecorItem, character: LifeCharacter): number {
  return Math.round(decorPrice(item, character) * DECOR_RESELL_RATIO)
}

export function ownedDecor(life: LifeState | null): DecorItem[] {
  const ids = life?.decor ?? []
  return DECOR_ITEMS.filter((d) => ids.includes(d.id))
}

/**
 * 꾸미기를 사거나 되판다. amount 는 부호가 있다 (산 돈은 −).
 * inSeason: 판이 진행 중이면 게임 현금에서 나가므로 계절 기록에 남기고, 정산이 끝난 뒤면 자산에서 바로 뺀다.
 */
export function tradeDecor(life: LifeState, item: DecorItem, amount: number, opts: { inSeason: boolean; day: number }): LifeState {
  const has = (life.decor ?? []).includes(item.id)
  const decor = amount < 0 ? (has ? life.decor ?? [] : [...(life.decor ?? []), item.id]) : (life.decor ?? []).filter((id) => id !== item.id)
  const next: LifeState = { ...life, decor }
  if (opts.inSeason) return recordSeasonEvent(next, { day: opts.day, eventId: `${DECOR_EVENT_PREFIX}${item.id}`, amount, forcedSell: false })
  return { ...next, assets: Math.max(0, life.assets + amount) }
}

/** 판 도중의 이사 — 넓은 집으로만. 줄어드는 건 계절이 끝날 때 정산이 한다 */
export function moveUp(life: LifeState, stage: number): LifeState {
  return stage > life.houseStage ? { ...life, houseStage: Math.min(stage, MAX_STAGE) } : life
}

export function signedKRW(amount: number): string {
  return `${amount >= 0 ? "+" : "−"}${formatKRW(Math.abs(amount))}`
}
