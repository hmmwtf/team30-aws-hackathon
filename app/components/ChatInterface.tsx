'use client'

import { useState, useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import MannerFeedback from './MannerFeedback'
import TranslationHistory, { addToHistory } from './TranslationHistory'
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
    if (!wsRef.current || !isConnected || !chatId) return

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      chatId,
      userId,
      text,
      timestamp: new Date().toISOString(),
      isPending: true,
      isAnalyzing: true
    }

    setMessages(prev => [...prev, tempMessage])
    setCurrentInput('')

    try {
      // 매너 분석
      const analyzeResponse = await fetch('/api/analyze-with-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          targetCountry,
          relationship: selectedRelationship,
          language
        })
      })
      
      const analyzeResult = await analyzeResponse.json()
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, isAnalyzing: false, feedback: analyzeResult }
            : msg
        )
      )
      
      if (analyzeResult.type === 'warning' && analyzeResult.alternatives) {
        setShowAlternatives({
          messageId: tempMessage.id,
          alternatives: analyzeResult.alternatives,
          originalMessage: text
        })
        return
      }
      
      // 매너 체크 통과 시 WebSocket으로 전송
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: text,
        userId,
        chatId
      }))
      
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      
    } catch (error) {
      console.error('Message send failed:', error)
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
    }
  }

  const handleConfirmSend = (messageId: string) => {
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

  const handleAlternativeSelect = async (selectedText: string) => {
    if (!showAlternatives || !wsRef.current || !isConnected) return
    
    // WebSocket으로 선택된 대안 전송
    wsRef.current.send(JSON.stringify({
      type: 'message',
      message: selectedText,
      userId,
      chatId
    }))
    
    // 임시 메시지 제거
    setMessages(prev => prev.filter(msg => msg.id !== showAlternatives.messageId))
    setShowAlternatives(null)
  }

  const handleAlternativeCancel = () => {
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`p-3 rounded-lg max-w-xs ml-auto relative ${
              message.isPending ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-blue-100'
            }`}>
              {/* 복사 버튼 - 오른쪽 맨위 */}
              {message.translatedText && (
                <button
                  onClick={() => copyToClipboard(message.translatedText!, message.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-300 hover:bg-gray-400 text-gray-600 rounded-full flex items-center justify-center text-xs transition-colors shadow-md"
                  title="번역 결과 복사"
                >
                  {copiedId === message.id ? '✓' : '📋'}
                </button>
              )}
              {message.isAnalyzing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">{t('analyzingMessage')}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{message.text}</p>
                    <span className="text-xs text-gray-500 ml-2">
                      {message.userId === userId ? 'You' : 'Friend'}
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
            {message.feedback && (
              <MannerFeedback feedback={message.feedback} language={language} />
            )}
          </div>
        ))}
      </div>
      
      
      <MessageInput
        value={currentInput}
        onChange={setCurrentInput}
        onSend={handleSendMessage}
        targetCountry={targetCountry}
        language={language}
      />
      
      <TranslationHistory language={language} />
      
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
          onSelect={handleAlternativeSelect}
          onCancel={handleAlternativeCancel}
        />
      )}
    </div>
  )
}

