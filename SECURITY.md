# 🔒 CultureChat 보안 가이드

## 🚨 중요 보안 사항

### 1. 환경변수 보안
- ✅ `.env.local` 파일은 `.gitignore`에 포함됨
- ✅ AWS 자격증명은 절대 Git에 커밋하지 않음
- ✅ `.env.local.example` 파일로 템플릿 제공

### 2. AWS 자격증명 관리
```bash
# ❌ 절대 하지 말 것
git add .env.local

# ✅ 올바른 방법
cp .env.local.example .env.local
# 실제 값 입력 후 사용
```

### 3. 프로덕션 환경 보안
- AWS Secrets Manager 사용 권장
- IAM 역할 기반 접근 제어
- 최소 권한 원칙 적용

## 🔐 필수 보안 체크리스트

### 개발 환경
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] AWS 자격증명이 Git 히스토리에 없는가?
- [ ] 테스트 코드에 실제 자격증명이 하드코딩되어 있지 않은가?

### 배포 환경
- [ ] 환경변수가 안전하게 관리되는가?
- [ ] API 키가 클라이언트 사이드에 노출되지 않는가?
- [ ] HTTPS 강제 적용되어 있는가?

### AWS 권한
- [ ] Bedrock 모델 접근 권한만 부여되어 있는가?
- [ ] 불필요한 AWS 서비스 권한이 없는가?
- [ ] 정기적으로 액세스 키를 로테이션하는가?

## 🛡️ 보안 모범 사례

### 1. 환경변수 검증
```typescript
// 환경변수 존재 여부 확인
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('AWS_ACCESS_KEY_ID is required')
}
```

### 2. 에러 메시지 보안
```typescript
// ❌ 민감한 정보 노출
console.error('AWS Error:', error.message)

// ✅ 안전한 에러 처리
console.error('Authentication failed')
```

### 3. 로깅 보안
- 사용자 메시지 로깅 최소화
- 개인정보 마스킹 처리
- 로그 보존 기간 설정

## 🚨 보안 사고 대응

### 자격증명 노출 시
1. 즉시 AWS 콘솔에서 액세스 키 비활성화
2. 새로운 액세스 키 생성
3. Git 히스토리에서 민감한 정보 제거
4. 영향 범위 분석

### 긴급 연락처
- AWS 보안팀: [AWS 지원 센터](https://console.aws.amazon.com/support/)
- 개발팀 보안 담당자: [연락처 정보]