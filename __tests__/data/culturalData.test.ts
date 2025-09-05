import { getCulturalData, culturalDatabase } from '../../app/data/culturalData'

describe('Cultural Data', () => {
  test('returns correct cultural data for supported countries', () => {
    const usData = getCulturalData('US')
    expect(usData).toBeTruthy()
    expect(usData?.country).toBe('미국')
    expect(usData?.code).toBe('US')
    expect(usData?.sensitiveTopic).toContain('나이')
    expect(usData?.directness).toBe('direct')
  })

  test('returns null for unsupported countries', () => {
    const unknownData = getCulturalData('XX')
    expect(unknownData).toBeNull()
  })

  test('all supported countries have required fields', () => {
    Object.values(culturalDatabase).forEach(data => {
      expect(data.country).toBeTruthy()
      expect(data.code).toBeTruthy()
      expect(Array.isArray(data.sensitiveTopic)).toBe(true)
      expect(data.communicationStyle).toBeTruthy()
      expect(Array.isArray(data.taboos)).toBe(true)
      expect(['high', 'medium', 'low']).toContain(data.politenessLevel)
      expect(['direct', 'indirect']).toContain(data.directness)
      expect(['close', 'medium', 'distant']).toContain(data.personalSpace)
      expect(['punctual', 'flexible']).toContain(data.timeOrientation)
      expect(['high', 'medium', 'low']).toContain(data.hierarchyImportance)
    })
  })

  test('cultural data covers all 12 supported countries', () => {
    const supportedCountries = ['US', 'JP', 'CN', 'GB', 'DE', 'FR', 'KR', 'IT', 'RU', 'IN', 'BR', 'AU']
    supportedCountries.forEach(country => {
      expect(culturalDatabase[country]).toBeTruthy()
    })
    expect(Object.keys(culturalDatabase)).toHaveLength(12)
  })
})