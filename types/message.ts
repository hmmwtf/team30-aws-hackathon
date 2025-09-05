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
    confidence?: number
  }
  translation?: string
  translatedText?: string
  isTranslating?: boolean
  isPending?: boolean
  isAnalyzing?: boolean
}