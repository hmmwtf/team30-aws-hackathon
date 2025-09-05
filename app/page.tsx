'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import CountrySelector from './components/CountrySelector'
import LanguageSelector from './components/LanguageSelector'
import TranslateMode from './components/TranslateMode'
import { Language, getTranslation } from './lib/i18n'

type Mode = 'chat' | 'translate'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')
  const [mode, setMode] = useState<Mode>('chat')

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
        
        <div className="max-w-4xl mx-auto">
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

          <CountrySelector 
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            language={selectedLanguage}
          />
          
          {mode === 'chat' ? (
            <ChatInterface 
              targetCountry={selectedCountry} 
              language={selectedLanguage}
            />
          ) : (
            <TranslateMode 
              targetCountry={selectedCountry}
              language={selectedLanguage}
            />
          )}
        </div>
      </div>
    </main>
  )
}