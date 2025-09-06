// 간단한 메모리 캐시 구현
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMs: number = 300000) { // 기본 5분
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

export const analysisCache = new SimpleCache()

// 캐시 키 생성 함수
export function createCacheKey(message: string, targetCountry: string, relationship: string): string {
  return `${message.toLowerCase().trim()}_${targetCountry}_${relationship}`
}