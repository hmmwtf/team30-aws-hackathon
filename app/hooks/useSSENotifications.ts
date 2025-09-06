import { useEffect, useRef, useState } from 'react'

interface NotificationData {
  type: string
  [key: string]: any
}

interface UseSSENotificationsProps {
  userId: string
  onNotification?: (data: NotificationData) => void
}

export function useSSENotifications({ userId, onNotification }: UseSSENotificationsProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!userId) return

    // SSE 연결 설정
    const eventSource = new EventSource(`/api/notifications?userId=${userId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data)
        
        // 연결 상태 메시지는 무시
        if (data.type === 'ping' || data.type === 'connected') return
        
        // 실제 알림만 로깅
        console.log('[SSE]', data.type, data.timestamp)
        
        // 실제 메시지 알림만 목록에 추가
        if (data.type === 'new_message' && data.message) {
          setNotifications(prev => [...prev.slice(-49), data]) // 최대 50개 유지
        }
        
        // 콜백 호출
        if (onNotification) {
          onNotification(data)
        }
        
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error')
      setIsConnected(false)
      // 재연결 로직 제거 - 브라우저가 자동으로 재연결 시도
    }

    // 초기 온라인 상태 설정 (한 번만)
    updateOnlineStatus(userId, 'online')

    // 페이지 언로드 시 오프라인 상태로 변경
    const handleBeforeUnload = () => {
      updateOnlineStatus(userId, 'offline')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
      // 컴포넌트 언마운트 시에만 오프라인 처리
      updateOnlineStatus(userId, 'offline')
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [userId, onNotification])

  // 알림 제거
  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  // 모든 알림 제거
  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    isConnected,
    notifications,
    removeNotification,
    clearNotifications
  }
}

// 온라인 상태 업데이트 헬퍼 함수 (디바운스 적용)
let updateTimeout: NodeJS.Timeout | null = null

async function updateOnlineStatus(userId: string, status: 'online' | 'offline', chatId?: string) {
  // 이전 요청 취소
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  
  // 1초 디바운스 적용
  updateTimeout = setTimeout(async () => {
    try {
      await fetch('/api/online-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, status, chatId })
      })
    } catch (error) {
      console.error('[SSE] Online status update failed')
    }
  }, 1000)
}