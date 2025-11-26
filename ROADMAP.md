# 🚀 고급 기능 개발 로드맵

## Phase 1: 실시간 주가 정보 연동 (1-2주) 📍 **다음 작업**

### 1.1 실시간 주가 데이터 소스
```javascript
// API 옵션
const STOCK_API_OPTIONS = {
  // 옵션 1: 한국투자증권 OpenAPI
  KIS: 'https://openapi.koreainvestment.com',
  
  // 옵션 2: 네이버 금융 (크롤링)
  NAVER_FINANCE: 'https://finance.naver.com',
  
  // 옵션 3: Yahoo Finance API
  YAHOO: 'https://query1.finance.yahoo.com/v8/finance/chart/'
};

// 실시간 데이터 구조
const realtimeStock = {
  code: '005930',
  name: '삼성전자',
  price: 75000,
  change: +1500,
  changeRate: 2.04,
  volume: 15234567,
  timestamp: '2024-01-15 15:30:00'
};
```

### 1.2 데이터 업데이트 방식
**Polling 방식 (단순)**
```javascript
// 30초마다 주가 업데이트
setInterval(() => {
  updateStockPrices();
}, 30000);
```

**WebSocket 방식 (실시간)**
```javascript
// WebSocket 연결
const ws = new WebSocket('wss://api.stock.com/realtime');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateStockUI(data);
};
```

### 1.3 구현 파일
- `realtime-stock.js` - 실시간 주가 API 통합
- `stock-updater.js` - 자동 업데이트 로직
- `stock-widget.css` - 주가 위젯 스타일

---

## Phase 2: 관심 기업 모니터링 (1주) ✅ **완료**

### 2.1 데이터 구조
```javascript
// localStorage 스키마
const watchlist = [
  {
    id: 'watch-1',
    corpCode: '00126380',
    corpName: '삼성전자',
    addedDate: '2024-01-15',
    memo: '반도체 업황 주시',
    alerts: [
      {
        metric: '부채비율',
        condition: 'above',
        threshold: 150,
        enabled: true
      }
    ],
    bookmark: true,
    tags: ['반도체', '대형주']
  }
];
```

### 2.2 주요 기능
- ✅ 기업 추가/삭제
- ✅ 북마크 기능
- ✅ 메모 작성
- ✅ 태그 분류
- ✅ 임계값 알림 설정
- ✅ 알림 히스토리

### 2.3 UI 컴포넌트
- 워치리스트 사이드바
- 기업 카드 (확장 가능)
- 알림 설정 모달
- 메모 에디터

---

## Phase 4: 투자 의사결정 지표 (1-2주) ✅ **완료**

### 4.1 추가 지표 계산 ✅
```javascript
// PER (주가수익비율)
PER = 주가 / 주당순이익(EPS)

// PBR (주가순자산비율)
PBR = 주가 / 주당순자산(BPS)

// PSR (주가매출액비율)
PSR = 시가총액 / 매출액

// EV/EBITDA
EV = 시가총액 + 순차입금
EBITDA = 영업이익 + 감가상각비

// 배당수익률
배당수익률 = (주당배당금 / 주가) × 100
```

### 4.2 데이터 소스
- 주가 데이터: 한국거래소 API / 네이버 증권 크롤링
- 주식 수: 금융위원회 API (기업개황)
- 배당 정보: DART API

### 4.3 시각화
- 지표 비교 레이더 차트
- 업종 평균 대비 상대 위치
- 시계열 추이 그래프

---

## Phase 5: 기업 뉴스 연동 (1주) ✅ **완료 (2025-11-26)**

### 5.1 API 연동 ✅
**네이버 검색 API**
```javascript
// 네이버 뉴스 검색
const NAVER_API = 'https://openapi.naver.com/v1/search/news.json';
const params = {
  query: '삼성전자',
  display: 10,
  sort: 'date'
};
```

**DART 공시 API**
```javascript
// 전자공시 시스템
const DART_API = 'https://opendart.fss.or.kr/api/list.json';
const params = {
  crtfc_key: 'YOUR_API_KEY',
  corp_code: '00126380',
  bgn_de: '20240101',
  end_de: '20241231'
};
```

