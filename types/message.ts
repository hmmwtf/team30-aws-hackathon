export interface Message {
  id: string
  chatId: string
  userId: string
  text: string
  timestamp: string
  feedback?: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
  translation?: string
  isTranslating?: boolean
  isPending?: boolean
  isAnalyzing?: boolean
}