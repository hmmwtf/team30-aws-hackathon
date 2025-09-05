# CultureChat 개발자 가이드

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd team30-aws-hackathon_ko
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp .env.local.example .env.local
# AWS 자격증명을 입력하세요
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## 📁 프로젝트 구조

```
app/
├── components/          # React 컴포넌트
│   ├── ChatInterface.tsx    # 메인 채팅 UI
│   ├── CountrySelector.tsx  # 국가 선택
│   ├── MessageInput.tsx     # 메시지 입력
│   └── MannerFeedback.tsx   # 피드백 표시
├── api/                # API 라우트
│   └── analyze/
│       └── route.ts    # Bedrock 분석 API
├── globals.css         # 글로벌 스타일
├── layout.tsx         # 루트 레이아웃
└── page.tsx           # 메인 페이지
```

## 🛠️ 개발 워크플로우

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
```

### 코드 스타일
- TypeScript 사용
- Tailwind CSS로 스타일링
- ESLint + Prettier 적용

## 🔧 주요 컴포넌트 개발

### 새로운 컴포넌트 추가
```typescript
// app/components/NewComponent.tsx
'use client'

interface NewComponentProps {
  // props 정의
}

export default function NewComponent({ }: NewComponentProps) {
  return (
    <div className="...">
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

### API 라우트 추가
```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // 로직 처리
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

## 🧪 테스트

### 단위 테스트 실행
```bash
npm run test
```

### E2E 테스트 실행
```bash
npm run test:e2e
```

## 📦 빌드 및 배포

### 로컬 빌드
```bash
npm run build
npm run start
```

### 프로덕션 배포
```bash
npm run deploy
```

## 🐛 디버깅

### 로그 확인
- 브라우저 개발자 도구 Console 탭
- Next.js 서버 로그 확인

### 일반적인 문제 해결
1. **AWS 자격증명 오류**: `.env.local` 파일 확인
2. **Bedrock API 오류**: AWS 리전 및 모델 ID 확인
3. **빌드 오류**: `node_modules` 삭제 후 재설치

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 후 머지

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [AWS Bedrock 문서](https://docs.aws.amazon.com/bedrock/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)