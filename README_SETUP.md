# 플랫폼별 설치 가이드

## 자동 설치 (권장)
```bash
node install.js
```

## 수동 설치
### macOS ARM64
```bash
node setup-platform.js
npm install
```

### Windows x64
```bash
node setup-platform.js
npm install
```

## 파일 구조
- `package_arm64.json` - macOS ARM64용
- `package_x64.json` - Windows x64용
- `setup-platform.js` - 플랫폼 감지 스크립트
- `install.js` - 통합 설치 스크립트