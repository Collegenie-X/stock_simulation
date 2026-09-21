/**
 * 게임 설정 화면 일러스트 (웹 app/practice/setup/illustrations.tsx 포팅)
 * - 인라인 <svg> → react-native-svg
 * - SMIL <animate> 는 RN 에서 지원되지 않아 RN Animated 로 동일한 값/주기를 재현
 */
import { forwardRef, useEffect, useRef, useState } from "react"
import { Animated, Easing } from "react-native"
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg"

// Animated 가 붙이는 collapsable={false} 가 웹에서 DOM 으로 새어 경고 창이 뜨므로 걸러낸다
const PlainCircle = forwardRef<any, any>(({ collapsable: _c, ...props }, ref) => <Circle ref={ref} {...props} />)
const PlainLine = forwardRef<any, any>(({ collapsable: _c, ...props }, ref) => <Line ref={ref} {...props} />)
PlainCircle.displayName = "PlainCircle"
PlainLine.displayName = "PlainLine"

const AnimatedCircle = Animated.createAnimatedComponent(PlainCircle)
const AnimatedLine = Animated.createAnimatedComponent(PlainLine)

/**
 * SMIL `values="a;b;a" dur="Ns" repeatCount="indefinite"` 대체
 * 0 → 1 → 0 을 duration(ms) 주기로 선형 반복하는 Animated.Value
 */
function useSvgLoop(active: boolean, duration: number, begin = 0) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!active) {
      v.setValue(0)
      return
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.linear, useNativeDriver: false }),
      ]),
    )
    const timer = setTimeout(() => anim.start(), begin)
    return () => {
      clearTimeout(timer)
      anim.stop()
    }
  }, [active, duration, begin, v])
  return v
}

const range = (v: Animated.Value, from: number, to: number) => v.interpolate({ inputRange: [0, 1], outputRange: [from, to] })

interface SceneProps {
  active?: boolean
  /** 웹의 w-full h-full 대체 (기본 100%) */
  size?: number | `${number}%`
}

// ============================================================
// Speed Mode scene illustrations
// ============================================================

export function SprintScene({ active = false, size = "100%" }: SceneProps) {
  const l1 = useSvgLoop(active, 600)
  const l2 = useSvgLoop(active, 500)
  const l3 = useSvgLoop(active, 700)
  const s1 = useSvgLoop(active, 1200)
  const s2 = useSvgLoop(active, 1500, 300)

  return (
    <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
      <Defs>
        <RadialGradient id="sprint-bg" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#fb923c" stopOpacity={active ? 0.5 : 0.25} />
          <Stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="sprint-bolt" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#fde047" />
          <Stop offset="100%" stopColor="#f97316" />
        </LinearGradient>
      </Defs>
      {/* Glow background */}
      <Circle cx={40} cy={36} r={32} fill="url(#sprint-bg)" />
      {/* Speed lines */}
      <G opacity={active ? 1 : 0.5}>
        <AnimatedLine x1={range(l1, 8, 14)} y1={22} x2={22} y2={22} stroke="#fb923c" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <AnimatedLine x1={range(l2, 6, 16)} y1={40} x2={26} y2={40} stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round" />
        <AnimatedLine x1={range(l3, 10, 18)} y1={56} x2={22} y2={56} stroke="#fb923c" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </G>
      {/* Lightning bolt */}
      <Path
        d="M48 12 L34 42 L44 42 L36 68 L60 34 L48 34 L56 12 Z"
        fill="url(#sprint-bolt)"
        stroke="#fff7ed"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      {active && (
        <>
          <AnimatedCircle cx={62} cy={20} r={1.5} fill="#fde047" opacity={s1} />
          <AnimatedCircle cx={68} cy={50} r={1.2} fill="#fb923c" opacity={s2} />
        </>
      )}
    </Svg>
  )
}

