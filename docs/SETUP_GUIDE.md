# CultureChat 설정 가이드

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- AWS 계정 및 Bedrock 액세스 권한

### 1. 프로젝트 설정

#### 저장소 클론
```bash
git clone <repository-url>
cd team30-aws-hackathon_ko
```

#### 의존성 설치
```bash
npm install
```

### 2. AWS 설정

#### AWS CLI 설치 및 구성
```bash
# AWS CLI 설치
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# AWS 자격증명 구성
aws configure
```

#### Bedrock 모델 액세스 활성화
1. AWS Console → Bedrock → Model access
2. Claude 3 Sonnet 모델 활성화
3. 권한 확인

### 3. 환경변수 설정

#### .env.local 파일 생성
```bash
cp .env.local.example .env.local
```

#### 환경변수 입력
```env
# AWS 설정
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# 선택사항
NEXT_PUBLIC_APP_ENV=development
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 확인

## 🚀 프로덕션 배포

### AWS Amplify 배포

#### 1. Amplify CLI 설치
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. 프로젝트 초기화
```bash
amplify init
```

#### 3. 호스팅 추가
```bash
amplify add hosting
amplify publish
```

### Vercel 배포

#### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2. 배포
```bash
vercel --prod
```

#### 3. 환경변수 설정
Vercel Dashboard에서 환경변수 추가:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Docker 배포

#### Dockerfile 생성
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 빌드 및 실행
```bash
docker build -t culture-chat .
docker run -p 3000:3000 --env-file .env.local culture-chat
```

## 🔒 보안 설정

### AWS IAM 권한 설정
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/anthropic.claude-3-sonnet-20240229-v1:0"
    }
  ]
}
```

### 환경변수 보안
- `.env.local`을 `.gitignore`에 추가
- 프로덕션에서는 AWS Secrets Manager 사용 권장

## 🔍 문제 해결

### 일반적인 오류

#### 1. AWS 자격증명 오류
```
Error: The security token included in the request is invalid
```
**해결방법**: AWS 자격증명 재설정
```bash
aws configure
```

#### 2. Bedrock 모델 액세스 오류
```
Error: You don't have access to the model
```
**해결방법**: AWS Console에서 Bedrock 모델 액세스 활성화

#### 3. 빌드 오류
```
Error: Module not found
```
**해결방법**: 의존성 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

### 로그 확인
```bash
# 개발 서버 로그
npm run dev

# 프로덕션 로그
npm run start

# AWS CloudWatch 로그 (배포 후)
aws logs describe-log-groups
```

## 📊 모니터링 설정

### AWS CloudWatch 설정
```bash
# CloudWatch 에이전트 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### 성능 모니터링
- Next.js Analytics 활성화
- Vercel Analytics 연동
- AWS X-Ray 트레이싱 설정

## 🔄 CI/CD 설정

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 📞 지원

문제가 발생하면:
1. 이 가이드의 문제 해결 섹션 확인
2. GitHub Issues에 문제 보고
3. 개발팀에 문의