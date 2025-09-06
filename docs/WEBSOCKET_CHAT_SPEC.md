# 웹소켓 채팅 기능 명세서

## 📋 개요
CultureChat 프로젝트의 실시간 1:1 채팅 기능을 위한 웹소켓 통신 명세서입니다.

## 🏗️ 아키텍처

### 현재 구조
```
Client (Next.js) ↔ WebSocket Server (Node.js) ↔ DynamoDB
```

### 주요 컴포넌트
- **WebSocket Server**: `/server/websocket.js` (포트 8080)
- **Chat Service**: `/app/lib/chat-service.ts`
- **API Routes**: `/app/api/chats/`, `/app/api/messages/`
- **Database**: DynamoDB (CultureChat-Chats, CultureChat-Messages)
- **DynamoDB Client**: `/app/lib/dynamodb.ts`, `/server/dynamodbClient.js`

## 🔌 웹소켓 연결 및 프로토콜

### 연결 설정
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### 메시지 프로토콜

#### 1. 채팅방 참여 (JOIN)
```json
{
  "type": "join",
  "userId": "user123",
  "chatId": "chat_1234567890_abc123"
}
```

#### 2. 메시지 전송 (MESSAGE)
```json
{
  "type": "message",
  "message": "안녕하세요!",
  "userId": "user123",
  "chatId": "chat_1234567890_abc123"
}
```

#### 3. 메시지 수신 (MESSAGE)
```json
{
  "type": "message",
  "message": "안녕하세요!",
  "userId": "user456",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

## 📊 데이터 모델

### Chat 타입
```typescript
interface Chat {
  id: string              // chat_timestamp_randomId
  name: string            // 채팅방 이름
  country: string         // 상대방 국가
  participants: string[]  // 참가자 이메일 배열
  relationship: string    // 관계 (boss, colleague, friend, etc.)
  lastMessage: string     // 마지막 메시지
  timestamp: string       // 생성/수정 시간
  unread: number          // 읽지 않은 메시지 수
  status: string          // 채팅방 상태 (accepted, pending, etc.)
}
```

### Message 타입
```typescript
interface Message {
  id: string
  chatId: string
  userId: string
  text: string
  timestamp: string
  feedback?: {
    type: 'warning' | 'good'
    message: string
    suggestion?: string
  }
  translation?: string
  isTranslating?: boolean
  isPending?: boolean
  isAnalyzing?: boolean
}
```

## 🔄 메시지 플로우

### 1. 기본 메시지 전송 플로우
```
1. 사용자 메시지 입력
2. hybrid-analyze API 호출 (매너 체크 + 조건부 번역)
3. 매너 체크 통과 시:
   - DynamoDB에 메시지 저장
   - WebSocket으로 실시간 전송
4. 상대방에게 실시간 수신
```

### 2. 매너 체크 실패 시 플로우
```
1. 사용자 메시지 입력
2. 매너 분석 → 문제 감지
3. 3가지 대안 제시
4. 사용자 대안 선택
5. 선택된 메시지로 번역 및 전송
```

## 🛠️ 주요 기능

### 1. 실시간 채팅
- **연결 관리**: 클라이언트 매핑 (userId, chatId)
- **메시지 브로드캐스트**: 같은 채팅방 참여자에게만 전송
- **자동 저장**: DynamoDB에 메시지 자동 저장

### 2. 채팅방 관리
- **채팅방 생성**: POST `/api/chats`
- **채팅방 목록**: GET `/api/chats`
- **메시지 히스토리**: GET `/api/messages?chatId={id}`

### 3. 메시지 상태 관리
- **전송 중**: `isPending: true`
- **분석 중**: `isAnalyzing: true`
- **번역 중**: `isTranslating: true`
- **완료**: 모든 플래그 `false`

## 🗄️ DynamoDB 클라이언트 설정

### 클라이언트 구성

#### Frontend/API Routes (`/app/lib/dynamodb.ts`)
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const dynamodb = DynamoDBDocumentClient.from(client)
```

#### WebSocket Server (`/server/dynamodbClient.js`)
```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const dynamodb = DynamoDBDocumentClient.from(client)
module.exports = { dynamodb }
```

### 테이블 구조

#### CultureChat-Chats 테이블
```
Partition Key: id (String)
Attributes:
- name (String)
- country (String)
- lastMessage (String)
- timestamp (String)
- unread (Number)
- createdAt (String)
```

#### CultureChat-Messages 테이블
```
Partition Key: chatId (String)
Sort Key: timestamp (String)
Attributes:
- id (String)
- userId (String)
- message (String)
- feedback (Map - Optional)
```

### 환경 변수 설정
```bash
# .env.local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

## 🔧 API 엔드포인트

### 채팅방 관리
```
POST /api/chat-request
- Body: { senderEmail: string, receiverEmail: string, relationship: string }
- Response: { success: boolean, chatId: string, message: string }

GET /api/chats?userEmail={email}
- Response: Chat[] 배열 (사용자별 필터링)
```

### 메시지 관리
```
GET /api/messages?chatId={id}
- Response: Message[] 배열

