# 🚀 고급 기능 개발 로드맵

## Phase 1: 맞춤형 대시보드 (1-2주) 📍 **다음 작업**

### 1.1 위젯 시스템 설계
```javascript
// 위젯 타입 정의
const WIDGET_TYPES = {
  WATCHLIST: 'watchlist',           // 관심 기업 목록
  QUICK_SEARCH: 'quick-search',     // 빠른 검색
  FINANCIAL_SUMMARY: 'fin-summary', // 재무 요약
  RATIO_CHART: 'ratio-chart',       // 비율 차트
  NEWS_FEED: 'news-feed',           // 뉴스 피드
  ALERTS: 'alerts'                  // 알림
};

// 위젯 데이터 구조
const widget = {
  id: 'widget-1',
  type: 'watchlist',
  position: { x: 0, y: 0, w: 2, h: 3 },
  settings: { /* 위젯별 설정 */ }
};
```

### 1.2 레이아웃 관리
- Grid 기반 레이아웃 (12 컬럼)
- 드래그 앤 드롭 (Sortable.js 또는 직접 구현)
- 위젯 크기 조절
- localStorage에 레이아웃 저장

### 1.3 구현 파일
- `dashboard.html` - 대시보드 페이지
- `dashboard.js` - 대시보드 로직
- `widget-*.js` - 각 위젯 컴포넌트
- `dashboard.css` - 대시보드 스타일

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

### 드래그 앤 드롭
- 📦 Sortable.js (드래그 앤 드롭)
- 📦 Gridstack.js (대시보드 그리드)

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
4. 📍 **대시보드 페이지 생성** (Phase 1)
5. ⏳ 재무 건전성 점수 (Phase 6)

### 🟢 Low Priority (5주+)
6. ⏳ AI 추천 알고리즘 (Phase 6)
7. ⏳ 이상 패턴 감지 (Phase 6)
8. ⏳ 고급 차트 (D3.js)

---

## 📁 파일 구조 (현재)

```
Finance/
├── index.html              ✅ 기본 검색 페이지 (1200+ 라인)
├── dashboard.html          📦 대시보드 페이지 (다음 작업)
├── style.css               ✅ 기본 스타일 (1800+ 라인)
├── dashboard.css           📦 대시보드 스타일
├── app.js                  ✅ 기본 앱 로직 (1200+ 라인)
├── dashboard.js            📦 대시보드 로직
├── watchlist.js            ✅ 워치리스트 관리 (450+ 라인)
├── investment-metrics.js   ✅ 투자 지표 계산 (400+ 라인)
├── news-api.js             ✅ 뉴스 API 연동 (400+ 라인)
├── proxy-server.js         ✅ 네이버 API 프록시 서버 (Node.js)
├── package.json            ✅ 프록시 서버 의존성
├── ai-analysis.js          📦 AI 분석 로직
├── widgets/                📦 위젯 컴포넌트
│   ├── watchlist-widget.js
│   ├── news-widget.js
│   └── chart-widget.js
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
| 드래그 | Sortable.js / Gridstack.js | 📦 |

---

## 💡 다음 단계

### ✅ 완료된 작업 (2025-11-26 기준)
1. ✅ **워치리스트 시스템 구현** - localStorage 기반 CRUD, 알림, 태그, 메모
2. ✅ **투자 지표 추가** - PER, PBR, PSR, EV/EBITDA, 배당수익률 (8개 지표)
3. ✅ **뉴스 연동** - Naver News API 실제 연동 완료 (프록시 서버 구축)
4. ✅ **색상 체계 커스터마이징** - 저평가(빨강) → 고평가(초록) 반전
5. ✅ **프록시 서버 구축** - Node.js/Express, 네이버 API 키 통합

### 📍 다음 우선 작업: Phase 1 - 맞춤형 대시보드
**목표:** 워치리스트와 주요 지표를 한눈에 볼 수 있는 대시보드 페이지 생성

**구현 계획:**
1. **dashboard.html 생성**
   - 헤더 네비게이션 (index.html ↔️ dashboard.html)
   - 그리드 레이아웃 (12컬럼 시스템)
   - 위젯 컨테이너 영역

2. **dashboard.css 생성**
   - 그리드 시스템 스타일
   - 위젯 카드 디자인
   - 반응형 브레이크포인트

3. **dashboard.js 생성**
   - 위젯 시스템 초기화
   - localStorage에서 레이아웃 로드/저장
   - 위젯 추가/삭제/이동 로직

4. **초기 위젯 구현**
   - 📊 워치리스트 위젯 (watchlist.js 재사용)
   - 🔍 빠른 검색 위젯
   - 📈 재무 요약 위젯
   - 📰 뉴스 피드 위젯 (news-api.js 재사용)

**예상 소요 시간:** 2-3일

### 🔄 향후 작업 순서
5. **재무 건전성 점수** (Phase 6) - 100점 만점 스코어링
6. **AI 추천 알고리즘** (Phase 6) - 매수/매도/보유 추천
7. **이상 패턴 감지** (Phase 6) - 급격한 재무 변화 감지

### 🎯 기술적 고려사항
- **드래그 앤 드롭:** Sortable.js 또는 Gridstack.js 도입 검토
- **실시간 주가:** WebSocket 또는 polling 방식 검토
- **성능 최적화:** Virtual scrolling, lazy loading

각 단계는 독립적으로 개발 가능하며, 점진적으로 기능을 추가할 수 있습니다.
