# 🚀 고급 기능 개발 로드맵

## Phase 1: 맞춤형 대시보드 (1-2주)

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

## Phase 2: 관심 기업 모니터링 (1주)

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

## Phase 3: 분석 리포트 자동 생성 (2주)

### 3.1 PDF 리포트 (jsPDF)
```javascript
// 리포트 구조
- 표지 (기업명, 보고서 날짜)
- 요약 (주요 지표 요약)
- 재무 비율 분석
- 차트 (자산/부채/자본 추이)
- 업종 평균 비교
- 투자 추천 (AI 분석 결과)
```

### 3.2 엑셀 내보내기 (SheetJS)
- 재무제표 원본 데이터
- 계산된 비율 데이터
- 시계열 데이터 (여러 연도)
- 차트 데이터

### 3.3 자동 코멘트 생성
```javascript
// 분석 로직
function generateComments(financialData) {
  const comments = [];
  
  // 부채비율 분석
  if (data.debtRatio > 200) {
    comments.push('⚠️ 부채비율이 높아 재무 안정성에 주의가 필요합니다.');
  }
  
  // ROE 분석
  if (data.roe > 15) {
    comments.push('✅ 높은 ROE로 수익성이 우수합니다.');
  }
  
  return comments;
}
```

---

## Phase 4: 투자 의사결정 지표 (1-2주)

### 4.1 추가 지표 계산
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

## Phase 5: 기업 뉴스 연동 (1주)

### 5.1 API 연동
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

### 5.2 기능
- 실시간 뉴스 피드
- 공시 정보 타임라인
- 중요 공시 알림 (유상증자, 배당, 합병 등)
- 재무제표 발표일 자동 알림

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

### 리포트 생성
- 📦 jsPDF (PDF 생성)
- 📦 html2canvas (HTML → 이미지)
- 📦 SheetJS (xlsx) (엑셀 생성)

### 유틸리티
- 📦 date-fns (날짜 처리)
- 📦 lodash (데이터 처리)

---

## 🎯 구현 우선순위

### 🔴 High Priority (1-2주 내)
1. ✅ 워치리스트 기본 기능
2. ✅ 대시보드 레이아웃
3. ✅ 투자 지표 계산 (PER, PBR)

### 🟡 Medium Priority (3-4주 내)
4. ⏳ PDF 리포트 생성
5. ⏳ 뉴스 API 연동
6. ⏳ 재무 건전성 점수

### 🟢 Low Priority (5주+)
7. ⏳ AI 추천 알고리즘
8. ⏳ 이상 패턴 감지
9. ⏳ 고급 차트 (D3.js)

---

## 📁 파일 구조 (예상)

```
Finance/
├── index.html              ✅ 기본 검색 페이지
├── dashboard.html          📦 대시보드 페이지
├── style.css               ✅ 기본 스타일
├── dashboard.css           📦 대시보드 스타일
├── app.js                  ✅ 기본 앱 로직
├── dashboard.js            📦 대시보드 로직
├── watchlist.js            📦 워치리스트 관리
├── report-generator.js     📦 리포트 생성
├── investment-metrics.js   📦 투자 지표 계산
├── news-api.js             📦 뉴스 API 연동
├── ai-analysis.js          📦 AI 분석 로직
├── widgets/                📦 위젯 컴포넌트
│   ├── watchlist-widget.js
│   ├── news-widget.js
│   └── chart-widget.js
└── basic.md                ✅ 프로젝트 문서
└── ROADMAP.md              ✅ 로드맵 (이 파일)
```

---

## 🔧 기술 스택 요약

| 카테고리 | 기술 | 상태 |
|---------|------|------|
| Frontend | HTML5, CSS3, Vanilla JS | ✅ |
| 차트 | Chart.js | ✅ |
| API | 금융위원회 API | ✅ |
| 스토리지 | localStorage | ✅ |
| PDF | jsPDF | 📦 |
| 엑셀 | SheetJS | 📦 |
| 뉴스 | Naver API, DART API | 📦 |
| 드래그 | Sortable.js / Gridstack.js | 📦 |

---

## 💡 다음 단계

1. **워치리스트 시스템 구현** (가장 기초적이고 중요)
2. **대시보드 레이아웃** (워치리스트를 표시할 공간)
3. **투자 지표 추가** (분석 강화)
4. **리포트 생성** (사용자 가치 제공)
5. **뉴스 연동** (실시간성 강화)
6. **AI 분석** (차별화 요소)

각 단계는 독립적으로 개발 가능하며, 점진적으로 기능을 추가할 수 있습니다.