### 5.2 기능 ✅
- ✅ 실시간 뉴스 피드 (Naver News API 연동)
- ✅ 공시 정보 타임라인 (DART API 연동)
- ✅ 뉴스/공시 탭 전환 UI
- ✅ 뉴스 카드 디자인 (호버 효과, 좌측 보더 애니메이션)
- ✅ 공시 타입별 색상 구분 (재무/배당/자본/합병)
- ✅ 로딩 상태 및 빈 상태 처리
- ⏳ 중요 공시 알림 (유상증자, 배당, 합병 등) - 향후 구현
- ⏳ 재무제표 발표일 자동 알림 - 향후 구현

### 5.3 구현 내역
**파일 생성/수정:**
- ✅ `news-api.js` - 뉴스/공시 API 통합 모듈 (400+ 라인)
- ✅ `proxy-server.js` - 네이버 API 프록시 서버 (Node.js/Express)
- ✅ `package.json` - 프록시 서버 의존성 관리
- ✅ `index.html` - 뉴스 섹션 추가 (탭, 피드, 공시 리스트)
- ✅ `style.css` - 뉴스 스타일링 (+200 라인, 총 1800+ 라인)
- ✅ `app.js` - 뉴스 로드 및 표시 로직 통합 (+150 라인)

**주요 기능:**
- `NewsAPI.searchNaverNews()` - 네이버 뉴스 검색 (실제 API 연동)
- `NewsAPI.searchDartDisclosure()` - DART 공시 조회
- `loadNews(companyName)` - 기업별 뉴스 로드
- `loadDisclosure(corpCode)` - 기업별 공시 로드
- `switchNewsTab(tabName)` - 탭 전환
- `displayNews(news)` - 뉴스 렌더링
- `displayDisclosure(disclosure)` - 공시 렌더링

**프록시 서버 구축:**
- ✅ Node.js/Express 기반 프록시 서버
- ✅ 네이버 API 키 통합 (Client ID & Secret)
- ✅ CORS 처리
- ✅ 에러 핸들링 및 폴백
- ✅ 서버 상태 확인 엔드포인트

**디자인 특징:**
- 그라디언트 탭 인디케이터 (primary → secondary)
- 뉴스 카드 호버 시 좌측 보더 확장 + translateX 효과
- 공시 타입별 원형 아이콘 (60px, 그라디언트 배경)
- 모바일 반응형 레이아웃
- 실제 뉴스 링크 연동

---

## Phase 6: AI 분석 기능 (2-3주)

### 6.1 재무 건전성 점수화
```javascript
// 점수 시스템 (100점 만점)
function calculateHealthScore(data) {
  let score = 0;
  
  // 수익성 (30점)
  score += roeScore(data.roe);        // ROE 평가
  score += roa Score(data.roa);       // ROA 평가
  
  // 안정성 (30점)
  score += debtRatioScore(data.debtRatio);
  score += currentRatioScore(data.currentRatio);
  
  // 성장성 (20점)
  score += revenueGrowthScore(data.revenueGrowth);
  score += profitGrowthScore(data.profitGrowth);
  
  // 밸류에이션 (20점)
  score += perScore(data.per);
  score += pbrScore(data.pbr);
  
  return score;
}
```

### 6.2 투자 추천 알고리즘
```javascript
// 추천 등급
const RATING = {
  STRONG_BUY: '적극 매수',
  BUY: '매수',
  HOLD: '보유',
  SELL: '매도',
  STRONG_SELL: '적극 매도'
};

// 추천 로직
function getInvestmentRating(healthScore, valuation) {
  if (healthScore >= 80 && valuation === 'undervalued') {
    return RATING.STRONG_BUY;
  }
  // ... 추가 로직
}
```

### 6.3 이상 패턴 감지
```javascript
// 감지할 패턴
- 급격한 부채비율 증가 (전년 대비 50% 이상)
- 유동비율 급락 (유동성 위기)
- 매출 감소 + 영업이익 증가 (회계 조작 의심)
- 자산 대비 과도한 현금 (M&A 가능성)
```

---

## 📦 필요 라이브러리

### 차트 & 시각화
- ✅ Chart.js (이미 사용 중)
- 📦 ApexCharts (고급 인터랙티브 차트)
- 📦 D3.js (커스텀 시각화)

