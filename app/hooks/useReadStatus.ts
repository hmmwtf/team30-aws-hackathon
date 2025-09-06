import { useEffect, useState } from 'react'

interface UseReadStatusProps {
  chatId: string
  userId: string
}

export function useReadStatus({ chatId, userId }: UseReadStatusProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!chatId || !userId) return

    // 읽지 않은 메시지 수 조회
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`/api/read-status?chatId=${chatId}&userId=${userId}`)
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()
    
    // 주기적으로 업데이트 (30초마다)
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [chatId, userId])

  // 메시지 읽음 처리
  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/read-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          userId,
          chatId,
          isRead: true
        })
      })
      
      // 읽지 않은 메시지 수 감소
      setUnreadCount(prev => Math.max(0, prev - 1))
      
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // 모든 메시지 읽음 처리
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      const messages = await response.json()
      
      // 모든 메시지를 읽음으로 표시
      await Promise.all(
        messages.map((message: any) => 
          fetch('/api/read-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messageId: message.id,
              userId,
              chatId,
              isRead: true
            })
          })
        )
      )
      
      setUnreadCount(0)
      
    } catch (error) {
      console.error('Error marking all messages as read:', error)
    }
  }

  return {
    unreadCount,
    markAsRead,
    markAllAsRead
  }
}