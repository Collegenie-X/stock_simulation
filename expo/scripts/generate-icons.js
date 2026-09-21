// 파도를 타라 — 런처 아이콘 생성기 (차트 선 = 파도 등선)
// 실행: npm i -D @resvg/resvg-js && node scripts/generate-icons.js
const fs = require("fs")
const path = require("path")
const { Resvg } = require("@resvg/resvg-js")

const OUT = process.argv[2] || path.join(__dirname, "../assets/images")
fs.mkdirSync(OUT, { recursive: true })

// 1024 기준 좌표. 지그재그 차트가 올라가다 파도 마루로 말린다.
const ZIG = "M150 700 L285 590 L350 648 L485 462 L548 522 L640 372"
const CREST = "C700 268 822 230 884 300 C940 366 912 474 826 494 C774 506 728 476 720 428"
const LINE = `${ZIG} ${CREST}`
// 파도 몸통: 등선 → 마루 → 말린 끝 → 안쪽 면(속이 빈 곡면) → 바닥
const BODY = `${LINE} C768 450 838 424 824 362 C810 310 728 318 694 378 C640 470 668 640 900 770 C810 735 720 815 620 782 S420 742 330 778 S200 802 150 772 Z`
const SWELL = "M190 868 C270 832 350 832 430 866 S590 902 670 866 S790 834 850 856"

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1f1a"/><stop offset="1" stop-color="#050807"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.68" cy="0.36" r="0.6">
      <stop offset="0" stop-color="#22c55e" stop-opacity="0.34"/><stop offset="1" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34d399" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="#10b981" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#0891b2" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22d3ee"/><stop offset="0.5" stop-color="#4ade80"/><stop offset="1" stop-color="#ecfdf5"/>
    </linearGradient>
  </defs>`

const glyph = `
  <path d="${BODY}" fill="url(#body)"/>
  <path d="${SWELL}" fill="none" stroke="#22d3ee" stroke-opacity="0.45" stroke-width="22" stroke-linecap="round"/>
  <path d="${LINE}" fill="none" stroke="#22c55e" stroke-opacity="0.28" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${LINE}" fill="none" stroke="url(#line)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="720" cy="428" r="46" fill="#4ade80" fill-opacity="0.3"/>
  <circle cx="720" cy="428" r="26" fill="#ffffff"/>`

const mono = `
  <path d="${BODY}" fill="#fff" fill-opacity="0.35"/>
  <path d="${SWELL}" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round"/>
  <path d="${LINE}" fill="none" stroke="#fff" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="720" cy="428" r="30" fill="#fff"/>`

const bgRect = `<rect width="1024" height="1024" fill="url(#bg)"/><rect width="1024" height="1024" fill="url(#glow)"/>`
// 글리프 중심(≈518,545)을 캔버스 중심으로 옮기고 s 배율
const place = (inner, s) => `<g transform="translate(512 512) scale(${s}) translate(-518 -548)">${inner}</g>`
const svg = (inner, vb = "0 0 1024 1024") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${defs}${inner}</svg>`

const files = {
  "icon.png": [svg(bgRect + place(glyph, 1.0)), 1024],
  "android-icon-background.png": [svg(bgRect), 1024],
  "android-icon-foreground.png": [svg(place(glyph, 0.76)), 1024], // 원형 마스크 안에 꽉 차게
  "android-icon-monochrome.png": [svg(place(mono, 0.76)), 1024],
  "splash-icon.png": [svg(glyph, "110 230 820 680"), 820],
  "favicon.png": [svg(`<rect width="1024" height="1024" rx="220" fill="url(#bg)"/>` + place(glyph, 1.08)), 96],
}
for (const [name, [src, w]] of Object.entries(files)) {
  const png = new Resvg(src, { fitTo: { mode: "width", value: w } }).render().asPng()
  fs.writeFileSync(path.join(OUT, name), png)
}
// iOS Icon Composer 레이어 (배경은 icon.json fill 이 담당)
fs.writeFileSync(path.join(__dirname, "../assets/expo.icon/Assets/wave-chart.svg"), svg(place(glyph, 1.0)))
console.log("ok →", OUT)
