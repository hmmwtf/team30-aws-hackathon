export interface Chat {
  id: string
  name: string
  country: string
  lastMessage: string
  timestamp: string
  unread: number
  createdAt?: string
  senderLanguage?: string // 발신자 언어
  receiverLanguage?: string // 수신자 언어
  participants?: string[] // 참가자 목록
  relationship?: string // 관계 설정
}