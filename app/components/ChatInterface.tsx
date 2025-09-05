'use client'

import { useState } from 'react'
import MessageInput from './MessageInput'
import MannerFeedback from './MannerFeedback'
import { Language, getTranslation } from '../lib/i18n'

interface ChatInterfaceProps {
  targetCountry: string
  language: Language
  onMessageSent?: () => void
}

interface Message {
  id: string
  text: string
  timestamp: Date
  translation?: string
  isTranslating?: boolean
  feedback?: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
  translationFeedback?: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
  isPending?: boolean
  translatedText?: string
  isAnalyzing?: boolean
  suggestedText?: string
  suggestedTranslation?: string
}

export default function ChatInterface({ targetCountry, language, onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')

  const t = (key: string) => getTranslation(language, key)

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isPending: true,
      isAnalyzing: true
    }

    // 대기 중인 메시지 추가
    setMessages(prev => [...prev, newMessage])
    setCurrentInput('')

    try {
      // 번역 + 매너 체크 동시 진행
      const response = await fetch('/api/translate-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: '', // 서버에서 대상 국가에 따라 결정
          sourceLanguage: 'auto',
          targetCountry,
          userLanguage: language // 사용자 인터페이스 언어
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // 분석 완료된 메시지로 업데이트
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                isAnalyzing: false,
                translatedText: result.translatedText,
                feedback: result.mannerFeedback
              }
            : msg
        )
      )
      
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
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isPending: false }
          : msg
      )
    )
    onMessageSent?.()
  }

  const handleCancelMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
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
        <h2 className="text-xl font-semibold">{t('chatTitle')}</h2>
        <p className="text-blue-100">{t('chatSubtitle')}</p>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`p-3 rounded-lg max-w-xs ml-auto relative group ${
              message.isPending ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-blue-100'
            }`}>
              {message.isAnalyzing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">{t('analyzingMessage')}</p>
                </div>
              ) : (
                <>
                  <p className="font-medium">{t('originalMessage')}: {message.text}</p>
                  {message.translatedText && (
                    <div className="mt-2 p-2 bg-white rounded text-sm">
                      <p className="text-gray-600 text-xs">{t('translatedMessage')}:</p>
                      <p className="font-medium">{message.translatedText}</p>
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
                      {message.timestamp.toLocaleTimeString()}
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
    </div>
  )
}

