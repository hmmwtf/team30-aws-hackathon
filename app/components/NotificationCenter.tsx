'use client'

import { useState, useEffect } from 'react'
import { useSSENotifications } from '../hooks/useSSENotifications'
import { 
  checkNotificationSupport, 
  requestNotificationPermission, 
  showNotification,
  getNotificationInstructions 
} from '../utils/notificationUtils'

interface NotificationCenterProps {
  userId: string
  onNewMessage?: (data: any) => void
}

export default function NotificationCenter({ userId, onNewMessage }: NotificationCenterProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationSupport, setNotificationSupport] = useState(checkNotificationSupport())
  const [permissionStatus, setPermissionStatus] = useState<string>('')
  
  const { isConnected, notifications, removeNotification, clearNotifications } = useSSENotifications({
    userId,
    onNotification: (data) => {
      // 실제 메시지 알림만 처리 (연결 상태 알림 제외)
      if (data.type === 'new_message' && data.message && onNewMessage) {
        onNewMessage(data)
        
        // 개선된 브라우저 알림 표시
        const success = showNotification('새 메시지', {
          body: `${data.senderName || '상대방'}님이 메시지를 보냈습니다.`,
          tag: 'new-message'
        })
        
        if (!success) {
          console.log('Browser notification failed, using fallback')
        }
      }
    }
  })

  useEffect(() => {
    // 알림 지원 상태 주기적 체크
    const interval = setInterval(() => {
      const newSupport = checkNotificationSupport()
      if (newSupport.permission !== notificationSupport.permission) {
        setNotificationSupport(newSupport)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [notificationSupport.permission])

  // 개선된 브라우저 알림 권한 요청
  const handleRequestPermission = async () => {
    setPermissionStatus('요청 중...')
    
    const result = await requestNotificationPermission()
    
    if (result.success) {
      setPermissionStatus('알림이 허용되었습니다!')
      setNotificationSupport(checkNotificationSupport())
    } else {
      setPermissionStatus(result.error || '알림 허용 실패')
    }
    
    // 3초 후 상태 메시지 제거
    setTimeout(() => setPermissionStatus(''), 3000)
  }

  const unreadCount = notifications.filter(n => n.type === 'new_message' && n.message).length

  return (
    <div className="relative">
      {/* 연결 상태 표시 */}
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
           title={isConnected ? '연결됨' : '연결 끊김'} />
      
      {/* 알림 버튼 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-5 5v-5zM11 19H6.414a1 1 0 01-.707-.293L4 17V6a2 2 0 012-2h12a2 2 0 012 2v5" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 패널 */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">알림</h3>
              <div className="flex gap-2">
                {notificationSupport.permission !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={!notificationSupport.isSupported || permissionStatus === '요청 중...'}
                  >
                    알림 허용
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  모두 지우기
                </button>
              </div>
            </div>
            
            {/* 알림 상태 표시 */}
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  notificationSupport.permission === 'granted' ? 'bg-green-500' :
                  notificationSupport.permission === 'denied' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />
                <span>
                  {notificationSupport.permission === 'granted' ? '알림 허용됨' :
                   notificationSupport.permission === 'denied' ? '알림 차단됨' :
                   notificationSupport.isSupported ? '알림 권한 필요' : '알림 미지원'}
                  {notificationSupport.browser && ` (${notificationSupport.browser})`}
                </span>
              </div>
              
              {permissionStatus && (
                <div className="mt-1 text-blue-600">{permissionStatus}</div>
              )}
              
              {notificationSupport.permission === 'denied' && (
                <div className="mt-1 text-red-600">
                  {getNotificationInstructions(notificationSupport.browser)}
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {getNotificationTitle(notification)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getNotificationMessage(notification)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getNotificationTitle(notification: any): string {
  switch (notification.type) {
    case 'new_message':
      return '새 메시지'
    case 'user_online':
      return '사용자 접속'
    case 'user_offline':
      return '사용자 종료'
    case 'message_read':
      return '메시지 읽음'
    case 'manner_check_complete':
      return '매너 체크 완료'
    default:
      return '알림'
  }
}

function getNotificationMessage(notification: any): string {
  switch (notification.type) {
    case 'new_message':
      return `${notification.senderName || '상대방'}님이 메시지를 보냈습니다`
    case 'user_online':
      return `${notification.userId}님이 접속했습니다`
    case 'user_offline':
      return `${notification.userId}님이 종료했습니다`
    case 'message_read':
      return '메시지를 읽었습니다'
    case 'manner_check_complete':
      return notification.isAppropriate ? '매너 체크 통과' : '매너 체크 실패'
    default:
      return notification.message || '알림이 도착했습니다'
  }
}