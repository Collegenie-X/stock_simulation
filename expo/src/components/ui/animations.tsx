/**
 * 공통 애니메이션 래퍼 — 웹 globals.css 의 @keyframes / animate-* 클래스를 대체합니다.
 *
 *  웹 클래스                    → 앱 컴포넌트
 *  animate-fadeUp / slideUp     → <FadeUp>
 *  animate-in fade-in           → <FadeIn>
 *  animate-bounceIn / pop       → <BounceIn> / <Pop>
 *  animate-pulse                → <Pulse>
 *  animate-float / bounce       → <Float>
 *  animate-ping(-slow)          → <Ping>
 *  animate-shake / wiggle       → <Shake> / <Wiggle>
 *  animate-spin                 → <Spin>
 *  animate-heartbeat            → <Heartbeat>
 */
import React, { useEffect, useRef } from "react"
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native"

const ND = true // useNativeDriver
const ENTER_EASING = Easing.out(Easing.cubic)
const LOOP_EASING = Easing.inOut(Easing.ease)

interface BaseProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  delay?: number
  duration?: number
}

// 주의: easing 함수는 매 렌더마다 새로 만들어지므로 effect 의존성에 넣으면
// 부모가 리렌더링될 때마다 애니메이션이 재시작된다 → ref 로 고정하고 마운트 시 1회만 실행.
function useEnter(duration: number, delay: number, easing: (t: number) => number = ENTER_EASING) {
  const v = useRef(new Animated.Value(0)).current
  const cfg = useRef({ duration, delay, easing }).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: cfg.duration, delay: cfg.delay, easing: cfg.easing, useNativeDriver: ND })
    anim.start()
    return () => anim.stop()
  }, [v, cfg])
  return v
}

function useLoop(durationIn: number, delayIn = 0, easingIn: (t: number) => number = LOOP_EASING, yoyoIn = true) {
  const v = useRef(new Animated.Value(0)).current
  const cfg = useRef({ duration: durationIn, delay: delayIn, easing: easingIn, yoyo: yoyoIn }).current
  useEffect(() => {
    const { duration, delay, easing, yoyo } = cfg
    const seq = yoyo
      ? Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing, useNativeDriver: ND }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing, useNativeDriver: ND }),
        ])
      : Animated.sequence([
          Animated.timing(v, { toValue: 1, duration, easing, useNativeDriver: ND }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: ND }),
        ])
    const anim = Animated.loop(seq)
    const t = setTimeout(() => anim.start(), delay)
    return () => {
      clearTimeout(t)
      anim.stop()
    }
  }, [v, cfg])
  return v
}

/** 아래에서 위로 올라오며 나타남 */
export function FadeUp({ children, style, delay = 0, duration = 450, distance = 16 }: BaseProps & { distance?: number }) {
  const v = useEnter(duration, delay)
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  )
}

/** 옆에서 슬라이드 인 (from: 시작 X 오프셋) */
export function SlideIn({ children, style, delay = 0, duration = 350, from = 24 }: BaseProps & { from?: number }) {
  const v = useEnter(duration, delay)
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  )
}

export function FadeIn({ children, style, delay = 0, duration = 300 }: BaseProps) {
  const v = useEnter(duration, delay)
  return <Animated.View style={[style, { opacity: v }]}>{children}</Animated.View>
}

/** 통통 튀며 등장 */
export function BounceIn({ children, style, delay = 0, duration = 500 }: BaseProps) {
  const v = useEnter(duration, delay, Easing.out(Easing.back(2)))
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/** 빠르게 팝 등장 */
export function Pop({ children, style, delay = 0, duration = 350 }: BaseProps) {
  const v = useEnter(duration, delay, Easing.out(Easing.back(1.6)))
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
    >
      {children}
    </Animated.View>
  )
}

/** 투명도 반복 (animate-pulse) */
export function Pulse({ children, style, delay = 0, duration = 2000, min = 0.5 }: BaseProps & { min?: number }) {
  const v = useLoop(duration, delay)
  return (
    <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, min] }) }]}>
      {children}
    </Animated.View>
  )
}

/** 위아래 둥둥 (animate-float / animate-bounce) */
export function Float({ children, style, delay = 0, duration = 2500, distance = 10 }: BaseProps & { distance?: number }) {
  const v = useLoop(duration, delay)
  return (
    <Animated.View
      style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }] }]}
    >
      {children}
    </Animated.View>
  )
}

/** 퍼져나가는 링 (animate-ping) — 보통 absolute 위치의 원에 사용 */
export function Ping({ children, style, delay = 0, duration = 1500, scaleTo = 2 }: BaseProps & { scaleTo?: number }) {
  const v = useLoop(duration, delay, Easing.out(Easing.ease), false)
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/** 크기 반복 (animate-heartbeat / glowPulse) */
export function Heartbeat({ children, style, delay = 0, duration = 1400, scaleTo = 1.12 }: BaseProps & { scaleTo?: number }) {
  const v = useLoop(duration, delay)
  return (
    <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) }] }]}>
      {children}
    </Animated.View>
  )
}

/** 좌우 흔들림 1회 (trigger 값이 바뀔 때마다 재생) */
export function Shake({ children, style, trigger, distance = 6 }: BaseProps & { trigger?: unknown; distance?: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    v.setValue(0)
    const anim = Animated.timing(v, { toValue: 1, duration: 400, easing: Easing.linear, useNativeDriver: ND })
    anim.start()
    return () => anim.stop()
  }, [v, trigger])
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -distance, distance, -distance, distance, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/** 회전 반복 흔들림 (animate-wiggle / flameJitter / timer-shake) */
export function Wiggle({ children, style, delay = 0, duration = 600, degrees = 6 }: BaseProps & { degrees?: number }) {
  const v = useLoop(duration, delay)
  return (
    <Animated.View
      style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`-${degrees}deg`, `${degrees}deg`] }) }] }]}
    >
      {children}
    </Animated.View>
  )
}

export function Spin({ children, style, duration = 1000 }: BaseProps) {
  const v = useLoop(duration, 0, Easing.linear, false)
  return (
    <Animated.View style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
      {children}
    </Animated.View>
  )
}

/** 위로 떠오르며 사라짐 (animate-rise / scorePop / comboPop) — 1회성 이펙트 */
export function RiseOut({ children, style, delay = 0, duration = 1400, distance = 60, onDone }: BaseProps & { distance?: number; onDone?: () => void }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.ease), useNativeDriver: ND })
    anim.start(({ finished }) => finished && onDone?.())
    return () => anim.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) },
            { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 1.15, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/** 화면 플래시 (animate-screenFlash) */
export function Flash({ style, color = "#ffffff", duration = 400, onDone }: { style?: StyleProp<ViewStyle>; color?: string; duration?: number; onDone?: () => void }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: duration * 0.25, useNativeDriver: ND }),
      Animated.timing(v, { toValue: 0, duration: duration * 0.75, useNativeDriver: ND }),
    ])
    anim.start(({ finished }) => finished && onDone?.())
    return () => anim.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color }, style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}
    />
  )
}
