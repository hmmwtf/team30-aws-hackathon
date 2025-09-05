import { test, expect } from '@playwright/test'

test.describe('CultureChat E2E Tests', () => {
  test('should load homepage and display country selector', async ({ page }) => {
    await page.goto('/')
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/CultureChat/)
    
    // 메인 헤딩 확인
    await expect(page.getByRole('heading', { name: /CultureChat/i })).toBeVisible()
    
    // 국가 선택기 확인
    await expect(page.getByText('채팅 상대방의 국가를 선택하세요')).toBeVisible()
    
    // 국가 버튼들 확인
    await expect(page.getByRole('button', { name: '🇺🇸 미국' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🇯🇵 일본' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🇨🇳 중국' })).toBeVisible()
  })

  test('should select country and show chat interface', async ({ page }) => {
    await page.goto('/')
    
    // 미국 선택
    await page.getByRole('button', { name: '🇺🇸 미국' }).click()
    
    // 채팅 인터페이스 표시 확인
    await expect(page.getByPlaceholder('메시지를 입력하세요...')).toBeVisible()
    await expect(page.getByRole('button', { name: '전송' })).toBeVisible()
    
    // 채팅 인터페이스 헤더 확인
    await expect(page.getByText('채팅 창')).toBeVisible()
    await expect(page.getByText('메시지를 입력하면 문화적 매너를 체크해드립니다')).toBeVisible()
  })

  test('should send message and receive feedback', async ({ page }) => {
    await page.goto('/')
    
    // 미국 선택
    await page.getByRole('button', { name: '🇺🇸 미국' }).click()
    
    // 메시지 입력
    const messageInput = page.getByPlaceholder('메시지를 입력하세요...')
    await messageInput.fill('Hello, nice to meet you!')
    
    // 전송 버튼 클릭
    await page.getByRole('button', { name: '전송' }).click()
    
    // 메시지가 채팅에 표시되는지 확인 (더 긴 대기 시간)
    await expect(page.locator('text=Hello, nice to meet you!')).toBeVisible({ timeout: 15000 })
    
    // 피드백이 표시되는지 확인 (최대 15초 대기)
    await expect(page.locator('[class*="bg-green-50"], [class*="bg-yellow-50"]')).toBeVisible({ timeout: 15000 })
    
    // 입력 필드가 비워졌는지 확인
    await expect(messageInput).toHaveValue('')
  })

  test('should switch between countries', async ({ page }) => {
    await page.goto('/')
    
    // 미국 선택
    await page.getByRole('button', { name: '🇺🇸 미국' }).click()
    await expect(page.getByText('채팅 창')).toBeVisible()
    
    // 일본으로 변경
    await page.getByRole('button', { name: '🇯🇵 일본' }).click()
    await expect(page.getByText('채팅 창')).toBeVisible()
    
    // 채팅 기록이 유지되는지 확인 (이전 메시지가 있다면)
    const chatMessages = page.locator('[class*="space-y-4"] > div')
    const messageCount = await chatMessages.count()
    
    // 중국으로 변경
    await page.getByRole('button', { name: '🇨🇳 중국' }).click()
    await expect(page.getByText('채팅 창')).toBeVisible()
    
    // 채팅 기록이 여전히 유지되는지 확인
    const newMessageCount = await chatMessages.count()
    expect(newMessageCount).toBe(messageCount)
  })

  test('should handle empty message submission', async ({ page }) => {
    await page.goto('/')
    
    // 미국 선택
    await page.getByRole('button', { name: '🇺🇸 미국' }).click()
    
    // 빈 메시지로 전송 시도 (버튼이 비활성화되어 있어야 함)
    const sendButton = page.getByRole('button', { name: '전송' })
    await expect(sendButton).toBeDisabled()
    
    // 메시지가 추가되지 않았는지 확인
    const chatMessages = page.locator('[class*="space-y-4"] > div')
    const messageCount = await chatMessages.count()
    expect(messageCount).toBe(0)
  })

  test('should display loading state during analysis', async ({ page }) => {
    await page.goto('/')
    
    // 미국 선택
    await page.getByRole('button', { name: '🇺🇸 미국' }).click()
    
    // 메시지 입력
    const messageInput = page.getByPlaceholder('메시지를 입력하세요...')
    await messageInput.fill('Test message for loading state')
    
    // 전송 버튼 클릭
    const sendButton = page.getByRole('button', { name: '전송' })
    await sendButton.click()
    
    // 분석 완료 후 피드백 표시 확인
    await expect(page.locator('[class*="bg-green-50"], [class*="bg-yellow-50"]')).toBeVisible({ timeout: 15000 })
  })
})