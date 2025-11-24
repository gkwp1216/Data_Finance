// =====================================================
// 투자 의사결정 지표 계산 모듈
// =====================================================

const InvestmentMetrics = {
    /**
     * PER (Price to Earnings Ratio) - 주가수익비율
     * PER = 주가 / 주당순이익(EPS)
     * 또는 PER = 시가총액 / 당기순이익
     * 
     * @param {number} stockPrice - 현재 주가
     * @param {number} eps - 주당순이익 (Earnings Per Share)
     * @returns {number} PER 값
     */
    calculatePER(stockPrice, eps) {
        if (!eps || eps <= 0) return null;
        return stockPrice / eps;
    },

    /**
     * PER 계산 (시가총액 기준)
     * @param {number} marketCap - 시가총액
     * @param {number} netIncome - 당기순이익
     * @returns {number} PER 값
     */
    calculatePERByMarketCap(marketCap, netIncome) {
        if (!netIncome || netIncome <= 0) return null;
        return marketCap / netIncome;
    },

    /**
     * PBR (Price to Book Ratio) - 주가순자산비율
     * PBR = 주가 / 주당순자산(BPS)
     * 또는 PBR = 시가총액 / 자본총계
     * 
     * @param {number} stockPrice - 현재 주가
     * @param {number} bps - 주당순자산 (Book value Per Share)
     * @returns {number} PBR 값
     */
    calculatePBR(stockPrice, bps) {
        if (!bps || bps <= 0) return null;
        return stockPrice / bps;
    },

    /**
     * PBR 계산 (시가총액 기준)
     * @param {number} marketCap - 시가총액
     * @param {number} equity - 자본총계
     * @returns {number} PBR 값
     */
    calculatePBRByMarketCap(marketCap, equity) {
        if (!equity || equity <= 0) return null;
        return marketCap / equity;
    },

    /**
     * PSR (Price to Sales Ratio) - 주가매출액비율
     * PSR = 시가총액 / 매출액
     * 
     * @param {number} marketCap - 시가총액
     * @param {number} revenue - 매출액
     * @returns {number} PSR 값
     */
    calculatePSR(marketCap, revenue) {
        if (!revenue || revenue <= 0) return null;
        return marketCap / revenue;
    },

    /**
     * EPS (Earnings Per Share) - 주당순이익
     * EPS = 당기순이익 / 발행주식수
     * 
     * @param {number} netIncome - 당기순이익
     * @param {number} shares - 발행주식수
     * @returns {number} EPS 값
     */
    calculateEPS(netIncome, shares) {
        if (!shares || shares <= 0) return null;
        return netIncome / shares;
    },

    /**
     * BPS (Book value Per Share) - 주당순자산
     * BPS = 자본총계 / 발행주식수
     * 
     * @param {number} equity - 자본총계
     * @param {number} shares - 발행주식수
     * @returns {number} BPS 값
     */
    calculateBPS(equity, shares) {
        if (!shares || shares <= 0) return null;
        return equity / shares;
    },

    /**
     * EV (Enterprise Value) - 기업가치
     * EV = 시가총액 + 순차입금
     * 순차입금 = 단기차입금 + 장기차입금 + 사채 - 현금및현금성자산
     * 
     * @param {number} marketCap - 시가총액
     * @param {number} debt - 총 차입금
     * @param {number} cash - 현금 및 현금성자산
     * @returns {number} EV 값
     */
    calculateEV(marketCap, debt, cash) {
        const netDebt = debt - cash;
        return marketCap + netDebt;
    },

    /**
     * EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization)
     * EBITDA = 영업이익 + 감가상각비
     * (간편 계산: 영업이익을 EBITDA로 근사)
     * 
     * @param {number} operatingIncome - 영업이익
     * @param {number} depreciation - 감가상각비 (선택)
     * @returns {number} EBITDA 값
     */
    calculateEBITDA(operatingIncome, depreciation = 0) {
        return operatingIncome + depreciation;
    },

    /**
     * EV/EBITDA
     * 기업가치를 EBITDA로 나눈 값
     * 
     * @param {number} ev - 기업가치
     * @param {number} ebitda - EBITDA
     * @returns {number} EV/EBITDA 값
     */
    calculateEVtoEBITDA(ev, ebitda) {
        if (!ebitda || ebitda <= 0) return null;
        return ev / ebitda;
    },

    /**
     * 배당수익률 (Dividend Yield)
     * 배당수익률 = (주당배당금 / 주가) × 100
     * 
     * @param {number} dividendPerShare - 주당배당금
     * @param {number} stockPrice - 현재 주가
     * @returns {number} 배당수익률 (%)
     */
    calculateDividendYield(dividendPerShare, stockPrice) {
        if (!stockPrice || stockPrice <= 0) return null;
        return (dividendPerShare / stockPrice) * 100;
    },

    /**
     * 배당성향 (Dividend Payout Ratio)
     * 배당성향 = (주당배당금 / 주당순이익) × 100
     * 
     * @param {number} dividendPerShare - 주당배당금
     * @param {number} eps - 주당순이익
     * @returns {number} 배당성향 (%)
     */
    calculatePayoutRatio(dividendPerShare, eps) {
        if (!eps || eps <= 0) return null;
        return (dividendPerShare / eps) * 100;
    },

    /**
     * 시가총액 계산
     * @param {number} stockPrice - 현재 주가
     * @param {number} shares - 발행주식수
     * @returns {number} 시가총액
     */
    calculateMarketCap(stockPrice, shares) {
        return stockPrice * shares;
    },

    /**
     * 모든 투자 지표 한번에 계산
     * @param {Object} data - 재무 및 주가 데이터
     * @returns {Object} 계산된 모든 지표
     */
    calculateAllMetrics(data) {
        const {
            // 재무 데이터
            netIncome,      // 당기순이익
            equity,         // 자본총계
            revenue,        // 매출액
            operatingIncome,// 영업이익
            debt,           // 총 차입금
            cash,           // 현금 및 현금성자산
            depreciation,   // 감가상각비 (선택)
            
            // 주가 데이터
            stockPrice,     // 현재 주가
            shares,         // 발행주식수
            dividendPerShare, // 주당배당금
            
            // 또는 직접 입력
            marketCap       // 시가총액 (주가 × 주식수)
        } = data;

        // 시가총액 계산 (없으면)
        const finalMarketCap = marketCap || this.calculateMarketCap(stockPrice, shares);

        // 주당 지표 계산
        const eps = this.calculateEPS(netIncome, shares);
        const bps = this.calculateBPS(equity, shares);

        // 기업가치 및 EBITDA
        const ev = this.calculateEV(finalMarketCap, debt || 0, cash || 0);
        const ebitda = this.calculateEBITDA(operatingIncome || 0, depreciation);

        // 투자 지표 계산
        const per = eps ? this.calculatePER(stockPrice, eps) : 
                    this.calculatePERByMarketCap(finalMarketCap, netIncome);
        const pbr = bps ? this.calculatePBR(stockPrice, bps) : 
                    this.calculatePBRByMarketCap(finalMarketCap, equity);
        const psr = this.calculatePSR(finalMarketCap, revenue);
        const evToEbitda = this.calculateEVtoEBITDA(ev, ebitda);
        const dividendYield = dividendPerShare ? 
                              this.calculateDividendYield(dividendPerShare, stockPrice) : null;
        const payoutRatio = (dividendPerShare && eps) ? 
                            this.calculatePayoutRatio(dividendPerShare, eps) : null;

        return {
            // 주당 지표
            eps,
            bps,
            
            // 밸류에이션 지표
            per,
            pbr,
            psr,
            
            // 기업가치 지표
            ev,
            ebitda,
            evToEbitda,
            
            // 배당 지표
            dividendYield,
            payoutRatio,
            
            // 기타
            marketCap: finalMarketCap
        };
    },

    /**
     * 지표 평가 (양호/주의/위험)
     * @param {string} metric - 지표명
     * @param {number} value - 지표값
     * @returns {Object} 평가 결과
     */
    evaluateMetric(metric, value) {
        if (value === null || value === undefined) {
            return { rating: 'N/A', color: 'gray', message: '데이터 부족' };
        }

        const evaluations = {
            per: [
                { max: 15, rating: '매우 저평가', color: '#dc3545', message: '매우 낮은 PER, 저평가 가능성' },
                { max: 20, rating: '적정', color: '#ffc107', message: '적정 수준의 PER' },
                { max: 30, rating: '다소 고평가', color: '#28a745', message: '다소 높은 PER' },
                { max: Infinity, rating: '고평가', color: '#06ffa5', message: '매우 높은 PER, 고평가 가능성' }
            ],
            pbr: [
                { max: 1, rating: '저평가', color: '#dc3545', message: '장부가치 이하 거래' },
                { max: 2, rating: '적정', color: '#ffc107', message: '적정 수준의 PBR' },
                { max: 3, rating: '다소 고평가', color: '#28a745', message: '다소 높은 PBR' },
                { max: Infinity, rating: '고평가', color: '#06ffa5', message: '높은 PBR' }
            ],
            psr: [
                { max: 1, rating: '저평가', color: '#dc3545', message: '매출 대비 저평가' },
                { max: 2, rating: '적정', color: '#ffc107', message: '적정 수준의 PSR' },
                { max: 4, rating: '다소 고평가', color: '#28a745', message: '다소 높은 PSR' },
                { max: Infinity, rating: '고평가', color: '#06ffa5', message: '높은 PSR' }
            ],
            evToEbitda: [
                { max: 8, rating: '저평가', color: '#dc3545', message: '낮은 EV/EBITDA' },
                { max: 12, rating: '적정', color: '#ffc107', message: '적정 수준' },
                { max: 15, rating: '다소 고평가', color: '#28a745', message: '다소 높음' },
                { max: Infinity, rating: '고평가', color: '#06ffa5', message: '높은 EV/EBITDA' }
            ],
            dividendYield: [
                { max: 2, rating: '낮음', color: '#dc3545', message: '낮은 배당수익률' },
                { max: 3, rating: '보통', color: '#ffc107', message: '보통 수준의 배당' },
                { max: 5, rating: '양호', color: '#28a745', message: '양호한 배당수익률' },
                { max: Infinity, rating: '우수', color: '#06ffa5', message: '높은 배당수익률' }
            ]
        };

        const metricEval = evaluations[metric];
        if (!metricEval) {
            return { rating: 'N/A', color: 'gray', message: '평가 기준 없음' };
        }

        for (let eval of metricEval) {
            if (value < eval.max) {
                return eval;
            }
        }

        return { rating: 'N/A', color: 'gray', message: '평가 불가' };
    },

    /**
     * 숫자 포맷팅
     * @param {number} value - 숫자
     * @param {number} decimals - 소수점 자리수
     * @returns {string} 포맷된 문자열
     */
    formatNumber(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '-';
        }
        return value.toFixed(decimals);
    },

    /**
     * 큰 숫자 포맷팅 (억, 조 단위)
     * @param {number} value - 숫자
     * @returns {string} 포맷된 문자열
     */
    formatLargeNumber(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return '-';
        }
        
        const trillion = 1000000000000; // 1조
        const billion = 100000000; // 1억
        
        if (value >= trillion) {
            return (value / trillion).toFixed(2) + '조';
        } else if (value >= billion) {
            return (value / billion).toFixed(2) + '억';
        } else {
            return value.toLocaleString('ko-KR');
        }
    }
};

// 전역 노출
window.InvestmentMetrics = InvestmentMetrics;
