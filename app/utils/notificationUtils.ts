// 브라우저별 알림 호환성 체크 및 처리 유틸리티

export interface NotificationSupport {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  requiresUserGesture: boolean
  browser: string
}

export function checkNotificationSupport(): NotificationSupport {
  const userAgent = navigator.userAgent.toLowerCase()
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
  const isChrome = /chrome/.test(userAgent)
  const isFirefox = /firefox/.test(userAgent)
  const isMac = /mac/.test(userAgent)
  
  let browser = 'unknown'
  if (isSafari) browser = 'safari'
  else if (isChrome) browser = 'chrome'
  else if (isFirefox) browser = 'firefox'

  // 기본 지원 여부 확인
  if (!('Notification' in window)) {
    return {
      isSupported: false,
      permission: 'unsupported',
      requiresUserGesture: false,
      browser
    }
  }

  return {
    isSupported: true,
    permission: Notification.permission,
    requiresUserGesture: isSafari || isMac, // Safari와 Mac은 사용자 제스처 필요
    browser
  }
}

export async function requestNotificationPermission(): Promise<{
  success: boolean
  permission: NotificationPermission | 'unsupported'
  error?: string
}> {
  const support = checkNotificationSupport()
  
  if (!support.isSupported) {
    return {
      success: false,
      permission: 'unsupported',
      error: '이 브라우저는 알림을 지원하지 않습니다.'
    }
  }

  if (support.permission === 'granted') {
    return {
      success: true,
      permission: 'granted'
    }
  }

  if (support.permission === 'denied') {
    return {
      success: false,
      permission: 'denied',
      error: '알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.'
    }
  }

  try {
    // Safari/Mac에서는 사용자 제스처가 필요함
    const permission = await Notification.requestPermission()
    
    return {
      success: permission === 'granted',
      permission,
      error: permission === 'denied' ? '사용자가 알림을 거부했습니다.' : undefined
    }
  } catch (error) {
    console.error('Notification permission request failed:', error)
    return {
      success: false,
      permission: 'default',
      error: '알림 권한 요청 중 오류가 발생했습니다.'
    }
  }
}

export function showNotification(title: string, options: NotificationOptions = {}): boolean {
  const support = checkNotificationSupport()
  
  if (!support.isSupported || support.permission !== 'granted') {
    console.warn('Notifications not supported or not permitted')
    return false
  }

  try {
    // Mac Safari에서 더 안정적인 옵션 설정
    const notificationOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'culture-chat',
      requireInteraction: false, // Mac에서 자동 닫힘 허용
      silent: false,
      ...options
    }

    const notification = new Notification(title, notificationOptions)
    
    // Mac Safari에서 알림 클릭 처리
    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      notification.close()
    }

    // 자동 닫힘 (Mac Safari 호환성)
    setTimeout(() => {
      notification.close()
    }, 5000)

    return true
  } catch (error) {
    console.error('Failed to show notification:', error)
    return false
  }
}

export function getNotificationInstructions(browser: string): string {
  switch (browser) {
    case 'safari':
      return 'Safari > 환경설정 > 웹사이트 > 알림에서 허용해주세요.'
    case 'chrome':
      return '주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림을 허용해주세요.'
    case 'firefox':
      return '주소창의 방패 아이콘을 클릭하여 알림을 허용해주세요.'
    default:
      return '브라우저 설정에서 이 사이트의 알림을 허용해주세요.'
  }
}