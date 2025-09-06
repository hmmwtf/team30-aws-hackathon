/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 모드에서 API 로깅 비활성화
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // 개발 서버 로깅 최소화
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 불필요한 로그 제거
  experimental: {
    logging: {
      level: 'error'
    }
  }
}

module.exports = nextConfig