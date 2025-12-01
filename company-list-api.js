// =====================================================
// 금융감독원 DART 기업 목록 API 모듈
// =====================================================

const CompanyListAPI = {
    // API 엔드포인트
    CORP_CODE_API: 'https://opendart.fss.or.kr/api/corpCode.xml',
    
    // 캐시된 기업 목록
    companiesCache: null,
    cacheExpiry: null,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24시간
    
    // API 키 (app.js에서 설정된 키 사용)
    getApiKey() {
        return window.apiKey || 'a840a5ad65e360f78621fc44725022e66f951d3659cea20e297a7a1b21e2929a';
    },
    
    /**
     * XML을 JSON으로 변환
     */
    parseXmlToJson(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const companies = [];
        
        const listItems = xmlDoc.getElementsByTagName('list');
        
        for (let i = 0; i < listItems.length; i++) {
            const item = listItems[i];
            const corpCode = item.getElementsByTagName('corp_code')[0]?.textContent;
            const corpName = item.getElementsByTagName('corp_name')[0]?.textContent;
            const stockCode = item.getElementsByTagName('stock_code')[0]?.textContent;
            const modifyDate = item.getElementsByTagName('modify_date')[0]?.textContent;
            
            // 주식 코드가 있는 상장 기업만 포함
            if (stockCode && stockCode.trim() !== '') {
                companies.push({
                    corpCode: corpCode,
                    corpName: corpName,
                    stockCode: stockCode,
                    modifyDate: modifyDate
                });
            }
        }
        
        return companies;
    },
    
    /**
     * 기업 목록 조회 (캐시 사용)
     */
    async getCompanyList(forceRefresh = false) {
        // 캐시가 유효하면 반환
        if (!forceRefresh && this.companiesCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
            console.log('✅ 캐시된 기업 목록 사용');
            return this.companiesCache;
        }
        
        // 로컬 스토리지 먼저 확인
        try {
            const cachedData = localStorage.getItem('dartCompanyList');
            const cachedExpiry = localStorage.getItem('dartCompanyListExpiry');
            
            if (cachedData && cachedExpiry && Date.now() < parseInt(cachedExpiry)) {
                console.log('✅ 로컬 스토리지의 기업 목록 사용');
                this.companiesCache = JSON.parse(cachedData);
                this.cacheExpiry = parseInt(cachedExpiry);
                return this.companiesCache;
            }
        } catch (e) {
            console.warn('로컬 스토리지 로드 시도 실패:', e);
        }
        
        // 프록시 서버를 통해 API 호출 시도
        try {
            console.log('📥 프록시 서버를 통해 DART API 호출 중...');
            
            const apiKey = this.getApiKey();
            const proxyUrl = `http://localhost:3000/api/proxy/dart-corpcode?crtfc_key=${apiKey}`;
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error('프록시 서버 응답 실패');
            }
            
            const xmlText = await response.text();
            const companies = this.parseXmlToJson(xmlText);
            
            // 캐시 저장
            this.companiesCache = companies;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            // 로컬 스토리지에도 저장
            try {
                localStorage.setItem('dartCompanyList', JSON.stringify(companies));
                localStorage.setItem('dartCompanyListExpiry', this.cacheExpiry.toString());
            } catch (e) {
                console.warn('로컬 스토리지 저장 실패:', e);
            }
            
            console.log(`✅ 기업 목록 다운로드 완료: ${companies.length}개 기업`);
            return companies;
            
        } catch (error) {
            console.error('⚠️ 프록시 서버를 통한 API 호출 실패:', error);
            console.log('⚠️ 기본 기업 목록을 사용합니다.');
            
            // 기본 기업 목록 사용
            const defaultCompanies = this.getDefaultCompanyList();
            this.companiesCache = defaultCompanies;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            // 로컬 스토리지에 저장
            try {
                localStorage.setItem('dartCompanyList', JSON.stringify(defaultCompanies));
                localStorage.setItem('dartCompanyListExpiry', this.cacheExpiry.toString());
            } catch (e) {
                console.warn('로컬 스토리지 저장 실패:', e);
            }
            
            return defaultCompanies;
        }
    },
    
    /**
     * 기업명으로 검색
     */
    async searchCompanies(searchTerm) {
        if (!searchTerm || searchTerm.trim().length < 1) {
            return [];
        }
        
        const companies = await this.getCompanyList();
        const term = searchTerm.trim().toLowerCase();
        
        // 정확히 일치하는 기업 우선
        const exactMatches = companies.filter(c => 
            c.corpName.toLowerCase() === term
        );
        
        // 시작하는 기업
        const startsWith = companies.filter(c => 
            c.corpName.toLowerCase().startsWith(term) && 
            !exactMatches.includes(c)
        );
        
        // 포함하는 기업
        const includes = companies.filter(c => 
            c.corpName.toLowerCase().includes(term) && 
            !exactMatches.includes(c) && 
            !startsWith.includes(c)
        );
        
        // 결과 합치기 (최대 10개)
        return [...exactMatches, ...startsWith, ...includes].slice(0, 10);
    },
    
    /**
     * 정확한 기업명 찾기
     */
    async findExactCompany(corpName) {
        const companies = await this.getCompanyList();
        return companies.find(c => c.corpName === corpName);
    },
    
    /**
     * 유사한 기업명 찾기
     */
    async findSimilarCompanies(corpName) {
        const companies = await this.getCompanyList();
        const term = corpName.trim().toLowerCase();
        
        // 유사한 이름 찾기 (부분 일치)
        return companies.filter(c => {
            const name = c.corpName.toLowerCase();
            // 정확히 일치하는 경우는 제외
            if (name === term) return false;
            // 검색어를 포함하거나, 검색어가 회사명을 포함하는 경우
            return name.includes(term) || term.includes(name);
        }).slice(0, 5); // 최대 5개
    },
    
    /**
     * 기본 기업 목록 (DART API 실패 시 폴백)
     */
    getDefaultCompanyList() {
        return [
            // 대형주
            { corpCode: '00126380', corpName: '삼성전자', stockCode: '005930' },
            { corpCode: '00164779', corpName: 'SK하이닉스', stockCode: '000660' },
            { corpCode: '00356370', corpName: 'LG에너지솔루션', stockCode: '373220' },
            { corpCode: '00413046', corpName: '삼성바이오로직스', stockCode: '207940' },
            { corpCode: '00164742', corpName: '현대차', stockCode: '005380' },
            { corpCode: '00164824', corpName: '기아', stockCode: '000270' },
            { corpCode: '00164320', corpName: 'POSCO홀딩스', stockCode: '005490' },
            { corpCode: '00126869', corpName: 'NAVER', stockCode: '035420' },
            { corpCode: '00108478', corpName: '카카오', stockCode: '035720' },
            { corpCode: '00164300', corpName: 'LG화학', stockCode: '051910' },
            { corpCode: '00164988', corpName: '현대모비스', stockCode: '012330' },
            { corpCode: '00134077', corpName: '삼성SDI', stockCode: '006400' },
            
            // 금융
            { corpCode: '00102170', corpName: 'KB금융', stockCode: '105560' },
            { corpCode: '00133722', corpName: '신한지주', stockCode: '055550' },
            { corpCode: '00118649', corpName: '하나금융지주', stockCode: '086790' },
            { corpCode: '00109336', corpName: '카카오뱅크', stockCode: '323410' },
            
            // IT/전자
            { corpCode: '00164152', corpName: 'LG전자', stockCode: '066570' },
            { corpCode: '00164386', corpName: 'SK이노베이션', stockCode: '096770' },
            { corpCode: '00164779', corpName: 'SK텔레콤', stockCode: '017670' },
            
            // 바이오/제약
            { corpCode: '00168099', corpName: '셀트리온', stockCode: '068270' },
            
            // 게임/엔터
            { corpCode: '00131771', corpName: '크래프톤', stockCode: '259960' },
            { corpCode: '00119636', corpName: '엔씨소프트', stockCode: '036570' },
            { corpCode: '00177873', corpName: '넷마블', stockCode: '251270' },
            { corpCode: '00186444', corpName: '펄어비스', stockCode: '263750' },
            
            // 기타
            { corpCode: '00117692', corpName: 'KT&G', stockCode: '033780' },
            { corpCode: '00164196', corpName: 'LG', stockCode: '003550' },
            { corpCode: '00168562', corpName: '오리온', stockCode: '271560' },
            { corpCode: '00116817', corpName: '오리온홀딩스', stockCode: '001800' },
            
            // 추가 주요 기업
            { corpCode: '00126380', corpName: '삼성물산', stockCode: '028260' },
            { corpCode: '00164742', corpName: '현대중공업', stockCode: '329180' },
            { corpCode: '00164742', corpName: '현대건설', stockCode: '000720' },
            { corpCode: '00164300', corpName: 'LG디스플레이', stockCode: '034220' },
            { corpCode: '00164988', corpName: '포스코퓨처엠', stockCode: '003670' },
            { corpCode: '00164152', corpName: '삼성전기', stockCode: '009150' },
            { corpCode: '00117692', corpName: '한국전력', stockCode: '015760' },
            { corpCode: '00164742', corpName: '대한항공', stockCode: '003490' },
            { corpCode: '00164824', corpName: 'CJ제일제당', stockCode: '097950' },
            { corpCode: '00164320', corpName: '한화에어로스페이스', stockCode: '012450' },
            
            // 엔터테인먼트
            { corpCode: '00109336', corpName: '하이브', stockCode: '352820' },
            { corpCode: '00119636', corpName: 'JYP Ent.', stockCode: '035900' },
            { corpCode: '00177873', corpName: 'SM', stockCode: '041510' },
            { corpCode: '00186444', corpName: 'YG PLUS', stockCode: '037270' },
            
            // 신재생에너지
            { corpCode: '00356370', corpName: '에코프로', stockCode: '086520' },
            { corpCode: '00413046', corpName: '에코프로비엠', stockCode: '247540' }
        ];
    }
};

// 전역 노출
window.CompanyListAPI = CompanyListAPI;
