// 간단한 메모리 캐시로 중복 요청 방지
interface CacheEntry {
  result: any
  timestamp: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>()
  private maxAge = 5 * 60 * 1000 // 5분
  private maxSize = 100

  generateKey(message: string, country: string): string {
    return `${country}:${message.toLowerCase().trim()}`
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 만료된 캐시 삭제
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return entry.result
  }

  set(key: string, result: any): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge
    }
  }
}

export const analysisCache = new SimpleCache()