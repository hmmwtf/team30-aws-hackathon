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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            CultureChat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            문화적 배려가 담긴 매너있는 외국인 채팅 서비스
          </p>
          <div className="flex justify-center items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    </main>
  )
}