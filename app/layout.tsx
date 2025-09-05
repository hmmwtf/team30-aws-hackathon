import './globals.css'

export const metadata = {
  title: 'CultureChat - 매너있는 외국인 채팅',
  description: '문화적 배려가 담긴 글로벌 채팅 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}