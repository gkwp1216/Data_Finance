// =====================================================
// 재무 건전성 점수화 모듈
// =====================================================

const FinancialHealth = {
    /**
     * 재무 건전성 종합 점수 계산 (100점 만점)
     * @param {Object} data - 재무 데이터 및 투자 지표
     * @returns {Object} 건전성 점수 및 상세 분석
     */
    calculateHealthScore(data) {
        const scores = {
            profitability: this.calculateProfitabilityScore(data),    // 수익성 (30점)
            stability: this.calculateStabilityScore(data),            // 안정성 (30점)
            growth: this.calculateGrowthScore(data),                  // 성장성 (20점)
            valuation: this.calculateValuationScore(data)             // 밸류에이션 (20점)
        };

        const totalScore = 
            scores.profitability.score + 
            scores.stability.score + 
            scores.growth.score + 
            scores.valuation.score;

        return {
            totalScore: Math.round(totalScore),
            grade: this.getGrade(totalScore),
            category: scores,
            analysis: this.generateAnalysis(totalScore, scores),
            recommendation: this.getRecommendation(totalScore, scores)
        };
    },

    /**
     * 수익성 점수 계산 (30점 만점)
     * ROE, ROA 기반 평가
     */
    calculateProfitabilityScore(data) {
        let score = 0;
        const details = [];

        // ROE 평가 (15점)
        const roe = data.roe || 0;
        if (roe >= 20) {
            score += 15;
            details.push({ metric: 'ROE', value: roe, score: 15, rating: '매우 우수' });
        } else if (roe >= 15) {
            score += 12;
            details.push({ metric: 'ROE', value: roe, score: 12, rating: '우수' });
        } else if (roe >= 10) {
            score += 9;
            details.push({ metric: 'ROE', value: roe, score: 9, rating: '양호' });
        } else if (roe >= 5) {
            score += 5;
            details.push({ metric: 'ROE', value: roe, score: 5, rating: '보통' });
        } else {
            score += 2;
            details.push({ metric: 'ROE', value: roe, score: 2, rating: '미흡' });
        }

        // 영업이익률 평가 (15점) - 재무데이터에서 계산
        const operatingMargin = this.calculateOperatingMargin(data);
        if (operatingMargin >= 15) {
            score += 15;
            details.push({ metric: '영업이익률', value: operatingMargin, score: 15, rating: '매우 우수' });
        } else if (operatingMargin >= 10) {
            score += 12;
            details.push({ metric: '영업이익률', value: operatingMargin, score: 12, rating: '우수' });
        } else if (operatingMargin >= 5) {
            score += 9;
            details.push({ metric: '영업이익률', value: operatingMargin, score: 9, rating: '양호' });
        } else if (operatingMargin >= 0) {
            score += 5;
            details.push({ metric: '영업이익률', value: operatingMargin, score: 5, rating: '보통' });
        } else {
            score += 0;
            details.push({ metric: '영업이익률', value: operatingMargin, score: 0, rating: '적자' });
        }

        return {
            score: score,
            maxScore: 30,
            percentage: Math.round((score / 30) * 100),
            details: details,
            summary: this.getProfitabilitySummary(score)
        };
    },

    /**
     * 안정성 점수 계산 (30점 만점)
     * 부채비율, 유동비율 기반 평가
     */
    calculateStabilityScore(data) {
        let score = 0;
        const details = [];

        // 부채비율 평가 (15점) - 낮을수록 좋음
        const debtRatio = data.debtRatio || 0;
        if (debtRatio < 50) {
            score += 15;
            details.push({ metric: '부채비율', value: debtRatio, score: 15, rating: '매우 안정' });
        } else if (debtRatio < 100) {
            score += 12;
            details.push({ metric: '부채비율', value: debtRatio, score: 12, rating: '안정' });
        } else if (debtRatio < 150) {
            score += 9;
            details.push({ metric: '부채비율', value: debtRatio, score: 9, rating: '양호' });
        } else if (debtRatio < 200) {
            score += 5;
            details.push({ metric: '부채비율', value: debtRatio, score: 5, rating: '주의' });
        } else {
            score += 2;
            details.push({ metric: '부채비율', value: debtRatio, score: 2, rating: '위험' });
        }

        // 유동비율 평가 (15점) - 높을수록 좋음
        const currentRatio = data.currentRatio || 0;
        if (currentRatio >= 200) {
            score += 15;
            details.push({ metric: '유동비율', value: currentRatio, score: 15, rating: '매우 안정' });
        } else if (currentRatio >= 150) {
            score += 12;
            details.push({ metric: '유동비율', value: currentRatio, score: 12, rating: '안정' });
        } else if (currentRatio >= 100) {
            score += 9;
            details.push({ metric: '유동비율', value: currentRatio, score: 9, rating: '양호' });
        } else if (currentRatio >= 80) {
            score += 5;
            details.push({ metric: '유동비율', value: currentRatio, score: 5, rating: '주의' });
        } else {
            score += 2;
            details.push({ metric: '유동비율', value: currentRatio, score: 2, rating: '위험' });
        }

        return {
            score: score,
            maxScore: 30,
            percentage: Math.round((score / 30) * 100),
            details: details,
            summary: this.getStabilitySummary(score)
        };
    },

    /**
     * 성장성 점수 계산 (20점 만점)
     * 자산 증가율 기반 평가 (실제로는 매출/이익 증가율이 필요하지만 현재 데이터 제약)
     */
    calculateGrowthScore(data) {
        let score = 0;
        const details = [];

        // 자산 증가 추정 (10점)
        const assetGrowth = this.estimateAssetGrowth(data);
        if (assetGrowth >= 15) {
            score += 10;
            details.push({ metric: '자산증가율(추정)', value: assetGrowth, score: 10, rating: '고성장' });
        } else if (assetGrowth >= 10) {
            score += 8;
            details.push({ metric: '자산증가율(추정)', value: assetGrowth, score: 8, rating: '성장' });
        } else if (assetGrowth >= 5) {
            score += 6;
            details.push({ metric: '자산증가율(추정)', value: assetGrowth, score: 6, rating: '안정성장' });
        } else if (assetGrowth >= 0) {
            score += 3;
            details.push({ metric: '자산증가율(추정)', value: assetGrowth, score: 3, rating: '저성장' });
        } else {
            score += 0;
            details.push({ metric: '자산증가율(추정)', value: assetGrowth, score: 0, rating: '역성장' });
        }

        // ROE 기반 성장성 평가 (10점)
        const roe = data.roe || 0;
        if (roe >= 15) {
            score += 10;
            details.push({ metric: 'ROE 성장성', value: roe, score: 10, rating: '우수' });
        } else if (roe >= 10) {
            score += 7;
            details.push({ metric: 'ROE 성장성', value: roe, score: 7, rating: '양호' });
        } else if (roe >= 5) {
            score += 4;
            details.push({ metric: 'ROE 성장성', value: roe, score: 4, rating: '보통' });
        } else {
            score += 1;
            details.push({ metric: 'ROE 성장성', value: roe, score: 1, rating: '미흡' });
        }

        return {
            score: score,
            maxScore: 20,
            percentage: Math.round((score / 20) * 100),
            details: details,
            summary: this.getGrowthSummary(score)
        };
    },

    /**
     * 밸류에이션 점수 계산 (20점 만점)
     * PER, PBR 기반 평가
     */
    calculateValuationScore(data) {
        let score = 0;
        const details = [];

        // PER 평가 (10점) - 낮을수록 저평가
        const per = data.per || 0;
        if (per > 0) {
            if (per < 10) {
                score += 10;
                details.push({ metric: 'PER', value: per, score: 10, rating: '매우 저평가' });
            } else if (per < 15) {
                score += 8;
                details.push({ metric: 'PER', value: per, score: 8, rating: '저평가' });
            } else if (per < 20) {
                score += 6;
                details.push({ metric: 'PER', value: per, score: 6, rating: '적정' });
            } else if (per < 30) {
                score += 3;
                details.push({ metric: 'PER', value: per, score: 3, rating: '고평가' });
            } else {
                score += 1;
                details.push({ metric: 'PER', value: per, score: 1, rating: '매우 고평가' });
            }
        } else {
            score += 0;
            details.push({ metric: 'PER', value: per, score: 0, rating: '적자/미산정' });
        }

        // PBR 평가 (10점) - 낮을수록 저평가
        const pbr = data.pbr || 0;
        if (pbr > 0) {
            if (pbr < 0.8) {
                score += 10;
                details.push({ metric: 'PBR', value: pbr, score: 10, rating: '매우 저평가' });
            } else if (pbr < 1.0) {
                score += 8;
                details.push({ metric: 'PBR', value: pbr, score: 8, rating: '저평가' });
            } else if (pbr < 1.5) {
                score += 6;
                details.push({ metric: 'PBR', value: pbr, score: 6, rating: '적정' });
            } else if (pbr < 2.0) {
                score += 3;
                details.push({ metric: 'PBR', value: pbr, score: 3, rating: '고평가' });
            } else {
                score += 1;
                details.push({ metric: 'PBR', value: pbr, score: 1, rating: '매우 고평가' });
            }
        } else {
            score += 0;
            details.push({ metric: 'PBR', value: pbr, score: 0, rating: '자본잠식/미산정' });
        }

        // 밸류에이션(Per/Pbr) 데이터 가용성 판단
        const perVal = per && per > 0;
        const pbrVal = pbr && pbr > 0;
        const valuationDataAvailable = perVal || pbrVal;

        return {
            score: score,
            maxScore: 20,
            percentage: Math.round((score / 20) * 100),
            details: details,
            // 데이터가 없을 경우 명확한 메시지 반환
            summary: valuationDataAvailable ? this.getValuationSummary(score) : '데이터 없음',
            dataAvailable: valuationDataAvailable
        };
    },

    /**
     * 영업이익률 계산 (추정)
     */
    calculateOperatingMargin(data) {
        // 실제 데이터가 없으면 ROE를 기반으로 추정
        if (data.operatingMargin) return data.operatingMargin;
        
        const roe = data.roe || 0;
        // ROE를 기반으로 영업이익률 추정 (간단한 휴리스틱)
        return roe > 0 ? roe * 0.8 : 0;
    },

    /**
     * 자산 증가율 추정
     */
    estimateAssetGrowth(data) {
        // 실제 데이터가 없으면 ROE를 기반으로 추정
        if (data.assetGrowth) return data.assetGrowth;
        
        const roe = data.roe || 0;
        return roe > 5 ? roe * 0.6 : 0;
    },

    /**
     * 종합 등급 산정
     */
    getGrade(score) {
        if (score >= 90) return 'S';
        if (score >= 80) return 'A+';
        if (score >= 70) return 'A';
        if (score >= 60) return 'B+';
        if (score >= 50) return 'B';
        if (score >= 40) return 'C+';
        if (score >= 30) return 'C';
        if (score >= 20) return 'D';
        return 'F';
    },

    /**
     * 등급별 색상
     */
    getGradeColor(grade) {
        const colors = {
            'S': '#06ffa5',
            'A+': '#28a745',
            'A': '#5cb85c',
            'B+': '#5bc0de',
            'B': '#4361ee',
            'C+': '#ffc107',
            'C': '#ff9800',
            'D': '#ff5722',
            'F': '#dc3545'
        };
        return colors[grade] || '#6c757d';
    },

    /**
     * 종합 분석 생성
     */
    generateAnalysis(totalScore, scores) {
        const analysis = [];

        // 강점 분석
        const strengths = [];
        if (scores.profitability.percentage >= 70) strengths.push('수익성');
        if (scores.stability.percentage >= 70) strengths.push('재무안정성');
        if (scores.growth.percentage >= 70) strengths.push('성장성');
        if (scores.valuation.percentage >= 70) strengths.push('밸류에이션');

        if (strengths.length > 0) {
            analysis.push({
                type: 'strength',
                message: `강점: ${strengths.join(', ')} 부문에서 우수한 성과를 보이고 있습니다.`
            });
        }

        // 약점 분석
        const weaknesses = [];
        if (scores.profitability.percentage < 50) weaknesses.push('수익성');
        if (scores.stability.percentage < 50) weaknesses.push('재무안정성');
        if (scores.growth.percentage < 50) weaknesses.push('성장성');
        if (scores.valuation.percentage < 50) weaknesses.push('밸류에이션');

        if (weaknesses.length > 0) {
            analysis.push({
                type: 'weakness',
                message: `약점: ${weaknesses.join(', ')} 부문에서 개선이 필요합니다.`
            });
        }

        // 종합 평가
        if (totalScore >= 80) {
            analysis.push({
                type: 'overall',
                message: '재무 건전성이 매우 우수한 기업입니다. 장기 투자에 적합합니다.'
            });
        } else if (totalScore >= 60) {
            analysis.push({
                type: 'overall',
                message: '재무 건전성이 양호한 기업입니다. 안정적인 투자 대상입니다.'
            });
        } else if (totalScore >= 40) {
            analysis.push({
                type: 'overall',
                message: '재무 건전성이 보통 수준입니다. 신중한 접근이 필요합니다.'
            });
        } else {
            analysis.push({
                type: 'overall',
                message: '재무 건전성이 낮습니다. 투자 시 주의가 필요합니다.'
            });
        }

        return analysis;
    },

    /**
     * 투자 추천
     */
    getRecommendation(totalScore, scores) {
        let rating = '';
        let reason = '';

        if (totalScore >= 80 && scores.valuation.percentage >= 60) {
            rating = '적극 매수';
            reason = '우수한 재무 건전성과 합리적인 밸류에이션';
        } else if (totalScore >= 70) {
            rating = '매수';
            reason = '양호한 재무 건전성';
        } else if (totalScore >= 50) {
            rating = '보유';
            reason = '평균적인 재무 상태';
        } else if (totalScore >= 30) {
            rating = '관망';
            reason = '재무 건전성 개선 필요';
        } else {
            rating = '매도';
            reason = '낮은 재무 건전성';
        }

        return { rating, reason };
    },

    /**
     * 카테고리별 요약
     */
    getProfitabilitySummary(score) {
        if (score >= 25) return '수익성이 매우 우수합니다';
        if (score >= 20) return '수익성이 양호합니다';
        if (score >= 15) return '수익성이 평균 수준입니다';
        if (score >= 10) return '수익성 개선이 필요합니다';
        return '수익성이 낮습니다';
    },

    getStabilitySummary(score) {
        if (score >= 25) return '재무 안정성이 매우 우수합니다';
        if (score >= 20) return '재무 안정성이 양호합니다';
        if (score >= 15) return '재무 안정성이 평균 수준입니다';
        if (score >= 10) return '재무 안정성 개선이 필요합니다';
        return '재무 안정성이 낮습니다';
    },

    getGrowthSummary(score) {
        if (score >= 17) return '성장성이 매우 우수합니다';
        if (score >= 13) return '성장성이 양호합니다';
        if (score >= 10) return '성장성이 평균 수준입니다';
        if (score >= 7) return '성장성 개선이 필요합니다';
        return '성장성이 낮습니다';
    },

    getValuationSummary(score) {
        if (score >= 17) return '매우 저평가되어 있습니다';
        if (score >= 13) return '저평가되어 있습니다';
        if (score >= 10) return '적정 가격입니다';
        if (score >= 7) return '고평가되어 있습니다';
        return '매우 고평가되어 있습니다';
    }
};

// 전역 노출
window.FinancialHealth = FinancialHealth;
