'use client'

import { useState } from 'react'
import MessageInput from './MessageInput'
import MannerFeedback from './MannerFeedback'
import { Language, getTranslation } from '../lib/i18n'

interface ChatInterfaceProps {
  targetCountry: string
  language: Language
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
}

export default function ChatInterface({ targetCountry, language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

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
          language,
        }),
      })
      
      const feedback = await response.json()
      newMessage.feedback = feedback
    } catch (error) {
      console.error('Analysis service unavailable')
      newMessage.feedback = {
        type: 'good',
        message: t('mannerGood')
      }
    }

    setMessages(prev => [...prev, newMessage])
    setCurrentInput('')
  }

  const handleTranslateMessage = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTranslating: true } : msg
    ))

    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.text,
          targetLanguage: language === 'ko' ? 'English' : 'Korean',
          sourceLanguage: language === 'ko' ? 'Korean' : 'English',
        }),
      })
      
      const { translation } = await response.json()
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, translation, isTranslating: false }
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
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto relative group">
              <p>{message.text}</p>
              {message.translation && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p className="text-gray-600 text-xs">{t('translatedMessage')}:</p>
                  <p>{message.translation}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => handleTranslateMessage(message.id)}
                  disabled={message.isTranslating}
                  className="text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {message.isTranslating ? t('translating') : t('translateMessage')}
                </button>
              </div>
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