export function StandardScene({ active = false, size = "100%" }: SceneProps) {
  const sun = useSvgLoop(active, 2000)

  return (
    <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
      <Defs>
        <RadialGradient id="std-bg" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#3b82f6" stopOpacity={active ? 0.5 : 0.25} />
          <Stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="std-sun" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#fde047" />
          <Stop offset="100%" stopColor="#facc15" />
        </LinearGradient>
        <LinearGradient id="std-building" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#60a5fa" />
          <Stop offset="100%" stopColor="#1e40af" />
        </LinearGradient>
      </Defs>
      <Circle cx={40} cy={36} r={32} fill="url(#std-bg)" />
      {/* Sun */}
      <AnimatedCircle cx={58} cy={22} r={range(sun, 8, 9)} fill="url(#std-sun)" />
      <G stroke="#fde047" strokeWidth={1.5} strokeLinecap="round" opacity={0.7}>
        <Line x1={58} y1={8} x2={58} y2={11} />
        <Line x1={46} y1={22} x2={49} y2={22} />
        <Line x1={49} y1={13} x2={51} y2={15} />
        <Line x1={68} y1={13} x2={66} y2={15} />
      </G>
      {/* Buildings */}
      <Rect x={14} y={38} width={14} height={28} rx={1.5} fill="url(#std-building)" />
      <Rect x={30} y={30} width={16} height={36} rx={1.5} fill="url(#std-building)" />
      <Rect x={48} y={42} width={12} height={24} rx={1.5} fill="url(#std-building)" />
      {/* Windows */}
      <G fill="#fef3c7" opacity={0.85}>
        <Rect x={17} y={42} width={2.5} height={2.5} />
        <Rect x={22} y={42} width={2.5} height={2.5} />
        <Rect x={17} y={48} width={2.5} height={2.5} />
        <Rect x={22} y={48} width={2.5} height={2.5} />
        <Rect x={33} y={34} width={2.5} height={2.5} />
        <Rect x={38} y={34} width={2.5} height={2.5} />
        <Rect x={33} y={40} width={2.5} height={2.5} />
        <Rect x={38} y={40} width={2.5} height={2.5} />
        <Rect x={33} y={46} width={2.5} height={2.5} />
        <Rect x={38} y={46} width={2.5} height={2.5} />
        <Rect x={51} y={46} width={2} height={2} />
        <Rect x={55} y={46} width={2} height={2} />
        <Rect x={51} y={52} width={2} height={2} />
        <Rect x={55} y={52} width={2} height={2} />
      </G>
      {/* Ground */}
      <Rect x={6} y={66} width={68} height={2} rx={1} fill="#1e3a8a" />
    </Svg>
  )
}

const FLAG_PATHS = ["M48 30 L56 32 L48 35 Z", "M48 30 L56 31 L48 36 Z"] as const

export function MarathonScene({ active = false, size = "100%" }: SceneProps) {
  const st1 = useSvgLoop(active, 2000)
  const st2 = useSvgLoop(active, 1500)
  const st3 = useSvgLoop(active, 2500)

  // 깃발 펄럭임 (웹: path d 모핑 1.5s) → 두 형태를 0.75s 간격으로 교대
  const [flag, setFlag] = useState(0)
  useEffect(() => {
    if (!active) {
      setFlag(0)
      return
    }
    const id = setInterval(() => setFlag((f) => (f === 0 ? 1 : 0)), 750)
    return () => clearInterval(id)
  }, [active])

  return (
    <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
      <Defs>
        <RadialGradient id="mar-bg" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#a855f7" stopOpacity={active ? 0.5 : 0.25} />
          <Stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="mar-mtn" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c084fc" />
          <Stop offset="100%" stopColor="#6b21a8" />
        </LinearGradient>
        <LinearGradient id="mar-mtn2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#a78bfa" />
          <Stop offset="100%" stopColor="#5b21b6" />
        </LinearGradient>
      </Defs>
      <Circle cx={40} cy={36} r={32} fill="url(#mar-bg)" />
      {/* Moon */}
      <Circle cx={60} cy={20} r={6} fill="#fef3c7" opacity={0.9} />
      <Circle cx={62} cy={18} r={4} fill="#1e1b4b" opacity={0.5} />
      {/* Stars */}
      <G fill="#fde047">
        <AnimatedCircle cx={14} cy={14} r={0.8} fill="#fde047" opacity={active ? range(st1, 0.3, 1) : 1} />
        <AnimatedCircle cx={26} cy={20} r={0.6} fill="#fde047" opacity={active ? range(st2, 1, 0.3) : 1} />
        <AnimatedCircle cx={44} cy={10} r={0.7} fill="#fde047" opacity={active ? range(st3, 0.3, 1) : 1} />
      </G>
      {/* Back mountain */}
      <Path d="M2 66 L22 38 L40 56 L52 44 L78 66 Z" fill="url(#mar-mtn2)" opacity={0.7} />
      {/* Front mountain */}
      <Path d="M-2 68 L18 44 L34 60 L48 40 L66 58 L82 68 Z" fill="url(#mar-mtn)" />
      {/* Snow caps */}
      <Path d="M14 50 L18 44 L22 50 L20 51 L18 49 Z" fill="#fff" opacity={0.85} />
      <Path d="M44 46 L48 40 L52 46 L50 47 L48 45 Z" fill="#fff" opacity={0.85} />
      {/* Flag on peak */}
      <Line x1={48} y1={40} x2={48} y2={30} stroke="#fef3c7" strokeWidth={1} strokeLinecap="round" />
      <Path d={FLAG_PATHS[flag]} fill="#ef4444" />
      {/* Ground */}
      <Rect x={0} y={66} width={80} height={2} fill="#312e81" />
    </Svg>
  )
}

// ============================================================
// Coin stack illustrations for money tiers
// ============================================================

