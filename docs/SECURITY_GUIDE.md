# CultureChat 보안 가이드

## 현재 보안 조치

### WebSocket 서버 보안
- **localhost 바인딩**: 127.0.0.1에서만 연결 허용
- **IP 검증**: 외부 IP 연결 차단
- **기본 인증**: userId, chatId 필수 검증

### 데이터 보안
- AWS DynamoDB 암호화 저장
- 환경변수로 AWS 자격증명 관리

## 추가 보안 강화 방안

### 1. JWT 토큰 인증
```javascript
// 향후 구현 예정
const jwt = require('jsonwebtoken')
const token = jwt.sign({ userId, chatId }, process.env.JWT_SECRET)
```

### 2. 메시지 암호화
```javascript
// 향후 구현 예정
const crypto = require('crypto')
const encryptedMessage = crypto.encrypt(message, key)
```

### 3. Rate Limiting
```javascript
// 향후 구현 예정
const rateLimit = new Map()
// 사용자당 초당 메시지 제한
```

## 현재 제한사항

⚠️ **개발 환경 전용**: 현재 구조는 로컬 개발용입니다.
⚠️ **프로덕션 배포 시**: AWS API Gateway + Lambda WebSocket 사용 권장
⚠️ **실제 인증**: OAuth 2.0 또는 AWS Cognito 통합 필요

## 프로덕션 배포 시 권장 아키텍처

```
Client → CloudFront → API Gateway WebSocket → Lambda → DynamoDB
```

- **API Gateway WebSocket**: 실시간 통신
- **Lambda Authorizer**: JWT 토큰 검증
- **DynamoDB**: 메시지 암호화 저장
- **CloudWatch**: 로그 및 모니터링