### 실시간 데이터
- 📦 Socket.io (WebSocket 클라이언트)
- 📦 axios (HTTP 요청)

### 유틸리티
- 📦 date-fns (날짜 처리)
- 📦 lodash (데이터 처리)

---

## 🎯 구현 우선순위

### 🔴 High Priority (1-2주 내) ✅ **완료**
1. ✅ 워치리스트 기본 기능 (Phase 2 완료)
2. ✅ 투자 지표 계산 (PER, PBR, PSR, EV/EBITDA, 배당수익률)
3. ✅ 뉴스 API 연동 (Phase 5 완료)

### 🟡 Medium Priority (3-4주 내) 🔄 **다음 작업**
4. 📍 **실시간 주가 정보 연동** (Phase 1)
5. 📍 **성능 최적화** (Virtual scrolling, Lazy loading)
6. ⏳ 재무 건전성 점수 (Phase 6)

### 🟢 Low Priority (5주+)
7. ⏳ AI 추천 알고리즘 (Phase 6)
8. ⏳ 이상 패턴 감지 (Phase 6)
9. ⏳ 고급 차트 (D3.js)

---

## 📁 파일 구조 (현재)

```
Finance/
├── index.html              ✅ 기본 검색 페이지 (1200+ 라인)
├── style.css               ✅ 기본 스타일 (1800+ 라인)
├── app.js                  ✅ 기본 앱 로직 (1600+ 라인)
├── watchlist.js            ✅ 워치리스트 관리 (450+ 라인)
├── investment-metrics.js   ✅ 투자 지표 계산 (400+ 라인)
├── financial-health.js     ✅ 재무 건전성 점수 (450+ 라인)
├── stock-api.js            ✅ 주식 API 통합 (200+ 라인)
├── news-api.js             ✅ 뉴스 API 연동 (400+ 라인)
├── proxy-server.js         ✅ 네이버 API 프록시 서버 (Node.js)
├── package.json            ✅ 프록시 서버 의존성
├── realtime-stock.js       📦 실시간 주가 (다음 작업)
├── stock-updater.js        📦 주가 자동 업데이트
├── performance-optimizer.js 📦 성능 최적화
├── ai-analysis.js          📦 AI 분석 로직
├── basic.md                ✅ 프로젝트 문서
├── ROADMAP.md              ✅ 로드맵 (이 파일)
├── PROGRESS.md             ✅ 진행 상황 로그
├── NAVER_API_GUIDE.md      ✅ 네이버 API 가이드
└── SERVER_GUIDE.md         ✅ 프록시 서버 실행 가이드
```

---

## 🔧 기술 스택 요약

| 카테고리 | 기술 | 상태 |
|---------|------|------|
| Frontend | HTML5, CSS3, Vanilla JS | ✅ |
| 차트 | Chart.js | ✅ |
| API | 금융위원회 API | ✅ |
| 스토리지 | localStorage | ✅ |
| 뉴스 | Naver API, DART API | ✅ |
| 프록시 | Node.js/Express | ✅ |
| 실시간 | WebSocket / Polling | 📦 |
| 최적화 | Virtual Scroll, Lazy Load | 📦 |

---

## 💡 다음 단계

### ✅ 완료된 작업 (2025-11-26 기준)
1. ✅ **워치리스트 시스템 구현** - localStorage 기반 CRUD, 알림, 태그, 메모
2. ✅ **투자 지표 추가** - PER, PBR, PSR, EV/EBITDA, 배당수익률 (8개 지표)
3. ✅ **뉴스 연동** - Naver News API 실제 연동 완료 (프록시 서버 구축)
4. ✅ **재무 건전성 점수** - 100점 만점 스코어링 시스템 (4개 카테고리)
5. ✅ **주식 API 통합** - 주가, 시가총액, 상장주식수 자동 입력
6. ✅ **색상 체계 커스터마이징** - 저평가(빨강) → 고평가(초록) 반전
7. ✅ **프록시 서버 구축** - Node.js/Express, 네이버 API 키 통합
8. ✅ **기업명 검증** - 상장 기업 목록 검증 및 오류 처리

