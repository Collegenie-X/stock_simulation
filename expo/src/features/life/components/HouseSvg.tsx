/**
 * 집 8단계 그림 (쪽방 → 마당 있는 집)
 * 불 켜진 창이 "내 방"이다. 단계가 오르면 내 몫의 창이 넓어진다.
 */
import Svg, { Circle, Line, Path, Rect } from "react-native-svg"

const LIT = "#fde68a"
const DARK = "#2b3346"
const GROUND = "#3a3a4a"
const GREEN = "#4ade80"

interface HouseSvgProps {
  stage: number
  width?: number
  /** 흐리게 (다른 길의 집, 지나온 집 등) */
  dim?: boolean
}

function Windows({ x, y, cols, rows, w, h, gap, lit }: { x: number; y: number; cols: number; rows: number; w: number; h: number; gap: number; lit: number[] }) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      cells.push(<Rect key={i} x={x + c * (w + gap)} y={y + r * (h + gap)} width={w} height={h} rx={1} fill={lit.includes(i) ? LIT : DARK} />)
    }
  }
  return <>{cells}</>
}

function Scene({ stage }: { stage: number }) {
  switch (stage) {
    case 1: // 쪽방 — 낮고 낡은 건물, 창도 없이 문틈으로 새는 불빛뿐
      return (
        <>
          <Rect x={22} y={44} width={76} height={24} rx={1} fill="#3f3f46" />
          <Path d="M20 44 L100 44 L96 38 L24 38 Z" fill="#52525b" />
          {[30, 48, 66, 84].map((x) => (
            <Rect key={x} x={x} y={52} width={8} height={16} fill={DARK} />
          ))}
          <Rect x={66} y={66} width={8} height={2} fill={LIT} />
          <Line x1={40} y1={38} x2={40} y2={30} stroke="#52525b" strokeWidth={2} />
        </>
      )
    case 2: // 고시원 — 좁고 높은 건물, 작은 창 하나
      return (
        <>
          <Rect x={46} y={10} width={28} height={58} rx={2} fill="#4b5563" />
          <Windows x={50} y={15} cols={3} rows={6} w={5} h={5} gap={2.5} lit={[10]} />
        </>
      )
    case 3: // 반지하 — 내 창이 땅에 반쯤 묻혀 있다
      return (
        <>
          <Rect x={32} y={26} width={56} height={46} rx={2} fill="#57534e" />
          <Windows x={38} y={32} cols={3} rows={2} w={12} h={9} gap={5} lit={[]} />
          <Rect x={38} y={62} width={16} height={9} rx={1} fill={LIT} />
        </>
      )
    case 4: // 원룸 — 창가에 화분 하나
      return (
        <>
          <Rect x={34} y={24} width={52} height={44} rx={2} fill="#78716c" />
          <Windows x={40} y={30} cols={2} rows={2} w={16} h={12} gap={8} lit={[1]} />
          <Circle cx={76} cy={41} r={2.5} fill={GREEN} />
          <Rect x={55} y={56} width={10} height={12} fill={DARK} />
        </>
      )
    case 5: // 투룸 빌라 — 창 두 개가 내 것
      return (
        <>
          <Rect x={26} y={22} width={68} height={46} rx={2} fill="#a8a29e" />
          <Windows x={32} y={28} cols={3} rows={2} w={15} h={12} gap={6} lit={[0, 1]} />
          <Rect x={55} y={58} width={10} height={10} fill={DARK} />
        </>
      )
    case 6: // 전세 아파트
      return (
        <>
          <Rect x={30} y={8} width={60} height={60} rx={2} fill="#94a3b8" />
          <Windows x={35} y={13} cols={4} rows={5} w={9} h={7} gap={4.5} lit={[9, 10]} />
        </>
      )
    case 7: // 내 집 — 베란다 정원
      return (
        <>
          <Path d="M24 36 L60 12 L96 36 Z" fill="#b45309" />
          <Rect x={30} y={36} width={60} height={32} fill="#fcd9a8" />
          <Windows x={36} y={42} cols={2} rows={1} w={18} h={12} gap={12} lit={[0, 1]} />
          <Rect x={55} y={54} width={10} height={14} fill="#92400e" />
          <Rect x={34} y={56} width={22} height={2} fill="#78716c" />
          <Circle cx={38} cy={54} r={2.5} fill={GREEN} />
          <Circle cx={45} cy={54} r={2.5} fill={GREEN} />
          <Circle cx={52} cy={54} r={2.5} fill={GREEN} />
        </>
      )
    default: // 마당 있는 집 — 나무 한 그루
      return (
        <>
          <Path d="M14 38 L46 14 L78 38 Z" fill="#b45309" />
          <Rect x={20} y={38} width={52} height={30} fill="#fcd9a8" />
          <Windows x={26} y={44} cols={2} rows={1} w={14} h={11} gap={14} lit={[0, 1]} />
          <Rect x={41} y={54} width={10} height={14} fill="#92400e" />
          <Rect x={94} y={44} width={4} height={24} fill="#92400e" />
          <Circle cx={96} cy={36} r={13} fill="#22c55e" />
          <Circle cx={88} cy={42} r={8} fill="#16a34a" />
          <Line x1={76} y1={62} x2={116} y2={62} stroke="#a8a29e" strokeWidth={1.5} />
        </>
      )
  }
}

export function HouseSvg({ stage, width = 120, dim = false }: HouseSvgProps) {
  return (
    <Svg width={width} height={(width * 80) / 120} viewBox="0 0 120 80" opacity={dim ? 0.55 : 1}>
      <Scene stage={stage} />
      {/* 땅 — 반지하는 땅이 창을 반쯤 가린다 */}
      <Rect x={0} y={stage === 3 ? 66 : 68} width={120} height={14} fill={GROUND} />
    </Svg>
  )
}
