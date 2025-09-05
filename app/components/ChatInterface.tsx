'use client'

import { useState, useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import EnhancedMannerFeedback from './EnhancedMannerFeedback'

import RelationshipSelector from './RelationshipSelector'
import AlternativeSelector from './AlternativeSelector'
import { Language, getTranslation } from '../lib/i18n'
import { Message } from '../../types/message'
import { Chat } from '../../types/chat'

interface ChatInterfaceProps {
  targetCountry: string
  language: Language
  chatId?: string
  userId: string
}

interface Alternative {
  text: string
  reason: string
  formalityLevel: 'formal' | 'semi-formal' | 'casual'
}

export default function ChatInterface({ targetCountry, language, chatId, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState('friend')
  const [showAlternatives, setShowAlternatives] = useState<{
    messageId: string
    alternatives: Alternative[]
    originalMessage: string
  } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
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
          text: data.message,
          timestamp: data.timestamp
        }
        setMessages(prev => [...prev, newMessage])
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
    if (!chatId) return
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
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
    console.log('🔍 ChatInterface - targetCountry:', targetCountry)
    
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
      // 🚀 빠른 매너 체크 + 번역 (병렬 처리)
      const requestBody = {
        message: text,
        targetCountry,
        relationship: selectedRelationship,
        language
      }
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch('/api/fast-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📥 API Response:', result)
      
      // 분석 완료된 메시지로 업데이트 (번역 결과 포함)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                isAnalyzing: false,
                translatedText: result.basicTranslation,
                feedback: result
              }
            : msg
        )
      )
      
      // 대안이 있으면 대안 선택 모달 표시
      if (result.type === 'warning' && result.alternatives) {
        setShowAlternatives({
          messageId: newMessage.id,
          alternatives: result.alternatives,
          originalMessage: result.originalMessage || text
        })
      }
      
    } catch (error) {
      console.error('Translation/Analysis failed:', error)
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                isAnalyzing: false,
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

  const handleConfirmSend = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message && wsRef.current && isConnected && chatId) {
      // WebSocket으로 메시지 전송
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: message.translatedText || message.text,
        userId,
        chatId
      }))
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
    if (!showAlternatives) return
    
    // 선택된 대안으로 메시지 업데이트 (이미 번역된 텍스트 사용)
    setMessages(prev => 
      prev.map(msg => 
        msg.id === showAlternatives.messageId 
          ? { 
              ...msg, 
              text: selectedText, 
              translatedText: translatedText || selectedText,
              feedback: { 
                type: 'good', 
                message: '👍 매너 굿! 선택한 표현이 적절합니다.' 
              } 
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
      <div className="bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{t('chatTitle')}</h2>
            <p className="text-blue-100">{t('chatSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b">
        <RelationshipSelector 
          selectedRelationship={selectedRelationship}
          onRelationshipChange={setSelectedRelationship}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">🚀 빠른 분석 중... (2-3초)</p>
                    <div className="mt-2 text-xs text-gray-500">
                      매너 체크와 번역을 동시에 처리하고 있어요
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{t('originalMessage')}: {message.text}</p>
                      <span className="text-xs text-gray-500 ml-2">
                        {message.userId === userId ? 'You' : 'Friend'}
                      </span>
                    </div>
                    {message.translatedText && (
                      <div className="mt-2 p-2 bg-white rounded text-sm">
                        <p className="text-gray-600 text-xs">{t('translatedMessage')}:</p>
                        <p className="font-medium">{message.translatedText}</p>
                      </div>
                    )}
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
              {message.feedback && (
                <EnhancedMannerFeedback 
                  feedback={{
                    ...message.feedback,
                    confidence: message.feedback.confidence || 0.8
                  }} 
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
          onSelect={handleAlternativeSelect}
          onCancel={handleAlternativeCancel}
        />
      )}
    </div>
  )
}

