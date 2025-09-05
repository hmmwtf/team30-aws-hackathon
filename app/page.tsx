'use client'

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Cookies from 'js-cookie'

export default function Home() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // URL에 code 파라미터가 있으면 콜백 처리 중
    const urlParams = new URLSearchParams(window.location.search)
    const hasCode = urlParams.get('code')
    
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        router.push('/main')
      } else if (!hasCode) {
        // 로그인되지 않은 상태에서 쿠키 정리
        const authCookies = ['oidc.user', 'oidc.access_token', 'oidc.id_token', 'oidc.refresh_token']
        authCookies.forEach(cookieName => {
          Cookies.remove(cookieName)
          Cookies.remove(cookieName, { path: '/' })
        })
        router.push('/login')
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

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
    </div>
  )
}