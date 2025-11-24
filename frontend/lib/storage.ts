/**
 * 로컬 스토리지 관리 유틸리티
 * 브라우저의 localStorage를 사용하여 게임 데이터를 저장하고 불러옵니다.
 */

// 스토리지 키 상수
const STORAGE_KEYS = {
  ONBOARDING_STATUS: "onboarding_complete",
  GUIDE_COMPLETE: "guide_complete",
  USER_PROFILE: "user_profile",
  PROGRESS: "user_progress",
  PORTFOLIO: "user_portfolio",
  CHARACTER: "character_data",
  GAME_SETTINGS: "game_settings",
  GAME_SESSION_PREFIX: "game_session_",
} as const

// 타입 정의
export interface UserProfile {
  investmentStyle?: "aggressive" | "conservative" | "balanced"
  riskTolerance?: string
  investmentGoal?: string
  learningStyle?: string
  [key: string]: any
}

export interface Character {
  type: "aggressive" | "conservative" | "balanced"
  level: number
  totalExp: number
  exp: number
  hearts: number
  streak: number
  achievements: string[]
  createdAt: string
}

export interface Progress {
  lessonsCompleted: number
  quizzesCompleted: number
  practiceCompleted: number
  [key: string]: any
}

export interface Portfolio {
  totalAssets: number
  cash: number
  stocks: Array<{
    symbol: string
    quantity: number
    avgPrice: number
  }>
  [key: string]: any
}

export interface GameSettings {
  difficulty?: "easy" | "medium" | "hard"
  soundEnabled?: boolean
  notificationsEnabled?: boolean
  [key: string]: any
}

export interface GameSession {
  scenarioId: string
  startTime: string
  currentTime: string
  portfolio: any
  history: any[]
  [key: string]: any
}

/**
 * 로컬 스토리지에서 데이터를 안전하게 가져오는 헬퍼 함수
 */
function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`스토리지 읽기 오류 [${key}]:`, error)
    return null
  }
}

/**
 * 로컬 스토리지에 데이터를 안전하게 저장하는 헬퍼 함수
 */
function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`스토리지 저장 오류 [${key}]:`, error)
  }
}

/**
 * 로컬 스토리지에서 데이터를 안전하게 삭제하는 헬퍼 함수
 */
function removeStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`스토리지 삭제 오류 [${key}]:`, error)
  }
}

/**
 * 스토리지 관리 객체
 */
