// 국가별 문화적 특성 데이터
export interface CulturalData {
  country: string
  code: string
  sensitiveTopic: string[]
  communicationStyle: string
  taboos: string[]
  politenessLevel: 'high' | 'medium' | 'low'
  directness: 'direct' | 'indirect'
  personalSpace: 'close' | 'medium' | 'distant'
  timeOrientation: 'punctual' | 'flexible'
  hierarchyImportance: 'high' | 'medium' | 'low'
}

export const culturalDatabase: Record<string, CulturalData> = {
  US: {
    country: '미국',
    code: 'US',
    sensitiveTopic: ['나이', '체중', '수입', '정치적 성향', '종교', '개인적 관계'],
    communicationStyle: '직접적이고 개방적이지만 개인 프라이버시 존중',
    taboos: ['나이 묻기', '급여 묻기', '외모 평가', '정치 논쟁'],
    politenessLevel: 'medium',
    directness: 'direct',
    personalSpace: 'medium',
    timeOrientation: 'punctual',
    hierarchyImportance: 'medium'
  },
  JP: {
    country: '일본',
    code: 'JP',
    sensitiveTopic: ['직접적 거절', '개인적 실패', '가족 문제', '회사 내부 사정'],
    communicationStyle: '간접적이고 예의를 중시하며 조화를 추구',
    taboos: ['직접적 "아니오"', '큰 소리', '개인적 질문', '신발 신고 실내 입장'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'distant',
    timeOrientation: 'punctual',
    hierarchyImportance: 'high'
  },
  CN: {
    country: '중국',
    code: 'CN',
    sensitiveTopic: ['정치', '대만', '홍콩', '티베트', '신장', '개인적 수입'],
    communicationStyle: '관계 중심적이며 체면을 중시',
    taboos: ['정치적 주제', '체면 손상', '공개적 비판', '선물 거절'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'close',
    timeOrientation: 'flexible',
    hierarchyImportance: 'high'
  },
  GB: {
    country: '영국',
    code: 'GB',
    sensitiveTopic: ['개인 수입', '왕실 비판', '계급', '브렉시트'],
    communicationStyle: '정중하고 우회적이며 유머를 활용',
    taboos: ['줄서기 새치기', '개인적 질문', '큰 소리로 말하기'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'distant',
    timeOrientation: 'punctual',
    hierarchyImportance: 'medium'
  },
  DE: {
    country: '독일',
    code: 'DE',
    sensitiveTopic: ['나치', '홀로코스트', '개인적 수입', '동서독 분단'],
    communicationStyle: '직접적이고 솔직하며 효율성을 중시',
    taboos: ['나치 관련 농담', '시간 약속 어기기', '개인 공간 침범'],
    politenessLevel: 'medium',
    directness: 'direct',
    personalSpace: 'distant',
    timeOrientation: 'punctual',
    hierarchyImportance: 'medium'
  },
  FR: {
    country: '프랑스',
    code: 'FR',
    sensitiveTopic: ['개인 수입', '종교', '이민 문제', '언어 능력'],
    communicationStyle: '우아하고 지적이며 토론을 즐김',
    taboos: ['프랑스어 실력 무시', '미국식 행동', '무례한 행동'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'medium',
    timeOrientation: 'flexible',
    hierarchyImportance: 'medium'
  },
  KR: {
    country: '한국',
    code: 'KR',
    sensitiveTopic: ['나이', '결혼 여부', '직업', '정치', '북한'],
    communicationStyle: '예의를 중시하고 위계를 존중하며 간접적 표현 선호',
    taboos: ['연장자에게 반대 의견', '나이 무시', '직접적 비판', '개인적 질문'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'medium',
    timeOrientation: 'punctual',
    hierarchyImportance: 'high'
  },
  IT: {
    country: '이탈리아',
    code: 'IT',
    sensitiveTopic: ['마피아', '정치 부패', '경제 문제', '남북 격차'],
    communicationStyle: '열정적이고 표현력이 풍부하며 가족을 중시',
    taboos: ['마피아 농담', '이탈리아 음식 비하', '시간 엄수성'],
    politenessLevel: 'medium',
    directness: 'direct',
    personalSpace: 'close',
    timeOrientation: 'flexible',
    hierarchyImportance: 'medium'
  },
  RU: {
    country: '러시아',
    code: 'RU',
    sensitiveTopic: ['소비에트 시대', '우크라이나', '정치', '경제 제재'],
    communicationStyle: '직접적이고 솔직하며 강한 의견 표현',
    taboos: ['소비에트 비하', '약함 보이기', '개인적 실패 언급'],
    politenessLevel: 'medium',
    directness: 'direct',
    personalSpace: 'distant',
    timeOrientation: 'flexible',
    hierarchyImportance: 'high'
  },
  IN: {
    country: '인도',
    code: 'IN',
    sensitiveTopic: ['카스트', '종교', '파키스탄', '빈곤'],
    communicationStyle: '예의바르고 위계를 중시하며 간접적 표현',
    taboos: ['왼손 사용', '쇠고기 언급', '직접적 거절', '머리 만지기'],
    politenessLevel: 'high',
    directness: 'indirect',
    personalSpace: 'medium',
    timeOrientation: 'flexible',
    hierarchyImportance: 'high'
  },
  BR: {
    country: '브라질',
    code: 'BR',
    sensitiveTopic: ['빈곤', '범죄', '정치 부패', '아마존 벌채'],
    communicationStyle: '친근하고 열정적이며 신체 접촉을 선호',
    taboos: ['아르헨티나 비교', '시간 엄수성', '개인 공간 침범'],
    politenessLevel: 'medium',
    directness: 'indirect',
    personalSpace: 'close',
    timeOrientation: 'flexible',
    hierarchyImportance: 'medium'
  },
  AU: {
    country: '호주',
    code: 'AU',
    sensitiveTopic: ['원주민 문제', '이민 정책', '인종 차별', '환경 문제'],
    communicationStyle: '친근하고 직설적이며 비공식적 분위기 선호',
    taboos: ['원주민 비하', '영국 식민지 미화', '과도한 공손'],
    politenessLevel: 'medium',
    directness: 'direct',
    personalSpace: 'medium',
    timeOrientation: 'punctual',
    hierarchyImportance: 'low'
  }
}

export const getCulturalData = (countryCode: string): CulturalData | null => {
  return culturalDatabase[countryCode] || null
}