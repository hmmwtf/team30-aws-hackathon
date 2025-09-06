import { NextRequest, NextResponse } from 'next/server'
import { sendNotification, broadcastNotification } from '../route'

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json()
    
    const { type, chatId, senderId, targetUserId } = notificationData
    
    if (targetUserId) {
      // 특정 사용자에게 알림 전송
      sendNotification(targetUserId, notificationData)
    } else if (chatId) {
      // 채팅방의 모든 사용자에게 브로드캐스트 (발신자 제외)
      broadcastNotification({
        ...notificationData,
        excludeUserId: senderId
      })
    } else {
      // 전체 브로드캐스트
      broadcastNotification(notificationData)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}