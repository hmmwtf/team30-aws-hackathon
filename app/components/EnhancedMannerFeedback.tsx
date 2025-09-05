'use client'

import { Language, getTranslation } from '../lib/i18n'

interface EnhancedMannerFeedbackProps {
  feedback: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
    confidence?: number
  }
  language: Language
}

export default function EnhancedMannerFeedback({ feedback, language }: EnhancedMannerFeedbackProps) {
  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const getIcon = () => {
    return feedback.type === 'warning' ? '⚠️' : '👍'
  }

  const getBgColor = () => {
    return feedback.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
  }

  const getTextColor = () => {
    return feedback.type === 'warning' ? 'text-orange-800' : 'text-green-800'
  }

  return (
    <div className={`p-3 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{getIcon()}</span>
        <div className="flex-1">
          <p className={`font-medium ${getTextColor()}`}>
            {feedback.message}
          </p>
          {feedback.suggestion && (
            <p className={`text-sm mt-1 ${getTextColor()}`}>
              {feedback.suggestion}
            </p>
          )}
          {feedback.confidence && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">
                신뢰도: {Math.round(feedback.confidence * 100)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${feedback.type === 'warning' ? 'bg-orange-400' : 'bg-green-400'}`}
                  style={{ width: `${feedback.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}