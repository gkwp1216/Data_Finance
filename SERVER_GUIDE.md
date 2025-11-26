# 🚀 네이버 뉴스 API 프록시 서버 실행 가이드

## 📋 준비 사항

### 1. Node.js 설치 확인
PowerShell에서 확인:
```powershell
node --version
npm --version
```

Node.js가 설치되어 있지 않다면 [nodejs.org](https://nodejs.org/)에서 다운로드하여 설치하세요.

---

## 🔧 설치 및 실행

### 1단계: 의존성 패키지 설치
PowerShell에서 프로젝트 폴더로 이동 후 실행:
```powershell
cd C:\Users\admin\Documents\KKW\Finance
npm install
```

설치되는 패키지:
- `express` - 웹 서버 프레임워크
- `axios` - HTTP 클라이언트
- `cors` - CORS 처리

### 2단계: 프록시 서버 실행
```powershell
npm start
```

또는 직접 실행:
```powershell
node proxy-server.js
```

### 3단계: 서버 상태 확인
브라우저에서 접속:
```
http://localhost:3000/health
```

정상 작동 시 다음과 같은 JSON 응답:
```json
{
  "status": "OK",
  "message": "프록시 서버가 정상 작동 중입니다.",
  "timestamp": "2025-11-26T..."
}
```

---

## 📱 웹 애플리케이션 사용

### 1. 프록시 서버가 실행된 상태에서 index.html 열기
- 브라우저에서 `index.html` 파일 열기
- 또는 Live Server 확장으로 실행

### 2. 기업 검색
- 기업명 입력 (예: 삼성전자, SK하이닉스)
- 뉴스 탭에서 실제 네이버 뉴스 확인

### 3. 작동 방식
```
사용자 (index.html)
    ↓ 기업명 검색
app.js → NewsAPI.searchNaverNews()
    ↓ fetch 요청
프록시 서버 (localhost:3000)
    ↓ API 호출 (API 키 포함)
네이버 서버
    ↓ 뉴스 데이터 응답
프록시 서버
    ↓ CORS 헤더 추가
app.js → 뉴스 표시
```

---

## 🐛 문제 해결

### 문제 1: "프록시 서버가 실행 중인지 확인하세요" 메시지
**원인**: 프록시 서버가 실행되지 않음  
**해결**: 
```powershell
npm start
```

### 문제 2: "npm을 찾을 수 없습니다"
**원인**: Node.js가 설치되지 않음  
**해결**: [nodejs.org](https://nodejs.org/)에서 Node.js 설치

### 문제 3: 포트 3000이 이미 사용 중
**원인**: 다른 애플리케이션이 3000 포트 사용  
**해결**: 
```powershell
# 포트 변경 (proxy-server.js 수정)
const PORT = 3001;  # 3000 → 3001로 변경

# news-api.js도 수정
fetch('http://localhost:3001/api/proxy/naver-news', ...)
```

### 문제 4: 샘플 데이터만 표시됨
**확인 사항**:
1. 프록시 서버가 실행 중인가?
2. 브라우저 콘솔에 에러 메시지는?
3. http://localhost:3000/health 접속 가능한가?

---

## 🔄 개발 모드 (자동 재시작)

코드 수정 시 서버 자동 재시작:
```powershell
npm install -g nodemon
npm run dev
```

---

## 📊 API 사용 현황

### 네이버 검색 API 제한
- **일일 호출 한도**: 25,000건
- **초당 호출 한도**: 10건
- **비용**: 무료

### 현재 설정
- 기업당 뉴스 5개 조회
- 캐싱 없음 (매번 새로 조회)

---

## 🎯 다음 단계

### 선택 1: 계속 사용
프록시 서버를 계속 실행하면서 사용

### 선택 2: 배포
- **Vercel/Netlify**: Serverless Functions
- **Heroku/Railway**: Node.js 앱 배포
- **AWS Lambda**: API Gateway + Lambda

### 선택 3: 캐싱 추가
자주 검색하는 기업의 뉴스를 캐싱하여 API 호출 절약

---

## 📌 요약

### ✅ 완료된 작업
1. ✅ 프록시 서버 생성 (`proxy-server.js`)
2. ✅ package.json 생성
3. ✅ news-api.js 수정 (실제 API 호출)
4. ✅ API 키 설정 완료

### 🚀 실행 순서
1. `npm install` (최초 1회)
2. `npm start` (프록시 서버 실행)
3. `index.html` 열기
4. 기업 검색 → 실제 뉴스 확인!

### 📡 서버 정보
- **프록시 서버**: http://localhost:3000
- **엔드포인트**: /api/proxy/naver-news
- **상태 확인**: /health

---

**문제가 발생하면 프록시 서버의 콘솔 로그를 확인하세요!**
