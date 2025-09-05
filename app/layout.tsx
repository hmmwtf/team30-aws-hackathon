'use client'

import './globals.css'
import { AuthProvider } from "react-oidc-context"

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_thz0ABVLv",
  client_id: "49rviner30oomvrdo0l4t82d2p",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "email openid phone",
  automaticSilentRenew: true,
  includeIdTokenInSilentRenew: true,
  post_logout_redirect_uri: "http://localhost:3000/login",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider {...cognitoAuthConfig}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}