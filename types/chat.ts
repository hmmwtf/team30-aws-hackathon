export interface Chat {
  id: string
  name: string
  country: string
  lastMessage: string
  timestamp: string
  unread: number
  createdAt?: string
}