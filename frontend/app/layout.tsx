import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Geist, Geist_Mono } from 'next/font/google'

// 폰트 초기화
const geist = Geist({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist-mono',
  display: 'swap',
})

// 메타데이터 설정
export const metadata: Metadata = {
  title: '파도를 타라 - 투자 교육 게임',
  description: '엘리엇 파동 이론으로 배우는 주식 투자 시뮬레이션. 가상 자금으로 안전하게 투자를 배워보세요.',
  generator: 'Next.js',
  applicationName: '파도를 타라',
  keywords: ['주식', '투자', '교육', '시뮬레이션', '엘리엇 파동', '게임'],
  authors: [{ name: '파도를 타라 팀' }],
  creator: '파도를 타라',
  publisher: '파도를 타라',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA 관련 메타데이터
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '파도를 타라',
    startupImage: [
      {
        url: '/apple-icon.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  // 아이콘 설정
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/icon-dark-32x32.png',
  },
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: '파도를 타라 - 투자 교육 게임',
    description: '엘리엇 파동 이론으로 배우는 주식 투자 시뮬레이션',
    siteName: '파도를 타라',
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '파도를 타라 - 투자 교육 게임',
    description: '엘리엇 파동 이론으로 배우는 주식 투자 시뮬레이션',
  },
}

// 모바일 뷰포트 설정
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#191919' },
    { media: '(prefers-color-scheme: dark)', color: '#191919' },
  ],
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="ko" 
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* 모바일 최적화 메타 태그 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* iOS 상태바 스타일 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 안드로이드 테마 색상 */}
        <meta name="theme-color" content="#191919" />
        <meta name="msapplication-navbutton-color" content="#191919" />
        
        {/* 핸드오프 비활성화 (iOS) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body 
        className={`font-sans antialiased bg-[#191919] text-white min-h-screen-mobile`}
        suppressHydrationWarning
      >
        {/* 메인 앱 컨테이너 */}
        <div className="mobile-container min-h-screen-mobile">
          {children}
        </div>
        
        {/* 분석 */}
        <Analytics />
      </body>
    </html>
  )
}
