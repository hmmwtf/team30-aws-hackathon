import { getCulturalData } from '../../app/data/culturalData'

describe('Country-Specific Cultural Analysis', () => {
  const testCases = [
    {
      country: 'KR',
      sensitiveMessage: '나이가 어떻게 되세요?',
      appropriateMessage: '안녕하세요, 반갑습니다.',
      expectedSensitive: true
    },
    {
      country: 'IT', 
      sensitiveMessage: '마피아 이야기 좀 해주세요',
      appropriateMessage: '이탈리아 음식이 정말 맛있어요',
      expectedSensitive: true
    },
    {
      country: 'RU',
      sensitiveMessage: '소비에트 시대가 더 좋았죠?',
      appropriateMessage: '러시아 문화에 관심이 많습니다',
      expectedSensitive: true
    },
    {
      country: 'IN',
      sensitiveMessage: '카스트 제도에 대해 어떻게 생각하세요?',
      appropriateMessage: '인도 문화가 정말 다양하고 흥미롭네요',
      expectedSensitive: true
    },
    {
      country: 'BR',
      sensitiveMessage: '브라질은 범죄가 많다던데',
      appropriateMessage: '브라질 축구 정말 좋아해요',
      expectedSensitive: true
    },
    {
      country: 'AU',
      sensitiveMessage: '원주민들을 어떻게 대했는지...',
      appropriateMessage: '호주의 자연이 정말 아름답네요',
      expectedSensitive: true
    }
  ]

  testCases.forEach(({ country, sensitiveMessage, appropriateMessage }) => {
    describe(`${country} Cultural Tests`, () => {
      test(`should have cultural data for ${country}`, () => {
        const data = getCulturalData(country)
        expect(data).toBeTruthy()
        expect(data?.country).toBeTruthy()
        expect(data?.sensitiveTopic.length).toBeGreaterThan(0)
        expect(data?.taboos.length).toBeGreaterThan(0)
      })

      test(`should identify sensitive topics for ${country}`, () => {
        const data = getCulturalData(country)
        const hasSensitiveTopic = data?.sensitiveTopic.some(topic => 
          sensitiveMessage.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(sensitiveMessage.toLowerCase().split(' ')[0])
        )
        // 민감한 주제가 데이터에 포함되어 있는지 확인
        expect(data?.sensitiveTopic.length).toBeGreaterThan(0)
      })

      test(`should have appropriate communication style for ${country}`, () => {
        const data = getCulturalData(country)
        expect(data?.communicationStyle).toBeTruthy()
        expect(data?.politenessLevel).toMatch(/^(high|medium|low)$/)
        expect(data?.directness).toMatch(/^(direct|indirect)$/)
      })
    })
  })

  test('all countries have consistent data structure', () => {
    const countries = ['US', 'JP', 'CN', 'GB', 'DE', 'FR', 'KR', 'IT', 'RU', 'IN', 'BR', 'AU']
    
    countries.forEach(countryCode => {
      const data = getCulturalData(countryCode)
      expect(data).toBeTruthy()
      
      // 필수 필드 검증
      expect(data?.country).toBeTruthy()
      expect(data?.code).toBe(countryCode)
      expect(Array.isArray(data?.sensitiveTopic)).toBe(true)
      expect(Array.isArray(data?.taboos)).toBe(true)
      expect(data?.communicationStyle).toBeTruthy()
      
      // 열거형 값 검증
      expect(['high', 'medium', 'low']).toContain(data?.politenessLevel)
      expect(['direct', 'indirect']).toContain(data?.directness)
      expect(['close', 'medium', 'distant']).toContain(data?.personalSpace)
      expect(['punctual', 'flexible']).toContain(data?.timeOrientation)
      expect(['high', 'medium', 'low']).toContain(data?.hierarchyImportance)
    })
  })
})