// =====================================================
// 뉴스 및 공시 정보 연동 모듈
// =====================================================

const NewsAPI = {
    // 네이버 뉴스 API 설정
    NAVER_NEWS_API: 'https://openapi.naver.com/v1/search/news.json',
    NAVER_CLIENT_ID: '', // 사용자가 입력해야 함
    NAVER_CLIENT_SECRET: '', // 사용자가 입력해야 함
    
    // DART 공시 API 설정
    DART_API: 'https://opendart.fss.or.kr/api/list.json',
    DART_API_KEY: '', // 사용자가 입력해야 함
    
    /**
     * 네이버 API 키 설정
     * @param {string} clientId - 네이버 클라이언트 ID
     * @param {string} clientSecret - 네이버 클라이언트 시크릿
     */
    setNaverAPIKey(clientId, clientSecret) {
        this.NAVER_CLIENT_ID = clientId;
        this.NAVER_CLIENT_SECRET = clientSecret;
        localStorage.setItem('naver_client_id', clientId);
        localStorage.setItem('naver_client_secret', clientSecret);
    },
    
    /**
     * DART API 키 설정
     * @param {string} apiKey - DART API 키
     */
    setDartAPIKey(apiKey) {
        this.DART_API_KEY = apiKey;
        localStorage.setItem('dart_api_key', apiKey);
    },
    
    /**
     * 저장된 API 키 불러오기
     */
    loadAPIKeys() {
        this.NAVER_CLIENT_ID = localStorage.getItem('naver_client_id') || '';
        this.NAVER_CLIENT_SECRET = localStorage.getItem('naver_client_secret') || '';
        this.DART_API_KEY = localStorage.getItem('dart_api_key') || '';
    },
    
    /**
     * 네이버 뉴스 검색
     * @param {string} query - 검색어 (기업명)
     * @param {number} display - 검색 결과 개수 (기본 10)
     * @returns {Promise<Array>} 뉴스 목록
     */
    async searchNaverNews(query, display = 10) {
        if (!this.NAVER_CLIENT_ID || !this.NAVER_CLIENT_SECRET) {
            console.warn('네이버 API 키가 설정되지 않았습니다.');
            return this.generateSampleNews(query);
        }
        
        try {
            const url = `${this.NAVER_NEWS_API}?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
            
            // CORS 문제로 직접 호출 불가 - 프록시 서버 필요
            // 여기서는 샘플 데이터 반환
            console.warn('네이버 뉴스 API는 CORS 제한으로 백엔드 프록시가 필요합니다.');
            return this.generateSampleNews(query);
            
            /* 백엔드 프록시를 통한 호출 예시:
            const response = await fetch('/api/proxy/naver-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, display })
            });
            
            const data = await response.json();
            return this.parseNaverNews(data.items);
            */
        } catch (error) {
            console.error('네이버 뉴스 검색 실패:', error);
            return this.generateSampleNews(query);
        }
    },
    
    /**
     * 네이버 뉴스 데이터 파싱
     * @param {Array} items - 네이버 API 응답 items
     * @returns {Array} 파싱된 뉴스 목록
     */
    parseNaverNews(items) {
        return items.map(item => ({
            title: item.title.replace(/<\/?b>/g, ''), // HTML 태그 제거
            description: item.description.replace(/<\/?b>/g, ''),
            link: item.link,
            pubDate: new Date(item.pubDate),
            source: '네이버 뉴스'
        }));
    },
    
    /**
     * DART 공시 정보 조회
     * @param {string} corpCode - 기업 고유번호
     * @param {string} beginDate - 시작일 (YYYYMMDD)
     * @param {string} endDate - 종료일 (YYYYMMDD)
     * @returns {Promise<Array>} 공시 목록
     */
    async searchDartDisclosure(corpCode, beginDate, endDate) {
        if (!this.DART_API_KEY) {
            console.warn('DART API 키가 설정되지 않았습니다.');
            return this.generateSampleDisclosure();
        }
        
        try {
            const url = `${this.DART_API}?crtfc_key=${this.DART_API_KEY}&corp_code=${corpCode}&bgn_de=${beginDate}&end_de=${endDate}&page_no=1&page_count=10`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === '000') {
                return this.parseDartDisclosure(data.list);
            } else {
                console.warn('DART API 오류:', data.message);
                return this.generateSampleDisclosure();
            }
        } catch (error) {
            console.error('DART 공시 조회 실패:', error);
            return this.generateSampleDisclosure();
        }
    },
    
    /**
     * DART 공시 데이터 파싱
     * @param {Array} list - DART API 응답 list
     * @returns {Array} 파싱된 공시 목록
     */
    parseDartDisclosure(list) {
        return list.map(item => ({
            title: item.report_nm,
            corpName: item.corp_name,
            date: this.formatDate(item.rcept_dt),
            link: `http://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
            type: this.getDisclosureType(item.report_nm),
            source: 'DART'
        }));
    },
    
    /**
     * 공시 유형 판단
     * @param {string} reportName - 공시 제목
     * @returns {string} 공시 유형
     */
    getDisclosureType(reportName) {
        if (reportName.includes('배당')) return 'dividend';
        if (reportName.includes('합병') || reportName.includes('분할')) return 'merger';
        if (reportName.includes('유상증자') || reportName.includes('감자')) return 'capital';
        if (reportName.includes('재무제표')) return 'financial';
        if (reportName.includes('공시')) return 'disclosure';
        return 'other';
    },
    
    /**
     * 날짜 포맷팅 (YYYYMMDD → YYYY-MM-DD)
     * @param {string} dateStr - 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    formatDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    },
    
    /**
     * 샘플 뉴스 생성 (데모용)
     * @param {string} companyName - 기업명
     * @returns {Array} 샘플 뉴스 목록
     */
    generateSampleNews(companyName) {
        const today = new Date();
        return [
            {
                title: `${companyName}, 2024년 실적 호조 전망`,
                description: `${companyName}의 올해 실적이 전년 대비 큰 폭으로 개선될 것으로 전망되고 있다. 주요 사업 부문에서 고른 성장세를 보이고 있으며...`,
                link: '#',
                pubDate: new Date(today.getTime() - 1 * 60 * 60 * 1000),
                source: '네이버 뉴스'
            },
            {
                title: `${companyName}, 신규 투자 계획 발표`,
                description: `${companyName}가 향후 3년간 대규모 설비 투자를 단행할 계획이라고 발표했다. 이번 투자로 생산 능력이 30% 이상 확대될 전망...`,
                link: '#',
                pubDate: new Date(today.getTime() - 5 * 60 * 60 * 1000),
                source: '네이버 뉴스'
            },
            {
                title: `${companyName} 주가, 최근 실적 호재에 강세`,
                description: `${companyName} 주가가 실적 개선 기대감에 강세를 보이고 있다. 시장 전문가들은 목표주가를 상향 조정하며...`,
                link: '#',
                pubDate: new Date(today.getTime() - 12 * 60 * 60 * 1000),
                source: '네이버 뉴스'
            },
            {
                title: `애널리스트 리포트: ${companyName} '매수' 의견 유지`,
                description: `주요 증권사 애널리스트들이 ${companyName}에 대해 '매수' 의견을 유지했다. 펀더멘털 개선과 밸류에이션 매력이 부각...`,
                link: '#',
                pubDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
                source: '네이버 뉴스'
            },
            {
                title: `${companyName}, ESG 경영 강화 선언`,
                description: `${companyName}가 환경·사회·지배구조(ESG) 경영을 한층 강화하겠다고 밝혔다. 탄소중립 목표 달성을 위한 로드맵을 제시...`,
                link: '#',
                pubDate: new Date(today.getTime() - 36 * 60 * 60 * 1000),
                source: '네이버 뉴스'
            }
        ];
    },
    
    /**
     * 샘플 공시 생성 (데모용)
     * @returns {Array} 샘플 공시 목록
     */
    generateSampleDisclosure() {
        const today = new Date();
        return [
            {
                title: '[기재정정]감사보고서제출',
                corpName: '샘플기업',
                date: this.formatDate(today.toISOString().slice(0, 10).replace(/-/g, '')),
                link: '#',
                type: 'financial',
                source: 'DART'
            },
            {
                title: '주요사항보고서(자기주식취득신탁계약체결결정)',
                corpName: '샘플기업',
                date: this.formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '')),
                link: '#',
                type: 'capital',
                source: 'DART'
            },
            {
                title: '분기보고서 (2024.09)',
                corpName: '샘플기업',
                date: this.formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '')),
                link: '#',
                type: 'financial',
                source: 'DART'
            }
        ];
    },
    
    /**
     * 상대 시간 포맷팅 (예: "3시간 전")
     * @param {Date} date - 날짜
     * @returns {string} 상대 시간
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return date.toLocaleDateString('ko-KR');
    }
};

// 초기화
NewsAPI.loadAPIKeys();

// 전역 노출
window.NewsAPI = NewsAPI;
