'use client'

import { useState } from 'react'
import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Cookies from 'js-cookie'
import ChatInterface from '../components/ChatInterface'
import ChatList from '../components/ChatList'
import CountrySelector from '../components/CountrySelector'
import LanguageSelector from '../components/LanguageSelector'
import TranslateMode from '../components/TranslateMode'
import { Language, getTranslation } from '../lib/i18n'
import { Chat } from '../../types/chat'

type Mode = 'chat' | 'translate'

export default function MainPage() {
  const auth = useAuth()
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  const handleLogout = async () => {
    try {
      // 모든 쿠키 삭제
      const allCookies = Cookies.get()
      Object.keys(allCookies).forEach(cookieName => {
        Cookies.remove(cookieName)
        Cookies.remove(cookieName, { path: '/' })
        Cookies.remove(cookieName, { path: '/', domain: 'localhost' })
      })
      
      // 로컬 스토리지 및 세션 스토리지 삭제
      localStorage.clear()
      sessionStorage.clear()
      
      // react-oidc-context 사용자 제거
      await auth.removeUser()
      
      // Cognito 호스팅 UI 로그아웃
      const clientId = "49rviner30oomvrdo0l4t82d2p"
      const logoutUri = "http://localhost:3000/login"
      const cognitoDomain = "https://us-east-1thz0abvlv.auth.us-east-1.amazoncognito.com"
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/login')
    }
  }

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(selectedLanguage, key)

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
          
          {/* 로그아웃 버튼 */}
          <div className="absolute top-0 right-0 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              안녕하세요, {auth.user?.profile.email}님!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>🚪</span>
              로그아웃
            </button>
          </div>
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
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
              <ChatList 
                onChatSelect={setSelectedChat}
                selectedChatId={selectedChat?.id}
              />
              <div className="flex-1">
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