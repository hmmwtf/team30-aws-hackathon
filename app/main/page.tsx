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
import ProfileSetupModal from '../components/ProfileSetupModal'
import { Language, getTranslation } from '../lib/i18n'
import { Chat } from '../../types/chat'

type Mode = 'chat' | 'translate'

export default function MainPage() {
  const auth = useAuth()
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState('KR') // 기본값, 사용자 프로필에서 업데이트됨
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ko')
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  // 사용자 프로필 체크
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      checkUserProfile()
    }
  }, [auth.isAuthenticated, auth.user])

  const checkUserProfile = async () => {
    try {
      const userId = auth.user?.profile.sub
      const response = await fetch(`/api/user-profile?userId=${userId}`)
      const data = await response.json()
      
      if (data.profile && data.profile.isProfileComplete) {
        setUserProfile(data.profile)
        // DB에 저장된 언어와 국적으로 자동 설정
        setSelectedLanguage(data.profile.language as Language)
        setSelectedCountry(data.profile.nationality)
      } else {
        setShowProfileModal(true)
      }
    } catch (error) {
      console.error('프로필 체크 오류:', error)
      setShowProfileModal(true)
    }
  }

  const handleProfileComplete = async (nationality: string, language: Language) => {
    try {
      const userId = auth.user?.profile.sub
      const email = auth.user?.profile.email
      
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, nationality, language })
      })
      
      const data = await response.json()
      if (data.success) {
        setUserProfile(data.profile)
        // 새로 설정한 언어로 업데이트
        setSelectedLanguage(language)
        setShowProfileModal(false)
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error)
    }
  }

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
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
      const logoutUri = process.env.NEXT_PUBLIC_LOGOUT_URI
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/login')
    }
  }

  // 언어 변경 시 DB 업데이트
  const handleLanguageChange = async (newLanguage: Language) => {
    setSelectedLanguage(newLanguage)
    
    // 사용자 프로필이 있으면 DB에 업데이트
    if (userProfile && auth.user) {
      try {
        const userId = auth.user.profile.sub
        const email = auth.user.profile.email
        
        await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            email, 
            nationality: userProfile.nationality, 
            language: newLanguage 
          })
        })
        
        // 로컬 상태도 업데이트
        setUserProfile({ ...userProfile, language: newLanguage })
      } catch (error) {
        console.error('언어 설정 업데이트 오류:', error)
      }
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
              {selectedLanguage === 'ko' ? '안녕하세요' : 
               selectedLanguage === 'en' ? 'Hello' :
               selectedLanguage === 'ja' ? 'こんにちは' :
               selectedLanguage === 'zh' ? '你好' :
               selectedLanguage === 'de' ? 'Hallo' :
               selectedLanguage === 'fr' ? 'Bonjour' :
               selectedLanguage === 'it' ? 'Ciao' :
               selectedLanguage === 'ru' ? 'Привет' :
               selectedLanguage === 'hi' ? 'नमस्ते' :
               selectedLanguage === 'pt' ? 'Olá' : '안녕하세요'}, {auth.user?.profile.email}!
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
            onLanguageChange={handleLanguageChange}
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
                      <p>
                        {selectedLanguage === 'ko' ? '채팅방을 선택하거나 새로 만들어보세요!' :
                         selectedLanguage === 'en' ? 'Select a chat room or create a new one!' :
                         selectedLanguage === 'ja' ? 'チャットルームを選択するか、新しく作成してください！' :
                         selectedLanguage === 'zh' ? '选择聊天室或创建新的！' :
                         selectedLanguage === 'de' ? 'Wählen Sie einen Chatroom oder erstellen Sie einen neuen!' :
                         selectedLanguage === 'fr' ? 'Sélectionnez un salon de chat ou créez-en un nouveau!' :
                         selectedLanguage === 'it' ? 'Seleziona una chat room o creane una nuova!' :
                         selectedLanguage === 'ru' ? 'Выберите чат или создайте новый!' :
                         selectedLanguage === 'hi' ? 'चैट रूम का चयन करें या नया बनाएं!' :
                         selectedLanguage === 'pt' ? 'Selecione uma sala de chat ou crie uma nova!' :
                         '채팅방을 선택하거나 새로 만들어보세요!'}
                      </p>
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
      
      <ProfileSetupModal 
        isOpen={showProfileModal}
        onComplete={handleProfileComplete}
        defaultLanguage={selectedLanguage}
      />
    </main>
  )
}