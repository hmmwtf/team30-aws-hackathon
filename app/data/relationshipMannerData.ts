export interface RelationshipMannerCriteria {
  relationship: string
  formalityLevel: 'very-high' | 'high' | 'medium' | 'low' | 'very-low'
  respectLevel: 'maximum' | 'high' | 'moderate' | 'minimal' | 'intimate'
  languageStyle: string[]
  avoidExpressions: string[]
  recommendedExpressions: string[]
  culturalNotes: string
}

export const relationshipMannerDatabase: Record<string, RelationshipMannerCriteria> = {
  boss: {
    relationship: '상사',
    formalityLevel: 'very-high',
    respectLevel: 'maximum',
    languageStyle: ['극존댓말', '높임법', '겸양어', '정중한 표현'],
    avoidExpressions: ['반말', '직접적 거절', '명령형', '비판적 표현'],
    recommendedExpressions: ['~습니다/~니다', '~해 주시겠습니까', '죄송하지만', '감사합니다'],
    culturalNotes: '위계질서를 존중하고 체면을 세워주는 표현 필수'
  },
  colleague: {
    relationship: '동료',
    formalityLevel: 'high',
    respectLevel: 'high',
    languageStyle: ['존댓말', '정중한 표현', '협력적 어조'],
    avoidExpressions: ['반말', '명령형', '무례한 표현'],
    recommendedExpressions: ['~해요', '~하시겠어요', '함께', '협력'],
    culturalNotes: '동등한 관계이지만 예의를 지키며 협력적 관계 유지'
  },
  friend: {
    relationship: '친구',
    formalityLevel: 'low',
    respectLevel: 'minimal',
    languageStyle: ['친근한 표현', '반말 가능', '편안한 어조'],
    avoidExpressions: ['과도한 존댓말', '딱딱한 표현'],
    recommendedExpressions: ['~해', '~야', '같이', '우리'],
    culturalNotes: '친밀감을 표현하되 기본적인 예의는 유지'
  },
  lover: {
    relationship: '연인',
    formalityLevel: 'very-low',
    respectLevel: 'intimate',
    languageStyle: ['애칭', '친밀한 표현', '감정 표현'],
    avoidExpressions: ['냉정한 표현', '거리감 있는 말'],
    recommendedExpressions: ['자기야', '사랑해', '보고싶어', '우리'],
    culturalNotes: '친밀감과 애정을 자연스럽게 표현'
  },
  parent: {
    relationship: '부모님',
    formalityLevel: 'very-high',
    respectLevel: 'maximum',
    languageStyle: ['높임말', '효도 표현', '감사 표현'],
    avoidExpressions: ['반말', '불손한 표현', '명령형'],
    recommendedExpressions: ['~드립니다', '아버지/어머니', '감사합니다', '죄송합니다'],
    culturalNotes: '효도와 존경의 마음을 담은 최고 수준의 예의'
  },
  stranger: {
    relationship: '낯선 사람',
    formalityLevel: 'high',
    respectLevel: 'high',
    languageStyle: ['정중한 표현', '예의바른 어조', '거리감 유지'],
    avoidExpressions: ['반말', '친근한 표현', '개인적 질문'],
    recommendedExpressions: ['~습니다', '실례합니다', '감사합니다', '죄송합니다'],
    culturalNotes: '적절한 거리감을 유지하며 예의바른 소통'
  }
}

export const getRelationshipMannerCriteria = (relationship: string): RelationshipMannerCriteria | null => {
  return relationshipMannerDatabase[relationship] || null
}