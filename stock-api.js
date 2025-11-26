// =====================================================
// 주식 정보 API 모듈
// =====================================================

const StockAPI = {
    // API 엔드포인트
    STOCK_PRICE_API: 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo',
    STOCK_ISSUE_API: 'https://apis.data.go.kr/1160100/service/GetStocIssuInfoService_V2/getStockIssuInfo',
    STOCK_DIVIDEND_API: 'https://apis.data.go.kr/1160100/service/GetStocDiviInfoService/getStkDivi',
    
    // API 키
    API_KEY: 'a840a5ad65e360f78621fc44725022e66f951d3659cea20e297a7a1b21e2929a',
    
    /**
     * 주식 시세 정보 조회
     * @param {string} corpName - 기업명
     * @returns {Promise<Object>} 주식 시세 정보
     */
    async getStockPrice(corpName) {
        try {
            const url = `${this.STOCK_PRICE_API}?serviceKey=${this.API_KEY}&numOfRows=1&pageNo=1&resultType=json&likeItmsNm=${encodeURIComponent(corpName)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response?.body?.items?.item) {
                const items = Array.isArray(data.response.body.items.item) 
                    ? data.response.body.items.item 
                    : [data.response.body.items.item];
                
                if (items.length > 0) {
                    const item = items[0];
                    return {
                        success: true,
                        stockCode: item.srtnCd,           // 단축코드
                        stockName: item.itmsNm,           // 종목명
                        marketPrice: parseFloat(item.clpr) || 0,  // 종가 (주가)
                        marketCap: parseFloat(item.mrktTotAmt) || 0,  // 시가총액
                        listedShares: parseFloat(item.lstgStCnt) || 0, // 상장주식수
                        date: item.basDt                  // 기준일자
                    };
                }
            }
            
            console.warn('주식 시세 정보를 찾을 수 없습니다:', corpName);
            return { success: false, message: '주식 시세 정보를 찾을 수 없습니다.' };
        } catch (error) {
            console.error('주식 시세 조회 실패:', error);
            return { success: false, message: '주식 시세 조회에 실패했습니다.' };
        }
    },
    
    /**
     * 주식 발행 정보 조회 (주식 수)
     * @param {string} stockCode - 종목코드
     * @returns {Promise<Object>} 주식 발행 정보
     */
    async getStockIssue(stockCode) {
        try {
            const url = `${this.STOCK_ISSUE_API}?serviceKey=${this.API_KEY}&numOfRows=1&pageNo=1&resultType=json&crno=${stockCode}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response?.body?.items?.item) {
                const items = Array.isArray(data.response.body.items.item) 
                    ? data.response.body.items.item 
                    : [data.response.body.items.item];
                
                if (items.length > 0) {
                    const item = items[0];
                    return {
                        success: true,
                        totalShares: parseFloat(item.stckIssuCnt) || 0,  // 주식발행수
                        corpName: item.corpNm,            // 법인명
                        date: item.basDt                  // 기준일자
                    };
                }
            }
            
            console.warn('주식 발행 정보를 찾을 수 없습니다:', stockCode);
            return { success: false, message: '주식 발행 정보를 찾을 수 없습니다.' };
        } catch (error) {
            console.error('주식 발행 정보 조회 실패:', error);
            return { success: false, message: '주식 발행 정보 조회에 실패했습니다.' };
        }
    },
    
    /**
     * 주식 배당 정보 조회
     * @param {string} stockCode - 종목코드
     * @returns {Promise<Object>} 배당 정보
     */
    async getStockDividend(stockCode) {
        try {
            const url = `${this.STOCK_DIVIDEND_API}?serviceKey=${this.API_KEY}&numOfRows=1&pageNo=1&resultType=json&crno=${stockCode}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response?.body?.items?.item) {
                const items = Array.isArray(data.response.body.items.item) 
                    ? data.response.body.items.item 
                    : [data.response.body.items.item];
                
                if (items.length > 0) {
                    const item = items[0];
                    return {
                        success: true,
                        dividendPerShare: parseFloat(item.cashDvdPayAmt) || 0,  // 현금배당금액
                        corpName: item.corpNm,            // 법인명
                        date: item.basDt                  // 기준일자
                    };
                }
            }
            
            console.warn('배당 정보를 찾을 수 없습니다:', stockCode);
            return { success: false, message: '배당 정보를 찾을 수 없습니다.' };
        } catch (error) {
            console.error('배당 정보 조회 실패:', error);
            return { success: false, message: '배당 정보 조회에 실패했습니다.' };
        }
    },
    
    /**
     * 통합 주식 정보 조회
     * @param {string} corpName - 기업명
     * @returns {Promise<Object>} 통합 주식 정보
     */
    async getStockInfo(corpName) {
        console.log(`📊 ${corpName}의 주식 정보를 조회합니다...`);
        
        // 1단계: 주식 시세 정보 조회 (주가, 시가총액, 상장주식수, 종목코드)
        const priceInfo = await this.getStockPrice(corpName);
        
        if (!priceInfo.success) {
            return {
                success: false,
                message: '주식 시세 정보를 찾을 수 없습니다. 상장 기업인지 확인하세요.',
                data: null
            };
        }
        
        console.log('✅ 주식 시세 정보:', priceInfo);
        
        // 2단계: 주식 발행 정보 조회 (종목코드 사용)
        const issueInfo = await this.getStockIssue(priceInfo.stockCode);
        console.log('📋 주식 발행 정보:', issueInfo);
        
        // 3단계: 배당 정보 조회 (종목코드 사용)
        const dividendInfo = await this.getStockDividend(priceInfo.stockCode);
        console.log('💰 배당 정보:', dividendInfo);
        
        // 통합 데이터 반환
        return {
            success: true,
            message: '주식 정보를 성공적으로 조회했습니다.',
            data: {
                // 기본 정보
                stockCode: priceInfo.stockCode,
                stockName: priceInfo.stockName,
                
                // 주가 정보
                stockPrice: priceInfo.marketPrice,           // 현재 주가
                marketCap: priceInfo.marketCap,             // 시가총액 (억원)
                listedShares: priceInfo.listedShares,       // 상장주식수
                
                // 발행 정보
                totalShares: issueInfo.success ? issueInfo.totalShares : priceInfo.listedShares,
                
                // 배당 정보
                dividendPerShare: dividendInfo.success ? dividendInfo.dividendPerShare : 0,
                
                // 조회일자
                priceDate: priceInfo.date,
                issueDate: issueInfo.success ? issueInfo.date : null,
                dividendDate: dividendInfo.success ? dividendInfo.date : null
            }
        };
    },
    
    /**
     * 주식 정보 포맷팅 (UI 표시용)
     */
    formatStockInfo(stockInfo) {
        if (!stockInfo.success) {
            return null;
        }
        
        const data = stockInfo.data;
        return {
            종목명: data.stockName,
            종목코드: data.stockCode,
            현재주가: `${data.stockPrice.toLocaleString()}원`,
            시가총액: `${(data.marketCap / 100000000).toLocaleString()}억원`,
            상장주식수: `${data.listedShares.toLocaleString()}주`,
            주당배당금: `${data.dividendPerShare.toLocaleString()}원`,
            조회일자: data.priceDate
        };
    }
};

// 전역 노출
window.StockAPI = StockAPI;
