'use client'

import { useState } from 'react'

interface TestNotificationProps {
  userId: string
  chatId?: string
  wsRef: React.RefObject<WebSocket | null>
}

export default function TestNotification({ userId, chatId, wsRef }: TestNotificationProps) {
  const [isLoading, setIsLoading] = useState(false)

  const sendTestNotification = () => {
    if (!chatId || !wsRef.current) return
    
    setIsLoading(true)
    try {
      // WebSocket으로 직접 테스트 메시지 전송
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: '테스트 메시지입니다! 🔔',
        userId: 'test-user',
        chatId
      }))
      
      console.log('테스트 메시지 전송 완료')
    } catch (error) {
      console.error('테스트 메시지 전송 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!chatId) return null

  return (
    <div className="p-2 bg-yellow-100 border border-yellow-300 rounded">
      <p className="text-xs text-yellow-800 mb-2">개발 테스트용</p>
      <button
        onClick={sendTestNotification}
        disabled={isLoading}
        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
      >
        {isLoading ? '전송중...' : '🔔 테스트 알림 보내기'}
      </button>
    </div>
  )
}