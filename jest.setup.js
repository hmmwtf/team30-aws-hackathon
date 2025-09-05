import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Node.js globals for Next.js API routes
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js Request/Response
Object.defineProperty(global, 'Request', {
  value: class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map(Object.entries(options.headers || {}))
      this._body = options.body
    }
    async json() {
      return JSON.parse(this._body)
    }
  }
})

// i18n 모킹
jest.mock('./app/lib/i18n', () => ({
  getTranslation: jest.fn((language, key) => {
    const mockTranslations = {
      title: 'title',
      subtitle: 'subtitle',
      selectCountry: 'selectCountry',
      culturalCheck: 'culturalCheck',
      chatTitle: '채팅 창',
      chatSubtitle: '메시지를 입력하면 문화적 매너를 체크해드립니다',
      inputPlaceholder: '메시지를 입력하세요...',
      sendButton: '전송',
      analyzing: '분석중...',
      mannerGood: '👍 매너 굿! 문화적으로 적절한 표현이에요',
      translateMessage: '메시지 번역',
      translating: '번역중...',
      translatedMessage: '번역된 메시지'
    }
    return mockTranslations[key] || key
  }),
  languages: {
    ko: { name: '한국어', flag: '🇰🇷' },
    en: { name: 'English', flag: '🇺🇸' },
    ja: { name: '日本語', flag: '🇯🇵' },
    zh: { name: '中文', flag: '🇨🇳' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    fr: { name: 'Français', flag: '🇫🇷' }
  },
  Language: 'ko'
}))