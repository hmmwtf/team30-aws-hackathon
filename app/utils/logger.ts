type LogLevel = 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private level: LogLevel
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.level = (process.env.LOG_LEVEL as LogLevel) || (this.isDev ? 'debug' : 'error')
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 }
    return levels[level] <= levels[this.level]
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, data || '')
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, data || '')
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, data || '')
    }
  }

  // SSE 연결은 너무 빈번하므로 별도 처리
  sse(message: string, userId?: string) {
    if (this.isDev && this.shouldLog('debug')) {
      console.log(`[SSE] ${message}${userId ? ` (${userId})` : ''}`)
    }
  }
}

export const logger = new Logger()