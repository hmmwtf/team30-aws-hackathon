'use client'

interface RelationshipSelectorProps {
  selectedRelationship: string
  onRelationshipChange: (relationship: string) => void
}

const relationships = [
  { value: 'boss', label: '👔 상사', description: '높은 격식, 극존댓말' },
  { value: 'colleague', label: '🤝 동료', description: '중간 격식, 존댓말' },
  { value: 'friend', label: '👫 친구', description: '낮은 격식, 친근한 표현' },
  { value: 'lover', label: '💕 연인', description: '친밀한 표현, 애칭 사용' },
  { value: 'parent', label: '👨‍👩‍👧‍👦 부모님', description: '높임말, 효도 표현' },
  { value: 'stranger', label: '🙋 낯선 사람', description: '정중한 표현, 예의' }
]

export default function RelationshipSelector({ 
  selectedRelationship, 
  onRelationshipChange 
}: RelationshipSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        상대방과의 관계
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {relationships.map((rel) => (
          <button
            key={rel.value}
            onClick={() => onRelationshipChange(rel.value)}
            className={`p-3 text-left border rounded-lg transition-all ${
              selectedRelationship === rel.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="font-medium text-sm">{rel.label}</div>
            <div className="text-xs text-gray-500 mt-1">{rel.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}