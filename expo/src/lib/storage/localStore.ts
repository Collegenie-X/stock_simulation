/**
 * localStore — 웹의 localStorage 와 같은 "동기" API를 제공하는 저장소 어댑터
 *
 * - 메모리 캐시(Map)를 단일 진실 소스로 사용하고, AsyncStorage 에 write-through 합니다.
 * - 앱 시작 시 루트 레이아웃에서 `await localStore.hydrate()` 를 한 번 호출합니다.
 * - 추후 서버 연동 시: 이 파일의 persist 계층만 교체(또는 sync 훅 추가)하면
 *   화면 코드 변경 없이 서버 저장으로 전환할 수 있습니다.
 */
import AsyncStorage from "@react-native-async-storage/async-storage"

const NAMESPACE = "wave:"
const cache = new Map<string, string>()
let hydrated = false
let hydrating: Promise<void> | null = null

export const localStore = {
  get isHydrated() {
    return hydrated
  },

  /** AsyncStorage → 메모리 캐시 로드 (앱 시작 시 1회) */
  hydrate(): Promise<void> {
    if (hydrated) return Promise.resolve()
    if (!hydrating) {
      hydrating = (async () => {
        try {
          const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(NAMESPACE))
          const pairs = await AsyncStorage.multiGet(keys)
          for (const [k, v] of pairs) {
            if (v != null) cache.set(k.slice(NAMESPACE.length), v)
          }
        } catch (error) {
          console.error("스토리지 로드 오류:", error)
        } finally {
          hydrated = true
        }
      })()
    }
    return hydrating
  },

  getItem(key: string): string | null {
    return cache.has(key) ? (cache.get(key) as string) : null
  },

  setItem(key: string, value: string): void {
    cache.set(key, value)
    AsyncStorage.setItem(NAMESPACE + key, value).catch((e) => console.error(`스토리지 저장 오류 [${key}]:`, e))
  },

  removeItem(key: string): void {
    cache.delete(key)
    AsyncStorage.removeItem(NAMESPACE + key).catch((e) => console.error(`스토리지 삭제 오류 [${key}]:`, e))
  },

  keys(): string[] {
    return Array.from(cache.keys())
  },

  clear(): void {
    const keys = this.keys()
    cache.clear()
    AsyncStorage.multiRemove(keys.map((k) => NAMESPACE + k)).catch((e) => console.error("스토리지 초기화 오류:", e))
  },

  /** JSON 헬퍼 */
  getJSON<T>(key: string): T | null {
    try {
      const item = this.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch (error) {
      console.error(`스토리지 읽기 오류 [${key}]:`, error)
      return null
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`스토리지 저장 오류 [${key}]:`, error)
    }
  },
}
