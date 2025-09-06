import { NextRequest, NextResponse } from 'next/server'

// 온라인 상태 기능 비활성화 - WebSocket으로 처리
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Online status handled by WebSocket' 
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    onlineUsers: [],
    message: 'Online status handled by WebSocket'
  })
}