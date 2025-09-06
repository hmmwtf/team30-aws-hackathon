'use client'

import { useState, useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import EnhancedMannerFeedback from './EnhancedMannerFeedback'
import AlternativeSelector from './AlternativeSelector'
import CustomNotification from './CustomNotification'
import { Language, getTranslation } from '../lib/i18n'
import { Message } from '../../types/message'
import { Chat } from '../../types/chat'
import { getRandomLoadingMessage } from '../utils/loadingMessages'
import { showNotification, requestNotificationPermission } from '../utils/notificationUtils'

interface ChatInterfaceProps {
  targetCountry: string
  language: Language
  chatId?: string
  userId: string
  receiverLanguage?: string // 수신자 언어 추가
  relationship?: string // 채팅방에서 가져온 관계 정보
}

interface Alternative {
  text: string
  reason: string
  formalityLevel: 'formal' | 'semi-formal' | 'casual'
}

export default function ChatInterface({ targetCountry, language, chatId, userId, receiverLanguage, relationship = 'friend' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCopyToast, setShowCopyToast] = useState(false)
  // const [selectedRelationship, setSelectedRelationship] = useState('friend') // 제거 - 채팅방에서 가져옴
  const [showAlternatives, setShowAlternatives] = useState<{
    messageId: string
    alternatives: Alternative[]
    originalMessage: string
  } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const [loadingMessage] = useState(getRandomLoadingMessage())
  const [notification, setNotification] = useState<{
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  } | null>(null)

  useEffect(() => {
    // 브라우저 알림 권한 요청
    const initNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const result = await requestNotificationPermission()
        console.log('🔔 브라우저 알림 권한:', result.permission)
        if (result.success) {
          console.log('✅ 알림 권한 허용됨')
        } else {
          console.log('❌ 알림 권한 거부:', result.error)
        }
      }
    }
    
    initNotifications()
    
    if (!chatId) return

    // WebSocket 연결
    const ws = new WebSocket('ws://localhost:8080')
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      ws.send(JSON.stringify({
        type: 'join',
        userId,
        chatId
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        const newMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          chatId: chatId,
          userId: data.userId,
          text: data.message, // 이미 번역된 메시지
          timestamp: data.timestamp,
          isTranslated: true // 수신된 메시지는 번역된 상태
        }
        setMessages(prev => [...prev, newMessage])
        
        // 다른 사용자의 메시지일 때만 알림
        if (data.userId !== userId) {
          setNotification({
            title: '새 메시지',
            message: data.message,
            type: 'info'
          })
        }
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    // 기존 메시지 로드
    loadMessages()

    return () => {
      ws.close()
    }
  }, [chatId, userId])

  const loadMessages = async () => {
    if (!chatId) {
      console.log('🚫 메시지 로드 스킵: chatId 없음')
      return
    }
    
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      const data = await response.json()
      
      // 빈 메시지 필터링
      const validMessages = data.filter(msg => msg.text && msg.text.trim() !== '' && msg.text !== 'undefined')
      
      setMessages(validMessages)
    } catch (error) {
      console.error('😨 메시지 로드 실패:', error)
    }
  }

  // 복사 기능
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      setShowCopyToast(true)
      setTimeout(() => {
        setCopiedId(null)
        setShowCopyToast(false)
      }, 1500)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const handleSendMessage = async (text: string) => {
    console.log('🔍 ChatInterface - chatId:', chatId)
    
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: chatId || '',
      userId,
      text,
      timestamp: new Date().toISOString(),
      isPending: true,
      isAnalyzing: true
    }

    // 대기 중인 메시지 추가
    setMessages(prev => [...prev, newMessage])
    setCurrentInput('')

    try {
      // 🚀 새로운 채팅 분석 API 사용
      const requestBody = {
        message: text,
        chatId,
        senderEmail: userId // userId가 실제로는 email임
      }
      
      console.log('🔗 [RELATIONSHIP]:', relationship) // 관계 정보 로그
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch('/api/chat-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('😨 [API-ERROR]:', JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          body: errorText
        }, null, 2))
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📥 [API-SUCCESS]:', JSON.stringify({
        type: result.senderView.type,
        hasTranslation: !!result.senderView.translatedText,
        hasAlternatives: !!result.senderView.alternatives,
        alternativeCount: result.senderView.alternatives?.length || 0
      }, null, 2))
      
      // 분석 완료된 메시지로 업데이트 (번역 결과 포함)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                isAnalyzing: false,
                translatedText: result.senderView.translatedText,
                feedback: result.senderView,
                // 매너 체크 통과 시 자동 전송 준비
                isPending: result.senderView.type === 'warning' // warning이면 대기, good면 자동 전송
              }
            : msg
        )
      )
      
      console.log('📥 API Response result:', result)
      
      // 대안이 있으면 대안 선택 모달 표시
      if (result.senderView.type === 'warning') {
        if (result.senderView.alternatives && result.senderView.alternatives.length > 0) {
          // chat-analyze에서 바로 대안 제공
          setShowAlternatives({
            messageId: newMessage.id,
            alternatives: result.senderView.alternatives,
            originalMessage: text
          })
        } else {
          // 대안이 없으면 analyze-with-alternatives 호출
          try {
            const altResponse = await fetch('/api/analyze-with-alternatives', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, targetCountry, relationship, language })
            })
            const altResult = await altResponse.json()
            if (altResult.alternatives) {
              setShowAlternatives({
                messageId: newMessage.id,
                alternatives: altResult.alternatives,
                originalMessage: text
              })
            }
          } catch (error) {
            console.error('Failed to get alternatives:', error)
          }
        }
      } else if (result.senderView.type === 'good') {
        // 매너 체크 통과 시 자동으로 번역문 전송 및 DB 저장
        setTimeout(async () => {
          const messageToSend = result.senderView.translatedText || text
          
          try {
            // 1. DB에 메시지 저장
            // 빈 메시지 방지
            if (!messageToSend || messageToSend.trim() === '' || messageToSend === 'undefined') {
              console.log('⚠️ 빈 메시지 전송 방지')
              return
            }
            
            const saveResponse = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId,
                text: messageToSend,
                userId: userId,
                feedback: result.senderView
              })
            })
            
            // 2. WebSocket으로 전송 (실시간 업데이트)
            if (wsRef.current && isConnected && chatId) {
              console.log('🚀 전송 데이터:', {
                original: text,
                translated: messageToSend,
                targetCountry,
                sending: messageToSend
              })
              wsRef.current.send(JSON.stringify({
                type: 'message',
                message: messageToSend,
                userId,
                chatId
              }))
            }
            
            // 3. 메시지 상태 업데이트
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, isPending: false }
                  : msg
              )
            )
          } catch (error) {
            console.error('메시지 저장 실패:', error)
          }
        }, 1000) // 1초 후 자동 전송
      }
      
    } catch (error) {
      console.error('😨 [CHAT-ERROR]:', JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: text,
        targetCountry,
        timestamp: new Date().toISOString()
      }, null, 2))
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                isAnalyzing: false,
                isPending: true, // 사용자가 수동으로 전송 결정
                feedback: {
                  type: 'good' as const,
                  message: '분석 중 오류가 발생했습니다. 원문을 그대로 보내시겠습니까?'
                }
              }
            : msg
        )
      )
    }
  }

  const handleConfirmSend = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message && chatId) {
      // 번역문이 있으면 번역문만, 없으면 원문을 전송
      const messageToSend = message.translatedText || message.text
      
      // 빈 메시지 방지
      if (!messageToSend || messageToSend.trim() === '' || messageToSend === 'undefined') {
        console.log('⚠️ 빈 메시지 전송 방지')
        return
      }
      
      console.log('📤 전송할 메시지:', messageToSend)
      
      try {
        // 1. DB에 메시지 저장
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            text: messageToSend,
            userId,
            feedback: message.feedback
          })
        })
        
        // 2. WebSocket으로 전송
        if (wsRef.current && isConnected) {
          wsRef.current.send(JSON.stringify({
            type: 'message',
            message: messageToSend,
            userId,
            chatId
          }))
        }
      } catch (error) {
        console.error('메시지 저장 실패:', error)
      }
    }
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isPending: false }
          : msg
      )
    )
  }

  const handleCancelMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const handleAlternativeSelect = async (selectedText: string, translatedText?: string) => {
    if (!showAlternatives || !chatId) return
    
    const messageToSend = translatedText || selectedText
    
    // 빈 메시지 방지
    if (!messageToSend || messageToSend.trim() === '' || messageToSend === 'undefined') {
      console.log('⚠️ 빈 대안 메시지 전송 방지')
      return
    }
    
    try {
      // 1. DB에 메시지 저장
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          text: messageToSend,
          userId,
          feedback: { type: 'good', message: '👍 매너 굿! 선택한 표현이 적절합니다.' }
        })
      })
      
      // 2. WebSocket으로 전송
      if (wsRef.current && isConnected) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          message: messageToSend,
          userId,
          chatId
        }))
      }
    } catch (error) {
      console.error('대안 메시지 저장 실패:', error)
    }
    
    // 선택된 대안으로 메시지 업데이트
    setMessages(prev => 
      prev.map(msg => 
        msg.id === showAlternatives.messageId 
          ? { 
              ...msg, 
              text: selectedText, 
              translatedText: messageToSend,
              feedback: { 
                type: 'good', 
                message: '👍 매너 굿! 선택한 표현이 적절합니다.' 
              },
              isPending: false
            }
          : msg
      )
    )
    
    setShowAlternatives(null)
  }

  const handleAlternativeCancel = () => {
    if (showAlternatives) {
      // 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== showAlternatives.messageId))
    }
    setShowAlternatives(null)
  }



  const handleTranslateMessage = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTranslating: true } : msg
    ))

    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const response = await fetch('/api/translate-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.text,
          targetLanguage: language === 'ko' ? 'en' : 'ko',
          sourceLanguage: 'auto',
          targetCountry
        }),
      })
      
      const result = await response.json()
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              translation: result.translatedText,
              isTranslating: false,
              translationFeedback: result.mannerFeedback
            }
          : msg
      ))
    } catch (error) {
      console.error('Translation failed')
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isTranslating: false } : msg
      ))
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-500 text-white p-3"> {/* padding 축소 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{t('chatTitle')}</h2> {/* 폰트 축소 */}
            <p className="text-blue-100 text-sm">{t('chatSubtitle')}</p> {/* 폰트 축소 */}
          </div>
          <div className="flex items-center gap-2"> {/* gap 축소 */}
            <button
              onClick={() => {
                setNotification({
                  title: '테스트 알림',
                  message: '알림이 정상적으로 작동합니다! 🔔',
                  type: 'success'
                })
              }}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              title="알림 테스트"
            >
              🔔
            </button>
            <div className="flex items-center gap-1"> {/* gap 축소 */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div> {/* 크기 축소 */}
              <span className="text-xs">{isConnected ? '연결됨' : '연결 끊어짐'}</span> {/* 폰트 축소 */}
            </div>
          </div>
        </div>
      </div>
      
      {/* 불필요한 UI 요소 제거 - 채팅창 확대를 위해 */}
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3"> {/* padding과 spacing 축소 */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>대화를 시작해보세요!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`p-3 rounded-lg max-w-xs relative ${
                message.userId === userId ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'
              } ${
                message.isPending ? 'border-2 border-yellow-300' : ''
              }`}>

                {/* 복사 버튼 - 오른쪽 맨위 */}
                {(message.translatedText || message.translation) && (
                  <button
                    onClick={() => copyToClipboard(message.translatedText || message.translation!, message.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-300 hover:bg-gray-400 text-gray-600 rounded-full flex items-center justify-center text-xs transition-colors shadow-md"
                    title="번역 결과 복사"
                  >
                    {copiedId === message.id ? '✓' : '📋'}
                  </button>
                )}
                {message.isAnalyzing ? (
                  <div className="text-center">
                    <div className="flex justify-center items-center mb-2">
                      <div className="animate-bounce mr-1">🤖</div>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-2"></div>
                      <div className="animate-pulse">✨</div>
                    </div>
                    <p className="text-sm text-gray-600">{loadingMessage.main}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {loadingMessage.sub}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{message.text}</p>
                        {/* 발신자에게만 번역 결과 표시 */}
                        {message.userId === userId && message.translatedText && message.translatedText !== message.text && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm border-l-2 border-blue-300">
                            <p className="text-blue-600 text-xs">🌍 상대방에게 전송된 메시지:</p>
                            <p className="font-medium text-blue-800">{message.translatedText}</p>
                          </div>
                        )}
                        {/* 수신자에게는 이미 번역된 메시지만 표시 */}
                        {message.userId !== userId && message.isTranslated && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">🌍 번역된 메시지</p>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {message.userId === userId ? `나 (${userId})` : `상대방 (${message.userId})`}
                      </span>
                    </div>
                    {message.translation && (
                      <div className="mt-2 p-2 bg-white rounded text-sm">
                        <p className="text-gray-600 text-xs">{t('translatedMessage')}:</p>
                        <p className="font-medium">{message.translation}</p>
                      </div>
                    )}
                    
                    {message.isPending && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleConfirmSend(message.id)}
                          className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          ✓ {t('sendButtonText')}
                        </button>
                        <button
                          onClick={() => handleCancelMessage(message.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          ✗ {t('cancelButtonText')}
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {/* 매너 체크 피드백은 발신자에게만 표시 */}
              {message.feedback && message.userId === userId && (
                <EnhancedMannerFeedback 
                  feedback={message.feedback} 
                  language={language} 
                />
              )}
            </div>
          ))
        )}
      </div>
      
      <MessageInput
        value={currentInput}
        onChange={setCurrentInput}
        onSend={handleSendMessage}
        targetCountry={targetCountry}
        language={language}
      />
      
      {/* 복사 완료 토스트 */}
      {showCopyToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          복사 완료! 📋
        </div>
      )}
      
      {/* 대안 선택 모달 */}
      {showAlternatives && (
        <AlternativeSelector
          alternatives={showAlternatives.alternatives}
          originalMessage={showAlternatives.originalMessage}
          targetCountry={targetCountry}
          userLanguage={language} // 사용자 언어 전달
          receiverLanguage={receiverLanguage || 'en'} // 수신자 언어 동적 설정
          onSelect={handleAlternativeSelect}
          onCancel={handleAlternativeCancel}
        />
      )}
      
      {/* 커스텀 알림 */}
      {notification && (
        <CustomNotification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

