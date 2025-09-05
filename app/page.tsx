'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import CountrySelector from './components/CountrySelector'
import LanguageSelector from './components/LanguageSelector'
import TranslateMode from './components/TranslateMode'
import SideAdBanner from './components/SideAdBanner'
import MobileAdBanner from './components/MobileAdBanner'
import SponsorModal from './components/SponsorModal'
import { useUsageCounter } from './hooks/useUsageCounter'
import { Language, getTranslation } from './lib/i18n'

type Mode = 'chat' | 'translate'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')
  const [mode, setMode] = useState<Mode>('chat')
  const { 
    usageCount, 
    showSponsorModal, 
    incrementUsage, 
    closeSponsorModal, 
    remainingUsage 
  } = useUsageCounter()

  const t = (key: string) => getTranslation(selectedLanguage, key)

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
          {remainingUsage > 0 && (
            <div className="mt-2 text-sm text-blue-600">
              무료 사용 {remainingUsage}회 남음
            </div>
          )}
        </header>
        
        <div className="flex justify-center w-full">
          <div className="flex gap-4 w-full max-w-7xl">
            {/* 왼쪽 광고 - 데스크톱에서만 표시 */}
            <div className="hidden 2xl:block flex-shrink-0">
              <SideAdBanner language={selectedLanguage} />
            </div>
            
            {/* 메인 콘텐츠 - 모바일에서 전체 폭 사용 */}
            <div className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-4">
              <MobileAdBanner language={selectedLanguage} />
              
              <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
            
            <div className="mb-6 p-3 sm:p-4 bg-white rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3">{t('modeSelection')}</h3>
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setMode('chat')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    mode === 'chat'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('chatMode')}
                </button>
                <button
                  onClick={() => setMode('translate')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
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
                onMessageSent={incrementUsage}
              />
            ) : (
              <TranslateMode 
                targetCountry={selectedCountry}
                language={selectedLanguage}
                onTranslate={incrementUsage}
              />
            )}
            </div>
            
            {/* 오른쪽 광고 - 데스크톱에서만 표시 */}
            <div className="hidden 2xl:block flex-shrink-0">
              <SideAdBanner language={selectedLanguage} />
            </div>
          </div>
        </div>
      </div>
      
      <SponsorModal 
        isOpen={showSponsorModal}
        onClose={closeSponsorModal}
        usageCount={usageCount}
        language={selectedLanguage}
      />
    </main>
  )
}