'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import ChatList from './components/ChatList'
import CountrySelector from './components/CountrySelector'
import LanguageSelector from './components/LanguageSelector'
import TranslateMode from './components/TranslateMode'
import { Language, getTranslation } from './lib/i18n'
import { Chat } from '../types/chat'

type Mode = 'chat' | 'translate'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const t = (key: keyof typeof import('./lib/i18n').translations.ko) => 
    getTranslation(selectedLanguage, key)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto">
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">{t('modeSelection')}</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'chat'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('chatMode')}
              </button>
              <button
                onClick={() => setMode('translate')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'translate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('translateMode')}
              </button>
            </div>
          </div>

          {mode === 'chat' ? (
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden" style={{height: '600px'}}>
              <ChatList 
                onChatSelect={setSelectedChat}
                selectedChatId={selectedChat?.id}
              />
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <ChatInterface 
                    targetCountry={selectedChat.country}
                    language={selectedLanguage}
                    chatId={selectedChat.id}
                    userId={userId}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💬</div>
                      <p>채팅방을 선택하거나 새로 만들어보세요!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <CountrySelector 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                language={selectedLanguage}
              />
              <TranslateMode 
                targetCountry={selectedCountry}
                language={selectedLanguage}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}