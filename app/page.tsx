'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import CountrySelector from './components/CountrySelector'
import LanguageSelector from './components/LanguageSelector'
import { Language, getTranslation } from './lib/i18n'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')

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
          <CountrySelector 
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            language={selectedLanguage}
          />
          <ChatInterface 
            targetCountry={selectedCountry} 
            language={selectedLanguage}
          />
        </div>
      </div>
    </main>
  )
}