// 🚀 고성능 캐싱 시스템
class FastCache {
  private cache = new Map<string, any>()
  private maxSize = 1000 // 최대 1000개 캐시
  private ttl = 1000 * 60 * 30 // 30분 TTL

  generateKey(message: string, targetCountry: string, relationship: string): string {
    // 메시지를 정규화하여 캐시 히트율 향상
    const normalized = message.toLowerCase().trim().replace(/\s+/g, ' ')
    return `${normalized}:${targetCountry}:${relationship}`
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // TTL 체크
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  set(key: string, data: any): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 삭제 (LRU)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    })
  }

  // 자주 사용되는 표현들 미리 캐싱
  preloadCommonExpressions() {
    const commonExpressions = [
      { msg: '안녕하세요', country: 'US', rel: 'colleague' },
      { msg: '감사합니다', country: 'JP', rel: 'boss' },
      { msg: '죄송합니다', country: 'DE', rel: 'colleague' },
      { msg: '괜찮습니다', country: 'FR', rel: 'friend' }
    ]

    // 실제 운영에서는 이런 표현들을 미리 분석해서 캐시에 저장
    commonExpressions.forEach(expr => {
      const key = this.generateKey(expr.msg, expr.country, expr.rel)
      this.set(key, {
        type: 'good',
        message: '👍 매너 굿!',
        culturalReason: '일반적으로 적절한 표현입니다.',
        basicTranslation: expr.msg // 실제로는 번역된 텍스트
      })
    })
  }
}

export const fastCache = new FastCache()

// 앱 시작 시 공통 표현 미리 로드
if (typeof window === 'undefined') { // 서버 사이드에서만
  fastCache.preloadCommonExpressions()
}