export const storage = {
  // ===== 온보딩 관련 =====
  
  /**
   * 온보딩 완료 여부 확인
   */
  getOnboardingStatus(): boolean {
    const status = getStorageItem<boolean>(STORAGE_KEYS.ONBOARDING_STATUS)
    return status === true
  },

  /**
   * 온보딩 완료 상태로 설정
   */
  setOnboardingComplete(): void {
    setStorageItem(STORAGE_KEYS.ONBOARDING_STATUS, true)
  },

  /**
   * 온보딩 상태 초기화
   */
  resetOnboarding(): void {
    removeStorageItem(STORAGE_KEYS.ONBOARDING_STATUS)
  },

  // ===== 가이드 관련 =====

  /**
   * 가이드 완료 여부 확인
   */
  getGuideComplete(): boolean {
    const status = getStorageItem<boolean>(STORAGE_KEYS.GUIDE_COMPLETE)
    return status === true
  },

  /**
   * 가이드 완료 상태로 설정
   */
  setGuideComplete(): void {
    setStorageItem(STORAGE_KEYS.GUIDE_COMPLETE, true)
  },

  /**
   * 가이드 상태 초기화
   */
  resetGuide(): void {
    removeStorageItem(STORAGE_KEYS.GUIDE_COMPLETE)
  },

  // ===== 사용자 프로필 관련 =====

  /**
   * 사용자 프로필 가져오기
   */
  getUserProfile(): UserProfile | null {
    return getStorageItem<UserProfile>(STORAGE_KEYS.USER_PROFILE)
  },

  /**
   * 사용자 프로필 저장
   */
  setUserProfile(profile: UserProfile): void {
    setStorageItem(STORAGE_KEYS.USER_PROFILE, profile)
  },

  /**
   * 사용자 프로필 저장 (saveUserProfile alias)
   */
  saveUserProfile(profile: UserProfile): void {
    setStorageItem(STORAGE_KEYS.USER_PROFILE, profile)
  },

  /**
   * 사용자 프로필 삭제
   */
  clearUserProfile(): void {
    removeStorageItem(STORAGE_KEYS.USER_PROFILE)
  },

  // ===== 진행 상황 관련 =====

  /**
   * 사용자 진행 상황 가져오기
   */
  getProgress(): Progress | null {
    const progress = getStorageItem<Progress>(STORAGE_KEYS.PROGRESS)
    
    // 기본값 반환
    if (!progress) {
      return {
        lessonsCompleted: 0,
        quizzesCompleted: 0,
        practiceCompleted: 0,
      }
    }
    
    return progress
  },

  /**
   * 사용자 진행 상황 저장
   */
  setProgress(progress: Progress): void {
    setStorageItem(STORAGE_KEYS.PROGRESS, progress)
  },

  /**
   * 진행 상황 초기화
   */
  clearProgress(): void {
    removeStorageItem(STORAGE_KEYS.PROGRESS)
  },

  // ===== 포트폴리오 관련 =====

  /**
   * 사용자 포트폴리오 가져오기
   */
  getPortfolio(): Portfolio | null {
    const portfolio = getStorageItem<Portfolio>(STORAGE_KEYS.PORTFOLIO)
    
    // 기본값 반환
    if (!portfolio) {
      return {
        totalAssets: 10000000, // 초기 자금 1천만원
        cash: 10000000,
        stocks: [],
      }
    }
    
    return portfolio
  },

  /**
   * 사용자 포트폴리오 저장
   */
  setPortfolio(portfolio: Portfolio): void {
    setStorageItem(STORAGE_KEYS.PORTFOLIO, portfolio)
  },

  /**
   * 포트폴리오 초기화
   */
  clearPortfolio(): void {
    removeStorageItem(STORAGE_KEYS.PORTFOLIO)
  },

  // ===== 캐릭터 관련 =====

  /**
   * 캐릭터 데이터 가져오기
   */
  getCharacter(): Character | null {
    return getStorageItem<Character>(STORAGE_KEYS.CHARACTER)
  },

  /**
   * 캐릭터 데이터 저장
   */
  setCharacter(character: Character): void {
    setStorageItem(STORAGE_KEYS.CHARACTER, character)
  },

  /**
   * 캐릭터 데이터 삭제
   */
  clearCharacter(): void {
    removeStorageItem(STORAGE_KEYS.CHARACTER)
  },

  // ===== 게임 설정 관련 =====

  /**
   * 게임 설정 가져오기
   */
  getGameSettings(): GameSettings {
    const settings = getStorageItem<GameSettings>(STORAGE_KEYS.GAME_SETTINGS)
    
    // 기본값 반환
    if (!settings) {
      return {
        difficulty: "medium",
        soundEnabled: true,
        notificationsEnabled: true,
      }
    }
    
    return settings
  },

  /**
   * 게임 설정 저장
   */
  setGameSettings(settings: GameSettings): void {
    const currentSettings = this.getGameSettings()
    const newSettings = { ...currentSettings, ...settings }
    setStorageItem(STORAGE_KEYS.GAME_SETTINGS, newSettings)
  },

  /**
   * 게임 설정 초기화
   */
  clearGameSettings(): void {
    removeStorageItem(STORAGE_KEYS.GAME_SETTINGS)
  },

  // ===== 게임 세션 관련 =====

  /**
   * 특정 시나리오의 게임 세션 가져오기
   */
  getGameSession(scenarioId: string): GameSession | null {
    const key = `${STORAGE_KEYS.GAME_SESSION_PREFIX}${scenarioId}`
    return getStorageItem<GameSession>(key)
  },

  /**
   * 특정 시나리오의 게임 세션 저장
   */
  setGameSession(scenarioId: string, session: GameSession): void {
    const key = `${STORAGE_KEYS.GAME_SESSION_PREFIX}${scenarioId}`
    setStorageItem(key, session)
  },

  /**
   * 특정 시나리오의 게임 세션 삭제
   */
  clearGameSession(scenarioId: string): void {
    const key = `${STORAGE_KEYS.GAME_SESSION_PREFIX}${scenarioId}`
    removeStorageItem(key)
  },

  /**
   * 모든 게임 세션 삭제
   */
  clearAllGameSessions(): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEYS.GAME_SESSION_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("게임 세션 전체 삭제 오류:", error)
    }
  },

  // ===== 전체 데이터 관리 =====

  /**
   * 모든 게임 데이터 초기화
   */
  clearAll(): void {
    this.resetOnboarding()
    this.resetGuide()
    this.clearUserProfile()
    this.clearProgress()
    this.clearPortfolio()
    this.clearCharacter()
    this.clearGameSettings()
    this.clearAllGameSessions()
  },

  /**
   * 디버그: 모든 저장된 데이터 출력
   */
  debugPrintAll(): void {
    if (typeof window === "undefined") {
      console.log("서버 사이드 환경에서는 스토리지를 사용할 수 없습니다.")
      return
    }

    console.group("=== 스토리지 디버그 정보 ===")
    console.log("온보딩 상태:", this.getOnboardingStatus())
    console.log("가이드 완료:", this.getGuideComplete())
    console.log("사용자 프로필:", this.getUserProfile())
    console.log("진행 상황:", this.getProgress())
    console.log("포트폴리오:", this.getPortfolio())
    console.log("캐릭터:", this.getCharacter())
    console.log("게임 설정:", this.getGameSettings())
    console.groupEnd()
  },
}

