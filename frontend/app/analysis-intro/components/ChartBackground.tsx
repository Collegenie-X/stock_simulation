"use client"

import { useEffect, useRef } from "react"

interface Candle {
  x: number
  open: number
  close: number
  high: number
  low: number
  color: string
}

export default function ChartBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const handleResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    const candleCount = 40
    const candleW = W / candleCount
    let candles: Candle[] = []
    let drawProgress = 0
    let price = H * 0.5

    const generateCandles = () => {
      candles = []
      price = H * 0.45
      for (let i = 0; i < candleCount; i++) {
        const change = (Math.random() - 0.48) * 30
        const open = price
        price += change
        const close = price
        const high = Math.max(open, close) + Math.random() * 15
        const low = Math.min(open, close) - Math.random() * 15
        const isUp = close > open
        candles.push({
          x: i * candleW + candleW * 0.5,
          open,
          close,
          high,
          low,
          color: isUp ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.6)",
        })
      }
    }
    generateCandles()

    const particles: { x: number; y: number; vx: number; vy: number; life: number; emoji: string }[] = []
    const emojis = ["📈", "📉", "💰", "🎯", "⚡", "🔥", "💎", "🚀"]

    const spawnParticle = () => {
      if (particles.length > 12) return
      particles.push({
        x: Math.random() * W,
        y: H + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.3 + Math.random() * 0.7),
        life: 1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      frame++

      if (drawProgress < candleCount) {
        drawProgress += 0.3
      }

      const visibleCount = Math.min(Math.floor(drawProgress), candleCount)

      // grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.03)"
      ctx.lineWidth = 1
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // draw line
      if (visibleCount > 1) {
        ctx.beginPath()
        ctx.strokeStyle = "rgba(100,140,255,0.25)"
        ctx.lineWidth = 2
        for (let i = 0; i < visibleCount; i++) {
          const c = candles[i]
          const y = (c.open + c.close) / 2
          if (i === 0) ctx.moveTo(c.x, y)
          else ctx.lineTo(c.x, y)
        }
        ctx.stroke()

        // glow
        const lastVisible = candles[visibleCount - 1]
        const lastY = (lastVisible.open + lastVisible.close) / 2
        const grad = ctx.createRadialGradient(lastVisible.x, lastY, 0, lastVisible.x, lastY, 40)
        grad.addColorStop(0, "rgba(100,140,255,0.3)")
        grad.addColorStop(1, "rgba(100,140,255,0)")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(lastVisible.x, lastY, 40, 0, Math.PI * 2)
        ctx.fill()
      }

      // candlesticks
      for (let i = 0; i < visibleCount; i++) {
        const c = candles[i]
        const alpha = i === visibleCount - 1 ? Math.min(1, (drawProgress % 1) + 0.3) : 1
        ctx.globalAlpha = alpha * 0.7

        // wick
        ctx.strokeStyle = c.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(c.x, c.high)
        ctx.lineTo(c.x, c.low)
        ctx.stroke()

        // body
        const bodyTop = Math.min(c.open, c.close)
        const bodyH = Math.max(Math.abs(c.close - c.open), 2)
        ctx.fillStyle = c.color
        ctx.fillRect(c.x - candleW * 0.3, bodyTop, candleW * 0.6, bodyH)
      }
      ctx.globalAlpha = 1

      // particles
      if (frame % 60 === 0) spawnParticle()
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.002
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life * 0.4
        ctx.font = "20px serif"
        ctx.fillText(p.emoji, p.x, p.y)
      }
      ctx.globalAlpha = 1

      // regenerate when done
      if (drawProgress >= candleCount + 30) {
        drawProgress = 0
        generateCandles()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
