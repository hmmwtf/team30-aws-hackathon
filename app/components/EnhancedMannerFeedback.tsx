'use client'

interface EnhancedMannerFeedbackProps {
  feedback: {
    type: 'warning' | 'good'
    message: string
    culturalReason: string
    severity?: 'low' | 'medium' | 'high'
    suggestions?: string[]
    confidence: number
  }
  language?: string
}

const severityConfig = {
  low: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: '⚠️',
    label: '주의'
  },
  medium: {
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    icon: '🚨',
    label: '경고'
  },
  high: {
    color: 'bg-red-50 border-red-200 text-red-800',
    icon: '🚫',
    label: '심각'
  }
}

export default function EnhancedMannerFeedback({ feedback, language = 'ko' }: EnhancedMannerFeedbackProps) {
  const isWarning = feedback.type === 'warning'
  const severity = feedback.severity || 'low'
  const severityInfo = severityConfig[severity]

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isWarning 
        ? severityInfo.color
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">
          {isWarning ? severityInfo.icon : '✅'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">
              {isWarning ? `${severityInfo.label} 필요` : '매너 굿!'}
            </h4>
            {feedback.confidence && (
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                신뢰도: {Math.round(feedback.confidence * 100)}%
              </span>
            )}
          </div>
          
          <p className="text-sm mb-2">{feedback.message}</p>
          
          <div className="text-xs opacity-75 mb-3">
            <strong>문화적 근거:</strong> {feedback.culturalReason}
          </div>
          
          {isWarning && feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
              <h5 className="font-medium text-sm mb-2">💡 개선 제안:</h5>
              <ul className="text-sm space-y-1">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}