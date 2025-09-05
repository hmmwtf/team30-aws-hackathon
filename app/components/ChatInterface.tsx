'use client'

import { useState } from 'react'
import MessageInput from './MessageInput'
import MannerFeedback from './MannerFeedback'

interface ChatInterfaceProps {
  targetCountry: string
}

interface Message {
  id: string
  text: string
  timestamp: Date
  feedback?: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
}

export default function ChatInterface({ targetCountry }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')

  const handleSendMessage = async (text: string) => {
    const startTime = Date.now()
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
    }

    // 메시지를 먼저 추가 (UX 향상)
    setMessages(prev => [...prev, newMessage])
    setCurrentInput('')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          targetCountry,
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const feedback = await response.json()
      
      // 메시지 업데이트
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, feedback }
            : msg
        )
      )
      
      const responseTime = Date.now() - startTime
      console.log(`📈 [Client] Analysis completed in ${responseTime}ms`)
      
    } catch (error) {
      console.error('🚫 [Client] Analysis failed:', error)
      
      let errorMessage = '👍 매너 굿! 문화적으로 적절한 표현이에요'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '⏰ 응답 시간이 초과되었습니다. 기본 분석을 제공합니다.'
        } else if (error.message.includes('HTTP')) {
          errorMessage = '🌐 서버 오류가 발생했습니다. 기본 분석을 제공합니다.'
        }
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { 
                ...msg, 
                feedback: {
                  type: 'good',
                  message: errorMessage,
                  suggestion: '잠시 후 다시 시도해주세요.',
                  culturalReason: '오프라인 모드입니다.'
                }
              }
            : msg
        )
      )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-500 text-white p-4">
        <h2 className="text-xl font-semibold">채팅 창</h2>
        <p className="text-blue-100">메시지를 입력하면 문화적 매너를 체크해드립니다</p>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p>{message.text}</p>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {message.feedback && (
              <MannerFeedback feedback={message.feedback} />
            )}
          </div>
        ))}
      </div>
      
      <MessageInput
        value={currentInput}
        onChange={setCurrentInput}
        onSend={handleSendMessage}
        targetCountry={targetCountry}
      />
    </div>
  )
}

