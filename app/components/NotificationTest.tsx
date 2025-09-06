'use client'

import { useState } from 'react'
import { 
  checkNotificationSupport, 
  requestNotificationPermission, 
  showNotification 
} from '../utils/notificationUtils'

export default function NotificationTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [support, setSupport] = useState(checkNotificationSupport())

  const runDiagnostics = () => {
    const diagnostics = []
    
    // 1. 기본 지원 여부
    diagnostics.push(`브라우저: ${support.browser}`)
    diagnostics.push(`알림 지원: ${support.isSupported ? '✅' : '❌'}`)
    diagnostics.push(`현재 권한: ${support.permission}`)
    diagnostics.push(`사용자 제스처 필요: ${support.requiresUserGesture ? '✅' : '❌'}`)
    
    // 2. 환경 정보
    diagnostics.push(`User Agent: ${navigator.userAgent}`)
    diagnostics.push(`HTTPS: ${location.protocol === 'https:' ? '✅' : '❌'}`)
    diagnostics.push(`Service Worker: ${'serviceWorker' in navigator ? '✅' : '❌'}`)
    
    setTestResult(diagnostics.join('\n'))
  }

  const testPermissionRequest = async () => {
    setTestResult('권한 요청 중...')
    const result = await requestNotificationPermission()
    setSupport(checkNotificationSupport())
    setTestResult(`권한 요청 결과: ${result.success ? '성공' : '실패'}\n${result.error || ''}`)
  }

  const testNotification = () => {
    const success = showNotification('테스트 알림', {
      body: 'Mac에서 알림이 정상적으로 표시되는지 테스트합니다.',
      tag: 'test-notification'
    })
    
    setTestResult(`알림 표시 ${success ? '성공' : '실패'}`)
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔔 알림 시스템 테스트</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            진단 실행
          </button>
          
          <button
            onClick={testPermissionRequest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!support.isSupported}
          >
            권한 요청 테스트
          </button>
          
          <button
            onClick={testNotification}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={support.permission !== 'granted'}
          >
            알림 테스트
          </button>
        </div>
        
        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">테스트 결과:</h3>
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Mac Safari 알림 활성화 방법:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Safari 메뉴 → 환경설정 (⌘,)</li>
            <li>2. '웹사이트' 탭 클릭</li>
            <li>3. 왼쪽 목록에서 '알림' 선택</li>
            <li>4. 현재 사이트를 '허용'으로 설정</li>
            <li>5. 페이지 새로고침 후 다시 테스트</li>
          </ol>
        </div>
      </div>
    </div>
  )
}