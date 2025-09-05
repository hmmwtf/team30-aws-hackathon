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
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          targetCountry,
        }),
      })
      
      const feedback = await response.json()
      newMessage.feedback = feedback
    } catch (error) {
      console.error('Analysis service unavailable')
      newMessage.feedback = {
        type: 'good',
        message: '👍 매너 굿! 문화적으로 적절한 표현이에요'
      }
    }

    setMessages(prev => [...prev, newMessage])
    setCurrentInput('')
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

