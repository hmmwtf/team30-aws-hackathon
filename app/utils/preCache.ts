// 자주 사용되는 표현들을 미리 캐시
export const commonPhrases = {
  ko: {
    greetings: ['안녕하세요', '안녕하십니까', '좋은 아침입니다', '안녕히 가세요'],
    thanks: ['감사합니다', '고맙습니다', '감사드립니다'],
    apologies: ['죄송합니다', '미안합니다', '실례합니다'],
    questions: ['어떻게 생각하세요?', '괜찮으신가요?', '시간 있으세요?']
  }
}

export const preTranslations = {
  // 한국어 → 영어
  '안녕하세요': 'Hello',
  '감사합니다': 'Thank you',
  '죄송합니다': 'I apologize',
  '어떻게 생각하세요?': 'What do you think?',
  
  // 한국어 → 일본어  
  '안녕하세요_JP': 'こんにちは',
  '감사합니다_JP': 'ありがとうございます',
  '죄송합니다_JP': 'すみません',
  
  // 한국어 → 중국어
  '안녕하세요_CN': '你好',
  '감사합니다_CN': '谢谢',
  '죄송합니다_CN': '对不起'
}

export function getInstantTranslation(text: string, targetCountry: string): string | null {
  const key = targetCountry === 'US' || targetCountry === 'GB' ? text : `${text}_${targetCountry}`
  return preTranslations[key as keyof typeof preTranslations] || null
}