---

## 📍 다음 우선 작업: Phase 1 - 실시간 주가 정보 연동

### 목표
워치리스트와 재무 페이지에 실시간 주가 정보를 자동 업데이트

### 구현 계획

#### 1단계: API 조사 및 선택 (1일)
**검토할 API:**
- 한국투자증권 OpenAPI (실시간 가능, 인증 필요)
- 네이버 금융 크롤링 (준실시간, 간단)
- Yahoo Finance API (글로벌 주식)
- Alpha Vantage API (무료 티어 제한)

**선정 기준:**
- 무료 사용 가능 여부
- API 호출 제한
- 실시간성 (지연 시간)
- 데이터 신뢰성

#### 2단계: realtime-stock.js 구현 (2-3일)
```javascript
// 주요 기능
class RealtimeStock {
  constructor() {
    this.updateInterval = 30000; // 30초
    this.watchedStocks = [];
  }
  
  // 주가 조회
  async fetchStockPrice(code) { }
  
  // 자동 업데이트 시작
  startAutoUpdate() { }
  
  // 워치리스트 동기화
  syncWithWatchlist() { }
}
```

#### 3단계: UI 업데이트 (1-2일)
- 워치리스트 카드에 실시간 주가 표시
- 등락률 색상 변화 (빨강/파랑)
- 로딩 인디케이터
- 마지막 업데이트 시간 표시

#### 4단계: 테스트 및 최적화 (1일)
- API 호출 최적화 (배치 처리)
- 에러 핸들링
- 로컬스토리지 캐싱

**예상 소요 시간:** 5-7일

---

## 📍 다음 작업 2: 성능 최적화

### 목표
대량의 재무 데이터와 뉴스를 효율적으로 렌더링

### 구현 계획

#### 1. Virtual Scrolling (가상 스크롤)
```javascript
// 뉴스 피드에 적용
class VirtualScroller {
  constructor(container, itemHeight) {
    this.visibleItems = 10;
    this.bufferSize = 5;
  }
  
  // 보이는 영역만 렌더링
  render(startIndex, endIndex) { }
}
```

**적용 대상:**
- 뉴스 피드 (수백 개 뉴스)
- 공시 리스트
- 워치리스트 (많은 기업)

#### 2. Lazy Loading (지연 로딩)
```javascript
// 이미지, 차트 지연 로딩
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadChart(entry.target);
    }
  });
});
```

**적용 대상:**
- Chart.js 차트
- 뉴스 썸네일 이미지
- 재무 데이터 테이블

#### 3. 데이터 캐싱
```javascript
// localStorage + 메모리 캐시
class DataCache {
  constructor(ttl = 300000) { // 5분
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) { }
  get(key) { }
  isExpired(key) { }
}
```

**예상 소요 시간:** 3-4일

---

## 🔄 향후 작업 순서

### 단기 (1-2주)
1. 📍 **실시간 주가 연동** - 워치리스트 자동 업데이트
2. 📍 **성능 최적화** - Virtual scroll, Lazy load, 캐싱

### 중기 (3-4주)
3. ⏳ **AI 추천 알고리즘** (Phase 6) - 매수/매도/보유 추천
4. ⏳ **이상 패턴 감지** (Phase 6) - 급격한 재무 변화 감지

### 장기 (5주+)
5. ⏳ **고급 차트** (D3.js) - 인터랙티브 시각화
6. ⏳ **포트폴리오 관리** - 보유 종목 추적
7. ⏳ **백테스팅** - 전략 시뮬레이션

---

## 🎯 기술 스택 선택

### 실시간 주가
- **Polling 방식** (단순, 안정적)
  - 30초마다 API 호출
  - 에러 핸들링 용이
  - 무료 API에 적합

- **WebSocket 방식** (고급, 실시간)
  - 밀리초 단위 업데이트
  - 서버 부하 낮음
  - 유료 API 필요

→ **1단계: Polling 방식으로 시작**

### 성능 최적화
- **Virtual Scrolling:** 직접 구현 (라이브러리 없이)
- **Lazy Loading:** Intersection Observer API
- **캐싱:** localStorage + Map

→ **Vanilla JS로 구현 (의존성 최소화)**
