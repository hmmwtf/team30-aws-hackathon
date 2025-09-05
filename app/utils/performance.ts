// 성능 메트릭 수집
export interface PerformanceMetrics {
  requestId: string
  startTime: number
  endTime: number
  duration: number
  success: boolean
  errorType?: string
  country: string
  messageLength: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // 최대 100개 메트릭 저장

  startRequest(country: string, messageLength: number): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return requestId
  }

  endRequest(
    requestId: string, 
    startTime: number, 
    success: boolean, 
    country: string, 
    messageLength: number,
    errorType?: string
  ) {
    const endTime = Date.now()
    const duration = endTime - startTime

    const metric: PerformanceMetrics = {
      requestId,
      startTime,
      endTime,
      duration,
      success,
      errorType,
      country,
      messageLength
    }

    this.metrics.push(metric)
    
    // 메트릭 개수 제한
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // 성능 로깅
    console.log(`📊 [Performance] ${requestId}: ${duration}ms, Success: ${success}`)
    
    // 느린 요청 경고
    if (duration > 5000) {
      console.warn(`⚠️ [Performance] Slow request detected: ${duration}ms`)
    }
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0)
    return Math.round(total / this.metrics.length)
  }

  getSuccessRate(): number {
    if (this.metrics.length === 0) return 100
    const successful = this.metrics.filter(m => m.success).length
    return Math.round((successful / this.metrics.length) * 100)
  }

  getMetricsSummary() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      successRate: this.getSuccessRate(),
      recentMetrics: this.metrics.slice(-10) // 최근 10개
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()