import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 로깅 완전 비활성화 (개발 환경에서)
  return NextResponse.next()
}

export const config = {
  matcher: []
}