export function CoinStack({
  size = "small",
  active = false,
  premium = false,
}: {
  size?: "small" | "medium" | "large"
  active?: boolean
  premium?: boolean
}) {
  const stroke = premium ? "#a855f7" : "#eab308"
  const main = premium
    ? { top: "#e9d5ff", mid: "#c084fc", bot: "#7e22ce" }
    : { top: "#fef08a", mid: "#facc15", bot: "#a16207" }
  const layers = size === "small" ? 1 : size === "medium" ? 2 : 3
  const gradId = `coin-${size}-${premium}`
  const gradUrl = `url(#${gradId})`

  const sp1 = useSvgLoop(active, 1200)
  const sp2 = useSvgLoop(active, 1500)

  return (
    <Svg viewBox="0 0 48 36" width="100%" height="100%" fill="none">
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={main.top} />
          <Stop offset="50%" stopColor={main.mid} />
          <Stop offset="100%" stopColor={main.bot} />
        </LinearGradient>
      </Defs>
      {layers >= 3 && (
        <G transform="translate(0, 18)">
          <Ellipse cx={24} cy={6} rx={16} ry={4} fill={main.bot} />
          <Rect x={8} y={2} width={32} height={6} fill={gradUrl} />
          <Ellipse cx={24} cy={2} rx={16} ry={4} fill={gradUrl} stroke={stroke} strokeWidth={0.8} />
        </G>
      )}
      {layers >= 2 && (
        <G transform="translate(0, 10)">
          <Ellipse cx={24} cy={6} rx={14} ry={3.5} fill={main.bot} />
          <Rect x={10} y={2.5} width={28} height={5} fill={gradUrl} />
          <Ellipse cx={24} cy={2.5} rx={14} ry={3.5} fill={gradUrl} stroke={stroke} strokeWidth={0.8} />
        </G>
      )}
      <G transform={`translate(0, ${layers >= 2 ? 2 : 12})`}>
        <Ellipse cx={24} cy={6} rx={12} ry={3} fill={main.bot} />
        <Rect x={12} y={3} width={24} height={4} fill={gradUrl} />
        <Ellipse cx={24} cy={3} rx={12} ry={3} fill={gradUrl} stroke={stroke} strokeWidth={0.8} />
        <SvgText x={24} y={5} textAnchor="middle" fontSize={4} fontWeight="900" fill={premium ? "#581c87" : "#713f12"}>
          ₩
        </SvgText>
      </G>
      {active && (
        <>
          <AnimatedCircle cx={6} cy={4} r={1} fill={stroke} opacity={sp1} />
          <AnimatedCircle cx={42} cy={6} r={1.2} fill={stroke} opacity={range(sp2, 1, 0)} />
        </>
      )}
    </Svg>
  )
}

// ============================================================
// Daily opportunity scene (sun/moon arc)
// ============================================================

export function DayCycleScene({ count, active = false }: { count: 1 | 2; active?: boolean }) {
  const orb = useSvgLoop(active, count === 1 ? 2400 : 2000)
  const tw1 = useSvgLoop(active, 1500)
  const tw2 = useSvgLoop(active, 2000)

  return (
    <Svg viewBox="0 0 100 40" width="100%" height={40} fill="none">
      <Defs>
        <LinearGradient id={`sky-${count}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#1e3a8a" />
          <Stop offset="50%" stopColor="#0891b2" />
          <Stop offset="100%" stopColor="#1e1b4b" />
        </LinearGradient>
      </Defs>
      {/* Arc path */}
      <Path
        d="M5 35 Q 50 -5 95 35"
        stroke={active ? "#10b981" : "#475569"}
        strokeWidth={1}
        strokeDasharray="2 3"
        fill="none"
        opacity={0.6}
      />
      {count === 1 ? (
        <>
          {/* Single Moon (저녁 한 번) */}
          <G transform="translate(50, 18)">
            <AnimatedCircle r={range(orb, 7, 7.8)} fill="#e0e7ff" />
            <Circle cx={2} cy={-2} r={4.5} fill="#1e1b4b" opacity={0.6} />
            {/* Soft glow */}
            <Circle r={10} fill="#a5b4fc" opacity={active ? 0.18 : 0.08} />
          </G>
        </>
      ) : (
        <>
          {/* Sun */}
          <G transform="translate(20, 18)">
            <AnimatedCircle r={range(orb, 6, 6.8)} fill="#fde047" />
            <G stroke="#fde047" strokeWidth={1.2} strokeLinecap="round" opacity={0.7}>
              <Line x1={0} y1={-9} x2={0} y2={-7} />
              <Line x1={-9} y1={0} x2={-7} y2={0} />
              <Line x1={9} y1={0} x2={7} y2={0} />
              <Line x1={0} y1={9} x2={0} y2={7} />
            </G>
          </G>
          {/* Moon */}
          <G transform="translate(80, 18)">
            <Circle r={5.5} fill="#e0e7ff" />
            <Circle cx={1.5} cy={-1.5} r={3.5} fill="#1e1b4b" opacity={0.6} />
          </G>
        </>
      )}
      {active && (
        <>
          <AnimatedCircle cx={40} cy={6} r={0.8} fill="#fff" opacity={tw1} />
          <AnimatedCircle cx={65} cy={4} r={0.6} fill="#fff" opacity={range(tw2, 1, 0)} />
        </>
      )}
    </Svg>
  )
}
