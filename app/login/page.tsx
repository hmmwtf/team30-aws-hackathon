'use client'

import { useAuth } from "react-oidc-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'

export default function LoginPage() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push('/main')
    } else {
      // 로그인 페이지에 오면 인증 관련 쿠키 정리
      const authCookies = ['oidc.user', 'oidc.access_token', 'oidc.id_token', 'oidc.refresh_token']
      authCookies.forEach(cookieName => {
        Cookies.remove(cookieName)
        Cookies.remove(cookieName, { path: '/' })
      })
    }
  }, [auth.isAuthenticated, router])

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

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">오류가 발생했습니다: {auth.error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            CultureChat
          </h1>
          <p className="text-gray-600 mb-8">
            문화적 배려가 담긴 매너있는 채팅 서비스
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              로그인이 필요합니다
            </h2>
            
            <button
              onClick={() => auth.signinRedirect()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>🔐</span>
              로그인 / 회원가입
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              AWS Cognito를 통한 안전한 로그인
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}