POST /api/messages
- Body: { chatId, text, userId, feedback? }
- Response: Message 객체
```

### 매너 분석 및 번역
```
POST /api/hybrid-analyze
- Body: { message: string, targetCountry: string, relationship: string, language: string }
- Response: { type: 'good'|'warning', message: string, basicTranslation?: string, alternatives?: Alternative[] }

POST /api/analyze-with-alternatives
- Body: { message: string, targetCountry: string, relationship: string, language: string }
- Response: { alternatives: Alternative[], feedback: string }

POST /api/translate-analyze
- Body: { text: string, targetLanguage: string, sourceLanguage: string, targetCountry: string }
- Response: { translatedText: string, mannerFeedback?: object }
```

## 🔒 보안 및 인증

### 현재 구현
- 기본 userId 기반 식별
- DynamoDB 접근 제어

### 향후 개선 필요
- JWT 토큰 기반 인증
- 메시지 암호화
- Rate Limiting
- CORS 설정

## 📈 성능 최적화

### 현재 최적화
- 클라이언트 매핑으로 효율적인 메시지 라우팅
- DynamoDB 비동기 저장

### 향후 개선
- 메시지 캐싱 (Redis)
- 연결 풀링
- 메시지 배치 처리
- CDN 활용

## 🧪 테스트 시나리오

### 1. 기본 채팅 테스트
```javascript
// 연결 테스트
const ws = new WebSocket('ws://localhost:8080');
ws.send(JSON.stringify({
  type: 'join',
  userId: 'test1',
  chatId: 'test_chat'
}));

// 메시지 전송 테스트
ws.send(JSON.stringify({
  type: 'message',
  message: 'Hello World!',
  userId: 'test1',
  chatId: 'test_chat'
}));
```

### 2. 매너 체크 통합 테스트
```javascript
// 부적절한 메시지 테스트
fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    message: '너 정말 바보야',
    targetCountry: 'US'
  })
});
```

## 🚨 에러 처리

### WebSocket 에러
- 연결 실패: 재연결 로직
- 메시지 전송 실패: 큐잉 및 재시도
- 서버 다운: 자동 재연결

### API 에러
- DynamoDB 연결 실패: 500 에러 반환
- 잘못된 요청: 400 에러 반환
- 인증 실패: 401 에러 반환

## 📋 개발 체크리스트

### Phase 1: 기본 웹소켓 채팅 ✅
- [x] WebSocket 서버 구현
- [x] 기본 메시지 송수신
- [x] DynamoDB 연동
- [x] 채팅방 관리 API

### Phase 2: 매너 체크 통합 ✅
- [x] 실시간 매너 분석 연동 (hybrid-analyze API)
- [x] 대안 제시 기능 (AlternativeSelector)
- [x] 조건부 번역 자동화 (한국인끼리는 번역 안함)
- [x] 상태 관리 개선 (isPending, isAnalyzing)

### Phase 3: 고급 기능 📋
- [ ] 사용자 인증 시스템
- [ ] 메시지 암호화
- [ ] 파일 전송 지원
- [ ] 읽음 표시 기능

### Phase 4: 성능 최적화 📋
- [ ] Redis 캐싱
- [ ] 연결 풀링
- [ ] 로드 밸런싱
- [ ] 모니터링 시스템

## 🔗 관련 파일

### 핵심 파일
- `/server/websocket.js` - WebSocket 서버
- `/app/lib/chat-service.ts` - 채팅 서비스
- `/app/lib/dynamodb.ts` - DynamoDB 클라이언트 (Frontend)
- `/server/dynamodbClient.js` - DynamoDB 클라이언트 (WebSocket)
- `/types/chat.ts` - Chat 타입 정의
- `/types/message.ts` - Message 타입 정의

### API 라우트
- `/app/api/chat-request/route.ts` - 이메일 기반 채팅 요청
- `/app/api/chats/route.ts` - 채팅방 관리 (사용자별 필터링)
- `/app/api/messages/route.ts` - 메시지 관리
- `/app/api/hybrid-analyze/route.ts` - 매너 체크 + 조건부 번역
- `/app/api/analyze-with-alternatives/route.ts` - 대안 제시
- `/app/api/translate-analyze/route.ts` - 번역 + 매너 분석

### 컴포넌트
- `/app/components/ChatInterface.tsx` - 채팅 UI (실시간 메시지 + 매너 체크)
- `/app/components/ChatList.tsx` - 채팅방 목록
- `/app/components/NewChatModal.tsx` - 새 채팅 요청 모달
- `/app/components/MessageInput.tsx` - 메시지 입력
- `/app/components/AlternativeSelector.tsx` - 대안 선택 모달
- `/app/components/EnhancedMannerFeedback.tsx` - 향상된 매너 피드백
- `/app/components/RelationshipSelector.tsx` - 관계 선택

---

**마지막 업데이트**: 2025년 1월 6일  
**다음 리뷰**: Phase 3 고급 기능 개발 시