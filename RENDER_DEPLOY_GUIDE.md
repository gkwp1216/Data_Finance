# 🚀 Render.com 배포 가이드

네이버 뉴스 프록시 서버를 Render.com에 배포하는 방법을 안내합니다.

## 📋 목차

1. [준비 사항](#준비-사항)
2. [GitHub 리포지토리 준비](#github-리포지토리-준비)
3. [Render.com 배포](#rendercom-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [프론트엔드 연결](#프론트엔드-연결)
6. [테스트 및 확인](#테스트-및-확인)

---

## 1️⃣ 준비 사항
  
### 필요한 것들
- ✅ GitHub 계정
- ✅ Render.com 계정 (무료)
- ✅ 네이버 API 키 (Client ID, Client Secret)

### 파일 확인
다음 파일들이 프로젝트에 있는지 확인:
```
Finance/
├── proxy-server.js          ← 프록시 서버 코드
├── package.json             ← Node.js 패키지 정보
└── news-api.js              ← 프론트엔드 API 호출 코드
```

---

## 2️⃣ GitHub 리포지토리 준비

### Step 1: package.json 확인

`package.json` 파일이 다음 내용을 포함하는지 확인:

```json
{
  "name": "finance-proxy-server",
  "version": "1.0.0",
  "description": "Proxy server for Naver News API",
  "main": "proxy-server.js",
  "scripts": {
    "start": "node proxy-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

**없다면 생성:**
```bash
# PowerShell에서 실행
cd C:\Users\admin\Documents\KKW\Finance
npm init -y
npm install express cors axios
```

### Step 2: .gitignore 생성

프로젝트 루트에 `.gitignore` 파일 생성:

```gitignore
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 환경 변수
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Step 3: GitHub에 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Add proxy server for deployment"

# GitHub 리포지토리와 연결
git remote add origin https://github.com/gkwp1216/Data_Finance.git
git branch -M master
git push -u origin master
```

---

## 3️⃣ Render.com 배포

### Step 1: Render.com 회원가입

1. [Render.com](https://render.com) 접속
2. **Sign Up** 클릭
3. GitHub 계정으로 로그인 (권장)

### Step 2: New Web Service 생성

1. 대시보드에서 **New +** 버튼 클릭
2. **Web Service** 선택
3. GitHub 리포지토리 연결:
   - **Connect GitHub** 클릭
   - `Data_Finance` 리포지토리 선택
   - **Connect** 클릭

### Step 3: 서비스 설정

다음 정보 입력:

| 항목 | 값 |
|------|-----|
| **Name** | `finance-news-proxy` (원하는 이름) |
| **Region** | `Singapore` (가장 가까운 지역) |
| **Branch** | `master` |
| **Root Directory** | 비워두기 (또는 `/`) |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### Step 4: 배포 시작

- **Create Web Service** 버튼 클릭
- 배포 시작 (약 3-5분 소요)
- 로그에서 진행 상황 확인

---

## 4️⃣ 환경 변수 설정

### Step 1: Environment Variables 추가

1. Render 대시보드에서 생성된 서비스 클릭
2. 좌측 메뉴에서 **Environment** 클릭
3. **Add Environment Variable** 클릭

### Step 2: 변수 추가

다음 두 개의 환경 변수 추가:

**변수 1:**
- **Key:** `NAVER_CLIENT_ID`
- **Value:** `Dzae9kwCMAsfyaN3rTrJ`

**변수 2:**
- **Key:** `NAVER_CLIENT_SECRET`
- **Value:** `rjK8xPVArj`

### Step 3: 저장 및 재배포

- **Save Changes** 클릭
- 자동으로 재배포 시작

---

## 5️⃣ 프론트엔드 연결

### Step 1: 배포 URL 확인

Render 대시보드 상단에서 URL 확인:
```
https://finance-news-proxy.onrender.com
```

### Step 2: news-api.js 수정

`news-api.js` 파일 열어서 PROXY_URL 수정:

**수정 전:**
```javascript
const NewsAPI = {
    PROXY_URL: 'http://localhost:3000/api/proxy/naver-news',
    // ...
}
```

**수정 후:**
```javascript
const NewsAPI = {
    // 로컬 개발 시
    // PROXY_URL: 'http://localhost:3000/api/proxy/naver-news',
    
    // 프로덕션 (Render 배포)
    PROXY_URL: 'https://finance-news-proxy.onrender.com/api/proxy/naver-news',
    
    // ...
}
```

### Step 3: 변경사항 커밋 및 푸시

```bash
git add news-api.js
git commit -m "Update proxy URL for production"
git push origin master
```

---

## 6️⃣ 테스트 및 확인

### Step 1: Health Check

브라우저에서 다음 URL 접속:
```
https://finance-news-proxy.onrender.com/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Proxy server is running"
}
```

### Step 2: API 테스트

브라우저 개발자 도구(F12) 콘솔에서:

```javascript
// 프록시 서버 테스트
fetch('https://finance-news-proxy.onrender.com/api/proxy/naver-news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '삼성전자' })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Step 3: 실제 페이지 테스트

1. 프론트엔드를 Netlify에 배포
2. 기업 검색 실행
3. 콘솔에서 확인:
   ```
   ✅ 5개의 실제 뉴스를 불러왔습니다.
   ```

---

## 🔧 문제 해결

### 문제 1: 배포 실패

**증상:** Build 또는 Start 실패

**해결:**
```bash
# 로컬에서 테스트
npm install
npm start

# package.json의 scripts 확인
{
  "scripts": {
    "start": "node proxy-server.js"
  }
}
```

### 문제 2: 503 Service Unavailable

**원인:** Free 플랜은 15분 동안 요청이 없으면 슬립 모드

**해결:**
- 첫 요청 시 30초 정도 대기 (자동으로 재시작)
- 또는 유료 플랜 사용

### 문제 3: CORS 에러 발생

**해결:** `proxy-server.js`에서 CORS 설정 확인:

```javascript
const cors = require('cors');
app.use(cors({
    origin: '*',  // 또는 특정 도메인
    credentials: true
}));
```

### 문제 4: 환경 변수 인식 안 됨

**확인:**
```javascript
// proxy-server.js 상단에 로그 추가
console.log('NAVER_CLIENT_ID:', process.env.NAVER_CLIENT_ID);
console.log('NAVER_CLIENT_SECRET:', process.env.NAVER_CLIENT_SECRET);
```

Render 로그에서 확인 후 Environment 탭에서 재설정

---

## 📊 배포 흐름도

```
로컬 개발
├── proxy-server.js (localhost:3000)
└── index.html (Live Server)

↓ Git Push

GitHub
└── Data_Finance 리포지토리

↓ 연결

Render.com
├── 자동 빌드 (npm install)
├── 자동 배포 (npm start)
└── 공개 URL 생성 (https://xxx.onrender.com)

↓ 사용

Netlify
├── 정적 파일 배포 (HTML, CSS, JS)
└── news-api.js → Render 프록시 서버 호출
```

---

## 🎯 완료 체크리스트

배포 전:
- [ ] `package.json` 존재
- [ ] `proxy-server.js` 정상 작동 확인
- [ ] GitHub 리포지토리 푸시 완료

Render 배포:
- [ ] Render.com 회원가입
- [ ] Web Service 생성
- [ ] GitHub 연결
- [ ] 환경 변수 설정 (NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)
- [ ] 배포 성공 확인

프론트엔드 연결:
- [ ] Render URL 확인
- [ ] `news-api.js` PROXY_URL 수정
- [ ] Git 커밋 및 푸시
- [ ] Netlify 배포

테스트:
- [ ] Health check 확인
- [ ] API 호출 테스트
- [ ] 실제 페이지에서 뉴스 표시 확인

---

## 💰 비용 안내

### Render.com Free 플랜
- ✅ **무료**
- ✅ 750시간/월 무료 사용
- ✅ HTTPS 자동 제공
- ⚠️ 15분 비활성 시 슬립 모드
- ⚠️ 첫 요청 시 콜드 스타트 (30초 소요)

### 업그레이드 시
- **Starter:** $7/월 (슬립 없음, 빠른 응답)
- **Standard:** $25/월 (확장 가능)

---

## 📞 지원

문제가 발생하면:
1. Render 대시보드의 **Logs** 탭 확인
2. 브라우저 개발자 도구(F12) 콘솔 확인
3. [Render 문서](https://render.com/docs) 참고

---

## 🎉 축하합니다!

이제 네이버 뉴스 API가 Netlify에서도 정상적으로 작동합니다! 🚀

프로젝트 URL:
- **프론트엔드:** https://your-site.netlify.app
- **백엔드:** https://finance-news-proxy.onrender.com

---

**작성일:** 2025년 11월 26일  
**작성자:** GitHub Copilot  
**프로젝트:** 기업 재무정보 조회 시스템
