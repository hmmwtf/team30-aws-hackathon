'use client'

interface MannerFeedbackProps {
  feedback: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
}

export default function MannerFeedback({ feedback }: MannerFeedbackProps) {
  const isWarning = feedback.type === 'warning'
  
  return (
    <div className={`p-3 rounded-lg border-l-4 ${
      isWarning 
        ? 'bg-yellow-50 border-yellow-400' 
        : 'bg-green-50 border-green-400'
    }`}>
      <div className="flex items-start space-x-2">
        <span className="text-lg">
          {isWarning ? '⚠️' : '✅'}
        </span>
        <div className="flex-1">
          <p className={`font-medium ${
            isWarning ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {feedback.message}
          </p>
          {feedback.suggestion && (
            <p className="text-sm text-gray-600 mt-1">
              💡 {feedback.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}