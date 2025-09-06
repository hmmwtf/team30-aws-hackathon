import { NextRequest, NextResponse } from 'next/server'

// SSE 기능 비활성화 - WebSocket 사용으로 변경
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'SSE notifications disabled. Use WebSocket instead.' 
  }, { status: 410 })
}

// 레거시 함수들 (사용하지 않음)
export function sendNotification(userId: string, notification: any) {
  console.log('SSE sendNotification deprecated')
}

export function broadcastNotification(notification: any) {
  console.log('SSE broadcastNotification deprecated')
}