# 📰 네이버 뉴스 API 연동 가이드

## 1. 네이버 개발자 센터에서 API 키 발급

### 1.1 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. "Application > 애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: 기업 재무정보 조회 시스템
   - **사용 API**: 검색 (뉴스 검색)
   - **비로그인 오픈 API 서비스 환경**: 웹 서비스 URL 입력 (예: http://localhost:8080)

### 1.2 Client ID 및 Client Secret 확인
- 등록 후 발급받은 **Client ID**와 **Client Secret** 저장

---

## 2. CORS 문제 해결: 백엔드 프록시 서버 구축

네이버 API는 클라이언트에서 직접 호출 시 CORS 제한이 있어 **백엔드 프록시 서버**가 필요합니다.

### 2.1 Node.js/Express 프록시 서버 예시

#### 설치
```bash
npm init -y
npm install express axios cors dotenv
```

#### 프록시 서버 코드 (server.js)
```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 네이버 뉴스 API 프록시
app.post('/api/proxy/naver-news', async (req, res) => {
    try {
        const { query, display = 10 } = req.body;
        
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: {
                query: query,
                display: display,
                sort: 'date'
            },
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('네이버 API 오류:', error);
        res.status(500).json({ error: '뉴스를 불러올 수 없습니다.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

#### .env 파일
```env
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

#### 실행
```bash
node server.js
```

---

## 3. 프론트엔드 코드 수정

### 3.1 news-api.js 수정

현재 `news-api.js`의 `searchNaverNews()` 함수를 다음과 같이 수정:

```javascript
async searchNaverNews(query, display = 10) {
    try {
        // 백엔드 프록시를 통한 호출
        const response = await fetch('http://localhost:3000/api/proxy/naver-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, display })
        });
        
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        
        const data = await response.json();
        return this.parseNaverNews(data.items);
    } catch (error) {
        console.error('네이버 뉴스 검색 실패:', error);
        return this.generateSampleNews(query);
    }
}
```

### 3.2 HTML에서 API 키 입력 UI 추가 (선택사항)

설정 페이지나 모달에서 사용자가 직접 API 키를 입력할 수 있도록:

```javascript
// API 키 설정
NewsAPI.setNaverAPIKey('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');
```

---

## 4. 대안: Serverless Functions 사용

백엔드 서버 없이 Serverless Functions를 사용할 수도 있습니다:

### 4.1 Vercel Serverless Function
```javascript
// api/naver-news.js
import axios from 'axios';

export default async function handler(req, res) {
    const { query, display = 10 } = req.body;
    
    try {
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: { query, display, sort: 'date' },
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
            }
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: '뉴스를 불러올 수 없습니다.' });
    }
}
```

### 4.2 AWS Lambda + API Gateway
Lambda 함수를 생성하고 API Gateway를 통해 엔드포인트 제공

---

## 5. 현재 임시 해결책

현재는 샘플 데이터의 링크를 네이버 검색 결과 페이지로 연결했습니다:
```javascript
const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}`;
```

**장점:**
- 즉시 사용 가능
- 실제 네이버 뉴스 검색 결과로 이동

**단점:**
- 특정 기사로 직접 연결되지 않음
- 검색 결과 페이지로 이동

---

## 6. 비용

- **네이버 검색 API**: 무료 (일일 호출 제한 있음)
  - 뉴스 검색: 하루 25,000건

---

## 7. 참고 자료

- [네이버 개발자 센터](https://developers.naver.com/)
- [네이버 검색 API 문서](https://developers.naver.com/docs/serviceapi/search/news/news.md)
- [CORS 이해하기](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)

---

## 요약

✅ **현재 상태**: 샘플 데이터 + 네이버 검색 페이지 링크  
🔄 **실제 API 사용 시 필요**: 네이버 API 키 + 백엔드 프록시 서버  
💡 **추천**: Node.js/Express 프록시 또는 Vercel Serverless Functions
